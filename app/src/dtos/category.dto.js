'use strict';

const Joi = require('joi');

/**
 * Validation Schemas for Category
 */

// Create category validation
const createCategorySchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 1 character',
      'string.max': 'Category name must not exceed 100 characters',
      'any.required': 'Category name is required'
    }),
  description: Joi.string()
    .allow(null, '')
    .optional()
    .messages({
      'string.base': 'Description must be a string'
    }),
  isAvailable: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'isAvailable must be a boolean'
    }),
  displayOrder: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Display order must be a number',
      'number.integer': 'Display order must be an integer',
      'number.min': 'Display order must be non-negative'
    }),
  gstRate: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .default(5)
    .messages({
      'number.base': 'GST rate must be a number',
      'number.min': 'GST rate must be non-negative',
      'number.max': 'GST rate cannot exceed 100'
    })
});

// Update category validation (all fields optional)
const updateCategorySchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Category name cannot be empty',
      'string.min': 'Category name must be at least 1 character',
      'string.max': 'Category name must not exceed 100 characters'
    }),
  description: Joi.string()
    .allow(null, '')
    .optional()
    .messages({
      'string.base': 'Description must be a string'
    }),
  isAvailable: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isAvailable must be a boolean'
    }),
  displayOrder: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Display order must be a number',
      'number.integer': 'Display order must be an integer',
      'number.min': 'Display order must be non-negative'
    }),
  gstRate: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'GST rate must be a number',
      'number.min': 'GST rate must be non-negative',
      'number.max': 'GST rate cannot exceed 100'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Query parameters validation
const queryCategoriesSchema = Joi.object({
  available: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'available must be "true" or "false"'
    }),
  includeItems: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'includeItems must be "true" or "false"'
    }),
  includeAddOns: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'includeAddOns must be "true" or "false"'
    })
});

/**
 * Response Formatters
 */

/**
 * Format single category for response
 * @param {Object} category - Category instance
 * @param {Object} options - Formatting options
 * @returns {Object}
 */
const formatCategoryResponse = (category, options = {}) => {
  const response = {
    id: category.id,
    name: category.name,
    description: category.description,
    isAvailable: category.isAvailable !== undefined ? category.isAvailable : category.is_available,
    displayOrder: category.displayOrder !== undefined ? category.displayOrder : category.display_order,
    gstRate: category.gstRate !== undefined ? parseFloat(category.gstRate) : (category.gst_rate !== undefined ? parseFloat(category.gst_rate) : 5.00),
    createdAt: category.createdAt || category.created_at,
    updatedAt: category.updatedAt || category.updated_at
  };

  // Include items if requested and available
  if (options.includeItems && category.items) {
    response.items = category.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : item.is_available,
      displayOrder: item.displayOrder !== undefined ? item.displayOrder : item.display_order
    }));
  }

  // Include add-ons if requested and available
  if (options.includeAddOns && category.addOns) {
    response.addOns = category.addOns.map(addOn => ({
      id: addOn.id,
      name: addOn.name,
      price: parseFloat(addOn.price),
      isAvailable: addOn.isAvailable !== undefined ? addOn.isAvailable : addOn.is_available
    }));
  }

  // Always include pictures if present
  if (category.pictures) {
    response.pictures = category.pictures.map(picture => ({
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
    const primaryPicture = category.pictures.find(p => p.isPrimary || p.is_primary) || category.pictures[0];
    if (primaryPicture) {
      response.imageUrl = primaryPicture.url;
    }
  }

  return response;
};

/**
 * Format array of categories for response
 * @param {Array} categories - Array of category instances
 * @param {Object} options - Formatting options
 * @returns {Array}
 */
const formatCategoriesResponse = (categories, options = {}) => {
  return categories.map(category => formatCategoryResponse(category, options));
};

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  queryCategoriesSchema,
  formatCategoryResponse,
  formatCategoriesResponse
};

