/**
 * Webhook Controller
 * 
 * This controller handles webhook events from Razorpay.
 * Webhooks are used to receive real-time notifications about payment events.
 */

const { Transaction, Order, User } = require('../models');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

/**
 * Handle Razorpay webhook events
 * POST /api/webhooks/razorpay
 */
const handleRazorpayWebhook = async (req, res) => {
  try {
    const event = req.body;
    
    logger.info('Received Razorpay webhook:', {
      event: event.event,
      paymentId: event.payload?.payment?.entity?.id
    });

    // Handle different event types
    switch (event.event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(event.payload.payment.entity);
        break;
        
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
        
      case 'refund.created':
        await handleRefundCreated(event.payload.refund.entity);
        break;
        
      case 'refund.processed':
        await handleRefundProcessed(event.payload.refund.entity);
        break;
        
      default:
        logger.info('Unhandled webhook event type:', event.event);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error handling webhook:', error);
    // Still respond with 200 to prevent Razorpay from retrying
    res.status(200).json({ success: true });
  }
};

/**
 * Handle payment.authorized event
 */
const handlePaymentAuthorized = async (payment) => {
  try {
    const transaction = await Transaction.findOne({
      where: { gatewayOrderId: payment.order_id }
    });

    if (transaction) {
      await transaction.update({
        gatewayPaymentId: payment.id,
        status: 'authorized',
        paymentMethod: payment.method,
        metadata: {
          ...transaction.metadata,
          webhook_payment_authorized: payment
        }
      });
      
      logger.info('Payment authorized via webhook:', {
        transactionId: transaction.id,
        paymentId: payment.id
      });
    }
  } catch (error) {
    logger.error('Error handling payment.authorized webhook:', error);
  }
};

/**
 * Handle payment.captured event
 */
const handlePaymentCaptured = async (payment) => {
  try {
    const transaction = await Transaction.findOne({
      where: { gatewayOrderId: payment.order_id },
      include: [{ model: Order, as: 'order' }]
    });

    if (transaction) {
      await transaction.update({
        gatewayPaymentId: payment.id,
        status: 'captured',
        paymentMethod: payment.method,
        upiVpa: payment.vpa || null,
        cardNetwork: payment.card?.network || null,
        cardLast4: payment.card?.last4 || null,
        bankName: payment.bank || null,
        walletName: payment.wallet || null,
        metadata: {
          ...transaction.metadata,
          webhook_payment_captured: payment
        }
      });

      // Update order if not already updated
      if (transaction.order && transaction.order.paymentStatus !== 'completed') {
        await transaction.order.update({
          paymentStatus: 'completed',
          paymentMethod: payment.method,
          paymentGatewayPaymentId: payment.id,
          status: 'pending'
        });

        // Get user details for admin notification
        const user = await User.findByPk(transaction.order.userId, {
          attributes: ['phone']
        });

        // Send notification to client
        await notificationService.createNotification('PAYMENT_COMPLETED', {
          userId: transaction.order.userId,
          orderId: transaction.orderId,
          amount: parseFloat(transaction.amount).toFixed(2)
        });

        // Send notification to admin
        await notificationService.createNotification('NEW_ORDER', {
          orderId: transaction.orderId,
          customerPhone: user.phone,
          totalPrice: parseFloat(transaction.order.totalPrice).toFixed(2)
        });

        // Also send PAYMENT_RECEIVED notification to admin
        await notificationService.createNotification('PAYMENT_RECEIVED', {
          orderId: transaction.orderId,
          customerPhone: user.phone,
          amount: parseFloat(transaction.amount).toFixed(2)
        });
      }

      logger.info('Payment captured via webhook:', {
        transactionId: transaction.id,
        orderId: transaction.orderId,
        paymentId: payment.id
      });
    }
  } catch (error) {
    logger.error('Error handling payment.captured webhook:', error);
  }
};

/**
 * Handle payment.failed event
 */
const handlePaymentFailed = async (payment) => {
  try {
    const transaction = await Transaction.findOne({
      where: { gatewayOrderId: payment.order_id },
      include: [{ model: Order, as: 'order' }]
    });

    if (transaction) {
      await transaction.update({
        gatewayPaymentId: payment.id,
        status: 'failed',
        errorCode: payment.error_code,
        errorDescription: payment.error_description,
        metadata: {
          ...transaction.metadata,
          webhook_payment_failed: payment
        }
      });

      // Update order payment status
      if (transaction.order) {
        await transaction.order.update({
          paymentStatus: 'failed'
        });

        // Send notification to client
        await notificationService.createNotification('PAYMENT_FAILED', {
          userId: transaction.order.userId,
          orderId: transaction.orderId,
          errorDescription: payment.error_description || 'Payment failed. Please try again.'
        });
      }

      logger.info('Payment failed via webhook:', {
        transactionId: transaction.id,
        orderId: transaction.orderId,
        paymentId: payment.id,
        errorCode: payment.error_code
      });
    }
  } catch (error) {
    logger.error('Error handling payment.failed webhook:', error);
  }
};

/**
 * Handle refund.created event
 */
const handleRefundCreated = async (refund) => {
  try {
    logger.info('Refund created via webhook:', {
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount
    });

    // Refund transaction is already created in paymentService.processRefund
    // This webhook is just for logging/notification purposes
  } catch (error) {
    logger.error('Error handling refund.created webhook:', error);
  }
};

/**
 * Handle refund.processed event
 */
const handleRefundProcessed = async (refund) => {
  try {
    logger.info('Refund processed via webhook:', {
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount,
      status: refund.status
    });

    // Update transaction metadata with refund status
    const transaction = await Transaction.findOne({
      where: { gatewayPaymentId: refund.payment_id, status: 'refunded' }
    });

    if (transaction && transaction.metadata?.refund_id === refund.id) {
      await transaction.update({
        metadata: {
          ...transaction.metadata,
          webhook_refund_processed: refund
        }
      });
    }
  } catch (error) {
    logger.error('Error handling refund.processed webhook:', error);
  }
};

module.exports = {
  handleRazorpayWebhook
};

