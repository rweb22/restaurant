/**
 * Razorpay Service
 * 
 * This service handles all direct interactions with the Razorpay API.
 * It provides methods for creating orders, verifying payments, and processing refunds.
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const razorpayConfig = require('../config/razorpay');
const MockRazorpayService = require('./mockRazorpayService');
const logger = require('../utils/logger');

class RazorpayService {
  constructor() {
    // Use mock service if configured
    const useMock = process.env.PAYMENT_USE_MOCK === 'true';

    if (useMock) {
      logger.info('Using Mock Razorpay service for testing');
      this.mockService = new MockRazorpayService();
      this.isMock = true;
      return;
    }

    // Initialize Razorpay instance only if payment is enabled
    if (razorpayConfig.enabled) {
      try {
        razorpayConfig.validate();
        this.razorpay = new Razorpay({
          key_id: razorpayConfig.keyId,
          key_secret: razorpayConfig.keySecret
        });
        this.isMock = false;
        logger.info('Razorpay service initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Razorpay service:', error);
        throw error;
      }
    } else {
      logger.warn('Razorpay service is disabled');
    }
  }

  /**
   * Create a Razorpay order
   * @param {number} amount - Amount in smallest currency unit (paise for INR)
   * @param {string} currency - Currency code (default: INR)
   * @param {string} receipt - Unique receipt ID for the order
   * @param {object} notes - Additional notes/metadata
   * @returns {Promise<object>} Razorpay order object
   */
  async createOrder(amount, currency = 'INR', receipt, notes = {}) {
    // Use mock service if configured
    if (this.isMock) {
      return await this.mockService.createOrder(amount, currency, receipt, notes);
    }

    if (!razorpayConfig.enabled) {
      throw new Error('Payment service is disabled');
    }

    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes,
        payment_capture: 1 // Auto-capture payment
      };

      logger.info('Creating Razorpay order:', { receipt, amount, currency });
      const order = await this.razorpay.orders.create(options);
      logger.info('Razorpay order created successfully:', { orderId: order.id });

      return order;
    } catch (error) {
      logger.error('Failed to create Razorpay order:', error);
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  }

  /**
   * Verify payment signature
   * @param {string} orderId - Razorpay order ID
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} signature - Razorpay signature
   * @returns {boolean} True if signature is valid
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    // Use mock service if configured
    if (this.isMock) {
      return this.mockService.verifyPaymentSignature(orderId, paymentId, signature);
    }

    try {
      const text = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', razorpayConfig.keySecret)
        .update(text)
        .digest('hex');

      const isValid = expectedSignature === signature;

      if (isValid) {
        logger.info('Payment signature verified successfully:', { orderId, paymentId });
      } else {
        logger.warn('Payment signature verification failed:', { orderId, paymentId });
      }

      return isValid;
    } catch (error) {
      logger.error('Error verifying payment signature:', error);
      return false;
    }
  }

  /**
   * Fetch payment details from Razorpay
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Promise<object>} Payment details
   */
  async fetchPayment(paymentId) {
    // Use mock service if configured
    if (this.isMock) {
      return await this.mockService.fetchPayment(paymentId);
    }

    if (!razorpayConfig.enabled) {
      throw new Error('Payment service is disabled');
    }

    try {
      logger.info('Fetching payment details:', { paymentId });
      const payment = await this.razorpay.payments.fetch(paymentId);
      logger.info('Payment details fetched successfully:', { paymentId, status: payment.status });

      return payment;
    } catch (error) {
      logger.error('Failed to fetch payment details:', error);
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  }

  /**
   * Create a refund for a payment
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount to refund in smallest currency unit (optional, full refund if not specified)
   * @param {object} notes - Additional notes for the refund
   * @returns {Promise<object>} Refund object
   */
  async createRefund(paymentId, amount = null, notes = {}) {
    // Use mock service if configured
    if (this.isMock) {
      return await this.mockService.createRefund(paymentId, amount, notes);
    }

    if (!razorpayConfig.enabled) {
      throw new Error('Payment service is disabled');
    }

    if (!razorpayConfig.refund.enabled) {
      throw new Error('Refund service is disabled');
    }

    try {
      const options = {
        speed: razorpayConfig.refund.speed,
        notes
      };

      if (amount) {
        options.amount = Math.round(amount * 100); // Convert to paise
      }

      logger.info('Creating refund:', { paymentId, amount });
      const refund = await this.razorpay.payments.refund(paymentId, options);
      logger.info('Refund created successfully:', { refundId: refund.id, paymentId });

      return refund;
    } catch (error) {
      logger.error('Failed to create refund:', error);
      throw new Error(`Refund creation failed: ${error.message}`);
    }
  }
}

module.exports = new RazorpayService();

