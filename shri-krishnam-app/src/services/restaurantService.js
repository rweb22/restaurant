import axios from 'axios';
import { API_CONFIG } from '../constants/config';

const restaurantService = {
  /**
   * Get restaurant status (public)
   */
  async getStatus() {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/restaurant/status`);
    return response.data;
  },

  /**
   * Get restaurant info (public)
   */
  async getInfo() {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/restaurant/info`);
    return response.data;
  },

  /**
   * Get operating hours (public)
   */
  async getOperatingHours() {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/restaurant/hours`);
    return response.data;
  }
};

export default restaurantService;

