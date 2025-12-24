'use strict';

const Joi = require('joi');

/**
 * Schema for updating user
 */
const updateUserSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  role: Joi.string().valid('admin', 'client').optional(),
});

/**
 * Schema for querying users
 */
const queryUsersSchema = Joi.object({
  role: Joi.string().valid('admin', 'client').optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

module.exports = {
  updateUserSchema,
  queryUsersSchema,
};

