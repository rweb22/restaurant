/**
 * UPIGateway Utility Functions
 * 
 * Helper functions for UPIGateway payment integration
 */

import { API_BASE_URL } from '../constants/config';
import { getAuthToken } from './auth';

/**
 * Initiate UPIGateway payment for an order
 * @param {number} orderId - Order ID
 * @returns {Promise<object>} Payment data including QR code
 */
export const initiatePayment = async (orderId) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId })
    });

    const data = await response.json();

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
    const token = await getAuthToken();
    
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
    const token = await getAuthToken();
    
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

