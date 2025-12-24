'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { updateUserSchema, queryUsersSchema } = require('../dtos/user.dto');
const { apiLimiter } = require('../middleware/rateLimiter');

/**
 * User Routes
 *
 * All routes require admin authentication
 */

// Apply rate limiting to all routes
router.use(apiLimiter);

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin only
 * @query   role - Filter by role (admin/client)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 20, max: 100)
 */
router.get(
  '/',
  validate(queryUsersSchema, 'query'),
  userController.getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin only
 */
router.get(
  '/:id',
  userController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin only
 */
router.put(
  '/:id',
  validate(updateUserSchema),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin only
 */
router.delete(
  '/:id',
  userController.deleteUser
);

module.exports = router;

