const { ItemSize, Item, sequelize } = require('../models');
const logger = require('../utils/logger');

class ItemSizeService {
  /**
   * Get all item sizes with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of item sizes
   */
  async getAllItemSizes(filters = {}) {
    const where = {};
    const include = [];

    // Filter by item ID
    if (filters.itemId) {
      where.itemId = filters.itemId;
    }

    // Filter by size
    if (filters.size) {
      where.size = filters.size;
    }

    // Filter by availability
    if (filters.available !== undefined) {
      where.isAvailable = filters.available;
    }

    // Always include item information
    include.push({
      model: Item,
      as: 'item',
      attributes: ['id', 'name', 'categoryId']
    });

    const itemSizes = await ItemSize.findAll({
      where,
      include,
      order: [
        ['itemId', 'ASC'],
        [
          sequelize.literal(`
            CASE size
              WHEN 'small' THEN 1
              WHEN 'medium' THEN 2
              WHEN 'large' THEN 3
              ELSE 4
            END
          `),
          'ASC'
        ]
      ]
    });

    logger.info(`Retrieved ${itemSizes.length} item sizes`);
    return itemSizes;
  }

  /**
   * Get item size by ID
   * @param {number} id - Item size ID
   * @returns {Promise<Object|null>} Item size or null
   */
  async getItemSizeById(id) {
    const itemSize = await ItemSize.findByPk(id, {
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'name', 'categoryId']
        }
      ]
    });

    if (itemSize) {
      logger.info(`Retrieved item size: ${id}`);
    }

    return itemSize;
  }

  /**
   * Create a new item size
   * @param {Object} itemSizeData - Item size data
   * @returns {Promise<Object>} Created item size
   */
  async createItemSize(itemSizeData) {
    // Verify item exists
    const item = await Item.findByPk(itemSizeData.itemId);
    if (!item) {
      const error = new Error('Item not found');
      error.name = 'NotFoundError';
      throw error;
    }

    const itemSize = await ItemSize.create(itemSizeData);
    logger.success(`Item size created: ${itemSize.id} - ${itemSize.size} for item ${itemSize.itemId}`);

    return await this.getItemSizeById(itemSize.id);
  }

  /**
   * Update an item size
   * @param {number} id - Item size ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated item size or null
   */
  async updateItemSize(id, updateData) {
    const itemSize = await ItemSize.findByPk(id);

    if (!itemSize) {
      return null;
    }

    // If updating itemId, verify the new item exists
    if (updateData.itemId && updateData.itemId !== itemSize.itemId) {
      const item = await Item.findByPk(updateData.itemId);
      if (!item) {
        const error = new Error('Item not found');
        error.name = 'NotFoundError';
        throw error;
      }
    }

    await itemSize.update(updateData);
    logger.success(`Item size updated: ${id} - ${itemSize.size}`);

    return await this.getItemSizeById(id);
  }

  /**
   * Delete an item size
   * @param {number} id - Item size ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteItemSize(id) {
    const itemSize = await ItemSize.findByPk(id);

    if (!itemSize) {
      return false;
    }

    await itemSize.destroy();
    logger.success(`Item size deleted: ${id} - ${itemSize.size}`);

    return true;
  }
}

module.exports = new ItemSizeService();

