/**
 * Webhook Validator Middleware
 *
 * This middleware validates UPIGateway webhook signatures to ensure
 * the webhook requests are authentic and coming from UPIGateway.
 */

const crypto = require('crypto');
const upigatewayConfig = require('../config/upigateway');
const logger = require('../utils/logger');

/**
 * Validate UPIGateway webhook signature
 */
const validateUPIGatewayWebhook = (req, res, next) => {
  try {
    // Get signature from headers
    const receivedSignature = req.headers['x-upigateway-signature'];

    if (!receivedSignature) {
      logger.warn('UPIGateway webhook signature missing in headers');
      return res.status(400).json({
        success: false,
        message: 'Webhook signature missing'
      });
    }

    // Get raw body (must be string)
    const body = JSON.stringify(req.body);

    // Generate expected signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', upigatewayConfig.webhookSecret)
      .update(body)
      .digest('hex');

    // Compare signatures
    if (receivedSignature !== expectedSignature) {
      logger.warn('UPIGateway webhook signature verification failed', {
        received: receivedSignature,
        expected: expectedSignature
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    logger.info('UPIGateway webhook signature verified successfully');
    next();
  } catch (error) {
    logger.error('Error validating UPIGateway webhook signature:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook validation error'
    });
  }
};

module.exports = {
  validateUPIGatewayWebhook
};

