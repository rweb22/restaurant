'use strict';

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createLocationSchema, updateLocationSchema, queryLocationsSchema } = require('../dtos/location.dto');
const { apiLimiter } = require('../middleware/rateLimiter');

/**
 * Location Routes
 *
 * Public routes:
 * - GET /api/locations - List all locations
 * - GET /api/locations/:id - Get location by ID
 *
 * Admin routes:
 * - POST /api/locations - Create location
 * - PUT /api/locations/:id - Update location
 * - DELETE /api/locations/:id - Delete location
 */

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * @route   GET /api/locations
 * @desc    Get all locations
 * @access  Public
 * @query   available - Filter by availability (true/false)
 * @query   city - Filter by city
 */
router.get(
  '/',
  validate(queryLocationsSchema, 'query'),
  locationController.getAllLocations
);

/**
 * @route   GET /api/locations/:id
 * @desc    Get location by ID
 * @access  Public
 */
router.get(
  '/:id',
  locationController.getLocationById
);

/**
 * @route   POST /api/locations
 * @desc    Create new location
 * @access  Admin only
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createLocationSchema),
  locationController.createLocation
);

/**
 * @route   PUT /api/locations/:id
 * @desc    Update location
 * @access  Admin only
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateLocationSchema),
  locationController.updateLocation
);

/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete location
 * @access  Admin only
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  locationController.deleteLocation
);

module.exports = router;

