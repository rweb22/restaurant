/**
 * UPIGateway Utility Functions
 *
 * Helper functions for UPIGateway payment integration
 */

import { API_CONFIG } from '../constants/config';
import useAuthStore from '../store/authStore';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Initiate UPIGateway payment for an order
 * @param {number} orderId - Order ID
 * @returns {Promise<object>} Payment data including QR code
 */
export const initiatePayment = async (orderId) => {
  try {
    const token = useAuthStore.getState().token;

    console.log('[UPIGateway] Initiating payment for order:', orderId);
    console.log('[UPIGateway] API URL:', `${API_BASE_URL}/payments/initiate`);
    console.log('[UPIGateway] Token:', token ? 'Present' : 'Missing');

    const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId })
    });

    console.log('[UPIGateway] Response status:', response.status);
    console.log('[UPIGateway] Response headers:', response.headers);

    // Get response text first to see what we're actually receiving
    const responseText = await response.text();
    console.log('[UPIGateway] Response text:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[UPIGateway] Failed to parse response as JSON:', parseError);
      throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to initiate payment');
    }

    if (!data.success) {
      throw new Error(data.message || 'Payment initiation failed');
    }

    return data.data;
  } catch (error) {
    console.error('Error initiating UPIGateway payment:', error);
    throw error;
  }
};

/**
 * Check payment status for an order
 * @param {number} orderId - Order ID
 * @returns {Promise<object>} Payment status
 */
export const checkPaymentStatus = async (orderId) => {
  try {
    const token = useAuthStore.getState().token;

    const response = await fetch(`${API_BASE_URL}/payments/check-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to check payment status');
    }

    if (!data.success) {
      throw new Error(data.message || 'Failed to retrieve payment status');
    }

    return data.data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

/**
 * Get payment status for an order (without gateway check)
 * @param {number} orderId - Order ID
 * @returns {Promise<object>} Payment status
 */
export const getPaymentStatus = async (orderId) => {
  try {
    const token = useAuthStore.getState().token;

    const response = await fetch(`${API_BASE_URL}/payments/status/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get payment status');
    }

    if (!data.success) {
      throw new Error(data.message || 'Failed to retrieve payment status');
    }

    return data.data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};

/**
 * Open UPI app with payment URL
 * @param {string} paymentUrl - UPI payment URL
 */
export const openUPIApp = (paymentUrl) => {
  if (typeof window !== 'undefined' && window.open) {
    window.open(paymentUrl, '_blank');
  }
};

/**
 * Share UPI payment string
 * @param {string} qrString - UPI intent string
 */
export const shareUPIString = async (qrString) => {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'UPI Payment',
        text: qrString
      });
    } catch (error) {
      console.error('Error sharing UPI string:', error);
    }
  }
};

