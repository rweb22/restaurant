/**
 * Webhook Routes
 *
 * This file defines all webhook-related routes.
 * Webhooks are used to receive real-time notifications from payment gateways.
 */

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { validateUPIGatewayWebhook } = require('../middleware/webhookValidator');

/**
 * @route   POST /api/webhooks/upigateway
 * @desc    Handle UPIGateway webhook events
 * @access  Public (but signature validated)
 */
router.post('/upigateway', validateUPIGatewayWebhook, webhookController.handleUPIGatewayWebhook);

module.exports = router;

