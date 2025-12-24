const Joi = require('joi');

/**
 * Validation schema for creating an add-on
 */
const createAddOnSchema = Joi.object({
  name: Joi.string().min(1).max(100).required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 1 character',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
  description: Joi.string().allow('', null).optional(),
  price: Joi.number().min(0).precision(2).required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price must be non-negative',
      'any.required': 'Price is required'
    }),
  isAvailable: Joi.boolean().optional().default(true)
}).options({ stripUnknown: true });

/**
 * Validation schema for updating an add-on
 */
const updateAddOnSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().allow('', null).optional(),
  price: Joi.number().min(0).precision(2).optional(),
  isAvailable: Joi.boolean().optional()
}).min(1).options({ stripUnknown: true });

/**
 * Validation schema for query parameters
 */
const queryAddOnsSchema = Joi.object({
  available: Joi.string().valid('true', 'false').optional()
}).options({ stripUnknown: true });

/**
 * Format add-on response
 */
const formatAddOnResponse = (addOn) => {
  return {
    id: addOn.id,
    name: addOn.name,
    description: addOn.description,
    price: parseFloat(addOn.price),
    isAvailable: addOn.isAvailable !== undefined ? addOn.isAvailable : addOn.is_available,
    createdAt: addOn.createdAt || addOn.created_at,
    updatedAt: addOn.updatedAt || addOn.updated_at
  };
};

/**
 * Format multiple add-ons response
 */
const formatAddOnsResponse = (addOns) => {
  return addOns.map(formatAddOnResponse);
};

module.exports = {
  createAddOnSchema,
  updateAddOnSchema,
  queryAddOnsSchema,
  formatAddOnResponse,
  formatAddOnsResponse
};

