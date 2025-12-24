'use strict';

/**
 * Unit Tests for JWT Token Generation and Verification
 * Tests JWT functionality without requiring database
 */

const path = require('path');
const jwt = require(path.resolve(__dirname, '../../app/node_modules/jsonwebtoken'));
const jwtConfig = require(path.resolve(__dirname, '../../app/src/config/jwt'));

describe('JWT Token - Unit Tests', () => {
  
  const testUser = {
    id: 1,
    phone: '+911234567890',
    role: 'client'
  };

  describe('Token Generation', () => {
    test('should generate a valid JWT token', () => {
      const payload = {
        userId: testUser.id,
        phone: testUser.phone,
        role: testUser.role
      };

      const token = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn
      });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should include correct payload in token', () => {
      const payload = {
        userId: testUser.id,
        phone: testUser.phone,
        role: testUser.role
      };

      const token = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn
      });

      const decoded = jwt.verify(token, jwtConfig.secret);
      
      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.phone).toBe(testUser.phone);
      expect(decoded.role).toBe(testUser.role);
    });
  });

  describe('Token Verification', () => {
    test('should verify a valid token', () => {
      const payload = {
        userId: testUser.id,
        phone: testUser.phone,
        role: testUser.role
      };

      const token = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn
      });

      const decoded = jwt.verify(token, jwtConfig.secret);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUser.id);
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        jwt.verify('invalid.token.here', jwtConfig.secret);
      }).toThrow();
    });

    test('should throw error for token with wrong secret', () => {
      const payload = {
        userId: testUser.id,
        phone: testUser.phone,
        role: testUser.role
      };

      const token = jwt.sign(payload, 'wrong-secret', {
        expiresIn: jwtConfig.expiresIn
      });

      expect(() => {
        jwt.verify(token, jwtConfig.secret);
      }).toThrow();
    });
  });

  describe('Token Expiry', () => {
    test('should include expiry time in token', () => {
      const payload = {
        userId: testUser.id,
        phone: testUser.phone,
        role: testUser.role
      };

      const token = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn
      });

      const decoded = jwt.verify(token, jwtConfig.secret);
      
      expect(decoded.iat).toBeDefined(); // Issued at
      expect(decoded.exp).toBeDefined(); // Expires at
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    test('should set expiry to 30 days from now', () => {
      const payload = {
        userId: testUser.id,
        phone: testUser.phone,
        role: testUser.role
      };

      const token = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: '30d'
      });

      const decoded = jwt.verify(token, jwtConfig.secret);
      
      const now = Math.floor(Date.now() / 1000);
      const thirtyDays = 30 * 24 * 60 * 60;
      
      // Allow 10 seconds tolerance for test execution time
      expect(decoded.exp).toBeGreaterThanOrEqual(now + thirtyDays - 10);
      expect(decoded.exp).toBeLessThanOrEqual(now + thirtyDays + 10);
    });
  });

  describe('Different User Roles', () => {
    test('should generate token for client role', () => {
      const payload = {
        userId: 1,
        phone: '+911234567890',
        role: 'client'
      };

      const token = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn
      });

      const decoded = jwt.verify(token, jwtConfig.secret);
      expect(decoded.role).toBe('client');
    });

    test('should generate token for admin role', () => {
      const payload = {
        userId: 999,
        phone: '+919999999999',
        role: 'admin'
      };

      const token = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn
      });

      const decoded = jwt.verify(token, jwtConfig.secret);
      expect(decoded.role).toBe('admin');
    });
  });
});

