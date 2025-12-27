import api from './api';

/**
 * Authentication Service
 */
const authService = {
  /**
   * Send OTP to phone number
   * @param {string} phone - Phone number with country code (e.g., +919999999999)
   * @returns {Promise} - Response with session secret
   */
  sendOTP: async (phone) => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  },

  /**
   * Verify OTP and get access token
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @param {string} secret - Session secret from sendOTP
   * @param {string} pushToken - Optional push notification token
   * @returns {Promise} - Response with access token and user data
   */
  verifyOTP: async (phone, otp, secret, pushToken = null) => {
    const payload = {
      phone,
      otp,
      secret,
    };

    // Add push token if provided
    if (pushToken) {
      payload.pushToken = pushToken;
    }

    const response = await api.post('/auth/verify-otp', payload);
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise} - User profile data
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} data - Profile data to update
   * @returns {Promise} - Updated user data
   */
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

export default authService;

