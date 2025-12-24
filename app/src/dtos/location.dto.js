const Joi = require('joi');

/**
 * Location DTO (Data Transfer Object)
 * Validation schemas and response formatters for location endpoints
 */

// Create location validation
const createLocationSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Location name is required',
      'string.min': 'Location name must be at least 1 character',
      'string.max': 'Location name must not exceed 100 characters',
      'any.required': 'Location name is required'
    }),
  area: Joi.string()
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Area must not exceed 100 characters'
    }),
  city: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .default('Chandigarh')
    .messages({
      'string.min': 'City must be at least 1 character',
      'string.max': 'City must not exceed 100 characters'
    }),
  pincode: Joi.string()
    .max(10)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Pincode must not exceed 10 characters'
    }),
  deliveryCharge: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Delivery charge must be a number',
      'number.min': 'Delivery charge must be non-negative',
      'any.required': 'Delivery charge is required'
    }),
  estimatedDeliveryTime: Joi.number()
    .integer()
    .min(0)
    .allow(null)
    .optional()
    .messages({
      'number.base': 'Estimated delivery time must be a number',
      'number.integer': 'Estimated delivery time must be an integer',
      'number.min': 'Estimated delivery time must be non-negative'
    }),
  isAvailable: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'isAvailable must be a boolean'
    })
});

// Update location validation
const updateLocationSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Location name cannot be empty',
      'string.min': 'Location name must be at least 1 character',
      'string.max': 'Location name must not exceed 100 characters'
    }),
  area: Joi.string()
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Area must not exceed 100 characters'
    }),
  city: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'City must be at least 1 character',
      'string.max': 'City must not exceed 100 characters'
    }),
  pincode: Joi.string()
    .max(10)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Pincode must not exceed 10 characters'
    }),
  deliveryCharge: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Delivery charge must be a number',
      'number.min': 'Delivery charge must be non-negative'
    }),
  estimatedDeliveryTime: Joi.number()
    .integer()
    .min(0)
    .allow(null)
    .optional()
    .messages({
      'number.base': 'Estimated delivery time must be a number',
      'number.integer': 'Estimated delivery time must be an integer',
      'number.min': 'Estimated delivery time must be non-negative'
    }),
  isAvailable: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isAvailable must be a boolean'
    })
});

// Query parameters validation
const queryLocationsSchema = Joi.object({
  available: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'available must be "true" or "false"'
    }),
  city: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'City must not exceed 100 characters'
    })
});

/**
 * Response Formatters
 */

/**
 * Format single location for response
 */
const formatLocationResponse = (location) => {
  return {
    id: location.id,
    name: location.name,
    area: location.area,
    city: location.city,
    pincode: location.pincode,
    deliveryCharge: parseFloat(location.deliveryCharge),
    estimatedDeliveryTime: location.estimatedDeliveryTime,
    isAvailable: location.isAvailable,
    createdAt: location.createdAt,
    updatedAt: location.updatedAt
  };
};

/**
 * Format array of locations for response
 */
const formatLocationsResponse = (locations) => {
  return locations.map(location => formatLocationResponse(location));
};

module.exports = {
  createLocationSchema,
  updateLocationSchema,
  queryLocationsSchema,
  formatLocationResponse,
  formatLocationsResponse
};

