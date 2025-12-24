'use strict';

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { upload, handleUploadError } = require('../middleware/upload');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * Admin-only routes
 * All upload endpoints require admin authentication
 */

// Upload a single image
// POST /api/upload/image
// Form data: image (file)
router.post(
  '/image',
  authenticate,
  requireAdmin,
  upload.single('image'),
  handleUploadError,
  uploadController.uploadImage
);

// Upload multiple images
// POST /api/upload/images
// Form data: images (multiple files)
router.post(
  '/images',
  authenticate,
  requireAdmin,
  upload.array('images', 5),
  handleUploadError,
  uploadController.uploadImages
);

// Upload image and create picture record in one step
// POST /api/upload/picture
// Form data: 
//   - image (file)
//   - entityType (string)
//   - entityId (number)
//   - altText (string, optional)
//   - displayOrder (number, optional)
//   - isPrimary (boolean, optional)
router.post(
  '/picture',
  authenticate,
  requireAdmin,
  upload.single('image'),
  handleUploadError,
  uploadController.uploadAndCreatePicture
);

// Get file info
// GET /api/upload/info?url=/uploads/pictures/image.jpg
router.get(
  '/info',
  authenticate,
  requireAdmin,
  uploadController.getFileInfo
);

module.exports = router;

