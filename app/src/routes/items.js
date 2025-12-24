const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createItemSchema, updateItemSchema, queryItemsSchema } = require('../dtos/item.dto');
const { createNestedItemSizeSchema, updateItemSizeSchema } = require('../dtos/itemSize.dto');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * Public routes
 */

// GET /api/items - List all items with optional filters
router.get(
  '/',
  validate(queryItemsSchema, 'query'),
  itemController.getAllItems
);

// GET /api/items/:id - Get item by ID with sizes and add-ons
router.get(
  '/:id',
  itemController.getItemById
);

/**
 * Admin routes
 */

// POST /api/items - Create new item
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createItemSchema),
  itemController.createItem
);

// PUT /api/items/:id - Update item
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateItemSchema),
  itemController.updateItem
);

// DELETE /api/items/:id - Delete item
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  itemController.deleteItem
);

/**
 * Nested size routes (design spec compliant)
 */

// POST /api/items/:id/sizes - Add size to item
router.post(
  '/:id/sizes',
  authenticate,
  requireAdmin,
  validate(createNestedItemSizeSchema),
  itemController.addSizeToItem
);

// PUT /api/items/:id/sizes/:sizeId - Update size
router.put(
  '/:id/sizes/:sizeId',
  authenticate,
  requireAdmin,
  validate(updateItemSizeSchema),
  itemController.updateItemSize
);

// DELETE /api/items/:id/sizes/:sizeId - Delete size
router.delete(
  '/:id/sizes/:sizeId',
  authenticate,
  requireAdmin,
  itemController.deleteItemSize
);

module.exports = router;

