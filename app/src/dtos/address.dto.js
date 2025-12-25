'use strict';

const Joi = require('joi');

/**
 * Validation Schemas for Address
 */

// Create address validation
const createAddressSchema = Joi.object({
  label: Joi.string()
    .max(50)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Label must not exceed 50 characters'
    }),
  addressLine1: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Address line 1 is required',
      'string.min': 'Address line 1 must be at least 1 character',
      'string.max': 'Address line 1 must not exceed 255 characters',
      'any.required': 'Address line 1 is required'
    }),
  addressLine2: Joi.string()
    .max(255)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Address line 2 must not exceed 255 characters'
    }),
  // Legacy fields - kept for backward compatibility but now optional
  // Location data is now stored via locationId
  city: Joi.string()
    .min(1)
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.min': 'City must be at least 1 character',
      'string.max': 'City must not exceed 100 characters'
    }),
  state: Joi.string()
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'State must not exceed 100 characters'
    }),
  postalCode: Joi.string()
    .max(20)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Postal code must not exceed 20 characters'
    }),
  country: Joi.string()
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Country must not exceed 100 characters'
    }),
  landmark: Joi.string()
    .max(255)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Landmark must not exceed 255 characters'
    }),
  locationId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Location ID must be a number',
      'number.integer': 'Location ID must be an integer',
      'number.positive': 'Location ID must be positive',
      'any.required': 'Location ID is required'
    }),
  isDefault: Joi.boolean()
    .optional()
    .default(false)
    .messages({
      'boolean.base': 'isDefault must be a boolean'
    })
}).options({ stripUnknown: true });

// Update address validation (all fields optional)
const updateAddressSchema = Joi.object({
  label: Joi.string()
    .max(50)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Label must not exceed 50 characters'
    }),
  addressLine1: Joi.string()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.empty': 'Address line 1 cannot be empty',
      'string.min': 'Address line 1 must be at least 1 character',
      'string.max': 'Address line 1 must not exceed 255 characters'
    }),
  addressLine2: Joi.string()
    .max(255)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Address line 2 must not exceed 255 characters'
    }),
  city: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'City cannot be empty',
      'string.min': 'City must be at least 1 character',
      'string.max': 'City must not exceed 100 characters'
    }),
  state: Joi.string()
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'State must not exceed 100 characters'
    }),
  postalCode: Joi.string()
    .max(20)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Postal code must not exceed 20 characters'
    }),
  country: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Country must not exceed 100 characters'
    }),
  landmark: Joi.string()
    .max(255)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Landmark must not exceed 255 characters'
    }),
  locationId: Joi.number()
    .integer()
    .allow(null)
    .optional()
    .messages({
      'number.base': 'Location ID must be a number',
      'number.integer': 'Location ID must be an integer'
    }),
  isDefault: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isDefault must be a boolean'
    })
}).options({ stripUnknown: true });

/**
 * Response Formatters
 */

const formatAddressResponse = (address) => {
  if (!address) return null;

  const response = {
    id: address.id,
    userId: address.userId !== undefined ? address.userId : address.user_id,
    label: address.label,
    addressLine1: address.addressLine1 || address.address_line1,
    addressLine2: address.addressLine2 || address.address_line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode || address.postal_code,
    country: address.country,
    landmark: address.landmark,
    locationId: address.locationId !== undefined ? address.locationId : address.location_id,
    isDefault: address.isDefault !== undefined ? address.isDefault : address.is_default,
    createdAt: address.createdAt || address.created_at,
    updatedAt: address.updatedAt || address.updated_at
  };

  // Include user data if available (for admin views)
  if (address.user) {
    response.user = {
      id: address.user.id,
      name: address.user.name,
      phone: address.user.phone
    };
  }

  // Include location data if available
  if (address.location) {
    const loc = address.location;
    // Handle both camelCase (from Sequelize with underscored: true) and snake_case (raw data)
    const deliveryCharge = loc.deliveryCharge !== undefined ? loc.deliveryCharge : loc.delivery_charge;
    const estimatedDeliveryTime = loc.estimatedDeliveryTime !== undefined ? loc.estimatedDeliveryTime : loc.estimated_delivery_time;
    const isAvailable = loc.isAvailable !== undefined ? loc.isAvailable : loc.is_available;

    const parsedDeliveryCharge = deliveryCharge !== undefined && deliveryCharge !== null ? parseFloat(deliveryCharge) : 0;

    response.location = {
      id: loc.id,
      name: loc.name,
      area: loc.area,
      city: loc.city,
      pincode: loc.pincode,
      deliveryCharge: parsedDeliveryCharge,
      estimatedDeliveryTime: estimatedDeliveryTime || 30,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    };
  }

  return response;
};

const formatAddressesResponse = (addresses) => {
  if (!Array.isArray(addresses)) return [];
  return addresses.map(formatAddressResponse);
};

module.exports = {
  createAddressSchema,
  updateAddressSchema,
  formatAddressResponse,
  formatAddressesResponse
};

