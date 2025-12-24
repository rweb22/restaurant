const locationService = require('../services/locationService');
const { formatLocationResponse, formatLocationsResponse } = require('../dtos/location.dto');
const { sendSuccess, sendError, sendNotFound } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Get all locations
 * GET /api/locations
 * Query params: ?available=true&city=Chandigarh
 */
const getAllLocations = async (req, res) => {
  try {
    const filters = {
      available: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined,
      city: req.query.city
    };

    const locations = await locationService.getAllLocations(filters);
    const formattedLocations = formatLocationsResponse(locations);

    return sendSuccess(res, 200, { locations: formattedLocations }, 'Locations retrieved successfully');
  } catch (error) {
    logger.error('Error in getAllLocations controller', error);
    return sendError(res, 500, 'Failed to retrieve locations');
  }
};

/**
 * Get location by ID
 * GET /api/locations/:id
 */
const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await locationService.getLocationById(id);

    if (!location) {
      return sendNotFound(res, 'Location not found');
    }

    const formattedLocation = formatLocationResponse(location);

    return sendSuccess(res, 200, { location: formattedLocation }, 'Location retrieved successfully');
  } catch (error) {
    logger.error('Error in getLocationById controller', error);
    
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    
    return sendError(res, 500, 'Failed to retrieve location');
  }
};

/**
 * Create new location
 * POST /api/locations
 * Body: { name, area, city, pincode, deliveryCharge, estimatedDeliveryTime, isAvailable }
 * Admin only
 */
const createLocation = async (req, res) => {
  try {
    const locationData = {
      name: req.body.name,
      area: req.body.area,
      city: req.body.city || 'Chandigarh',
      pincode: req.body.pincode,
      deliveryCharge: req.body.deliveryCharge,
      estimatedDeliveryTime: req.body.estimatedDeliveryTime,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true
    };

    const location = await locationService.createLocation(locationData);
    const formattedLocation = formatLocationResponse(location);

    return sendSuccess(res, 201, { location: formattedLocation }, 'Location created successfully');
  } catch (error) {
    logger.error('Error in createLocation controller', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }

    return sendError(res, 500, 'Failed to create location');
  }
};

/**
 * Update location
 * PUT /api/locations/:id
 * Body: { name, area, city, pincode, deliveryCharge, estimatedDeliveryTime, isAvailable }
 * Admin only
 */
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const locationData = {};

    // Only include fields that are provided
    if (req.body.name !== undefined) locationData.name = req.body.name;
    if (req.body.area !== undefined) locationData.area = req.body.area;
    if (req.body.city !== undefined) locationData.city = req.body.city;
    if (req.body.pincode !== undefined) locationData.pincode = req.body.pincode;
    if (req.body.deliveryCharge !== undefined) locationData.deliveryCharge = req.body.deliveryCharge;
    if (req.body.estimatedDeliveryTime !== undefined) locationData.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    if (req.body.isAvailable !== undefined) locationData.isAvailable = req.body.isAvailable;

    const location = await locationService.updateLocation(id, locationData);
    const formattedLocation = formatLocationResponse(location);

    return sendSuccess(res, 200, { location: formattedLocation }, 'Location updated successfully');
  } catch (error) {
    logger.error('Error in updateLocation controller', error);

    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }

    return sendError(res, 500, 'Failed to update location');
  }
};

/**
 * Delete location
 * DELETE /api/locations/:id
 * Admin only
 */
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await locationService.deleteLocation(id);

    if (!deleted) {
      return sendNotFound(res, 'Location not found');
    }

    return sendSuccess(res, 200, {}, 'Location deleted successfully');
  } catch (error) {
    logger.error('Error in deleteLocation controller', error);
    return sendError(res, 500, 'Failed to delete location');
  }
};

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation
};

