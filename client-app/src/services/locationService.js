import api from './api';

/**
 * Location Service
 */
const locationService = {
  /**
   * Get all locations
   * @param {Object} params - Query parameters
   * @returns {Promise} - Locations list
   */
  getLocations: async (params = {}) => {
    const response = await api.get('/locations', { params });
    return response.data;
  },

  /**
   * Get location by ID
   * @param {number} id - Location ID
   * @returns {Promise} - Location data
   */
  getLocationById: async (id) => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  }
};

export default locationService;

