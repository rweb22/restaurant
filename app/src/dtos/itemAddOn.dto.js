const Joi = require('joi');

// Validation schema for creating item add-on association
const createItemAddOnSchema = Joi.object({
  itemId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Item ID must be a number',
      'number.integer': 'Item ID must be an integer',
      'number.positive': 'Item ID must be positive',
      'any.required': 'Item ID is required'
    }),
  addOnId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Add-on ID must be a number',
      'number.integer': 'Add-on ID must be an integer',
      'number.positive': 'Add-on ID must be positive',
      'any.required': 'Add-on ID is required'
    })
}).options({ stripUnknown: true });

// Validation schema for querying item add-ons
const queryItemAddOnsSchema = Joi.object({
  itemId: Joi.string().pattern(/^\d+$/).optional()
    .messages({
      'string.pattern.base': 'Item ID must be a valid number'
    }),
  addOnId: Joi.string().pattern(/^\d+$/).optional()
    .messages({
      'string.pattern.base': 'Add-on ID must be a valid number'
    })
}).options({ stripUnknown: true });

// Format item add-on response
const formatItemAddOnResponse = (itemAddOn, options = {}) => {
  const response = {
    id: itemAddOn.id,
    itemId: itemAddOn.itemId !== undefined ? itemAddOn.itemId : itemAddOn.item_id,
    addOnId: itemAddOn.addOnId !== undefined ? itemAddOn.addOnId : itemAddOn.add_on_id,
    createdAt: itemAddOn.createdAt || itemAddOn.created_at
  };

  // Include item info if available
  if (itemAddOn.item) {
    response.item = {
      id: itemAddOn.item.id,
      name: itemAddOn.item.name,
      categoryId: itemAddOn.item.categoryId !== undefined ? itemAddOn.item.categoryId : itemAddOn.item.category_id
    };
  }

  // Include add-on info if available
  if (itemAddOn.addOn) {
    response.addOn = {
      id: itemAddOn.addOn.id,
      name: itemAddOn.addOn.name,
      price: parseFloat(itemAddOn.addOn.price),
      isAvailable: itemAddOn.addOn.isAvailable !== undefined 
        ? itemAddOn.addOn.isAvailable 
        : itemAddOn.addOn.is_available
    };
  }

  return response;
};

// Format multiple item add-ons response
const formatItemAddOnsResponse = (itemAddOns, options = {}) => {
  return itemAddOns.map(itemAddOn => formatItemAddOnResponse(itemAddOn, options));
};

module.exports = {
  createItemAddOnSchema,
  queryItemAddOnsSchema,
  formatItemAddOnResponse,
  formatItemAddOnsResponse
};

