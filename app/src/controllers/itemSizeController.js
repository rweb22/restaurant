const itemSizeService = require('../services/itemSizeService');
const { formatItemSizeResponse, formatItemSizesResponse } = require('../dtos/itemSize.dto');
const { sendSuccess, sendError, sendNotFound } = require('../utils/responseFormatter');

/**
 * Get all item sizes
 * @route GET /api/item-sizes
 */
const getAllItemSizes = async (req, res) => {
  try {
    const filters = {};

    // Parse query parameters
    if (req.query.itemId) {
      filters.itemId = parseInt(req.query.itemId, 10);
    }

    if (req.query.size) {
      filters.size = req.query.size;
    }

    if (req.query.available) {
      filters.available = req.query.available === 'true';
    }

    const itemSizes = await itemSizeService.getAllItemSizes(filters);
    const formattedItemSizes = formatItemSizesResponse(itemSizes);

    return sendSuccess(res, 200, { itemSizes: formattedItemSizes }, 'Item sizes retrieved successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve item sizes');
  }
};

/**
 * Get item size by ID
 * @route GET /api/item-sizes/:id
 */
const getItemSizeById = async (req, res) => {
  try {
    const itemSize = await itemSizeService.getItemSizeById(req.params.id);

    if (!itemSize) {
      return sendNotFound(res, 'Item size not found');
    }

    const formattedItemSize = formatItemSizeResponse(itemSize);

    return sendSuccess(res, 200, { itemSize: formattedItemSize }, 'Item size retrieved successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve item size');
  }
};

/**
 * Create a new item size
 * @route POST /api/item-sizes
 */
const createItemSize = async (req, res) => {
  try {
    const itemSizeData = {
      itemId: req.body.itemId,
      size: req.body.size,
      price: req.body.price,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true
    };

    const itemSize = await itemSizeService.createItemSize(itemSizeData);
    const formattedItemSize = formatItemSizeResponse(itemSize);

    return sendSuccess(res, 201, { itemSize: formattedItemSize }, 'Item size created successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendError(res, 404, error.message);
    }

    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 400, 'Item size with this size already exists for this item');
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return sendError(res, 400, 'Invalid item ID');
    }

    return sendError(res, 500, 'Failed to create item size');
  }
};

/**
 * Update an item size
 * @route PUT /api/item-sizes/:id
 */
const updateItemSize = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.itemId !== undefined) updateData.itemId = req.body.itemId;
    if (req.body.size !== undefined) updateData.size = req.body.size;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable;

    const itemSize = await itemSizeService.updateItemSize(req.params.id, updateData);

    if (!itemSize) {
      return sendNotFound(res, 'Item size not found');
    }

    const formattedItemSize = formatItemSizeResponse(itemSize);

    return sendSuccess(res, 200, { itemSize: formattedItemSize }, 'Item size updated successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendError(res, 404, error.message);
    }

    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 400, 'Item size with this size already exists for this item');
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return sendError(res, 400, 'Invalid item ID');
    }

    return sendError(res, 500, 'Failed to update item size');
  }
};

/**
 * Delete an item size
 * @route DELETE /api/item-sizes/:id
 */
const deleteItemSize = async (req, res) => {
  try {
    const deleted = await itemSizeService.deleteItemSize(req.params.id);

    if (!deleted) {
      return sendNotFound(res, 'Item size not found');
    }

    return sendSuccess(res, 200, null, 'Item size deleted successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete item size');
  }
};

module.exports = {
  getAllItemSizes,
  getItemSizeById,
  createItemSize,
  updateItemSize,
  deleteItemSize
};

