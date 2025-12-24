const express = require('express');
const router = express.Router();
const itemAddOnController = require('../controllers/itemAddOnController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createItemAddOnSchema, queryItemAddOnsSchema } = require('../dtos/itemAddOn.dto');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/', validate(queryItemAddOnsSchema, 'query'), itemAddOnController.getAllItemAddOns);
router.get('/:id', itemAddOnController.getItemAddOnById);

// Admin routes
router.post('/', authenticate, requireAdmin, validate(createItemAddOnSchema), itemAddOnController.createItemAddOn);
router.delete('/:id', authenticate, requireAdmin, itemAddOnController.deleteItemAddOn);

module.exports = router;

