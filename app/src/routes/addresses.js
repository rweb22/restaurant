'use strict';

const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createAddressSchema, updateAddressSchema } = require('../dtos/address.dto');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(apiLimiter);

// All address routes require authentication
router.use(authenticate);

// Address routes
router.get('/', addressController.getAllAddresses);
router.get('/:id', addressController.getAddressById);
router.post('/', validate(createAddressSchema), addressController.createAddress);
router.put('/:id', validate(updateAddressSchema), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

module.exports = router;

