'use strict';

const logger = require('../utils/logger');

/**
 * Mock OTP Service for Testing
 * Simulates 2Factor.in behavior without requiring real API credentials
 */
class MockOtpService {
  constructor() {
    this.mockOtp = '123456'; // Fixed OTP for testing
    this.mockSessionId = 'mock-session-id';
    this.otpExpiry = 300; // 5 minutes
    this.sessions = new Map(); // Store active sessions
  }

  /**
   * Mock send OTP
   * Always succeeds and returns a mock session ID
   * @param {string} phone - Phone number
   * @returns {Promise<{sessionId: string, expiresIn: number}>}
   */
  async sendOtp(phone) {
    logger.info(`[MOCK] Sending OTP to ${phone}`);
    
    // Generate unique session ID for this phone
    const sessionId = `mock-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session with phone and OTP
    this.sessions.set(sessionId, {
      phone,
      otp: this.mockOtp,
      createdAt: Date.now()
    });

    logger.success(`[MOCK] OTP sent: ${this.mockOtp} (Session: ${sessionId})`);

    return {
      sessionId,
      expiresIn: this.otpExpiry
    };
  }

  /**
   * Mock verify OTP
   * Accepts OTP '123456' as valid for any session
   * @param {string} sessionId - Session ID from sendOtp
   * @param {string} otp - OTP to verify
   * @returns {Promise<boolean>}
   */
  async verifyOtp(sessionId, otp) {
    logger.info(`[MOCK] Verifying OTP for session: ${sessionId}`);

    // Check if session exists
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      logger.warn(`[MOCK] Session not found: ${sessionId}`);
      return false;
    }

    // Check if session expired (5 minutes)
    const now = Date.now();
    const sessionAge = now - session.createdAt;
    if (sessionAge > this.otpExpiry * 1000) {
      logger.warn(`[MOCK] Session expired: ${sessionId}`);
      this.sessions.delete(sessionId);
      return false;
    }

    // Verify OTP
    if (otp === session.otp) {
      logger.success(`[MOCK] OTP verified successfully for session: ${sessionId}`);
      // Clean up session after successful verification
      this.sessions.delete(sessionId);
      return true;
    } else {
      logger.warn(`[MOCK] Invalid OTP. Expected: ${session.otp}, Got: ${otp}`);
      return false;
    }
  }

  /**
   * Check if OTP service is configured
   * Always returns true for mock
   * @returns {boolean}
   */
  isConfigured() {
    return true;
  }

  /**
   * Clear all sessions (useful for testing)
   */
  clearSessions() {
    this.sessions.clear();
    logger.info('[MOCK] All sessions cleared');
  }

  /**
   * Get active sessions count (for testing/debugging)
   * @returns {number}
   */
  getActiveSessionsCount() {
    return this.sessions.size;
  }

  /**
   * Set custom OTP for testing specific scenarios
   * @param {string} otp - Custom OTP
   */
  setMockOtp(otp) {
    this.mockOtp = otp;
    logger.info(`[MOCK] OTP set to: ${otp}`);
  }
}

// Export singleton instance
module.exports = new MockOtpService();

