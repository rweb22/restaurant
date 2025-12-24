'use strict';

const mockOtpService = require('../mocks/mockOtpService');

/**
 * Test Helpers
 * Utilities for setting up and tearing down tests
 */

/**
 * Mock the OTP service for testing
 * Call this in beforeAll() or beforeEach()
 */
const useMockOtpService = () => {
  // Replace the real OTP service with mock
  jest.mock('../../app/src/services/otpService', () => {
    return require('../mocks/mockOtpService');
  });
};

/**
 * Create a test user object
 * @param {object} overrides - Properties to override
 * @returns {object} - User object
 */
const createTestUser = (overrides = {}) => {
  return {
    id: 1,
    phone: '+911234567890',
    role: 'client',
    name: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

/**
 * Create a test admin user object
 * @param {object} overrides - Properties to override
 * @returns {object} - Admin user object
 */
const createTestAdmin = (overrides = {}) => {
  return createTestUser({
    id: 999,
    phone: '+919999999999',
    role: 'admin',
    name: 'Admin User',
    ...overrides
  });
};

/**
 * Generate a valid JWT token for testing
 * @param {object} user - User object
 * @returns {string} - JWT token
 */
const generateTestToken = (user) => {
  const authService = require('../../app/src/services/authService');
  return authService.generateToken(user);
};

/**
 * Create authorization header for testing
 * @param {string} token - JWT token
 * @returns {object} - Headers object
 */
const createAuthHeader = (token) => {
  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Test phone numbers for different scenarios
 */
const testPhones = {
  valid: {
    indian: '+911234567890',
    us: '+11234567890',
    uk: '+441234567890'
  },
  invalid: {
    noCountryCode: '1234567890',
    tooShort: '+9112345',
    tooLong: '+91123456789012345',
    withSpaces: '+91 1234 567890',
    withDashes: '+91-1234-567890'
  }
};

/**
 * Test OTP values
 */
const testOtps = {
  valid: '123456',
  invalid: '000000',
  tooShort: '123',
  tooLong: '1234567',
  nonNumeric: 'abcdef'
};

/**
 * Clean up mock OTP service sessions
 */
const cleanupMockOtp = () => {
  mockOtpService.clearSessions();
};

/**
 * Wait for a specified time (for testing async operations)
 * @param {number} ms - Milliseconds to wait
 */
const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Extract error messages from Joi validation error
 * @param {object} error - Joi error object
 * @returns {object} - Formatted errors
 */
const extractValidationErrors = (error) => {
  const errors = {};
  if (error && error.details) {
    error.details.forEach(detail => {
      const field = detail.path.join('.');
      errors[field] = detail.message;
    });
  }
  return errors;
};

module.exports = {
  useMockOtpService,
  createTestUser,
  createTestAdmin,
  generateTestToken,
  createAuthHeader,
  testPhones,
  testOtps,
  cleanupMockOtp,
  wait,
  extractValidationErrors
};

