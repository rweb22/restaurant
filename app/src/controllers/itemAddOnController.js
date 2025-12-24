const itemAddOnService = require('../services/itemAddOnService');
const { formatItemAddOnResponse, formatItemAddOnsResponse } = require('../dtos/itemAddOn.dto');
const { sendSuccess, sendError, sendNotFound } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Get all item add-on associations
 * @route GET /api/item-add-ons
 * @query {number} itemId - Filter by item ID
 * @query {number} addOnId - Filter by add-on ID
 */
const getAllItemAddOns = async (req, res) => {
  try {
    const filters = {
      itemId: req.query.itemId ? parseInt(req.query.itemId) : undefined,
      addOnId: req.query.addOnId ? parseInt(req.query.addOnId) : undefined
    };

    const itemAddOns = await itemAddOnService.getAllItemAddOns(filters);
    const formattedItemAddOns = formatItemAddOnsResponse(itemAddOns);

    return sendSuccess(res, 200, { itemAddOns: formattedItemAddOns }, 'Item add-ons retrieved successfully');
  } catch (error) {
    logger.error('Error in getAllItemAddOns controller', error);
    return sendError(res, 500, 'Failed to retrieve item add-ons');
  }
};

/**
 * Get item add-on association by ID
 * @route GET /api/item-add-ons/:id
 * @param {number} id - Item add-on association ID
 */
const getItemAddOnById = async (req, res) => {
  try {
    const { id } = req.params;
    const itemAddOn = await itemAddOnService.getItemAddOnById(id);

    if (!itemAddOn) {
      return sendNotFound(res, 'Item add-on association not found');
    }

    const formattedItemAddOn = formatItemAddOnResponse(itemAddOn);
    return sendSuccess(res, 200, { itemAddOn: formattedItemAddOn }, 'Item add-on retrieved successfully');
  } catch (error) {
    logger.error('Error in getItemAddOnById controller', error);
    return sendError(res, 500, 'Failed to retrieve item add-on');
  }
};

/**
 * Create a new item add-on association
 * @route POST /api/item-add-ons
 * @body {number} itemId - Item ID
 * @body {number} addOnId - Add-on ID
 */
const createItemAddOn = async (req, res) => {
  try {
    const itemAddOnData = {
      itemId: req.body.itemId,
      addOnId: req.body.addOnId
    };

    const itemAddOn = await itemAddOnService.createItemAddOn(itemAddOnData);
    const formattedItemAddOn = formatItemAddOnResponse(itemAddOn);

    return sendSuccess(
      res,
      201,
      { itemAddOn: formattedItemAddOn },
      'Item add-on created successfully'
    );
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendError(res, 404, error.message);
    }
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 400, 'This add-on is already associated with this item');
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return sendError(res, 400, 'Invalid item ID or add-on ID');
    }
    logger.error('Error in createItemAddOn controller', error);
    return sendError(res, 500, 'Failed to create item add-on');
  }
};

/**
 * Delete an item add-on association
 * @route DELETE /api/item-add-ons/:id
 * @param {number} id - Item add-on association ID
 */
const deleteItemAddOn = async (req, res) => {
  try {
    const { id } = req.params;
    await itemAddOnService.deleteItemAddOn(id);

    return sendSuccess(res, 200, null, 'Item add-on deleted successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    logger.error('Error in deleteItemAddOn controller', error);
    return sendError(res, 500, 'Failed to delete item add-on');
  }
};

module.exports = {
  getAllItemAddOns,
  getItemAddOnById,
  createItemAddOn,
  deleteItemAddOn
};

