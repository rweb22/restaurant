const express = require('express');
const router = express.Router();
const addOnController = require('../controllers/addOnController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createAddOnSchema, updateAddOnSchema, queryAddOnsSchema } = require('../dtos/addOn.dto');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/', validate(queryAddOnsSchema, 'query'), addOnController.getAllAddOns);
router.get('/:id', addOnController.getAddOnById);

// Admin routes
router.post('/', authenticate, requireAdmin, validate(createAddOnSchema), addOnController.createAddOn);
router.put('/:id', authenticate, requireAdmin, validate(updateAddOnSchema), addOnController.updateAddOn);
router.delete('/:id', authenticate, requireAdmin, addOnController.deleteAddOn);

module.exports = router;

