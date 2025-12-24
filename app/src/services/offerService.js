'use strict';

const { Offer, Category, Item, Order, Picture, sequelize } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class OfferService {
  /**
   * Get all offers with optional filters
   */
  async getAllOffers(filters = {}) {
    try {
      const where = {};

      if (filters.isActive !== undefined) {
        where.is_active = filters.isActive;
      }

      if (filters.discountType) {
        where.discount_type = filters.discountType;
      }

      const include = [];
      if (filters.includeCategory) {
        include.push({
          model: Category,
          as: 'applicableCategory',
          attributes: ['id', 'name']
        });
      }

      if (filters.includeItem) {
        include.push({
          model: Item,
          as: 'applicableItem',
          attributes: ['id', 'name']
        });
      }

      // Always include pictures
      include.push({
        model: Picture,
        as: 'pictures',
        attributes: ['id', 'url', 'altText', 'displayOrder', 'isPrimary', 'width', 'height', 'fileSize', 'mimeType'],
        required: false
      });

      const offers = await Offer.findAll({
        where,
        include: include.length > 0 ? include : undefined,
        order: [
          ['created_at', 'DESC'],
          [{ model: Picture, as: 'pictures' }, 'displayOrder', 'ASC'],
          [{ model: Picture, as: 'pictures' }, 'createdAt', 'ASC']
        ]
      });

      logger.info(`Retrieved ${offers.length} offers`);
      return offers;
    } catch (error) {
      logger.error('Error retrieving offers', error);
      throw error;
    }
  }

  /**
   * Get offer by ID
   */
  async getOfferById(id, includeAssociations = false) {
    try {
      const include = [];
      if (includeAssociations) {
        include.push(
          {
            model: Category,
            as: 'applicableCategory',
            attributes: ['id', 'name']
          },
          {
            model: Item,
            as: 'applicableItem',
            attributes: ['id', 'name']
          }
        );
      }

      // Always include pictures
      include.push({
        model: Picture,
        as: 'pictures',
        attributes: ['id', 'url', 'altText', 'displayOrder', 'isPrimary', 'width', 'height', 'fileSize', 'mimeType'],
        required: false
      });

      const offer = await Offer.findByPk(id, {
        include: include.length > 0 ? include : undefined,
        order: [
          [{ model: Picture, as: 'pictures' }, 'displayOrder', 'ASC'],
          [{ model: Picture, as: 'pictures' }, 'createdAt', 'ASC']
        ]
      });

      if (offer) {
        logger.info(`Retrieved offer: ${id}`);
      }

      return offer;
    } catch (error) {
      logger.error(`Error retrieving offer ${id}`, error);
      throw error;
    }
  }

  /**
   * Get offer by code
   */
  async getOfferByCode(code) {
    try {
      const offer = await Offer.findOne({
        where: { code: code.toUpperCase() },
        include: [
          {
            model: Category,
            as: 'applicableCategory',
            attributes: ['id', 'name']
          },
          {
            model: Item,
            as: 'applicableItem',
            attributes: ['id', 'name']
          }
        ]
      });

      if (offer) {
        logger.info(`Retrieved offer by code: ${code}`);
      }

      return offer;
    } catch (error) {
      logger.error(`Error retrieving offer by code ${code}`, error);
      throw error;
    }
  }

  /**
   * Create a new offer
   */
  async createOffer(offerData) {
    try {
      // Convert code to uppercase
      offerData.code = offerData.code.toUpperCase();

      const offer = await Offer.create(offerData);
      logger.success(`Offer created: ${offer.id} (${offer.code})`);
      return offer;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const customError = new Error('Offer code already exists');
        customError.name = 'UniqueConstraintError';
        throw customError;
      }
      logger.error('Error creating offer', error);
      throw error;
    }
  }

  /**
   * Update an offer
   */
  async updateOffer(id, updateData) {
    try {
      const offer = await this.getOfferById(id);

      if (!offer) {
        const error = new Error('Offer not found');
        error.name = 'NotFoundError';
        throw error;
      }

      // Convert code to uppercase if provided
      if (updateData.code) {
        updateData.code = updateData.code.toUpperCase();
      }

      await offer.update(updateData);
      logger.success(`Offer updated: ${id}`);
      return offer;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const customError = new Error('Offer code already exists');
        customError.name = 'UniqueConstraintError';
        throw customError;
      }
      logger.error(`Error updating offer ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete an offer
   */
  async deleteOffer(id) {
    try {
      const offer = await this.getOfferById(id);

      if (!offer) {
        const error = new Error('Offer not found');
        error.name = 'NotFoundError';
        throw error;
      }

      await offer.destroy();
      logger.success(`Offer deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting offer ${id}`, error);
      throw error;
    }
  }

  /**
   * Validate and calculate discount for an offer
   */
  async validateOffer(code, userId, subtotal, categoryIds = [], itemIds = []) {
    try {
      const offer = await this.getOfferByCode(code);

      if (!offer) {
        return {
          valid: false,
          message: 'Invalid offer code'
        };
      }

      // Check if offer is active
      if (!offer.isActive) {
        return {
          valid: false,
          message: 'This offer is no longer active'
        };
      }

      // Check validity dates
      const now = new Date();
      if (offer.validFrom && new Date(offer.validFrom) > now) {
        return {
          valid: false,
          message: 'This offer is not yet valid'
        };
      }

      if (offer.validTo && new Date(offer.validTo) < now) {
        return {
          valid: false,
          message: 'This offer has expired'
        };
      }

      // Check minimum order value
      if (offer.minOrderValue && subtotal < parseFloat(offer.minOrderValue)) {
        return {
          valid: false,
          message: `Minimum order value of ₹${offer.minOrderValue} required`
        };
      }

      // Check category/item applicability
      if (offer.applicableCategoryId && !categoryIds.includes(offer.applicableCategoryId)) {
        return {
          valid: false,
          message: 'This offer is not applicable to items in your cart'
        };
      }

      if (offer.applicableItemId && !itemIds.includes(offer.applicableItemId)) {
        return {
          valid: false,
          message: 'This offer is not applicable to items in your cart'
        };
      }

      // Check first order only
      if (offer.firstOrderOnly) {
        const orderCount = await Order.count({
          where: { user_id: userId, status: { [Op.ne]: 'cancelled' } }
        });

        if (orderCount > 0) {
          return {
            valid: false,
            message: 'This offer is only valid for first-time orders'
          };
        }
      }

      // Check max uses per user
      if (offer.maxUsesPerUser) {
        const usageCount = await Order.count({
          where: {
            offer_id: offer.id,
            user_id: userId,
            status: { [Op.ne]: 'cancelled' }  // Don't count cancelled orders
          }
        });

        if (usageCount >= offer.maxUsesPerUser) {
          return {
            valid: false,
            message: 'You have already used this offer the maximum number of times'
          };
        }
      }

      // Calculate discount
      let discountAmount = 0;
      let deliveryDiscount = 0;

      if (offer.discountType === 'percentage') {
        discountAmount = (subtotal * parseFloat(offer.discountValue)) / 100;

        // Apply max discount cap if specified
        if (offer.maxDiscountAmount && discountAmount > parseFloat(offer.maxDiscountAmount)) {
          discountAmount = parseFloat(offer.maxDiscountAmount);
        }
      } else if (offer.discountType === 'flat') {
        discountAmount = parseFloat(offer.discountValue);

        // Discount cannot exceed subtotal
        if (discountAmount > subtotal) {
          discountAmount = subtotal;
        }
      } else if (offer.discountType === 'free_delivery') {
        deliveryDiscount = true;
      }

      logger.info(`Offer validated: ${code} for user ${userId}, discount: ₹${discountAmount}`);

      return {
        valid: true,
        offerId: offer.id,
        discountAmount: Math.round(discountAmount * 100) / 100,
        freeDelivery: deliveryDiscount,
        message: 'Offer applied successfully'
      };
    } catch (error) {
      logger.error(`Error validating offer ${code}`, error);
      throw error;
    }
  }

  /**
   * Get user's offer usage history (orders with offers applied)
   */
  async getUserOfferUsage(userId, offerId = null) {
    try {
      const where = {
        user_id: userId,
        offer_id: { [Op.ne]: null }  // Only orders with offers
      };

      if (offerId) {
        where.offer_id = offerId;
      }

      const orders = await Order.findAll({
        where,
        include: [
          {
            model: Offer,
            as: 'offer',
            attributes: ['id', 'code', 'title', 'discountType']
          }
        ],
        attributes: ['id', 'offerId', 'discountAmount', 'status', 'totalPrice', 'createdAt'],
        order: [['created_at', 'DESC']]
      });

      logger.info(`Retrieved ${orders.length} orders with offers for user ${userId}`);
      return orders;
    } catch (error) {
      logger.error(`Error retrieving offer usage for user ${userId}`, error);
      throw error;
    }
  }
}

module.exports = new OfferService();

