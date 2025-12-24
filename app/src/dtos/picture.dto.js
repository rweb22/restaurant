'use strict';

const Joi = require('joi');

/**
 * Schema for creating a new picture
 */
const createPictureSchema = Joi.object({
  entityType: Joi.string()
    .valid('item', 'category', 'offer', 'user')
    .required()
    .messages({
      'any.required': 'Entity type is required',
      'any.only': 'Entity type must be one of: item, category, offer, user'
    }),
  
  entityId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'any.required': 'Entity ID is required',
      'number.base': 'Entity ID must be a number',
      'number.integer': 'Entity ID must be an integer',
      'number.positive': 'Entity ID must be positive'
    }),
  
  url: Joi.string()
    .uri()
    .required()
    .messages({
      'any.required': 'URL is required',
      'string.uri': 'URL must be a valid URI'
    }),
  
  altText: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Alt text must not exceed 255 characters'
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
  
  isPrimary: Joi.boolean()
    .optional()
    .default(false)
    .messages({
      'boolean.base': 'isPrimary must be a boolean'
    }),
  
  width: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Width must be a number',
      'number.integer': 'Width must be an integer',
      'number.positive': 'Width must be positive'
    }),
  
  height: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Height must be a number',
      'number.integer': 'Height must be an integer',
      'number.positive': 'Height must be positive'
    }),
  
  fileSize: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'File size must be a number',
      'number.integer': 'File size must be an integer',
      'number.positive': 'File size must be positive'
    }),
  
  mimeType: Joi.string()
    .pattern(/^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/i)
    .optional()
    .messages({
      'string.pattern.base': 'MIME type must be a valid image type (jpeg, jpg, png, gif, webp, svg+xml)'
    })
});

/**
 * Schema for updating a picture
 */
const updatePictureSchema = Joi.object({
  url: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'URL must be a valid URI'
    }),
  
  altText: Joi.string()
    .max(255)
    .optional()
    .allow(null)
    .messages({
      'string.max': 'Alt text must not exceed 255 characters'
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
  
  isPrimary: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isPrimary must be a boolean'
    }),
  
  width: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Width must be a number',
      'number.integer': 'Width must be an integer',
      'number.positive': 'Width must be positive'
    }),
  
  height: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Height must be a number',
      'number.integer': 'Height must be an integer',
      'number.positive': 'Height must be positive'
    }),
  
  fileSize: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'File size must be a number',
      'number.integer': 'File size must be an integer',
      'number.positive': 'File size must be positive'
    }),
  
  mimeType: Joi.string()
    .pattern(/^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/i)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'MIME type must be a valid image type (jpeg, jpg, png, gif, webp, svg+xml)'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Schema for reordering pictures
 */
const reorderPicturesSchema = Joi.object({
  pictures: Joi.array()
    .items(
      Joi.object({
        id: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'any.required': 'Picture ID is required',
            'number.base': 'Picture ID must be a number',
            'number.integer': 'Picture ID must be an integer',
            'number.positive': 'Picture ID must be positive'
          }),
        displayOrder: Joi.number()
          .integer()
          .min(0)
          .required()
          .messages({
            'any.required': 'Display order is required',
            'number.base': 'Display order must be a number',
            'number.integer': 'Display order must be an integer',
            'number.min': 'Display order must be non-negative'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'any.required': 'Pictures array is required',
      'array.min': 'At least one picture must be provided'
    })
});

module.exports = {
  createPictureSchema,
  updatePictureSchema,
  reorderPicturesSchema
};

