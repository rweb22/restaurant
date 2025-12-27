import api from './api';

/**
 * Order Service
 */
const orderService = {
  /**
   * Get all orders for current user
   * @param {Object} params - Query parameters (status, page, limit)
   * @returns {Promise} - Orders list
   */
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  /**
   * Get order by ID
   * @param {number} id - Order ID
   * @returns {Promise} - Order data
   */
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Create new order
   * @param {Object} orderData - Order data
   * @returns {Promise} - Created order
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Cancel order
   * @param {number} id - Order ID
   * @returns {Promise} - Updated order
   */
  cancelOrder: async (id) => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },

  /**
   * Validate offer code
   * @param {string} code - Offer code
   * @param {number} orderValue - Order value
   * @returns {Promise} - Validation result
   */
  validateOffer: async (code, orderValue) => {
    const response = await api.post('/offers/validate', { code, orderValue });
    return response.data;
  },
};

export default orderService;

