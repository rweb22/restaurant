const express = require('express');
const router = express.Router();
const itemSizeController = require('../controllers/itemSizeController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createItemSizeSchema, updateItemSizeSchema, queryItemSizesSchema } = require('../dtos/itemSize.dto');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/', validate(queryItemSizesSchema, 'query'), itemSizeController.getAllItemSizes);
router.get('/:id', itemSizeController.getItemSizeById);

// Admin routes
router.post('/', authenticate, requireAdmin, validate(createItemSizeSchema), itemSizeController.createItemSize);
router.put('/:id', authenticate, requireAdmin, validate(updateItemSizeSchema), itemSizeController.updateItemSize);
router.delete('/:id', authenticate, requireAdmin, itemSizeController.deleteItemSize);

module.exports = router;

