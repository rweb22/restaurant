'use strict';

const { Order, OrderItem, OrderItemAddOn, User, Address, Offer, Item, ItemSize, AddOn, Category, sequelize } = require('../models');
const logger = require('../utils/logger');
const offerService = require('./offerService');
const notificationService = require('./notificationService');
const { Op } = require('sequelize');

class OrderService {
  /**
   * Get all orders with optional filters
   */
  async getAllOrders(filters = {}) {
    try {
      const where = {};

      if (filters.userId) {
        where.user_id = filters.userId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      const include = [
        {
          model: Offer,
          as: 'offer',
          attributes: ['id', 'code', 'title', 'discountType']
        }
      ];

      if (filters.includeItems) {
        include.push({
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: OrderItemAddOn,
              as: 'addOns'
            }
          ]
        });
      }

      const orders = await Order.findAll({
        where,
        include,
        order: [['created_at', 'DESC']]
      });

      logger.info(`Retrieved ${orders.length} orders`);
      return orders;
    } catch (error) {
      logger.error('Error retrieving orders', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id, userId = null) {
    try {
      const where = { id };
      if (userId !== null) {
        where.user_id = userId;
      }

      const order = await Order.findOne({
        where,
        include: [
          {
            model: Offer,
            as: 'offer',
            attributes: ['id', 'code', 'title', 'discountType']
          },
          {
            model: OrderItem,
            as: 'orderItems',
            include: [
              {
                model: OrderItemAddOn,
                as: 'addOns'
              }
            ]
          }
        ]
      });

      if (order) {
        logger.info(`Retrieved order: ${id}`);
      }

      return order;
    } catch (error) {
      logger.error(`Error retrieving order ${id}`, error);
      throw error;
    }
  }

  /**
   * Create new order
   */
  async createOrder(userId, orderData) {
    const transaction = await sequelize.transaction();

    try {
      // Verify user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify address exists and belongs to user
      const address = await Address.findOne({
        where: { id: orderData.addressId, user_id: userId }
      });
      if (!address) {
        throw new Error('Address not found or does not belong to user');
      }

      // Build delivery address snapshot
      const deliveryAddress = `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}${address.state ? ', ' + address.state : ''}${address.postalCode ? ' - ' + address.postalCode : ''}, ${address.country}${address.landmark ? ' (Near: ' + address.landmark + ')' : ''}`;

      // Calculate subtotal and validate items
      let subtotal = 0;
      const validatedItems = [];
      const categoryIds = [];
      const itemIds = [];

      // Track GST by category
      const categoryGstMap = new Map();

      for (const orderItem of orderData.items) {
        // Get item size with item and category info
        const itemSize = await ItemSize.findOne({
          where: { id: orderItem.itemSizeId },
          include: [
            {
              model: Item,
              as: 'item',
              include: [
                {
                  model: Category,
                  as: 'category'
                }
              ]
            }
          ]
        });

        if (!itemSize || !itemSize.item) {
          throw new Error(`Item size ${orderItem.itemSizeId} not found`);
        }

        const item = itemSize.item;
        const category = item.category;

        // Track for offer validation
        categoryIds.push(category.id);
        itemIds.push(item.id);

        // Calculate item price
        let itemTotal = parseFloat(itemSize.price) * orderItem.quantity;

        // Validate and calculate add-ons
        const validatedAddOns = [];
        if (orderItem.addOns && orderItem.addOns.length > 0) {
          for (const addOnData of orderItem.addOns) {
            const addOn = await AddOn.findByPk(addOnData.addOnId);
            if (!addOn) {
              throw new Error(`Add-on ${addOnData.addOnId} not found`);
            }

            const addOnQuantity = addOnData.quantity || 1;
            itemTotal += parseFloat(addOn.price) * addOnQuantity * orderItem.quantity;

            validatedAddOns.push({
              addOnId: addOn.id,
              quantity: addOnQuantity,
              addOnName: addOn.name,
              addOnPrice: addOn.price
            });
          }
        }

        subtotal += itemTotal;

        // Track GST for this category
        const gstRate = parseFloat(category.gstRate) || 5.0;
        if (!categoryGstMap.has(category.id)) {
          categoryGstMap.set(category.id, { rate: gstRate, amount: 0 });
        }
        const categoryGst = categoryGstMap.get(category.id);
        categoryGst.amount += itemTotal;

        validatedItems.push({
          itemSizeId: itemSize.id,
          itemId: item.id,
          quantity: orderItem.quantity,
          categoryName: category.name,
          itemName: item.name,
          size: itemSize.size,
          basePrice: itemSize.price,
          addOns: validatedAddOns
        });
      }

      // Calculate total GST
      let gstAmount = 0;
      for (const [categoryId, gstInfo] of categoryGstMap) {
        gstAmount += (gstInfo.amount * gstInfo.rate) / 100;
      }

      // Validate and apply offer if provided
      let offerId = null;
      let discountAmount = 0;

      if (orderData.offerCode) {
        const offerValidation = await offerService.validateOffer(
          orderData.offerCode,
          userId,
          subtotal,
          categoryIds,
          itemIds
        );

        if (!offerValidation.valid) {
          throw new Error(offerValidation.message);
        }

        offerId = offerValidation.offerId;
        discountAmount = offerValidation.discountAmount;
      }

      // Calculate total price (subtotal + GST + delivery - discount)
      const deliveryCharge = orderData.deliveryCharge || 0;
      const totalPrice = subtotal + gstAmount + deliveryCharge - discountAmount;

      // Create order
      const order = await Order.create(
        {
          userId,
          addressId: orderData.addressId,
          offerId,
          status: 'pending_payment',
          paymentStatus: 'pending',
          subtotal,
          gstAmount,
          discountAmount,
          deliveryCharge,
          totalPrice,
          specialInstructions: orderData.specialInstructions,
          deliveryAddress
        },
        { transaction }
      );

      // Create order items
      for (const validatedItem of validatedItems) {
        const orderItem = await OrderItem.create(
          {
            orderId: order.id,
            itemId: validatedItem.itemId,
            itemSizeId: validatedItem.itemSizeId,
            quantity: validatedItem.quantity,
            categoryName: validatedItem.categoryName,
            itemName: validatedItem.itemName,
            size: validatedItem.size,
            basePrice: validatedItem.basePrice
          },
          { transaction }
        );

        // Create order item add-ons
        for (const addOn of validatedItem.addOns) {
          await OrderItemAddOn.create(
            {
              orderItemId: orderItem.id,
              addOnId: addOn.addOnId,
              quantity: addOn.quantity,
              addOnName: addOn.addOnName,
              addOnPrice: addOn.addOnPrice
            },
            { transaction }
          );
        }
      }

      await transaction.commit();

      logger.success(`Order created: ${order.id} for user ${userId}`);

      // Send notification to client
      await notificationService.createNotification('ORDER_CREATED', {
        userId,
        orderId: order.id,
        totalPrice: parseFloat(totalPrice).toFixed(2)
      });

      // Fetch complete order with associations
      return await this.getOrderById(order.id);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating order', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id, status, userId = null, isAdmin = false) {
    try {
      const where = { id };

      // Non-admin users can only update their own orders
      if (!isAdmin && userId !== null) {
        where.user_id = userId;
      }

      const order = await Order.findOne({ where });

      if (!order) {
        throw new Error('Order not found');
      }

      // Validate status transition
      const validTransitions = {
        pending_payment: ['cancelled'], // Can only cancel if payment is pending
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready', 'cancelled'],
        ready: ['completed', 'cancelled'],
        completed: [],
        cancelled: []
      };

      if (!validTransitions[order.status]) {
        throw new Error(`Invalid order status: ${order.status}`);
      }

      if (!validTransitions[order.status].includes(status)) {
        throw new Error(`Cannot transition from ${order.status} to ${status}`);
      }

      await order.update({ status });

      logger.success(`Order ${id} status updated to ${status}`);

      // Send notification to client based on status
      const notificationTemplates = {
        'confirmed': 'ORDER_CONFIRMED',
        'preparing': 'ORDER_PREPARING',
        'ready': 'ORDER_READY',
        'completed': 'ORDER_COMPLETED'
      };

      const templateName = notificationTemplates[status];
      if (templateName) {
        await notificationService.createNotification(templateName, {
          userId: order.userId,
          orderId: order.id,
          deliveryAddress: order.deliveryAddress
        });
      }

      return await this.getOrderById(id);
    } catch (error) {
      logger.error(`Error updating order ${id} status`, error);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(id, userId = null, isAdmin = false) {
    try {
      // Get order details before cancellation
      const order = await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'phone']
          }
        ]
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const cancelledByClient = !isAdmin && userId === order.userId;

      // Update order status
      const updatedOrder = await this.updateOrderStatus(id, 'cancelled', userId, isAdmin);

      // Send notification to client
      await notificationService.createNotification('ORDER_CANCELLED', {
        userId: order.userId,
        orderId: order.id,
        refundAmount: order.paymentStatus === 'completed' ? parseFloat(order.totalPrice).toFixed(2) : null
      });

      // If cancelled by client, notify admin
      if (cancelledByClient) {
        await notificationService.createNotification('ORDER_CANCELLED_BY_CLIENT', {
          orderId: order.id,
          customerPhone: order.user.phone,
          refundAmount: order.paymentStatus === 'completed' ? parseFloat(order.totalPrice).toFixed(2) : null
        });
      }

      return updatedOrder;
    } catch (error) {
      logger.error(`Error cancelling order ${id}`, error);
      throw error;
    }
  }
}

module.exports = new OrderService();

