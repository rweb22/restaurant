const Joi = require('joi');

// Validation schema for creating an item size
const createItemSizeSchema = Joi.object({
  itemId: Joi.number().integer().positive().required(),
  size: Joi.string().min(1).max(50).required(),
  price: Joi.number().min(0).precision(2).required(),
  isAvailable: Joi.boolean().optional().default(true)
});

// Validation schema for updating an item size
const updateItemSizeSchema = Joi.object({
  size: Joi.string().min(1).max(50).optional(),
  price: Joi.number().min(0).precision(2).optional(),
  isAvailable: Joi.boolean().optional()
}).min(1);

// Validation schema for creating an item size via nested route (no itemId needed)
const createNestedItemSizeSchema = Joi.object({
  size: Joi.string().min(1).max(50).required(),
  price: Joi.number().min(0).precision(2).required(),
  isAvailable: Joi.boolean().optional().default(true)
});

// Validation schema for query parameters
const queryItemSizesSchema = Joi.object({
  itemId: Joi.string().pattern(/^\d+$/).optional(),
  size: Joi.string().min(1).max(50).optional(),
  available: Joi.string().valid('true', 'false').optional()
});

/**
 * Format item size response
 * @param {Object} itemSize - ItemSize model instance
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted item size
 */
const formatItemSizeResponse = (itemSize, options = {}) => {
  const response = {
    id: itemSize.id,
    itemId: itemSize.itemId !== undefined ? itemSize.itemId : itemSize.item_id,
    size: itemSize.size,
    price: parseFloat(itemSize.price),
    isAvailable: itemSize.isAvailable !== undefined ? itemSize.isAvailable : itemSize.is_available,
    createdAt: itemSize.createdAt || itemSize.created_at,
    updatedAt: itemSize.updatedAt || itemSize.updated_at
  };

  // Include item information if available
  if (itemSize.item) {
    response.item = {
      id: itemSize.item.id,
      name: itemSize.item.name,
      categoryId: itemSize.item.categoryId !== undefined ? itemSize.item.categoryId : itemSize.item.category_id
    };
  }

  return response;
};

/**
 * Format multiple item sizes response
 * @param {Array} itemSizes - Array of ItemSize model instances
 * @param {Object} options - Formatting options
 * @returns {Array} Formatted item sizes
 */
const formatItemSizesResponse = (itemSizes, options = {}) => {
  return itemSizes.map(itemSize => formatItemSizeResponse(itemSize, options));
};

module.exports = {
  createItemSizeSchema,
  createNestedItemSizeSchema,
  updateItemSizeSchema,
  queryItemSizesSchema,
  formatItemSizeResponse,
  formatItemSizesResponse
};

