'use strict';

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Authentication Service
 * Handles JWT generation, verification, and user management
 */
class AuthService {
  /**
   * Generate JWT token for user
   * @param {object} user - User object
   * @returns {string} - JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      phone: user.phone,
      role: user.role
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });

    logger.debug('JWT token generated', { userId: user.id, role: user.role });

    return token;
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {object} - Decoded token payload
   * @throws {Error} - If token is invalid or expired
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Refresh JWT token (extend expiry by 30 days)
   * @param {string} token - Current JWT token
   * @returns {string} - New JWT token
   * @throws {Error} - If token is invalid
   */
  async refreshToken(token) {
    try {
      // Verify current token
      const decoded = this.verifyToken(token);

      // Find user
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token
      const newToken = this.generateToken(user);

      logger.info(`Token refreshed for user: ${user.id}`);

      return newToken;
    } catch (error) {
      logger.error('Error refreshing token', error);
      throw error;
    }
  }

  /**
   * Find user by phone or create new client user
   * @param {string} phone - Phone number
   * @returns {Promise<object>} - User object
   */
  async findOrCreateUser(phone) {
    try {
      // Try to find existing user
      let user = await User.findOne({ where: { phone } });

      if (user) {
        logger.info(`Existing user found: ${user.id}`);
        return user;
      }

      // Create new client user
      user = await User.create({
        phone,
        role: 'client'
      });

      logger.success(`New user created: ${user.id}`, { phone });

      return user;
    } catch (error) {
      logger.error('Error finding or creating user', error);
      throw new Error('Failed to process user');
    }
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {object} data - Update data (name)
   * @returns {Promise<object>} - Updated user object
   */
  async updateProfile(userId, data) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Update allowed fields
      if (data.name !== undefined) {
        user.name = data.name;
      }

      await user.save();

      logger.info(`User profile updated: ${userId}`);

      return user;
    } catch (error) {
      logger.error('Error updating profile', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<object>} - User object
   */
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Error getting user', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new AuthService();

