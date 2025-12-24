const express = require('express');
const router = express.Router();
const categoryAddOnController = require('../controllers/categoryAddOnController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createCategoryAddOnSchema, queryCategoryAddOnsSchema } = require('../dtos/categoryAddOn.dto');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/', validate(queryCategoryAddOnsSchema, 'query'), categoryAddOnController.getAllCategoryAddOns);
router.get('/:id', categoryAddOnController.getCategoryAddOnById);

// Admin routes
router.post('/', authenticate, requireAdmin, validate(createCategoryAddOnSchema), categoryAddOnController.createCategoryAddOn);
router.delete('/:id', authenticate, requireAdmin, categoryAddOnController.deleteCategoryAddOn);

module.exports = router;

