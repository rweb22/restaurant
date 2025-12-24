/**
 * Mock Razorpay Service for Testing
 * 
 * This service simulates Razorpay API calls for local development and testing
 * without requiring real API credentials.
 * 
 * Usage: Set PAYMENT_USE_MOCK=true in .env to use this service
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

class MockRazorpayService {
  constructor() {
    logger.info('Mock Razorpay service initialized (for testing only)');
    this.orders = new Map();
    this.payments = new Map();
    this.refunds = new Map();
  }

  /**
   * Create a mock Razorpay order
   * @param {number} amount - Amount in rupees (will be converted to paise)
   * @param {string} currency - Currency code (default: INR)
   * @param {string} receipt - Receipt ID
   * @param {object} notes - Additional notes
   * @returns {Promise<object>} Mock order object
   */
  async createOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
      const orderId = `order_${crypto.randomBytes(14).toString('hex')}`;
      const amountInPaise = Math.round(amount * 100);

      const order = {
        id: orderId,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency,
        receipt,
        offer_id: null,
        status: 'created',
        attempts: 0,
        notes,
        created_at: Math.floor(Date.now() / 1000)
      };

      this.orders.set(orderId, order);

      logger.info(`Mock Razorpay order created: ${orderId}`, {
        amount: amount,
        currency,
        receipt
      });

      return order;
    } catch (error) {
      logger.error('Mock Razorpay order creation failed:', error);
      throw error;
    }
  }

  /**
   * Verify payment signature (mock implementation)
   * @param {string} orderId - Razorpay order ID
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} signature - Payment signature
   * @returns {boolean} Always returns true for mock
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    // In mock mode, we accept any signature for testing
    logger.info('Mock payment signature verification (always passes)', {
      orderId,
      paymentId
    });
    return true;
  }

  /**
   * Fetch payment details (mock implementation)
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Promise<object>} Mock payment object
   */
  async fetchPayment(paymentId) {
    try {
      let payment = this.payments.get(paymentId);

      if (!payment) {
        // Create a mock payment if it doesn't exist
        payment = {
          id: paymentId,
          entity: 'payment',
          amount: 10000, // Mock amount in paise
          currency: 'INR',
          status: 'captured',
          order_id: `order_${crypto.randomBytes(14).toString('hex')}`,
          method: 'upi',
          amount_refunded: 0,
          refund_status: null,
          captured: true,
          description: 'Mock payment',
          card_id: null,
          bank: null,
          wallet: null,
          vpa: 'mock@upi',
          email: 'mock@example.com',
          contact: '+919999999999',
          fee: 0,
          tax: 0,
          error_code: null,
          error_description: null,
          created_at: Math.floor(Date.now() / 1000)
        };

        this.payments.set(paymentId, payment);
      }

      logger.info(`Mock payment fetched: ${paymentId}`);
      return payment;
    } catch (error) {
      logger.error('Mock payment fetch failed:', error);
      throw error;
    }
  }

  /**
   * Create a mock refund
   * @param {string} paymentId - Razorpay payment ID
   * @param {number|null} amount - Refund amount in rupees (null for full refund)
   * @param {object} notes - Additional notes
   * @returns {Promise<object>} Mock refund object
   */
  async createRefund(paymentId, amount = null, notes = {}) {
    try {
      const payment = await this.fetchPayment(paymentId);
      const refundId = `rfnd_${crypto.randomBytes(14).toString('hex')}`;
      const refundAmount = amount ? Math.round(amount * 100) : payment.amount;

      const refund = {
        id: refundId,
        entity: 'refund',
        amount: refundAmount,
        currency: 'INR',
        payment_id: paymentId,
        notes,
        receipt: null,
        acquirer_data: {
          arn: null
        },
        created_at: Math.floor(Date.now() / 1000),
        batch_id: null,
        status: 'processed',
        speed_processed: 'normal'
      };

      this.refunds.set(refundId, refund);

      logger.info(`Mock refund created: ${refundId}`, {
        paymentId,
        amount: refundAmount / 100
      });

      return refund;
    } catch (error) {
      logger.error('Mock refund creation failed:', error);
      throw error;
    }
  }
}

module.exports = MockRazorpayService;

