import api from './api';

/**
 * Address Service
 * Handles all address-related API calls for admin app
 */

/**
 * Get all addresses (Admin only)
 */
export const getAllAddresses = async (params = {}) => {
  const response = await api.get('/addresses', { params });
  return response.data;
};

/**
 * Get address by ID
 */
export const getAddressById = async (id) => {
  const response = await api.get(`/addresses/${id}`);
  return response.data;
};

/**
 * Create new address
 */
export const createAddress = async (addressData) => {
  const response = await api.post('/addresses', addressData);
  return response.data;
};

/**
 * Update address
 */
export const updateAddress = async (id, addressData) => {
  const response = await api.put(`/addresses/${id}`, addressData);
  return response.data;
};

/**
 * Delete address
 */
export const deleteAddress = async (id) => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};

/**
 * Set address as default
 */
export const setDefaultAddress = async (id) => {
  const response = await api.patch(`/addresses/${id}/default`);
  return response.data;
};

