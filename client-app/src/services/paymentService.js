import api from './api';

/**
 * Payment Service
 */
const paymentService = {
  /**
   * Initiate payment for an order
   * @param {number} orderId - Order ID
   * @returns {Promise} - Payment initiation details (Razorpay order ID, amount, key)
   */
  async initiatePayment(orderId) {
    try {
      console.log('[PaymentService] Initiating payment for order:', orderId);
      const response = await api.post('/payments/initiate', { orderId });
      console.log('[PaymentService] Payment initiated:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PaymentService] Error initiating payment:', error);
      throw error;
    }
  },

  /**
   * Verify payment after user completes payment
   * @param {Object} paymentData - Payment verification data
   * @param {string} paymentData.razorpay_order_id - Razorpay order ID
   * @param {string} paymentData.razorpay_payment_id - Razorpay payment ID
   * @param {string} paymentData.razorpay_signature - Razorpay signature
   * @returns {Promise} - Verification result
   */
  async verifyPayment(paymentData) {
    try {
      console.log('[PaymentService] Verifying payment:', paymentData);
      const response = await api.post('/payments/verify', paymentData);
      console.log('[PaymentService] Payment verified:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PaymentService] Error verifying payment:', error);
      throw error;
    }
  },

  /**
   * Get payment status for an order
   * @param {number} orderId - Order ID
   * @returns {Promise} - Payment status
   */
  async getPaymentStatus(orderId) {
    try {
      console.log('[PaymentService] Getting payment status for order:', orderId);
      const response = await api.get(`/payments/status/${orderId}`);
      console.log('[PaymentService] Payment status:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PaymentService] Error getting payment status:', error);
      throw error;
    }
  },
};

export default paymentService;

