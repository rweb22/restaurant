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
 * @route   GET /api/payments/transactions
 * @desc    Get all transactions (Admin only)
 * @access  Private (Admin only)
 */
router.get('/transactions', authenticate, requireRole('admin'), paymentController.getAllTransactions);

/**
 * @route   GET /api/payments/transactions/:id
 * @desc    Get transaction by ID (Admin only)
 * @access  Private (Admin only)
 */
router.get('/transactions/:id', authenticate, requireRole('admin'), paymentController.getTransactionById);

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate payment for an order
 * @access  Private (Client)
 */
router.post('/initiate', authenticate, paymentController.initiatePayment);

/**
 * @route   POST /api/payments/check-status
 * @desc    Check payment status (for polling)
 * @access  Private (Client)
 */
router.post('/check-status', authenticate, paymentController.checkPaymentStatus);

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

