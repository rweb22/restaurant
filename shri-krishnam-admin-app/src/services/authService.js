import api from './api';

const authService = {
  // Send OTP to phone number
  sendOTP: async (phone) => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  },

  // Verify OTP and get token
  verifyOTP: async (phone, otp, secret, pushToken = null) => {
    const payload = { phone, otp, secret };
    if (pushToken) {
      payload.pushToken = pushToken;
    }
    const response = await api.post('/auth/verify-otp', payload);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    // No server-side logout needed for JWT
    return Promise.resolve();
  },
};

export default authService;

