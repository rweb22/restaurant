'use strict';

/**
 * Format success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Response data
 * @param {string} message - Optional success message
 */
const sendSuccess = (res, statusCode = 200, data = {}, message = null) => {
  const response = {
    success: true,
    ...data
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Format error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} errors - Optional validation errors
 */
const sendError = (res, statusCode = 500, message = 'Internal server error', errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Format validation error response
 * @param {object} res - Express response object
 * @param {object} errors - Validation errors from Joi
 */
const sendValidationError = (res, errors) => {
  const formattedErrors = {};
  
  if (errors && errors.details) {
    errors.details.forEach(error => {
      const field = error.path.join('.');
      formattedErrors[field] = error.message;
    });
  }

  return sendError(res, 400, 'Validation failed', formattedErrors);
};

/**
 * Format not found error
 * @param {object} res - Express response object
 * @param {string} resource - Resource name
 */
const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, 404, `${resource} not found`);
};

/**
 * Format unauthorized error
 * @param {object} res - Express response object
 * @param {string} message - Optional custom message
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, 401, message);
};

/**
 * Format forbidden error
 * @param {object} res - Express response object
 * @param {string} message - Optional custom message
 */
const sendForbidden = (res, message = 'Access forbidden') => {
  return sendError(res, 403, message);
};

/**
 * Format conflict error
 * @param {object} res - Express response object
 * @param {string} message - Conflict message
 */
const sendConflict = (res, message = 'Resource already exists') => {
  return sendError(res, 409, message);
};

/**
 * Format bad request error
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const sendBadRequest = (res, message = 'Bad request') => {
  return sendError(res, 400, message);
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendConflict,
  sendBadRequest
};

