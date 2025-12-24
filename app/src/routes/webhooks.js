/**
 * Webhook Routes
 * 
 * This file defines all webhook-related routes.
 * Webhooks are used to receive real-time notifications from payment gateways.
 */

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { validateWebhookSignature } = require('../middleware/webhookValidator');

/**
 * @route   POST /api/webhooks/razorpay
 * @desc    Handle Razorpay webhook events
 * @access  Public (but signature validated)
 */
router.post('/razorpay', validateWebhookSignature, webhookController.handleRazorpayWebhook);

module.exports = router;

