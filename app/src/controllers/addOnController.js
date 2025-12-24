const addOnService = require('../services/addOnService');
const { formatAddOnResponse, formatAddOnsResponse } = require('../dtos/addOn.dto');
const { sendSuccess, sendError, sendNotFound } = require('../utils/responseFormatter');

/**
 * Get all add-ons
 */
const getAllAddOns = async (req, res) => {
  try {
    const filters = {};

    // Parse availability filter
    if (req.query.available !== undefined) {
      filters.available = req.query.available === 'true';
    }

    const addOns = await addOnService.getAllAddOns(filters);
    const formattedAddOns = formatAddOnsResponse(addOns);

    return sendSuccess(res, 200, { addOns: formattedAddOns }, 'Add-ons retrieved successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve add-ons');
  }
};

/**
 * Get add-on by ID
 */
const getAddOnById = async (req, res) => {
  try {
    const addOn = await addOnService.getAddOnById(req.params.id);
    const formattedAddOn = formatAddOnResponse(addOn);

    return sendSuccess(res, 200, { addOn: formattedAddOn }, 'Add-on retrieved successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    return sendError(res, 500, 'Failed to retrieve add-on');
  }
};

/**
 * Create a new add-on
 */
const createAddOn = async (req, res) => {
  try {
    const addOnData = {
      name: req.body.name,
      description: req.body.description || null,
      price: req.body.price,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true
    };

    const addOn = await addOnService.createAddOn(addOnData);
    const formattedAddOn = formatAddOnResponse(addOn);

    return sendSuccess(res, 201, { addOn: formattedAddOn }, 'Add-on created successfully');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }
    return sendError(res, 500, 'Failed to create add-on');
  }
};

/**
 * Update an add-on
 */
const updateAddOn = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable;

    const addOn = await addOnService.updateAddOn(req.params.id, updateData);
    const formattedAddOn = formatAddOnResponse(addOn);

    return sendSuccess(res, 200, { addOn: formattedAddOn }, 'Add-on updated successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }
    return sendError(res, 500, 'Failed to update add-on');
  }
};

/**
 * Delete an add-on
 */
const deleteAddOn = async (req, res) => {
  try {
    await addOnService.deleteAddOn(req.params.id);
    return sendSuccess(res, 200, null, 'Add-on deleted successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    return sendError(res, 500, 'Failed to delete add-on');
  }
};

module.exports = {
  getAllAddOns,
  getAddOnById,
  createAddOn,
  updateAddOn,
  deleteAddOn
};

