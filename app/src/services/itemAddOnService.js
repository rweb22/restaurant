const { ItemAddOn, Item, AddOn } = require('../models');
const logger = require('../utils/logger');

class ItemAddOnService {
  /**
   * Get all item add-on associations with optional filters
   * @param {Object} filters - Filter options (itemId, addOnId)
   * @returns {Promise<Array>} Array of item add-on associations
   */
  async getAllItemAddOns(filters = {}) {
    try {
      const where = {};

      // Filter by item ID
      if (filters.itemId) {
        where.itemId = filters.itemId;
      }

      // Filter by add-on ID
      if (filters.addOnId) {
        where.addOnId = filters.addOnId;
      }

      const itemAddOns = await ItemAddOn.findAll({
        where,
        include: [
          {
            model: Item,
            as: 'item',
            attributes: ['id', 'name', 'categoryId']
          },
          {
            model: AddOn,
            as: 'addOn',
            attributes: ['id', 'name', 'price', 'isAvailable']
          }
        ],
        order: [['itemId', 'ASC'], ['addOnId', 'ASC']]
      });

      logger.info(`Retrieved ${itemAddOns.length} item add-on associations`);
      return itemAddOns;
    } catch (error) {
      logger.error('Error getting all item add-ons', error);
      throw error;
    }
  }

  /**
   * Get item add-on association by ID
   * @param {number} id - Item add-on association ID
   * @returns {Promise<Object|null>} Item add-on association or null
   */
  async getItemAddOnById(id) {
    try {
      const itemAddOn = await ItemAddOn.findByPk(id, {
        include: [
          {
            model: Item,
            as: 'item',
            attributes: ['id', 'name', 'categoryId']
          },
          {
            model: AddOn,
            as: 'addOn',
            attributes: ['id', 'name', 'price', 'isAvailable']
          }
        ]
      });

      if (itemAddOn) {
        logger.info(`Retrieved item add-on: ${id}`);
      }

      return itemAddOn;
    } catch (error) {
      logger.error(`Error getting item add-on ${id}`, error);
      throw error;
    }
  }

  /**
   * Create a new item add-on association
   * @param {Object} itemAddOnData - Item add-on data (itemId, addOnId)
   * @returns {Promise<Object>} Created item add-on association
   */
  async createItemAddOn(itemAddOnData) {
    try {
      // Verify item exists
      const item = await Item.findByPk(itemAddOnData.itemId);
      if (!item) {
        const error = new Error('Item not found');
        error.name = 'NotFoundError';
        throw error;
      }

      // Verify add-on exists
      const addOn = await AddOn.findByPk(itemAddOnData.addOnId);
      if (!addOn) {
        const error = new Error('Add-on not found');
        error.name = 'NotFoundError';
        throw error;
      }

      const itemAddOn = await ItemAddOn.create(itemAddOnData);
      logger.success(
        `Item add-on created: ${itemAddOn.id} - Item ${itemAddOn.itemId} + AddOn ${itemAddOn.addOnId}`
      );

      // Return the created association with full details
      return await this.getItemAddOnById(itemAddOn.id);
    } catch (error) {
      logger.error('Error creating item add-on', error);
      throw error;
    }
  }

  /**
   * Delete an item add-on association
   * @param {number} id - Item add-on association ID
   * @returns {Promise<Object>} Deleted item add-on association
   */
  async deleteItemAddOn(id) {
    try {
      const itemAddOn = await this.getItemAddOnById(id);

      if (!itemAddOn) {
        const error = new Error('Item add-on association not found');
        error.name = 'NotFoundError';
        throw error;
      }

      await itemAddOn.destroy();
      logger.success(
        `Item add-on deleted: ${id} - Item ${itemAddOn.itemId} + AddOn ${itemAddOn.addOnId}`
      );

      return itemAddOn;
    } catch (error) {
      logger.error(`Error deleting item add-on ${id}`, error);
      throw error;
    }
  }
}

module.exports = new ItemAddOnService();

