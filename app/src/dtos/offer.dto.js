'use strict';

const Joi = require('joi');

/**
 * Validation schema for creating an offer
 */
const createOfferSchema = Joi.object({
  code: Joi.string().min(3).max(50).uppercase().required()
    .messages({
      'string.empty': 'Offer code is required',
      'any.required': 'Offer code is required',
      'string.min': 'Offer code must be at least 3 characters',
      'string.max': 'Offer code must not exceed 50 characters'
    }),
  title: Joi.string().min(1).max(255).required()
    .messages({
      'string.empty': 'Offer title is required',
      'any.required': 'Offer title is required',
      'string.max': 'Offer title must not exceed 255 characters'
    }),
  description: Joi.string().allow(null, '').optional(),
  discountType: Joi.string().valid('percentage', 'flat', 'free_delivery').required()
    .messages({
      'any.required': 'Discount type is required',
      'any.only': 'Discount type must be percentage, flat, or free_delivery'
    }),
  discountValue: Joi.number().min(0).when('discountType', {
    is: Joi.string().valid('percentage', 'flat'),
    then: Joi.required(),
    otherwise: Joi.optional().allow(null)
  })
    .messages({
      'number.min': 'Discount value must be non-negative',
      'any.required': 'Discount value is required for percentage and flat discounts'
    }),
  maxDiscountAmount: Joi.number().min(0).optional().allow(null)
    .messages({
      'number.min': 'Max discount amount must be non-negative'
    }),
  minOrderValue: Joi.number().min(0).optional().allow(null)
    .messages({
      'number.min': 'Minimum order value must be non-negative'
    }),
  applicableCategoryId: Joi.number().integer().optional().allow(null)
    .messages({
      'number.base': 'Applicable category ID must be a number'
    }),
  applicableItemId: Joi.number().integer().optional().allow(null)
    .messages({
      'number.base': 'Applicable item ID must be a number'
    }),
  firstOrderOnly: Joi.boolean().optional().default(false),
  maxUsesPerUser: Joi.number().integer().min(1).optional().allow(null)
    .messages({
      'number.min': 'Max uses per user must be at least 1'
    }),
  validFrom: Joi.date().iso().optional().allow(null),
  validTo: Joi.date().iso().min(Joi.ref('validFrom')).optional().allow(null)
    .messages({
      'date.min': 'Valid to date must be after valid from date'
    }),
  isActive: Joi.boolean().optional().default(true)
}).options({ stripUnknown: true });

/**
 * Validation schema for updating an offer
 */
const updateOfferSchema = Joi.object({
  code: Joi.string().min(3).max(50).uppercase().optional()
    .messages({
      'string.min': 'Offer code must be at least 3 characters',
      'string.max': 'Offer code must not exceed 50 characters'
    }),
  title: Joi.string().min(1).max(255).optional()
    .messages({
      'string.max': 'Offer title must not exceed 255 characters'
    }),
  description: Joi.string().allow(null, '').optional(),
  discountType: Joi.string().valid('percentage', 'flat', 'free_delivery').optional()
    .messages({
      'any.only': 'Discount type must be percentage, flat, or free_delivery'
    }),
  discountValue: Joi.number().min(0).optional().allow(null)
    .messages({
      'number.min': 'Discount value must be non-negative'
    }),
  maxDiscountAmount: Joi.number().min(0).optional().allow(null)
    .messages({
      'number.min': 'Max discount amount must be non-negative'
    }),
  minOrderValue: Joi.number().min(0).optional().allow(null)
    .messages({
      'number.min': 'Minimum order value must be non-negative'
    }),
  applicableCategoryId: Joi.number().integer().optional().allow(null)
    .messages({
      'number.base': 'Applicable category ID must be a number'
    }),
  applicableItemId: Joi.number().integer().optional().allow(null)
    .messages({
      'number.base': 'Applicable item ID must be a number'
    }),
  firstOrderOnly: Joi.boolean().optional(),
  maxUsesPerUser: Joi.number().integer().min(1).optional().allow(null)
    .messages({
      'number.min': 'Max uses per user must be at least 1'
    }),
  validFrom: Joi.date().iso().optional().allow(null),
  validTo: Joi.date().iso().optional().allow(null),
  isActive: Joi.boolean().optional()
}).options({ stripUnknown: true });

/**
 * Validation schema for validating an offer code
 */
const validateOfferSchema = Joi.object({
  code: Joi.string().min(3).max(50).uppercase().required()
    .messages({
      'string.empty': 'Offer code is required',
      'any.required': 'Offer code is required'
    }),
  subtotal: Joi.number().min(0).required()
    .messages({
      'number.min': 'Subtotal must be non-negative',
      'any.required': 'Subtotal is required'
    }),
  categoryIds: Joi.array().items(Joi.number().integer()).optional().default([]),
  itemIds: Joi.array().items(Joi.number().integer()).optional().default([])
}).options({ stripUnknown: true });

/**
 * Format offer response
 */
const formatOfferResponse = (offer) => {
  return {
    id: offer.id,
    code: offer.code,
    title: offer.title,
    description: offer.description,
    discountType: offer.discountType,
    discountValue: offer.discountValue ? parseFloat(offer.discountValue) : null,
    maxDiscountAmount: offer.maxDiscountAmount ? parseFloat(offer.maxDiscountAmount) : null,
    minOrderValue: offer.minOrderValue ? parseFloat(offer.minOrderValue) : null,
    applicableCategoryId: offer.applicableCategoryId,
    applicableItemId: offer.applicableItemId,
    firstOrderOnly: offer.firstOrderOnly,
    maxUsesPerUser: offer.maxUsesPerUser,
    validFrom: offer.validFrom,
    validTo: offer.validTo,
    isActive: offer.isActive,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
    // Include associations if present
    ...(offer.applicableCategory && {
      applicableCategory: {
        id: offer.applicableCategory.id,
        name: offer.applicableCategory.name
      }
    }),
    ...(offer.applicableItem && {
      applicableItem: {
        id: offer.applicableItem.id,
        name: offer.applicableItem.name
      }
    }),
    // Always include pictures if present
    ...(offer.pictures && {
      pictures: offer.pictures.map(picture => ({
        id: picture.id,
        url: picture.url,
        altText: picture.altText || picture.alt_text,
        displayOrder: picture.displayOrder !== undefined ? picture.displayOrder : picture.display_order,
        isPrimary: picture.isPrimary !== undefined ? picture.isPrimary : picture.is_primary,
        width: picture.width,
        height: picture.height,
        fileSize: picture.fileSize !== undefined ? picture.fileSize : picture.file_size,
        mimeType: picture.mimeType || picture.mime_type
      }))
    })
  };
};

module.exports = {
  createOfferSchema,
  updateOfferSchema,
  validateOfferSchema,
  formatOfferResponse
};

