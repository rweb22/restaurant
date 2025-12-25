/**
 * Payment Service
 *
 * This service provides high-level payment operations and manages the interaction
 * between orders, transactions, and the UPIGateway payment gateway.
 */

const upigatewayService = require('./upigatewayService');
const { Order, Transaction, User } = require('../models');
const logger = require('../utils/logger');
const upigatewayConfig = require('../config/upigateway');
const notificationService = require('./notificationService');

class PaymentService {
  /**
   * Initiate payment for an order
   * @param {number} orderId - Order ID
   * @returns {Promise<object>} Payment initiation details
   */
  async initiatePayment(orderId) {
    try {
      // Fetch order with user details
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'phone', 'email']
          }
        ]
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Validate order status
      if (order.status !== 'pending_payment') {
        throw new Error(`Cannot initiate payment for order with status: ${order.status}`);
      }

      // Validate payment status
      if (order.paymentStatus !== 'pending') {
        throw new Error(`Payment already ${order.paymentStatus}`);
      }

      // Create UPIGateway order
      const clientTxnId = `order_${orderId}_${Date.now()}`;
      const customFields = {
        udf1: orderId.toString(),
        udf2: 'restaurant_order',
        udf3: ''
      };

      const upigatewayOrder = await upigatewayService.createOrder(
        order.totalPrice,
        clientTxnId,
        order.user?.name || 'Customer',
        order.user?.email || '',
        order.user?.phone || '',
        customFields
      );

      // Create transaction record
      const transaction = await Transaction.create({
        orderId: orderId,
        paymentGateway: 'upigateway',
        gatewayOrderId: upigatewayOrder.orderId,
        amount: order.totalPrice,
        currency: 'INR',
        status: 'created',
        metadata: {
          client_txn_id: clientTxnId,
          qr_code: upigatewayOrder.qrCode,
          qr_string: upigatewayOrder.qrString,
          payment_url: upigatewayOrder.paymentUrl,
          upigateway_order: upigatewayOrder
        }
      });

      // Update order with gateway order ID
      await order.update({
        paymentGatewayOrderId: upigatewayOrder.orderId,
        paymentStatus: 'processing'
      });

      logger.info('Payment initiated successfully:', {
        orderId,
        transactionId: transaction.id,
        gatewayOrderId: upigatewayOrder.orderId,
        clientTxnId
      });

      return {
        orderId: order.id,
        transactionId: transaction.id,
        gatewayOrderId: upigatewayOrder.orderId,
        clientTxnId: clientTxnId,
        qrCode: upigatewayOrder.qrCode,
        qrString: upigatewayOrder.qrString,
        paymentUrl: upigatewayOrder.paymentUrl,
        amount: order.totalPrice,
        currency: 'INR',
        merchantKey: upigatewayConfig.merchantKey
      };
    } catch (error) {
      logger.error('Failed to initiate payment:', error);
      throw error;
    }
  }

  /**
   * Handle webhook payment notification from UPIGateway
   * @param {Object} webhookData - Webhook payload from UPIGateway
   * @returns {Promise<Object>} - Verification result
   */
  async handleWebhookPayment(webhookData) {
    try {
      const {
        client_txn_id,
        status,
        txn_id,
        upi_txn_id,
        amount,
        customer_vpa,
        customer_name,
        customer_mobile
      } = webhookData;

      logger.info('Processing webhook payment:', {
        client_txn_id,
        status,
        txn_id
      });

      // Find transaction by client_txn_id in metadata
      const transaction = await Transaction.findOne({
        where: {
          metadata: {
            client_txn_id: client_txn_id
          }
        },
        include: [
          {
            model: Order,
            as: 'order',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'phone']
              }
            ]
          }
        ]
      });

      if (!transaction) {
        logger.error('Transaction not found for webhook:', { client_txn_id });
        throw new Error('Transaction not found');
      }

      const order = transaction.order;
      const wasAlreadyCompleted = order.paymentStatus === 'completed';

      // Update transaction based on webhook status
      if (status === 'success') {
        await transaction.update({
          status: 'captured',
          gatewayPaymentId: txn_id,
          paymentMethod: 'upi',
          upiVpa: customer_vpa,
          metadata: {
            ...transaction.metadata,
            upi_txn_id,
            customer_name,
            customer_mobile,
            webhook_received_at: new Date().toISOString(),
            payment_status: status
          }
        });

        // Update order
        await order.update({
          paymentGatewayPaymentId: txn_id,
          paymentStatus: 'completed',
          paymentMethod: 'upi',
          status: 'pending' // Move to pending for admin confirmation
        });

        logger.info('Payment completed via webhook:', {
          orderId: order.id,
          transactionId: transaction.id,
          txnId: txn_id
        });

        // Only send notifications if payment wasn't already completed (prevent duplicates)
        if (!wasAlreadyCompleted) {
          // Send notification to client
          await notificationService.createNotification('PAYMENT_COMPLETED', {
            userId: order.userId,
            orderId: order.id,
            amount: parseFloat(transaction.amount).toFixed(2)
          });

          // Send notification to admin
          await notificationService.createNotification('NEW_ORDER', {
            orderId: order.id,
            customerPhone: order.user?.phone || customer_mobile,
            totalPrice: parseFloat(order.totalPrice).toFixed(2)
          });

          // Also send PAYMENT_RECEIVED notification to admin
          await notificationService.createNotification('PAYMENT_RECEIVED', {
            orderId: order.id,
            customerPhone: order.user?.phone || customer_mobile,
            amount: parseFloat(transaction.amount).toFixed(2)
          });
        }
      } else if (status === 'failed') {
        await transaction.update({
          status: 'failed',
          errorCode: 'PAYMENT_FAILED',
          errorDescription: 'Payment failed at UPI gateway',
          metadata: {
            ...transaction.metadata,
            webhook_received_at: new Date().toISOString(),
            payment_status: status
          }
        });

        await order.update({
          paymentStatus: 'failed'
        });

        logger.warn('Payment failed via webhook:', {
          orderId: order.id,
          transactionId: transaction.id,
          client_txn_id
        });
      } else {
        // Pending or other status
        logger.info('Payment status update via webhook:', {
          orderId: order.id,
          status
        });
      }

      return {
        success: true,
        orderId: order.id,
        transactionId: transaction.id,
        paymentStatus: 'completed',
        orderStatus: 'pending'
      };
    } catch (error) {
      logger.error('Payment verification failed:', error);
      throw error;
    }
  }

  /**
   * Get payment status for an order
   * @param {number} orderId - Order ID
   * @param {boolean} checkGateway - Whether to check status from gateway
   * @returns {Promise<object>} Payment status details
   */
  async getPaymentStatus(orderId, checkGateway = false) {
    try {
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: Transaction,
            as: 'transactions',
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const latestTransaction = order.transactions[0];
      let gatewayStatus = null;

      // Optionally check status from UPIGateway
      if (checkGateway && latestTransaction && latestTransaction.metadata?.client_txn_id) {
        try {
          const statusResponse = await upigatewayService.checkTransactionStatus(
            latestTransaction.metadata.client_txn_id
          );
          gatewayStatus = statusResponse;

          // Update transaction if status changed
          if (statusResponse.status === 'success' && latestTransaction.status !== 'captured') {
            await latestTransaction.update({
              status: 'captured',
              gatewayPaymentId: statusResponse.txnId,
              paymentMethod: 'upi',
              upiVpa: statusResponse.customerVpa,
              metadata: {
                ...latestTransaction.metadata,
                upi_txn_id: statusResponse.upiTxnId,
                status_checked_at: new Date().toISOString()
              }
            });

            await order.update({
              paymentGatewayPaymentId: statusResponse.txnId,
              paymentStatus: 'completed',
              paymentMethod: 'upi',
              status: 'pending'
            });
          }
        } catch (error) {
          logger.warn('Failed to check gateway status:', error);
          // Continue with local status
        }
      }

      return {
        orderId: order.id,
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        totalAmount: parseFloat(order.totalPrice),
        gatewayStatus: gatewayStatus,
        transactions: order.transactions.map(t => t.toSafeObject())
      };
    } catch (error) {
      logger.error('Failed to get payment status:', error);
      throw error;
    }
  }

  /**
   * Process refund for an order
   * NOTE: UPIGateway does not support automatic refunds.
   * Refunds must be processed manually through your UPI merchant app.
   *
   * @param {number} orderId - Order ID
   * @param {number} amount - Amount to refund (optional, full refund if not specified)
   * @param {string} reason - Reason for refund
   * @returns {Promise<object>} Refund details
   */
  async processRefund(orderId, amount = null, reason = '') {
    try {
      const order = await Order.findByPk(orderId, {
        include: [{ model: Transaction, as: 'transactions' }]
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Validate order status - can only refund if not in preparing status
      if (order.status === 'preparing') {
        throw new Error('Cannot refund order that is being prepared');
      }

      // Validate payment status
      if (order.paymentStatus !== 'completed') {
        throw new Error('Cannot refund order with payment status: ' + order.paymentStatus);
      }

      // Find the successful transaction
      const successfulTransaction = order.transactions.find(
        t => t.status === 'captured' || t.status === 'authorized'
      );

      if (!successfulTransaction) {
        throw new Error('No successful payment transaction found');
      }

      if (!successfulTransaction.upiVpa) {
        throw new Error('Customer UPI VPA not found in transaction');
      }

      // UPIGateway doesn't support automatic refunds
      // Create a refund transaction record for manual processing
      const refundAmount = amount || order.totalPrice;

      // Create new transaction record for refund (manual processing required)
      const refundTransaction = await Transaction.create({
        orderId: orderId,
        paymentGateway: 'upigateway',
        gatewayOrderId: successfulTransaction.gatewayOrderId,
        gatewayPaymentId: successfulTransaction.gatewayPaymentId,
        amount: refundAmount,
        currency: 'INR',
        status: 'refund_pending',
        paymentMethod: 'upi',
        upiVpa: successfulTransaction.upiVpa,
        metadata: {
          refund_type: 'manual',
          reason,
          customer_vpa: successfulTransaction.upiVpa,
          original_txn_id: successfulTransaction.gatewayPaymentId,
          refund_instructions: 'Process refund manually through your UPI merchant app',
          created_at: new Date().toISOString()
        }
      });

      // Update order payment status to refund_pending
      await order.update({
        paymentStatus: 'refund_pending'
      });

      logger.info('Refund initiated (manual processing required):', {
        orderId,
        refundTransactionId: refundTransaction.id,
        amount: refundAmount,
        customerVpa: successfulTransaction.upiVpa
      });

      // Get user details for admin notification
      const user = await User.findByPk(order.userId, {
        attributes: ['phone']
      });

      // Send notification to client
      await notificationService.createNotification('REFUND_INITIATED', {
        userId: order.userId,
        orderId: order.id,
        refundAmount: parseFloat(refundAmount).toFixed(2)
      });

      // Send notification to admin
      await notificationService.createNotification('REFUND_REQUESTED', {
        orderId: order.id,
        customerPhone: user.phone,
        refundAmount: parseFloat(refundAmount).toFixed(2),
        customerVpa: successfulTransaction.upiVpa
      });

      return {
        success: true,
        orderId: order.id,
        refundTransactionId: refundTransaction.id,
        amount: refundAmount,
        status: 'refund_pending',
        customerVpa: successfulTransaction.upiVpa,
        message: 'Refund initiated. Please process manually through your UPI merchant app.',
        instructions: `Send ₹${refundAmount} to ${successfulTransaction.upiVpa} using your UPI merchant app.`
      };
    } catch (error) {
      logger.error('Refund processing failed:', error);
      throw error;
    }
  }
}


module.exports = new PaymentService();

