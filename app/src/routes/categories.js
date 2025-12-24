'use strict';

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createCategorySchema, updateCategorySchema, queryCategoriesSchema } = require('../dtos/category.dto');
const { apiLimiter } = require('../middleware/rateLimiter');

/**
 * Category Routes
 *
 * Public routes:
 * - GET /api/categories - List all categories
 * - GET /api/categories/:id - Get category by ID
 *
 * Admin routes:
 * - POST /api/categories - Create category
 * - PUT /api/categories/:id - Update category
 * - DELETE /api/categories/:id - Delete category
 */

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 * @query   available - Filter by availability (true/false)
 * @query   includeItems - Include items in response (true/false)
 */
router.get(
  '/',
  validate(queryCategoriesSchema, 'query'),
  categoryController.getAllCategories
);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 * @query   includeItems - Include items in response (true/false)
 */
router.get(
  '/:id',
  categoryController.getCategoryById
);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Admin only
 * @body    { name, description, imageUrl, isAvailable, displayOrder }
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createCategorySchema),
  categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Admin only
 * @body    { name, description, imageUrl, isAvailable, displayOrder }
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateCategorySchema),
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Admin only
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  categoryController.deleteCategory
);

module.exports = router;

