'use strict';

const authService = require('../services/authService');
const { sendUnauthorized, sendForbidden } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate JWT token
 * Extracts token from Authorization header and verifies it
 * Attaches user info to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return sendUnauthorized(res, 'No authorization token provided');
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Invalid authorization format. Use: Bearer <token>');
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return sendUnauthorized(res, 'No token provided');
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user from database
    const user = await authService.getUserById(decoded.userId);

    // Attach user to request
    req.user = user;
    req.token = token;

    logger.debug(`User authenticated: ${user.id} (${user.role})`);

    next();
  } catch (error) {
    logger.warn('Authentication failed', { error: error.message });
    
    if (error.message === 'Token has expired') {
      return sendUnauthorized(res, 'Token has expired. Please refresh your token.');
    } else if (error.message === 'Invalid token') {
      return sendUnauthorized(res, 'Invalid token');
    } else if (error.message === 'User not found') {
      return sendUnauthorized(res, 'User not found');
    } else {
      return sendUnauthorized(res, 'Authentication failed');
    }
  }
};

/**
 * Middleware to check if user has required role(s)
 * Must be used after authenticate middleware
 * @param {string|string[]} roles - Required role(s)
 */
const requireRole = (roles) => {
  // Normalize to array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.id}. Required: ${allowedRoles.join(', ')}, Has: ${req.user.role}`);
      return sendForbidden(res, `Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }

    logger.debug(`Role check passed for user ${req.user.id}: ${req.user.role}`);
    next();
  };
};

/**
 * Middleware to require admin role
 * Shorthand for requireRole('admin')
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware to require client role
 * Shorthand for requireRole('client')
 */
const requireClient = requireRole('client');

/**
 * Middleware to check if user owns the resource
 * Compares req.user.id with req.params.userId or req.body.userId
 * Admin users bypass this check
 * @param {string} paramName - Parameter name to check (default: 'userId')
 */
const requireOwnership = (paramName = 'userId') => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      logger.debug(`Admin user ${req.user.id} bypassing ownership check`);
      return next();
    }

    // Get resource owner ID from params or body
    const resourceOwnerId = parseInt(req.params[paramName] || req.body[paramName]);

    if (!resourceOwnerId) {
      return sendForbidden(res, 'Resource owner not specified');
    }

    // Check if user owns the resource
    if (req.user.id !== resourceOwnerId) {
      logger.warn(`User ${req.user.id} attempted to access resource owned by ${resourceOwnerId}`);
      return sendForbidden(res, 'You can only access your own resources');
    }

    logger.debug(`Ownership check passed for user ${req.user.id}`);
    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user to req.user if token is valid, but doesn't fail if no token
 * Useful for routes that work for both authenticated and unauthenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    // Try to verify token
    const decoded = authService.verifyToken(token);
    const user = await authService.getUserById(decoded.userId);

    req.user = user;
    req.token = token;

    logger.debug(`Optional auth: User ${user.id} authenticated`);
    next();
  } catch (error) {
    // Token invalid, but continue without user
    logger.debug('Optional auth: Invalid token, continuing without user');
    next();
  }
};

module.exports = {
  authenticate,
  requireRole,
  requireAdmin,
  requireClient,
  requireOwnership,
  optionalAuth
};

