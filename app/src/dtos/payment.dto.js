/**
 * Payment Data Transfer Objects (DTOs)
 * 
 * This file contains validation schemas and response formatters for payment-related operations.
 */

const Joi = require('joi');

/**
 * Validation Schemas
 */

// Initiate payment request
const initiatePaymentSchema = Joi.object({
  orderId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Order ID must be a number',
      'number.integer': 'Order ID must be an integer',
      'number.positive': 'Order ID must be positive',
      'any.required': 'Order ID is required'
    })
});

// Verify payment request
const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required()
    .messages({
      'string.base': 'Razorpay order ID must be a string',
      'any.required': 'Razorpay order ID is required'
    }),
  razorpay_payment_id: Joi.string().required()
    .messages({
      'string.base': 'Razorpay payment ID must be a string',
      'any.required': 'Razorpay payment ID is required'
    }),
  razorpay_signature: Joi.string().required()
    .messages({
      'string.base': 'Razorpay signature must be a string',
      'any.required': 'Razorpay signature is required'
    })
});

// Get payment status request (query params)
const getPaymentStatusSchema = Joi.object({
  orderId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Order ID must be a number',
      'number.integer': 'Order ID must be an integer',
      'number.positive': 'Order ID must be positive',
      'any.required': 'Order ID is required'
    })
});

// Process refund request
const processRefundSchema = Joi.object({
  orderId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Order ID must be a number',
      'number.integer': 'Order ID must be an integer',
      'number.positive': 'Order ID must be positive',
      'any.required': 'Order ID is required'
    }),
  amount: Joi.number().positive().optional()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive'
    }),
  reason: Joi.string().max(500).optional()
    .messages({
      'string.base': 'Reason must be a string',
      'string.max': 'Reason must not exceed 500 characters'
    })
});

/**
 * Response Formatters
 */

// Format payment initiation response
const formatInitiatePaymentResponse = (data) => {
  return {
    success: true,
    message: 'Payment initiated successfully',
    data: {
      orderId: data.orderId,
      transactionId: data.transactionId,
      gatewayOrderId: data.gatewayOrderId,
      amount: parseFloat(data.amount),
      currency: data.currency,
      razorpayKeyId: data.razorpayKeyId
    }
  };
};

// Format payment verification response
const formatVerifyPaymentResponse = (data) => {
  return {
    success: true,
    message: 'Payment verified successfully',
    data: {
      orderId: data.orderId,
      transactionId: data.transactionId,
      paymentStatus: data.paymentStatus,
      orderStatus: data.orderStatus
    }
  };
};

// Format payment status response
const formatPaymentStatusResponse = (data) => {
  return {
    success: true,
    data: {
      orderId: data.orderId,
      orderStatus: data.orderStatus,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      totalAmount: data.totalAmount,
      transactions: data.transactions
    }
  };
};

// Format refund response
const formatRefundResponse = (data) => {
  return {
    success: true,
    message: 'Refund processed successfully',
    data: {
      orderId: data.orderId,
      refundTransactionId: data.refundTransactionId,
      refundId: data.refundId,
      amount: parseFloat(data.amount),
      status: data.status
    }
  };
};

module.exports = {
  // Validation schemas
  initiatePaymentSchema,
  verifyPaymentSchema,
  getPaymentStatusSchema,
  processRefundSchema,
  
  // Response formatters
  formatInitiatePaymentResponse,
  formatVerifyPaymentResponse,
  formatPaymentStatusResponse,
  formatRefundResponse
};

