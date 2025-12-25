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
const { Transaction, Order, User } = require('../models');
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
 * Check payment status (for polling)
 * POST /api/payments/check-status
 *
 * UPIGateway uses webhooks for payment confirmation, but this endpoint
 * allows clients to poll for status updates if needed.
 */
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Check payment status (with gateway check)
    const result = await paymentService.getPaymentStatus(orderId, true);

    // Send response
    res.status(200).json({
      success: true,
      data: result,
      message: 'Payment status retrieved successfully'
    });
  } catch (error) {
    logger.error('Error checking payment status:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to check payment status'
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

/**
 * Get all transactions (Admin only)
 * GET /api/payments/transactions
 */
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, orderId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (orderId) where.orderId = parseInt(orderId);

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'phone']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        transactions: transactions.map(t => t.toSafeObject()),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting all transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get transactions'
    });
  }
};

/**
 * Get transaction by ID (Admin only)
 * GET /api/payments/transactions/:id
 */
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'phone']
            }
          ]
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { transaction: transaction.toSafeObject() }
    });
  } catch (error) {
    logger.error('Error getting transaction by ID:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get transaction'
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  initiatePayment,
  checkPaymentStatus,
  getPaymentStatus,
  processRefund
};

