import api from './api';

/**
 * Transaction Service
 * Handles all transaction-related API calls for admin app
 */

/**
 * Get all transactions (Admin only)
 */
export const getAllTransactions = async (params = {}) => {
  const response = await api.get('/payments/transactions', { params });
  return response.data;
};

/**
 * Get transaction by ID (Admin only)
 */
export const getTransactionById = async (id) => {
  const response = await api.get(`/payments/transactions/${id}`);
  return response.data;
};

/**
 * Process refund (Admin only)
 */
export const processRefund = async (refundData) => {
  const response = await api.post('/payments/refund', refundData);
  return response.data;
};

