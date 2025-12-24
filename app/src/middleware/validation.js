'use strict';

const { sendValidationError } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Middleware factory to validate request data using Joi schema
 * @param {object} schema - Joi schema object
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {function} - Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    // Get data to validate
    const dataToValidate = req[property];

    // Validate against schema
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      logger.warn('Validation failed', {
        property,
        errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });

      return sendValidationError(res, error);
    }

    // Replace request data with validated and sanitized value
    req[property] = value;

    next();
  };
};

/**
 * Shorthand for validating request body
 * @param {object} schema - Joi schema
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * Shorthand for validating query parameters
 * @param {object} schema - Joi schema
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Shorthand for validating route parameters
 * @param {object} schema - Joi schema
 */
const validateParams = (schema) => validate(schema, 'params');

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams
};

