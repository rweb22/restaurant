'use strict';

const Joi = require('joi');

/**
 * Validation Schemas for Order
 */

// Create order validation
const createOrderSchema = Joi.object({
  addressId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Address ID must be a number',
      'number.integer': 'Address ID must be an integer',
      'number.positive': 'Address ID must be positive',
      'any.required': 'Address ID is required'
    }),
  offerCode: Joi.string()
    .max(50)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Offer code must not exceed 50 characters'
    }),
  items: Joi.array()
    .items(
      Joi.object({
        itemSizeId: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.base': 'Item size ID must be a number',
            'number.integer': 'Item size ID must be an integer',
            'number.positive': 'Item size ID must be positive',
            'any.required': 'Item size ID is required'
          }),
        quantity: Joi.number()
          .integer()
          .min(1)
          .required()
          .messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be an integer',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required'
          }),
        addOns: Joi.array()
          .items(
            Joi.object({
              addOnId: Joi.number()
                .integer()
                .positive()
                .required()
                .messages({
                  'number.base': 'Add-on ID must be a number',
                  'number.integer': 'Add-on ID must be an integer',
                  'number.positive': 'Add-on ID must be positive',
                  'any.required': 'Add-on ID is required'
                }),
              quantity: Joi.number()
                .integer()
                .min(1)
                .optional()
                .default(1)
                .messages({
                  'number.base': 'Add-on quantity must be a number',
                  'number.integer': 'Add-on quantity must be an integer',
                  'number.min': 'Add-on quantity must be at least 1'
                })
            })
          )
          .optional()
          .default([])
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one item is required',
      'any.required': 'Items are required'
    }),
  specialInstructions: Joi.string()
    .max(1000)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Special instructions must not exceed 1000 characters'
    }),
  deliveryCharge: Joi.number()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Delivery charge must be a number',
      'number.min': 'Delivery charge must be non-negative'
    })
}).options({ stripUnknown: true });

// Update order status validation
const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')
    .required()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of: pending, confirmed, preparing, ready, completed, cancelled',
      'any.required': 'Status is required'
    })
}).options({ stripUnknown: true });

/**
 * Response Formatters
 */

// Format single order response
const formatOrderResponse = (order, includeItems = false) => {
  const response = {
    id: order.id,
    userId: order.userId,
    addressId: order.addressId,
    offerId: order.offerId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    paymentGatewayOrderId: order.paymentGatewayOrderId,
    paymentGatewayPaymentId: order.paymentGatewayPaymentId,
    subtotal: parseFloat(order.subtotal),
    gstAmount: parseFloat(order.gstAmount),
    discountAmount: parseFloat(order.discountAmount),
    deliveryCharge: parseFloat(order.deliveryCharge),
    totalPrice: parseFloat(order.totalPrice),
    specialInstructions: order.specialInstructions,
    deliveryAddress: order.deliveryAddress,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };

  if (includeItems && order.orderItems) {
    response.items = order.orderItems.map(item => formatOrderItemResponse(item, true));
  }

  if (order.offer) {
    response.offer = {
      id: order.offer.id,
      code: order.offer.code,
      title: order.offer.title,
      discountType: order.offer.discountType
    };
  }

  return response;
};

// Format order item response
const formatOrderItemResponse = (orderItem, includeAddOns = false) => {
  const response = {
    id: orderItem.id,
    orderId: orderItem.orderId,
    itemId: orderItem.itemId,
    itemSizeId: orderItem.itemSizeId,
    quantity: orderItem.quantity,
    categoryName: orderItem.categoryName,
    itemName: orderItem.itemName,
    size: orderItem.size,
    basePrice: parseFloat(orderItem.basePrice),
    createdAt: orderItem.createdAt
  };

  if (includeAddOns && orderItem.addOns) {
    response.addOns = orderItem.addOns.map(addOn => formatOrderItemAddOnResponse(addOn));
  }

  return response;
};

// Format order item add-on response
const formatOrderItemAddOnResponse = (addOn) => {
  return {
    id: addOn.id,
    orderItemId: addOn.orderItemId,
    addOnId: addOn.addOnId,
    quantity: addOn.quantity,
    addOnName: addOn.addOnName,
    addOnPrice: parseFloat(addOn.addOnPrice),
    createdAt: addOn.createdAt
  };
};

// Format multiple orders response
const formatOrdersResponse = (orders, includeItems = false) => {
  return orders.map(order => formatOrderResponse(order, includeItems));
};

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  formatOrderResponse,
  formatOrderItemResponse,
  formatOrderItemAddOnResponse,
  formatOrdersResponse
};

