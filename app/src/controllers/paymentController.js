/**
 * Payment Controller
 * 
 * This controller handles all payment-related HTTP requests.
 */

const paymentService = require('../services/paymentService');
const {
  initiatePaymentSchema,
  verifyPaymentSchema,
  getPaymentStatusSchema,
  processRefundSchema,
  formatInitiatePaymentResponse,
  formatVerifyPaymentResponse,
  formatPaymentStatusResponse,
  formatRefundResponse
} = require('../dtos/payment.dto');
const logger = require('../utils/logger');

/**
 * Initiate payment for an order
 * POST /api/payments/initiate
 */
const initiatePayment = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = initiatePaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Initiate payment
    const result = await paymentService.initiatePayment(value.orderId);

    // Send response
    res.status(200).json(formatInitiatePaymentResponse(result));
  } catch (error) {
    logger.error('Error initiating payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment'
    });
  }
};

/**
 * Verify payment after user completes payment
 * POST /api/payments/verify
 */
const verifyPayment = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = verifyPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Verify payment
    const result = await paymentService.verifyPayment(
      value.razorpay_order_id,
      value.razorpay_payment_id,
      value.razorpay_signature
    );

    // Send response
    res.status(200).json(formatVerifyPaymentResponse(result));
  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
};

/**
 * Get payment status for an order
 * GET /api/payments/status/:orderId
 */
const getPaymentStatus = async (req, res) => {
  try {
    // Validate request params
    const { error, value } = getPaymentStatusSchema.validate({
      orderId: parseInt(req.params.orderId)
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Get payment status
    const result = await paymentService.getPaymentStatus(value.orderId);

    // Send response
    res.status(200).json(formatPaymentStatusResponse(result));
  } catch (error) {
    logger.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment status'
    });
  }
};

/**
 * Process refund for an order (Admin only)
 * POST /api/payments/refund
 */
const processRefund = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = processRefundSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Process refund
    const result = await paymentService.processRefund(
      value.orderId,
      value.amount,
      value.reason
    );

    // Send response
    res.status(200).json(formatRefundResponse(result));
  } catch (error) {
    logger.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund'
    });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
  processRefund
};

