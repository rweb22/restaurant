/**
 * Payment Service
 * 
 * This service provides high-level payment operations and manages the interaction
 * between orders, transactions, and the Razorpay payment gateway.
 */

const razorpayService = require('./razorpayService');
const { Order, Transaction, User } = require('../models');
const logger = require('../utils/logger');
const razorpayConfig = require('../config/razorpay');
const notificationService = require('./notificationService');

class PaymentService {
  /**
   * Initiate payment for an order
   * @param {number} orderId - Order ID
   * @returns {Promise<object>} Payment initiation details
   */
  async initiatePayment(orderId) {
    try {
      // Fetch order
      const order = await Order.findByPk(orderId);
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

      // Create Razorpay order
      const receipt = `order_${orderId}_${Date.now()}`;
      const notes = {
        order_id: orderId,
        order_type: 'restaurant_order'
      };

      const razorpayOrder = await razorpayService.createOrder(
        order.totalPrice,
        razorpayConfig.currency,
        receipt,
        notes
      );

      // Create transaction record
      const transaction = await Transaction.create({
        orderId: orderId,
        paymentGateway: 'razorpay',
        gatewayOrderId: razorpayOrder.id,
        amount: order.totalPrice,
        currency: razorpayConfig.currency,
        status: 'created',
        metadata: {
          receipt,
          razorpay_order: razorpayOrder
        }
      });

      // Update order with gateway order ID
      await order.update({
        paymentGatewayOrderId: razorpayOrder.id,
        paymentStatus: 'processing'
      });

      logger.info('Payment initiated successfully:', {
        orderId,
        transactionId: transaction.id,
        gatewayOrderId: razorpayOrder.id
      });

      return {
        orderId: order.id,
        transactionId: transaction.id,
        gatewayOrderId: razorpayOrder.id,
        amount: order.totalPrice,
        currency: razorpayConfig.currency,
        razorpayKeyId: razorpayConfig.keyId
      };
    } catch (error) {
      logger.error('Failed to initiate payment:', error);
      throw error;
    }
  }

  /**
   * Verify payment after user completes payment
   * @param {string} gatewayOrderId - Razorpay order ID
   * @param {string} gatewayPaymentId - Razorpay payment ID
   * @param {string} gatewaySignature - Razorpay signature
   * @returns {Promise<object>} Verification result
   */
  async verifyPayment(gatewayOrderId, gatewayPaymentId, gatewaySignature) {
    try {
      // Find transaction by gateway order ID
      const transaction = await Transaction.findOne({
        where: { gatewayOrderId },
        include: [{ model: Order, as: 'order' }]
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Verify signature
      const isValid = razorpayService.verifyPaymentSignature(
        gatewayOrderId,
        gatewayPaymentId,
        gatewaySignature
      );

      if (!isValid) {
        // Update transaction as failed
        await transaction.update({
          status: 'failed',
          errorCode: 'SIGNATURE_VERIFICATION_FAILED',
          errorDescription: 'Payment signature verification failed'
        });

        logger.warn('Payment signature verification failed:', {
          transactionId: transaction.id,
          gatewayOrderId
        });

        throw new Error('Payment signature verification failed');
      }

      // Fetch payment details from Razorpay
      const paymentDetails = await razorpayService.fetchPayment(gatewayPaymentId);

      // Update transaction with payment details
      await transaction.update({
        gatewayPaymentId,
        gatewaySignature,
        status: paymentDetails.status === 'captured' ? 'captured' : 'authorized',
        paymentMethod: paymentDetails.method,
        upiVpa: paymentDetails.vpa || null,
        cardNetwork: paymentDetails.card?.network || null,
        cardLast4: paymentDetails.card?.last4 || null,
        bankName: paymentDetails.bank || null,
        walletName: paymentDetails.wallet || null,
        metadata: {
          ...transaction.metadata,
          payment_details: paymentDetails
        }
      });

      // Update order
      const order = transaction.order;
      const wasAlreadyCompleted = order.paymentStatus === 'completed';

      await order.update({
        paymentGatewayPaymentId: gatewayPaymentId,
        paymentStatus: 'completed',
        paymentMethod: paymentDetails.method,
        status: 'pending' // Move to pending for admin confirmation
      });

      logger.info('Payment verified successfully:', {
        orderId: order.id,
        transactionId: transaction.id,
        gatewayPaymentId
      });

      // Only send notifications if payment wasn't already completed (prevent duplicates)
      if (!wasAlreadyCompleted) {
        // Get user details for admin notification
        const user = await User.findByPk(order.userId, {
          attributes: ['phone']
        });

        // Send notification to client
        await notificationService.createNotification('PAYMENT_COMPLETED', {
          userId: order.userId,
          orderId: order.id,
          amount: parseFloat(transaction.amount).toFixed(2)
        });

        // Send notification to admin
        await notificationService.createNotification('NEW_ORDER', {
          orderId: order.id,
          customerPhone: user.phone,
          totalPrice: parseFloat(order.totalPrice).toFixed(2)
        });

        // Also send PAYMENT_RECEIVED notification to admin
        await notificationService.createNotification('PAYMENT_RECEIVED', {
          orderId: order.id,
          customerPhone: user.phone,
          amount: parseFloat(transaction.amount).toFixed(2)
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
   * @returns {Promise<object>} Payment status details
   */
  async getPaymentStatus(orderId) {
    try {
      const order = await Order.findByPk(orderId, {
        include: [{ model: Transaction, as: 'transactions' }]
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        orderId: order.id,
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        totalAmount: parseFloat(order.totalPrice),
        transactions: order.transactions.map(t => t.toSafeObject())
      };
    } catch (error) {
      logger.error('Failed to get payment status:', error);
      throw error;
    }
  }

  /**
   * Process refund for an order
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

      if (!successfulTransaction.gatewayPaymentId) {
        throw new Error('Payment ID not found in transaction');
      }

      // Create refund in Razorpay
      const refundAmount = amount || order.totalPrice;
      const refund = await razorpayService.createRefund(
        successfulTransaction.gatewayPaymentId,
        refundAmount,
        { reason, order_id: orderId }
      );

      // Create new transaction record for refund
      const refundTransaction = await Transaction.create({
        orderId: orderId,
        paymentGateway: 'razorpay',
        gatewayOrderId: successfulTransaction.gatewayOrderId,
        gatewayPaymentId: successfulTransaction.gatewayPaymentId,
        amount: refundAmount,
        currency: razorpayConfig.currency,
        status: 'refunded',
        paymentMethod: successfulTransaction.paymentMethod,
        metadata: {
          refund_id: refund.id,
          refund_details: refund,
          reason
        }
      });

      // Update order payment status
      await order.update({
        paymentStatus: 'refunded'
      });

      logger.info('Refund processed successfully:', {
        orderId,
        refundTransactionId: refundTransaction.id,
        refundId: refund.id,
        amount: refundAmount
      });

      // Get user details for admin notification
      const user = await User.findByPk(order.userId, {
        attributes: ['phone']
      });

      // Send notification to client
      await notificationService.createNotification('REFUND_PROCESSED', {
        userId: order.userId,
        orderId: order.id,
        refundAmount: parseFloat(refundAmount).toFixed(2)
      });

      // Send notification to admin
      await notificationService.createNotification('REFUND_REQUESTED', {
        orderId: order.id,
        customerPhone: user.phone,
        refundAmount: parseFloat(refundAmount).toFixed(2)
      });

      return {
        success: true,
        orderId: order.id,
        refundTransactionId: refundTransaction.id,
        refundId: refund.id,
        amount: refundAmount,
        status: 'refunded'
      };
    } catch (error) {
      logger.error('Refund processing failed:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();

