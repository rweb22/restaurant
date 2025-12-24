import api from './api';

/**
 * Menu Service
 */
const menuService = {
  /**
   * Get all categories
   * @param {Object} params - Query parameters
   * @returns {Promise} - Categories list
   */
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - Category data
   */
  getCategoryById: async (id, params = {}) => {
    const response = await api.get(`/categories/${id}`, { params });
    return response.data;
  },

  /**
   * Get all items
   * @param {Object} params - Query parameters (categoryId, available, includeSizes, includeAddOns)
   * @returns {Promise} - Items list
   */
  getItems: async (params = {}) => {
    const response = await api.get('/items', { params });
    return response.data;
  },

  /**
   * Get item by ID
   * @param {number} id - Item ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - Item data
   */
  getItemById: async (id, params = {}) => {
    const response = await api.get(`/items/${id}`, { params });
    return response.data;
  },

  /**
   * Get add-ons for an item
   * @param {number} itemId - Item ID
   * @returns {Promise} - Add-ons list
   */
  getItemAddOns: async (itemId) => {
    const response = await api.get(`/item-add-ons/item/${itemId}`);
    return response.data;
  },

  /**
   * Get add-ons for a category
   * @param {number} categoryId - Category ID
   * @returns {Promise} - Add-ons list
   */
  getCategoryAddOns: async (categoryId) => {
    const response = await api.get(`/category-add-ons/category/${categoryId}`);
    return response.data;
  },
};

export default menuService;

