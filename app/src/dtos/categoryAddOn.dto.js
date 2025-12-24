const Joi = require('joi');

/**
 * Validation schema for creating a category add-on association
 */
const createCategoryAddOnSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be positive',
      'any.required': 'Category ID is required'
    }),
  addOnId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Add-on ID must be a number',
      'number.integer': 'Add-on ID must be an integer',
      'number.positive': 'Add-on ID must be positive',
      'any.required': 'Add-on ID is required'
    })
}).options({ stripUnknown: true });

/**
 * Validation schema for query parameters
 */
const queryCategoryAddOnsSchema = Joi.object({
  categoryId: Joi.string().pattern(/^\d+$/).optional(),
  addOnId: Joi.string().pattern(/^\d+$/).optional()
}).options({ stripUnknown: true });

/**
 * Format category add-on response
 */
const formatCategoryAddOnResponse = (categoryAddOn, options = {}) => {
  const response = {
    id: categoryAddOn.id,
    categoryId: categoryAddOn.categoryId !== undefined ? categoryAddOn.categoryId : categoryAddOn.category_id,
    addOnId: categoryAddOn.addOnId !== undefined ? categoryAddOn.addOnId : categoryAddOn.add_on_id,
    createdAt: categoryAddOn.createdAt || categoryAddOn.created_at
  };

  // Include category info if available
  if (categoryAddOn.category) {
    response.category = {
      id: categoryAddOn.category.id,
      name: categoryAddOn.category.name
    };
  }

  // Include add-on info if available
  if (categoryAddOn.addOn) {
    response.addOn = {
      id: categoryAddOn.addOn.id,
      name: categoryAddOn.addOn.name,
      price: parseFloat(categoryAddOn.addOn.price),
      isAvailable: categoryAddOn.addOn.isAvailable !== undefined 
        ? categoryAddOn.addOn.isAvailable 
        : categoryAddOn.addOn.is_available
    };
  }

  return response;
};

/**
 * Format multiple category add-ons response
 */
const formatCategoryAddOnsResponse = (categoryAddOns) => {
  return categoryAddOns.map(formatCategoryAddOnResponse);
};

module.exports = {
  createCategoryAddOnSchema,
  queryCategoryAddOnsSchema,
  formatCategoryAddOnResponse,
  formatCategoryAddOnsResponse
};

