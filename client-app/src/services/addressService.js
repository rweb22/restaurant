import api from './api';

/**
 * Address Service
 */
const addressService = {
  /**
   * Get all addresses for the authenticated user
   * @returns {Promise} - Addresses list
   */
  getAddresses: async () => {
    const response = await api.get('/addresses');
    return response.data;
  },

  /**
   * Get address by ID
   * @param {number} id - Address ID
   * @returns {Promise} - Address data
   */
  getAddressById: async (id) => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  /**
   * Create new address
   * @param {Object} addressData - Address data
   * @returns {Promise} - Created address
   */
  createAddress: async (addressData) => {
    console.log('[AddressService] Creating address with data:', addressData);
    const response = await api.post('/addresses', addressData);
    console.log('[AddressService] Address created:', response.data);
    return response.data;
  },

  /**
   * Update address
   * @param {number} id - Address ID
   * @param {Object} addressData - Updated address data
   * @returns {Promise} - Updated address
   */
  updateAddress: async (id, addressData) => {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data;
  },

  /**
   * Delete address
   * @param {number} id - Address ID
   * @returns {Promise} - Deletion result
   */
  deleteAddress: async (id) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  /**
   * Set address as default
   * @param {number} id - Address ID
   * @returns {Promise} - Updated address
   */
  setDefaultAddress: async (id) => {
    const response = await api.patch(`/addresses/${id}/default`);
    return response.data;
  }
};

export default addressService;

