'use strict';

const express = require('express');
const router = express.Router();
const pictureController = require('../controllers/pictureController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createPictureSchema, updatePictureSchema, reorderPicturesSchema } = require('../dtos/picture.dto');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * Public routes
 */

// Get all pictures for an entity
// GET /api/pictures?entityType=item&entityId=1
router.get('/', pictureController.getPictures);

// Get a single picture by ID
// GET /api/pictures/:id
router.get('/:id', pictureController.getPictureById);

/**
 * Admin-only routes
 */

// Create a new picture
// POST /api/pictures
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createPictureSchema),
  pictureController.createPicture
);

// Update a picture
// PUT /api/pictures/:id
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updatePictureSchema),
  pictureController.updatePicture
);

// Delete a picture
// DELETE /api/pictures/:id
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  pictureController.deletePicture
);

// Set a picture as primary
// PATCH /api/pictures/:id/primary
router.patch(
  '/:id/primary',
  authenticate,
  requireAdmin,
  pictureController.setPrimaryPicture
);

// Reorder pictures
// PATCH /api/pictures/reorder
router.patch(
  '/reorder',
  authenticate,
  requireAdmin,
  validate(reorderPicturesSchema),
  pictureController.reorderPictures
);

module.exports = router;

