'use strict';

/**
 * Unit Tests for Mock OTP Service
 * Tests the mock implementation used for testing without 2Factor.in credentials
 */

const mockOtpService = require('../mocks/mockOtpService');
const { testPhones, testOtps, cleanupMockOtp } = require('../fixtures/testHelpers');

describe('MockOtpService - Unit Tests', () => {
  
  beforeEach(() => {
    // Clear sessions before each test
    cleanupMockOtp();
  });

  afterEach(() => {
    // Clean up after each test
    cleanupMockOtp();
  });

  describe('sendOtp()', () => {
    test('should send OTP successfully', async () => {
      const result = await mockOtpService.sendOtp(testPhones.valid.indian);
      
      expect(result).toBeDefined();
      expect(result.sessionId).toBeDefined();
      expect(result.expiresIn).toBe(300);
    });

    test('should generate unique session IDs', async () => {
      const result1 = await mockOtpService.sendOtp(testPhones.valid.indian);
      const result2 = await mockOtpService.sendOtp(testPhones.valid.us);
      
      expect(result1.sessionId).not.toBe(result2.sessionId);
    });

    test('should work with different phone formats', async () => {
      const phones = [
        testPhones.valid.indian,
        testPhones.valid.us,
        testPhones.valid.uk
      ];

      for (const phone of phones) {
        const result = await mockOtpService.sendOtp(phone);
        expect(result.sessionId).toBeDefined();
      }
    });

    test('should track active sessions', async () => {
      expect(mockOtpService.getActiveSessionsCount()).toBe(0);
      
      await mockOtpService.sendOtp(testPhones.valid.indian);
      expect(mockOtpService.getActiveSessionsCount()).toBe(1);
      
      await mockOtpService.sendOtp(testPhones.valid.us);
      expect(mockOtpService.getActiveSessionsCount()).toBe(2);
    });
  });

  describe('verifyOtp()', () => {
    test('should verify valid OTP', async () => {
      const { sessionId } = await mockOtpService.sendOtp(testPhones.valid.indian);
      const isValid = await mockOtpService.verifyOtp(sessionId, testOtps.valid);
      
      expect(isValid).toBe(true);
    });

    test('should reject invalid OTP', async () => {
      const { sessionId } = await mockOtpService.sendOtp(testPhones.valid.indian);
      const isValid = await mockOtpService.verifyOtp(sessionId, testOtps.invalid);
      
      expect(isValid).toBe(false);
    });

    test('should reject non-existent session', async () => {
      const isValid = await mockOtpService.verifyOtp('non-existent-session', testOtps.valid);
      
      expect(isValid).toBe(false);
    });

    test('should clean up session after successful verification', async () => {
      const { sessionId } = await mockOtpService.sendOtp(testPhones.valid.indian);
      expect(mockOtpService.getActiveSessionsCount()).toBe(1);
      
      await mockOtpService.verifyOtp(sessionId, testOtps.valid);
      expect(mockOtpService.getActiveSessionsCount()).toBe(0);
    });

    test('should not clean up session after failed verification', async () => {
      const { sessionId } = await mockOtpService.sendOtp(testPhones.valid.indian);
      expect(mockOtpService.getActiveSessionsCount()).toBe(1);
      
      await mockOtpService.verifyOtp(sessionId, testOtps.invalid);
      expect(mockOtpService.getActiveSessionsCount()).toBe(1);
    });

    test('should reject same session twice', async () => {
      const { sessionId } = await mockOtpService.sendOtp(testPhones.valid.indian);
      
      const firstAttempt = await mockOtpService.verifyOtp(sessionId, testOtps.valid);
      expect(firstAttempt).toBe(true);
      
      // Session should be deleted after first successful verification
      const secondAttempt = await mockOtpService.verifyOtp(sessionId, testOtps.valid);
      expect(secondAttempt).toBe(false);
    });
  });

  describe('isConfigured()', () => {
    test('should always return true for mock service', () => {
      expect(mockOtpService.isConfigured()).toBe(true);
    });
  });

  describe('clearSessions()', () => {
    test('should clear all active sessions', async () => {
      await mockOtpService.sendOtp(testPhones.valid.indian);
      await mockOtpService.sendOtp(testPhones.valid.us);
      await mockOtpService.sendOtp(testPhones.valid.uk);
      
      expect(mockOtpService.getActiveSessionsCount()).toBe(3);
      
      mockOtpService.clearSessions();
      expect(mockOtpService.getActiveSessionsCount()).toBe(0);
    });
  });

  describe('setMockOtp()', () => {
    test('should allow setting custom OTP', async () => {
      mockOtpService.setMockOtp('999999');
      
      const { sessionId } = await mockOtpService.sendOtp(testPhones.valid.indian);
      
      const validWithCustom = await mockOtpService.verifyOtp(sessionId, '999999');
      expect(validWithCustom).toBe(true);
      
      // Reset to default
      mockOtpService.setMockOtp('123456');
    });
  });
});

