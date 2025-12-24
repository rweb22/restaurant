/**
 * Webhook Validator Middleware
 * 
 * This middleware validates Razorpay webhook signatures to ensure
 * the webhook requests are authentic and coming from Razorpay.
 */

const crypto = require('crypto');
const razorpayConfig = require('../config/razorpay');
const logger = require('../utils/logger');

/**
 * Validate Razorpay webhook signature
 */
const validateWebhookSignature = (req, res, next) => {
  try {
    // Get signature from headers
    const receivedSignature = req.headers['x-razorpay-signature'];
    
    if (!receivedSignature) {
      logger.warn('Webhook signature missing in headers');
      return res.status(400).json({
        success: false,
        message: 'Webhook signature missing'
      });
    }

    // Get raw body (must be string)
    const body = JSON.stringify(req.body);

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', razorpayConfig.webhookSecret)
      .update(body)
      .digest('hex');

    // Compare signatures
    if (receivedSignature !== expectedSignature) {
      logger.warn('Webhook signature verification failed', {
        received: receivedSignature,
        expected: expectedSignature
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    logger.info('Webhook signature verified successfully');
    next();
  } catch (error) {
    logger.error('Error validating webhook signature:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook validation error'
    });
  }
};

module.exports = {
  validateWebhookSignature
};

