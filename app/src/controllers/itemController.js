const itemService = require('../services/itemService');
const itemSizeService = require('../services/itemSizeService');
const { formatItemResponse, formatItemsResponse } = require('../dtos/item.dto');
const { formatItemSizeResponse } = require('../dtos/itemSize.dto');
const { sendSuccess, sendError, sendNotFound } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Get all items with optional filters
 */
const getAllItems = async (req, res) => {
  try {
    const filters = {
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId, 10) : undefined,
      available: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined,
      includeSizes: req.query.includeSizes === 'true',
      includeAddOns: req.query.includeAddOns === 'true'
    };

    const items = await itemService.getAllItems(filters);
    const formattedItems = formatItemsResponse(items, {
      includeSizes: filters.includeSizes,
      includeAddOns: filters.includeAddOns
    });

    return sendSuccess(res, 200, { items: formattedItems }, 'Items retrieved successfully');
  } catch (error) {
    logger.error('Error in getAllItems controller', error);
    return sendError(res, 500, 'Failed to retrieve items');
  }
};

/**
 * Get item by ID
 */
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const options = {
      includeSizes: req.query.includeSizes === 'true',
      includeAddOns: req.query.includeAddOns === 'true'
    };

    const item = await itemService.getItemById(id, options);

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    const formattedItem = formatItemResponse(item, {
      includeSizes: options.includeSizes,
      includeAddOns: options.includeAddOns
    });

    return sendSuccess(res, 200, { item: formattedItem }, 'Item retrieved successfully');
  } catch (error) {
    logger.error('Error in getItemById controller', error);
    return sendError(res, 500, 'Failed to retrieve item');
  }
};

/**
 * Create a new item
 */
const createItem = async (req, res) => {
  try {
    const itemData = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
      dietaryTags: req.body.dietaryTags || [],
      displayOrder: req.body.displayOrder !== undefined ? req.body.displayOrder : 0
    };

    const item = await itemService.createItem(itemData);
    const formattedItem = formatItemResponse(item);

    return sendSuccess(res, 201, { item: formattedItem }, 'Item created successfully');
  } catch (error) {
    logger.error('Error in createItem controller', error);

    // Handle not found error (category doesn't exist)
    if (error.name === 'NotFoundError') {
      return sendError(res, 404, error.message);
    }

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }

    // Handle foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return sendError(res, 400, 'Invalid category ID');
    }

    return sendError(res, 500, 'Failed to create item');
  }
};

/**
 * Update an item
 */
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    // Only include fields that are provided
    if (req.body.categoryId !== undefined) updateData.categoryId = req.body.categoryId;
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.imageUrl !== undefined) updateData.imageUrl = req.body.imageUrl;
    if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable;
    if (req.body.dietaryTags !== undefined) updateData.dietaryTags = req.body.dietaryTags;
    if (req.body.displayOrder !== undefined) updateData.displayOrder = req.body.displayOrder;

    const item = await itemService.updateItem(id, updateData);

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    const formattedItem = formatItemResponse(item);
    return sendSuccess(res, 200, { item: formattedItem }, 'Item updated successfully');
  } catch (error) {
    logger.error('Error in updateItem controller', error);

    // Handle not found error (category doesn't exist)
    if (error.name === 'NotFoundError') {
      return sendError(res, 404, error.message);
    }

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }

    // Handle foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return sendError(res, 400, 'Invalid category ID');
    }

    return sendError(res, 500, 'Failed to update item');
  }
};

/**
 * Delete an item
 */
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await itemService.deleteItem(id);

    if (!deleted) {
      return sendNotFound(res, 'Item not found');
    }

    return sendSuccess(res, 200, {}, 'Item deleted successfully');
  } catch (error) {
    logger.error('Error in deleteItem controller', error);
    return sendError(res, 500, 'Failed to delete item');
  }
};

/**
 * Add size to item (nested route)
 * @route POST /api/items/:id/sizes
 */
const addSizeToItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);

    // Verify item exists
    const item = await itemService.getItemById(itemId);
    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    const itemSizeData = {
      itemId,
      size: req.body.size,
      price: req.body.price,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true
    };

    const itemSize = await itemSizeService.createItemSize(itemSizeData);
    const formattedItemSize = formatItemSizeResponse(itemSize);

    return sendSuccess(res, 201, { itemSize: formattedItemSize }, 'Item size created successfully');
  } catch (error) {
    logger.error('Error in addSizeToItem controller', error);

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

    return sendError(res, 500, 'Failed to create item size');
  }
};

/**
 * Update item size (nested route)
 * @route PUT /api/items/:id/sizes/:sizeId
 */
const updateItemSize = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const sizeId = parseInt(req.params.sizeId, 10);

    // Verify item exists
    const item = await itemService.getItemById(itemId);
    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    // Verify size belongs to this item
    const existingSize = await itemSizeService.getItemSizeById(sizeId);
    if (!existingSize) {
      return sendNotFound(res, 'Item size not found');
    }
    if (existingSize.itemId !== itemId) {
      return sendError(res, 400, 'Item size does not belong to this item');
    }

    const updateData = {};
    if (req.body.size !== undefined) updateData.size = req.body.size;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable;

    const itemSize = await itemSizeService.updateItemSize(sizeId, updateData);
    const formattedItemSize = formatItemSizeResponse(itemSize);

    return sendSuccess(res, 200, { itemSize: formattedItemSize }, 'Item size updated successfully');
  } catch (error) {
    logger.error('Error in updateItemSize controller', error);

    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 400, 'Item size with this size already exists for this item');
    }

    return sendError(res, 500, 'Failed to update item size');
  }
};

/**
 * Delete item size (nested route)
 * @route DELETE /api/items/:id/sizes/:sizeId
 */
const deleteItemSize = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const sizeId = parseInt(req.params.sizeId, 10);

    // Verify item exists
    const item = await itemService.getItemById(itemId);
    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    // Verify size belongs to this item
    const existingSize = await itemSizeService.getItemSizeById(sizeId);
    if (!existingSize) {
      return sendNotFound(res, 'Item size not found');
    }
    if (existingSize.itemId !== itemId) {
      return sendError(res, 400, 'Item size does not belong to this item');
    }

    const deleted = await itemSizeService.deleteItemSize(sizeId);

    return sendSuccess(res, 200, null, 'Item size deleted successfully');
  } catch (error) {
    logger.error('Error in deleteItemSize controller', error);
    return sendError(res, 500, 'Failed to delete item size');
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  addSizeToItem,
  updateItemSize,
  deleteItemSize
};

