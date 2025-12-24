/**
 * Payment Routes
 * 
 * This file defines all payment-related routes.
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, requireRole } = require('../middleware/auth');

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate payment for an order
 * @access  Private (Client)
 */
router.post('/initiate', authenticate, paymentController.initiatePayment);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment after user completes payment
 * @access  Private (Client)
 */
router.post('/verify', authenticate, paymentController.verifyPayment);

/**
 * @route   GET /api/payments/status/:orderId
 * @desc    Get payment status for an order
 * @access  Private (Client/Admin)
 */
router.get('/status/:orderId', authenticate, paymentController.getPaymentStatus);

/**
 * @route   POST /api/payments/refund
 * @desc    Process refund for an order
 * @access  Private (Admin only)
 */
router.post('/refund', authenticate, requireRole('admin'), paymentController.processRefund);

module.exports = router;

