'use strict';

const orderService = require('../services/orderService');
const { formatOrderResponse, formatOrdersResponse } = require('../dtos/order.dto');
const { sendSuccess, sendError, sendNotFound } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Order Controller
 * Handles HTTP requests for order operations
 */

/**
 * Get all orders
 * GET /api/orders
 * Admin: Get all orders
 * Client: Get only their own orders
 */
const getAllOrders = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const filters = {
      userId,
      status: req.query.status,
      includeItems: req.query.includeItems === 'true'
    };

    const orders = await orderService.getAllOrders(filters);
    const formattedOrders = formatOrdersResponse(orders, filters.includeItems);

    return sendSuccess(res, 200, { orders: formattedOrders }, 'Orders retrieved successfully');
  } catch (error) {
    logger.error('Error in getAllOrders controller', error);
    return sendError(res, 500, 'Failed to retrieve orders');
  }
};

/**
 * Get order by ID
 * GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.role === 'admin' ? null : req.user.id;

    const order = await orderService.getOrderById(id, userId);

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    const formattedOrder = formatOrderResponse(order, true);

    return sendSuccess(res, 200, { order: formattedOrder }, 'Order retrieved successfully');
  } catch (error) {
    logger.error('Error in getOrderById controller', error);
    return sendError(res, 500, 'Failed to retrieve order');
  }
};

/**
 * Create new order
 * POST /api/orders
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = {
      addressId: req.body.addressId,
      offerCode: req.body.offerCode,
      items: req.body.items,
      specialInstructions: req.body.specialInstructions,
      deliveryCharge: req.body.deliveryCharge
    };

    const order = await orderService.createOrder(userId, orderData);
    const formattedOrder = formatOrderResponse(order, true);

    return sendSuccess(res, 201, { order: formattedOrder }, 'Order created successfully');
  } catch (error) {
    logger.error('Error in createOrder controller', error);

    // Handle specific error messages
    if (error.message.includes('not found') || error.message.includes('does not belong')) {
      return sendError(res, 404, error.message);
    }

    if (error.message.includes('unavailable')) {
      return sendError(res, 400, error.message);
    }

    if (error.message.includes('offer') || error.message.includes('Offer')) {
      return sendError(res, 400, error.message);
    }

    return sendError(res, 500, 'Failed to create order', error.message);
  }
};

/**
 * Update order status
 * PATCH /api/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const isAdmin = req.user.role === 'admin';

    const order = await orderService.updateOrderStatus(id, status, userId, isAdmin);

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    const formattedOrder = formatOrderResponse(order, true);

    return sendSuccess(res, 200, { order: formattedOrder }, 'Order status updated successfully');
  } catch (error) {
    logger.error('Error in updateOrderStatus controller', error);
    
    if (error.message.includes('not found')) {
      return sendNotFound(res, error.message);
    }
    
    if (error.message.includes('transition')) {
      return sendError(res, 400, error.message);
    }

    return sendError(res, 500, 'Failed to update order status', error.message);
  }
};

/**
 * Cancel order
 * POST /api/orders/:id/cancel
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const isAdmin = req.user.role === 'admin';

    const order = await orderService.cancelOrder(id, userId, isAdmin);

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    const formattedOrder = formatOrderResponse(order, true);

    return sendSuccess(res, 200, { order: formattedOrder }, 'Order cancelled successfully');
  } catch (error) {
    logger.error('Error in cancelOrder controller', error);

    if (error.message.includes('not found')) {
      return sendNotFound(res, error.message);
    }

    if (error.message.includes('transition')) {
      return sendError(res, 400, error.message);
    }

    return sendError(res, 500, 'Failed to cancel order', error.message);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder
};

