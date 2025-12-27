'use strict';

const otpService = require('../services/otpService');
const authService = require('../services/authService');
const pushNotificationService = require('../services/pushNotificationService');
const {
  formatOtpSendResponse,
  formatAuthResponse,
  formatTokenRefreshResponse,
  formatUserResponse
} = require('../dtos/auth.dto');
const {
  sendSuccess,
  sendError,
  sendBadRequest
} = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const { normalizePhone } = require('../utils/phoneValidator');

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 * Body: { phone }
 */
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // Normalize phone number
    const normalizedPhone = normalizePhone(phone);

    // Check if OTP service is configured
    if (!otpService.isConfigured()) {
      logger.error('OTP service not configured');
      return sendError(res, 503, 'OTP service is not configured. Please contact administrator.');
    }

    // Send OTP via 2Factor.in
    const { sessionId, expiresIn } = await otpService.sendOtp(normalizedPhone);

    // Return session ID to client
    const response = formatOtpSendResponse(sessionId, expiresIn);

    logger.info(`OTP sent to ${normalizedPhone}`);

    return sendSuccess(res, 200, response);
  } catch (error) {
    logger.error('Error in sendOtp controller', error);

    if (error.message.includes('Phone number')) {
      return sendBadRequest(res, error.message);
    }

    return sendError(res, 500, error.message || 'Failed to send OTP');
  }
};

/**
 * Verify OTP and authenticate user
 * POST /api/auth/verify-otp
 * Body: { phone, otp, secret }
 */
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, secret } = req.body;

    // Normalize phone number
    const normalizedPhone = normalizePhone(phone);

    // Verify OTP with 2Factor.in
    const isValid = await otpService.verifyOtp(secret, otp);

    if (!isValid) {
      logger.warn(`Invalid OTP attempt for ${normalizedPhone}`);
      return sendBadRequest(res, 'Invalid or expired OTP');
    }

    // Find or create user
    const user = await authService.findOrCreateUser(normalizedPhone);

    // Generate JWT token
    const accessToken = authService.generateToken(user);

    // Return token and user info
    const response = formatAuthResponse(accessToken, user);

    logger.success(`User authenticated: ${user.id}`);

    return sendSuccess(res, 200, response);
  } catch (error) {
    logger.error('Error in verifyOtp controller', error);

    if (error.message.includes('Phone number')) {
      return sendBadRequest(res, error.message);
    }

    return sendError(res, 500, error.message || 'Failed to verify OTP');
  }
};

/**
 * Refresh JWT token
 * POST /api/auth/refresh
 * Headers: Authorization: Bearer <token>
 */
const refresh = async (req, res) => {
  try {
    const token = req.token; // Attached by authenticate middleware

    // Refresh token (extend expiry)
    const newToken = await authService.refreshToken(token);

    // Return new token
    const response = formatTokenRefreshResponse(newToken);

    logger.info(`Token refreshed for user: ${req.user.id}`);

    return sendSuccess(res, 200, response);
  } catch (error) {
    logger.error('Error in refresh controller', error);
    return sendError(res, 500, error.message || 'Failed to refresh token');
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 */
const getMe = async (req, res) => {
  try {
    const user = req.user; // Attached by authenticate middleware

    const response = { user: formatUserResponse(user) };

    return sendSuccess(res, 200, response);
  } catch (error) {
    logger.error('Error in getMe controller', error);
    return sendError(res, 500, 'Failed to get user info');
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 * Headers: Authorization: Bearer <token>
 * Body: { name }
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    // Update profile
    const updatedUser = await authService.updateProfile(userId, { name });

    const response = { user: formatUserResponse(updatedUser) };

    logger.info(`Profile updated for user: ${userId}`);

    return sendSuccess(res, 200, response, 'Profile updated successfully');
  } catch (error) {
    logger.error('Error in updateProfile controller', error);
    return sendError(res, 500, error.message || 'Failed to update profile');
  }
};

/**
 * Register push notification token
 * POST /api/auth/register-push-token
 * Body: { pushToken }
 */
const registerPushToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pushToken } = req.body;

    if (!pushToken) {
      return sendBadRequest(res, 'Push token is required');
    }

    const success = await pushNotificationService.registerPushToken(userId, pushToken);

    if (!success) {
      return sendError(res, 400, 'Invalid push token');
    }

    return sendSuccess(res, 200, { registered: true }, 'Push token registered successfully');
  } catch (error) {
    logger.error('Error in registerPushToken controller', error);
    return sendError(res, 500, error.message || 'Failed to register push token');
  }
};

/**
 * Remove push notification token (on logout)
 * POST /api/auth/remove-push-token
 */
const removePushToken = async (req, res) => {
  try {
    const userId = req.user.id;

    await pushNotificationService.removePushToken(userId);

    return sendSuccess(res, 200, { removed: true }, 'Push token removed successfully');
  } catch (error) {
    logger.error('Error in removePushToken controller', error);
    return sendError(res, 500, error.message || 'Failed to remove push token');
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  refresh,
  getMe,
  updateProfile,
  registerPushToken,
  removePushToken
};

