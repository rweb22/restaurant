'use strict';

const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createOfferSchema, updateOfferSchema, validateOfferSchema } = require('../dtos/offer.dto');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes (no authentication required)
router.get('/', offerController.getAllOffers);
router.get('/code/:code', offerController.getOfferByCode);
router.get('/:id', offerController.getOfferById);

// Authenticated routes
router.post('/validate', authenticate, validate(validateOfferSchema), offerController.validateOffer);
router.get('/usage/history', authenticate, offerController.getUserOfferUsage);

// Admin-only routes
router.post('/', authenticate, requireAdmin, validate(createOfferSchema), offerController.createOffer);
router.put('/:id', authenticate, requireAdmin, validate(updateOfferSchema), offerController.updateOffer);
router.delete('/:id', authenticate, requireAdmin, offerController.deleteOffer);

module.exports = router;

