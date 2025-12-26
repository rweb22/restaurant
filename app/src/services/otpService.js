'use strict';

const logger = require('../utils/logger');

// Check if we should use mock OTP service
const USE_MOCK_OTP = process.env.USE_MOCK_OTP === 'true';

// If mock is enabled, use the mock service
if (USE_MOCK_OTP) {
  logger.info('Using Mock OTP Service (USE_MOCK_OTP=true)');
  module.exports = require('./mockOtpService');
} else {
  // Use real 2Factor.in service
  const axios = require('axios');
  const config = require('../config/otpService');
  const { formatPhoneFor2Factor } = require('../utils/phoneValidator');

/**
 * 2Factor.in OTP Service Integration
 * API Documentation: https://2factor.in/docs
 */
class OtpService {
  constructor() {
    this.baseUrl = config.url;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout;
    this.otpExpiry = config.otpExpiry;
    this.smsTemplateName = config.smsTemplateName;

    // Validate configuration
    if (!this.apiKey) {
      logger.warn('OTP_SERVICE_API_KEY is not configured. OTP functionality will not work.');
    }

    if (!this.smsTemplateName) {
      logger.warn('OTP_SMS_TEMPLATE_NAME is not configured. You may receive voice calls instead of SMS. Please create an SMS template in your 2Factor.in dashboard.');
    }
  }

  /**
   * Send OTP to phone number via 2Factor.in
   * @param {string} phone - Phone number in international format
   * @returns {Promise<{sessionId: string, expiresIn: number}>}
   */
  async sendOtp(phone) {
    try {
      // Format phone for 2Factor.in (remove + prefix)
      const formattedPhone = formatPhoneFor2Factor(phone);

      // 2Factor.in endpoint for SMS OTP
      // If template name is provided, append it to the URL
      // Otherwise, use default (which may result in voice calls if account default is voice)
      let url = `${this.baseUrl}/${this.apiKey}/SMS/${formattedPhone}/AUTOGEN`;
      if (this.smsTemplateName) {
        url += `/${this.smsTemplateName}`;
        logger.info(`Using SMS template: ${this.smsTemplateName}`);
      } else {
        logger.warn('No SMS template specified. Using default delivery method from 2Factor.in account.');
      }

      logger.info(`2Factor.in API URL: ${url.replace(this.apiKey, 'API_KEY_HIDDEN')}`);

      logger.info(`Sending OTP to phone: ${formattedPhone}`);

      const response = await axios.get(url, {
        timeout: this.timeout
      });

      // 2Factor.in response format:
      // Success: { "Status": "Success", "Details": "session_id_here", "OTP": "sent" }
      // Error: { "Status": "Error", "Details": "error message" }

      if (response.data.Status === 'Success') {
        const sessionId = response.data.Details;
        
        logger.success(`OTP sent successfully to ${formattedPhone}`, { sessionId });

        return {
          sessionId,
          expiresIn: this.otpExpiry
        };
      } else {
        const errorMessage = response.data.Details || 'Failed to send OTP';
        logger.error(`2Factor.in error: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (error) {
      logger.error('Error sending OTP', error);

      // Handle specific errors
      if (error.response) {
        // API returned an error response
        const errorMessage = error.response.data?.Details || error.response.data?.message || 'OTP service error';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request made but no response received
        throw new Error('OTP service is unavailable. Please try again later.');
      } else {
        // Other errors
        throw new Error(error.message || 'Failed to send OTP');
      }
    }
  }

  /**
   * Verify OTP with 2Factor.in
   * @param {string} sessionId - Session ID from sendOtp
   * @param {string} otp - OTP entered by user
   * @returns {Promise<boolean>} - True if OTP is valid
   */
  async verifyOtp(sessionId, otp) {
    try {
      // 2Factor.in endpoint: GET /API/V1/{api_key}/SMS/VERIFY/{session_id}/{otp}
      const url = `${this.baseUrl}/${this.apiKey}/SMS/VERIFY/${sessionId}/${otp}`;

      logger.info(`Verifying OTP for session: ${sessionId}`);

      const response = await axios.get(url, {
        timeout: this.timeout
      });

      // 2Factor.in response format:
      // Success: { "Status": "Success", "Details": "OTP Matched" }
      // Error: { "Status": "Error", "Details": "OTP Mismatch" or "OTP Expired" }

      if (response.data.Status === 'Success') {
        logger.success(`OTP verified successfully for session: ${sessionId}`);
        return true;
      } else {
        const errorMessage = response.data.Details || 'OTP verification failed';
        logger.warn(`OTP verification failed: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      logger.error('Error verifying OTP', error);

      // Handle specific errors
      if (error.response) {
        // API returned an error response
        const errorMessage = error.response.data?.Details || 'OTP verification failed';
        logger.warn(`2Factor.in verification error: ${errorMessage}`);
        return false;
      } else if (error.request) {
        // Request made but no response received
        throw new Error('OTP service is unavailable. Please try again later.');
      } else {
        // Other errors
        throw new Error(error.message || 'Failed to verify OTP');
      }
    }
  }

  /**
   * Check if OTP service is configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

// Export singleton instance
module.exports = new OtpService();

}

