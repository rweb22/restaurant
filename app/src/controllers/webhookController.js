/**
 * Webhook Controller
 *
 * This controller handles webhook events from UPIGateway.
 * Webhooks are used to receive real-time notifications about payment events.
 */

const paymentService = require('../services/paymentService');
const { Transaction, Order, User } = require('../models');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

/**
 * Handle UPIGateway webhook events
 * POST /api/webhooks/upigateway
 */
const handleUPIGatewayWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    logger.info('Received UPIGateway webhook:', {
      client_txn_id: webhookData.client_txn_id,
      status: webhookData.status,
      txn_id: webhookData.txn_id
    });

    // Process webhook payment using payment service
    await paymentService.handleWebhookPayment(webhookData);

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    logger.error('Error handling UPIGateway webhook:', error);
    // Still respond with 200 to prevent UPIGateway from retrying
    res.status(200).json({
      success: true,
      message: 'Webhook received'
    });
  }
};

module.exports = {
  handleUPIGatewayWebhook
};

