'use strict';

const { Address, User, Location, sequelize } = require('../models');
const logger = require('../utils/logger');

class AddressService {
  /**
   * Get all addresses for a user
   */
  async getAllAddresses(userId) {
    try {
      const addresses = await Address.findAll({
        where: { user_id: userId },
        include: [{
          model: Location,
          as: 'location',
          attributes: ['id', 'name', 'area', 'city', 'pincode', 'deliveryCharge', 'estimatedDeliveryTime', 'isAvailable']
        }],
        order: [
          ['is_default', 'DESC'],
          ['created_at', 'DESC']
        ]
      });

      logger.info(`Retrieved ${addresses.length} addresses for user ${userId}`);
      return addresses;
    } catch (error) {
      logger.error(`Error getting addresses for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get address by ID
   */
  async getAddressById(id, userId = null) {
    try {
      const where = { id };
      if (userId !== null) {
        where.user_id = userId;
      }

      const address = await Address.findOne({
        where,
        include: [{
          model: Location,
          as: 'location',
          attributes: ['id', 'name', 'area', 'city', 'pincode', 'deliveryCharge', 'estimatedDeliveryTime', 'isAvailable']
        }]
      });

      if (!address) {
        return null;
      }

      logger.info(`Retrieved address: ${id}`);
      return address;
    } catch (error) {
      logger.error(`Error getting address ${id}`, error);
      throw error;
    }
  }

  /**
   * Create new address
   */
  async createAddress(userId, addressData) {
    try {
      // Validate that location exists and is available
      if (addressData.locationId) {
        const location = await Location.findByPk(addressData.locationId);

        if (!location) {
          const error = new Error('Location not found');
          error.name = 'NotFoundError';
          throw error;
        }

        if (!location.isAvailable) {
          const error = new Error('This location is not available for delivery');
          error.name = 'ValidationError';
          throw error;
        }
      }

      // If this is set as default, unset other defaults for this user
      if (addressData.isDefault) {
        await Address.update(
          { is_default: false },
          { where: { user_id: userId, is_default: true } }
        );
      }

      const createData = {
        ...addressData,
        userId
      };

      const address = await Address.create(createData);

      // Reload with location data
      await address.reload({
        include: [{
          model: Location,
          as: 'location',
          attributes: ['id', 'name', 'area', 'city', 'pincode', 'deliveryCharge', 'estimatedDeliveryTime', 'isAvailable']
        }]
      });

      logger.success(`Address created: ${address.id} for user ${userId}`);
      return address;
    } catch (error) {
      logger.error('Error creating address', error);
      throw error;
    }
  }

  /**
   * Update address
   */
  async updateAddress(id, userId, addressData) {
    try {
      const address = await this.getAddressById(id, userId);

      if (!address) {
        const error = new Error('Address not found');
        error.name = 'NotFoundError';
        throw error;
      }

      // Validate location if being updated
      if (addressData.locationId) {
        const location = await Location.findByPk(addressData.locationId);

        if (!location) {
          const error = new Error('Location not found');
          error.name = 'NotFoundError';
          throw error;
        }

        if (!location.isAvailable) {
          const error = new Error('This location is not available for delivery');
          error.name = 'ValidationError';
          throw error;
        }
      }

      // If setting this as default, unset other defaults for this user
      if (addressData.isDefault && !address.isDefault) {
        await Address.update(
          { is_default: false },
          { where: { user_id: userId, is_default: true } }
        );
      }

      await address.update(addressData);

      // Reload with location data
      await address.reload({
        include: [{
          model: Location,
          as: 'location',
          attributes: ['id', 'name', 'area', 'city', 'pincode', 'deliveryCharge', 'estimatedDeliveryTime', 'isAvailable']
        }]
      });

      logger.success(`Address updated: ${id}`);
      return address;
    } catch (error) {
      logger.error(`Error updating address ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(id, userId) {
    try {
      const address = await this.getAddressById(id, userId);

      if (!address) {
        const error = new Error('Address not found');
        error.name = 'NotFoundError';
        throw error;
      }

      await address.destroy();

      logger.success(`Address deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting address ${id}`, error);
      throw error;
    }
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(id, userId) {
    try {
      const address = await this.getAddressById(id, userId);

      if (!address) {
        const error = new Error('Address not found');
        error.name = 'NotFoundError';
        throw error;
      }

      // Unset other defaults for this user using raw SQL
      await sequelize.query(
        'UPDATE addresses SET is_default = false WHERE user_id = :userId AND is_default = true',
        { replacements: { userId }, type: sequelize.QueryTypes.UPDATE }
      );

      // Set this address as default using raw SQL
      await sequelize.query(
        'UPDATE addresses SET is_default = true WHERE id = :id AND user_id = :userId',
        { replacements: { id: parseInt(id), userId }, type: sequelize.QueryTypes.UPDATE }
      );

      // Reload to get updated values
      await address.reload();

      logger.success(`Address ${id} set as default for user ${userId}`);
      return address;
    } catch (error) {
      logger.error(`Error setting default address ${id}`, error);
      throw error;
    }
  }
}

module.exports = new AddressService();

