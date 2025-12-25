const Joi = require('joi');

/**
 * Validation schema for creating an item
 */
const createItemSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be positive',
      'any.required': 'Category ID is required'
    }),
  name: Joi.string().min(1).max(255).required()
    .messages({
      'string.empty': 'Item name cannot be empty',
      'string.min': 'Item name must be at least 1 character',
      'string.max': 'Item name cannot exceed 255 characters',
      'any.required': 'Item name is required'
    }),
  description: Joi.string().allow(null, '').optional(),
  isAvailable: Joi.boolean().optional().default(true),
  dietaryTags: Joi.array().items(Joi.string()).optional().default([])
    .messages({
      'array.base': 'Dietary tags must be an array'
    }),
  displayOrder: Joi.number().integer().min(0).optional().default(0)
    .messages({
      'number.base': 'Display order must be a number',
      'number.integer': 'Display order must be an integer',
      'number.min': 'Display order must be non-negative'
    })
});

/**
 * Validation schema for updating an item
 */
const updateItemSchema = Joi.object({
  categoryId: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be positive'
    }),
  name: Joi.string().min(1).max(255).optional()
    .messages({
      'string.empty': 'Item name cannot be empty',
      'string.min': 'Item name must be at least 1 character',
      'string.max': 'Item name cannot exceed 255 characters'
    }),
  description: Joi.string().allow(null, '').optional(),
  isAvailable: Joi.boolean().optional(),
  dietaryTags: Joi.array().items(Joi.string()).optional()
    .messages({
      'array.base': 'Dietary tags must be an array'
    }),
  displayOrder: Joi.number().integer().min(0).optional()
    .messages({
      'number.base': 'Display order must be a number',
      'number.integer': 'Display order must be an integer',
      'number.min': 'Display order must be non-negative'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Validation schema for query parameters
 */
const queryItemsSchema = Joi.object({
  categoryId: Joi.string().pattern(/^\d+$/).optional()
    .messages({
      'string.pattern.base': 'Category ID must be a valid number'
    }),
  available: Joi.string().valid('true', 'false').optional()
    .messages({
      'any.only': 'available must be "true" or "false"'
    }),
  includeSizes: Joi.string().valid('true', 'false').optional()
    .messages({
      'any.only': 'includeSizes must be "true" or "false"'
    }),
  includeAddOns: Joi.string().valid('true', 'false').optional()
    .messages({
      'any.only': 'includeAddOns must be "true" or "false"'
    })
});

/**
 * Format item response
 */
const formatItemResponse = (item, options = {}) => {
  const response = {
    id: item.id,
    categoryId: item.categoryId !== undefined ? item.categoryId : item.category_id,
    name: item.name,
    description: item.description,
    isAvailable: item.isAvailable !== undefined ? item.isAvailable : item.is_available,
    dietaryTags: item.dietaryTags || item.dietary_tags || [],
    displayOrder: item.displayOrder !== undefined ? item.displayOrder : item.display_order,
    createdAt: item.createdAt || item.created_at,
    updatedAt: item.updatedAt || item.updated_at
  };

  // Include category if present
  if (item.category) {
    response.category = {
      id: item.category.id,
      name: item.category.name,
      gstRate: item.category.gstRate !== undefined ? parseFloat(item.category.gstRate) : (item.category.gst_rate !== undefined ? parseFloat(item.category.gst_rate) : 5.00),
      isAvailable: item.category.isAvailable !== undefined ? item.category.isAvailable : item.category.is_available
    };
  }

  // Include sizes if requested and present
  if (options.includeSizes && item.sizes) {
    response.sizes = item.sizes.map(size => ({
      id: size.id,
      size: size.size,
      price: parseFloat(size.price),
      isAvailable: size.isAvailable !== undefined ? size.isAvailable : size.is_available
    }));
  }

  // Include add-ons if requested and present
  if (options.includeAddOns && item.addOns) {
    response.addOns = item.addOns.map(addOn => ({
      id: addOn.id,
      name: addOn.name,
      description: addOn.description,
      price: parseFloat(addOn.price),
      isAvailable: addOn.isAvailable !== undefined ? addOn.isAvailable : addOn.is_available
    }));
  }

  // Always include pictures if present
  if (item.pictures) {
    response.pictures = item.pictures.map(picture => ({
      id: picture.id,
      url: picture.url,
      altText: picture.altText || picture.alt_text,
      displayOrder: picture.displayOrder !== undefined ? picture.displayOrder : picture.display_order,
      isPrimary: picture.isPrimary !== undefined ? picture.isPrimary : picture.is_primary,
      width: picture.width,
      height: picture.height,
      fileSize: picture.fileSize !== undefined ? picture.fileSize : picture.file_size,
      mimeType: picture.mimeType || picture.mime_type
    }));

    // Add imageUrl field for backward compatibility with client app
    const primaryPicture = item.pictures.find(p => p.isPrimary || p.is_primary) || item.pictures[0];
    if (primaryPicture) {
      response.imageUrl = primaryPicture.url;
    }
  }

  return response;
};

/**
 * Format multiple items response
 */
const formatItemsResponse = (items, options = {}) => {
  return items.map(item => formatItemResponse(item, options));
};

module.exports = {
  createItemSchema,
  updateItemSchema,
  queryItemsSchema,
  formatItemResponse,
  formatItemsResponse
};

