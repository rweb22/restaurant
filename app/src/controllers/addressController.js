'use strict';

const addressService = require('../services/addressService');
const { formatAddressResponse, formatAddressesResponse } = require('../dtos/address.dto');
const { sendSuccess, sendError, sendNotFound } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Address Controller
 * Handles HTTP requests for address operations
 */

/**
 * Get all addresses for authenticated user
 * Admin: Get all addresses from all users
 * Client: Get only their own addresses
 * GET /api/addresses
 */
const getAllAddresses = async (req, res) => {
  try {
    // If admin, get all addresses; otherwise, get only user's addresses
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const addresses = await addressService.getAllAddresses(userId);
    const formattedAddresses = formatAddressesResponse(addresses);

    return sendSuccess(res, 200, { addresses: formattedAddresses }, 'Addresses retrieved successfully');
  } catch (error) {
    logger.error('Error in getAllAddresses controller', error);
    return sendError(res, 500, 'Failed to retrieve addresses');
  }
};

/**
 * Get address by ID
 * Admin: Can get any address
 * Client: Can only get their own addresses
 * GET /api/addresses/:id
 */
const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    // If admin, allow access to any address; otherwise, restrict to user's own addresses
    const userId = req.user.role === 'admin' ? null : req.user.id;

    const address = await addressService.getAddressById(id, userId);

    if (!address) {
      return sendNotFound(res, 'Address not found');
    }

    const formattedAddress = formatAddressResponse(address);

    return sendSuccess(res, 200, { address: formattedAddress }, 'Address retrieved successfully');
  } catch (error) {
    logger.error('Error in getAddressById controller', error);
    return sendError(res, 500, 'Failed to retrieve address');
  }
};

/**
 * Create new address
 * POST /api/addresses
 */
const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate required fields
    if (!req.body.addressLine1 || !req.body.addressLine1.trim()) {
      return sendError(res, 400, 'Address line 1 is required');
    }

    if (!req.body.city || !req.body.city.trim()) {
      return sendError(res, 400, 'City is required');
    }

    const addressData = {
      label: req.body.label,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country || 'India',
      landmark: req.body.landmark,
      isDefault: req.body.isDefault || false
    };

    const address = await addressService.createAddress(userId, addressData);
    const formattedAddress = formatAddressResponse(address);

    return sendSuccess(res, 201, { address: formattedAddress }, 'Address created successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendError(res, 404, error.message);
    }
    if (error.name === 'ValidationError') {
      return sendError(res, 400, error.message);
    }
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return sendError(res, 400, 'Invalid foreign key reference');
    }
    logger.error('Error in createAddress controller', error);
    return sendError(res, 500, 'Failed to create address');
  }
};

/**
 * Update address
 * Admin: Can update any address
 * Client: Can only update their own addresses
 * PUT /api/addresses/:id
 */
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    // If admin, allow updating any address; otherwise, restrict to user's own addresses
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const addressData = {
      label: req.body.label,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country,
      landmark: req.body.landmark,
      isDefault: req.body.isDefault
    };

    // Remove undefined fields
    Object.keys(addressData).forEach(key => {
      if (addressData[key] === undefined) {
        delete addressData[key];
      }
    });

    const address = await addressService.updateAddress(id, userId, addressData);
    const formattedAddress = formatAddressResponse(address);

    return sendSuccess(res, 200, { address: formattedAddress }, 'Address updated successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    if (error.name === 'ValidationError') {
      return sendError(res, 400, error.message);
    }
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return sendError(res, 400, 'Invalid location ID');
    }
    logger.error('Error in updateAddress controller', error);
    return sendError(res, 500, 'Failed to update address');
  }
};

/**
 * Delete address
 * Admin: Can delete any address
 * Client: Can only delete their own addresses
 * DELETE /api/addresses/:id
 */
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    // If admin, allow deleting any address; otherwise, restrict to user's own addresses
    const userId = req.user.role === 'admin' ? null : req.user.id;

    await addressService.deleteAddress(id, userId);

    return sendSuccess(res, 200, null, 'Address deleted successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    logger.error('Error in deleteAddress controller', error);
    return sendError(res, 500, 'Failed to delete address');
  }
};

/**
 * Set address as default
 * PATCH /api/addresses/:id/default
 */
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const address = await addressService.setDefaultAddress(id, userId);
    const formattedAddress = formatAddressResponse(address);

    return sendSuccess(res, 200, { address: formattedAddress }, 'Default address updated successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    logger.error('Error in setDefaultAddress controller', error);
    return sendError(res, 500, 'Failed to set default address');
  }
};

module.exports = {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};

