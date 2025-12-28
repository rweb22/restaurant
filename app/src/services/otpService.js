'use strict';

const logger = require('../utils/logger');

// Check if we should use mock OTP service
const USE_MOCK_OTP = process.env.USE_MOCK_OTP === 'true';

// If mock is enabled, use the mock service
if (USE_MOCK_OTP) {
  logger.info('Using Mock OTP Service (USE_MOCK_OTP=true)');
  module.exports = require('./mockOtpService');
} else {
  // Use real SMS Lab service
  const axios = require('axios');
  const config = require('../config/otpService');
  const { formatPhoneForSMSLab } = require('../utils/phoneValidator');

/**
 * SMS Lab OTP Service Integration
 * API Documentation: http://sms.smslab.in/
 */
class OtpService {
  constructor() {
    this.baseUrl = config.url;
    this.authKey = config.authKey;
    this.sender = config.sender;
    this.route = config.route;
    this.country = config.country;
    this.dltTemplateId = config.dltTemplateId;
    this.timeout = config.timeout;
    this.otpExpiry = config.otpExpiry;

    // Store OTP sessions locally (since SMS Lab doesn't provide session management)
    this.otpSessions = new Map();

    // Validate configuration
    if (!this.authKey) {
      logger.warn('OTP_SERVICE_AUTH_KEY is not configured. OTP functionality will not work.');
    }

    if (!this.dltTemplateId) {
      logger.warn('OTP_SERVICE_DLT_TEMPLATE_ID is not configured. SMS delivery may fail due to DLT regulations.');
    }
  }

  /**
   * Generate a random 6-digit OTP
   * @returns {string} - 6-digit OTP
   */
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to phone number via SMS Lab
   * @param {string} phone - Phone number in international format
   * @returns {Promise<{sessionId: string, expiresIn: number}>}
   */
  async sendOtp(phone) {
    try {
      // Format phone for SMS Lab (remove + prefix, extract number without country code)
      const formattedPhone = formatPhoneForSMSLab(phone);

      // Generate OTP
      const otp = this.generateOtp();

      // Generate unique session ID
      const sessionId = `smslab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Store OTP session
      this.otpSessions.set(sessionId, {
        phone,
        otp,
        createdAt: Date.now()
      });

      // Format message (URL encoded)
      const message = `Verify+Mobile,+No.+Your+OTP+is+${otp}+To+Login+in+App+ARNAV`;

      // SMS Lab API parameters
      const params = {
        authkey: this.authKey,
        mobiles: `${this.country}${formattedPhone}`,
        message: message,
        sender: this.sender,
        route: this.route,
        country: this.country,
        DLT_TE_ID: this.dltTemplateId
      };

      logger.info(`Sending OTP to phone: ${this.country}${formattedPhone}`);

      const response = await axios.get(this.baseUrl, {
        params,
        timeout: this.timeout
      });

      // SMS Lab typically returns 200 for success
      if (response.status === 200) {
        logger.success(`OTP sent successfully to ${this.country}${formattedPhone}`, { sessionId });

        return {
          sessionId,
          expiresIn: this.otpExpiry
        };
      } else {
        const errorMessage = response.data?.message || 'Failed to send OTP';
        logger.error(`SMS Lab error: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (error) {
      logger.error('Error sending OTP', error);

      // Handle specific errors
      if (error.response) {
        // API returned an error response
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to send OTP';
        logger.warn(`SMS Lab API error: ${errorMessage}`);
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request made but no response received
        throw new Error('OTP service is unavailable. Please try again later.');
      } else {
        // Other errors (e.g., phone validation)
        throw new Error(error.message || 'Failed to send OTP');
      }
    }
  }

  /**
   * Verify OTP with SMS Lab (local verification)
   * Since SMS Lab doesn't provide verification API, we verify locally
   * @param {string} sessionId - Session ID from sendOtp
   * @param {string} otp - OTP entered by user
   * @returns {Promise<boolean>} - True if OTP is valid
   */
  async verifyOtp(sessionId, otp) {
    try {
      logger.info(`Verifying OTP for session: ${sessionId}`);

      // Get session from local storage
      const session = this.otpSessions.get(sessionId);

      if (!session) {
        logger.warn(`Session not found: ${sessionId}`);
        return false;
      }

      // Check if session expired (5 minutes)
      const now = Date.now();
      const sessionAge = now - session.createdAt;
      if (sessionAge > this.otpExpiry * 1000) {
        logger.warn(`Session expired: ${sessionId}`);
        this.otpSessions.delete(sessionId);
        return false;
      }

      // Verify OTP
      if (session.otp === otp) {
        logger.success(`OTP verified successfully for session: ${sessionId}`);
        // Clean up session after successful verification
        this.otpSessions.delete(sessionId);
        return true;
      } else {
        logger.warn(`OTP mismatch for session: ${sessionId}`);
        return false;
      }
    } catch (error) {
      logger.error('Error verifying OTP', error);
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }

  /**
   * Check if OTP service is configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.authKey;
  }
}

// Export singleton instance
module.exports = new OtpService();

}

