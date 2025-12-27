'use strict';

const Joi = require('joi');

/**
 * DTO for sending OTP
 */
const SendOtpDto = Joi.object({
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be in valid international format (e.g., +911234567890)',
      'any.required': 'Phone number is required'
    })
});

/**
 * DTO for verifying OTP
 */
const VerifyOtpDto = Joi.object({
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be in valid international format',
      'any.required': 'Phone number is required'
    }),
  otp: Joi.string()
    .pattern(/^\d{4,6}$/)
    .required()
    .messages({
      'string.pattern.base': 'OTP must be 4-6 digits',
      'any.required': 'OTP is required'
    }),
  secret: Joi.string()
    .required()
    .messages({
      'any.required': 'Secret is required'
    }),
  pushToken: Joi.string()
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'Push token must be a string'
    })
});

/**
 * DTO for updating user profile
 */
const UpdateProfileDto = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.min': 'Name must be at least 1 character',
      'string.max': 'Name must not exceed 255 characters',
      'any.required': 'Name is required'
    })
});

/**
 * Format user response (safe object without sensitive data)
 */
const formatUserResponse = (user) => {
  return {
    id: user.id,
    phone: user.phone,
    role: user.role,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * Format authentication response with token
 */
const formatAuthResponse = (accessToken, user) => {
  return {
    accessToken,
    user: formatUserResponse(user)
  };
};

/**
 * Format OTP send response
 */
const formatOtpSendResponse = (secret, expiresIn = 300) => {
  return {
    secret,
    expiresIn,
    message: 'OTP sent successfully'
  };
};

/**
 * Format token refresh response
 */
const formatTokenRefreshResponse = (accessToken) => {
  return {
    accessToken
  };
};

module.exports = {
  SendOtpDto,
  VerifyOtpDto,
  UpdateProfileDto,
  formatUserResponse,
  formatAuthResponse,
  formatOtpSendResponse,
  formatTokenRefreshResponse
};

