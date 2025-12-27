import api from './api';

const restaurantService = {
  /**
   * Get restaurant status (public)
   */
  async getStatus() {
    const response = await api.get('/restaurant/status');
    return response.data;
  },

  /**
   * Get restaurant info (public)
   */
  async getInfo() {
    const response = await api.get('/restaurant/info');
    return response.data;
  },

  /**
   * Get operating hours (public)
   */
  async getOperatingHours() {
    const response = await api.get('/restaurant/hours');
    return response.data;
  },

  /**
   * Get all settings (admin)
   */
  async getSettings() {
    const response = await api.get('/restaurant/settings');
    return response.data;
  },

  /**
   * Update settings (admin)
   */
  async updateSettings(data) {
    const response = await api.put('/restaurant/settings', data);
    return response.data;
  },

  /**
   * Manually close restaurant (admin)
   */
  async manualClose(reason) {
    const response = await api.post('/restaurant/manual-close', { reason });
    return response.data;
  },

  /**
   * Manually open restaurant (admin)
   */
  async manualOpen() {
    const response = await api.post('/restaurant/manual-open', {});
    return response.data;
  },

  /**
   * Update operating hours for a day (admin)
   */
  async updateOperatingHoursForDay(dayOfWeek, slots) {
    const response = await api.put(`/restaurant/operating-hours/${dayOfWeek}`, { slots });
    return response.data;
  },

  /**
   * Get all holidays (admin)
   */
  async getHolidays() {
    const response = await api.get('/restaurant/holidays');
    return response.data;
  },

  /**
   * Create holiday (admin)
   */
  async createHoliday(data) {
    const response = await api.post('/restaurant/holidays', data);
    return response.data;
  },

  /**
   * Update holiday (admin)
   */
  async updateHoliday(id, data) {
    const response = await api.put(`/restaurant/holidays/${id}`, data);
    return response.data;
  },

  /**
   * Delete holiday (admin)
   */
  async deleteHoliday(id) {
    const response = await api.delete(`/restaurant/holidays/${id}`);
    return response.data;
  }
};

export default restaurantService;

