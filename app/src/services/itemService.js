const { Item, Category, ItemSize, AddOn, Picture } = require('../models');
const logger = require('../utils/logger');

class ItemService {
  /**
   * Get all items with optional filters
   */
  async getAllItems(filters = {}) {
    try {
      const where = {};
      const include = [];

      // Filter by category
      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      // Filter by availability
      if (filters.available !== undefined) {
        where.isAvailable = filters.available;
      }

      // Always include category
      include.push({
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'gstRate']
      });

      // Include sizes if requested
      if (filters.includeSizes) {
        include.push({
          model: ItemSize,
          as: 'sizes',
          attributes: ['id', 'size', 'price', 'isAvailable'],
          required: false
        });
      }

      // Include add-ons if requested
      if (filters.includeAddOns) {
        include.push({
          model: AddOn,
          as: 'addOns',
          attributes: ['id', 'name', 'description', 'price', 'isAvailable'],
          required: false
        });
      }

      // Always include pictures
      include.push({
        model: Picture,
        as: 'pictures',
        attributes: ['id', 'url', 'altText', 'displayOrder', 'isPrimary', 'width', 'height', 'fileSize', 'mimeType'],
        required: false
      });

      const items = await Item.findAll({
        where,
        include,
        order: [
          ['categoryId', 'ASC'],
          ['displayOrder', 'ASC'],
          ['name', 'ASC'],
          [{ model: Picture, as: 'pictures' }, 'displayOrder', 'ASC'],
          [{ model: Picture, as: 'pictures' }, 'createdAt', 'ASC']
        ]
      });

      logger.info(`Retrieved ${items.length} items`);
      return items;
    } catch (error) {
      logger.error('Error getting all items', error);
      throw error;
    }
  }

  /**
   * Get item by ID
   */
  async getItemById(id, options = {}) {
    try {
      const include = [];

      // Always include category
      include.push({
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'gstRate']
      });

      // Include sizes if requested
      if (options.includeSizes) {
        include.push({
          model: ItemSize,
          as: 'sizes',
          attributes: ['id', 'size', 'price', 'isAvailable'],
          required: false,
          order: [['size', 'ASC']]
        });
      }

      // Include add-ons if requested
      if (options.includeAddOns) {
        include.push({
          model: AddOn,
          as: 'addOns',
          attributes: ['id', 'name', 'description', 'price', 'isAvailable'],
          required: false
        });
      }

      // Always include pictures
      include.push({
        model: Picture,
        as: 'pictures',
        attributes: ['id', 'url', 'altText', 'displayOrder', 'isPrimary', 'width', 'height', 'fileSize', 'mimeType'],
        required: false
      });

      const item = await Item.findByPk(id, {
        include,
        order: [
          [{ model: Picture, as: 'pictures' }, 'displayOrder', 'ASC'],
          [{ model: Picture, as: 'pictures' }, 'createdAt', 'ASC']
        ]
      });

      if (!item) {
        logger.warn(`Item not found: ${id}`);
        return null;
      }

      logger.info(`Retrieved item: ${id}`);
      return item;
    } catch (error) {
      logger.error(`Error getting item ${id}`, error);
      throw error;
    }
  }

  /**
   * Create a new item
   */
  async createItem(itemData) {
    try {
      // Verify category exists
      const category = await Category.findByPk(itemData.categoryId);
      if (!category) {
        const error = new Error('Category not found');
        error.name = 'NotFoundError';
        throw error;
      }

      const item = await Item.create(itemData);
      logger.success(`Item created: ${item.id} - ${item.name}`);
      
      // Fetch with category for response
      return await this.getItemById(item.id);
    } catch (error) {
      logger.error('Error creating item', error);
      throw error;
    }
  }

  /**
   * Update an item
   */
  async updateItem(id, updateData) {
    try {
      const item = await Item.findByPk(id);

      if (!item) {
        logger.warn(`Item not found for update: ${id}`);
        return null;
      }

      // If updating category, verify it exists
      if (updateData.categoryId) {
        const category = await Category.findByPk(updateData.categoryId);
        if (!category) {
          const error = new Error('Category not found');
          error.name = 'NotFoundError';
          throw error;
        }
      }

      await item.update(updateData);
      logger.success(`Item updated: ${id} - ${item.name}`);
      
      // Fetch with category for response
      return await this.getItemById(id);
    } catch (error) {
      logger.error(`Error updating item ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete an item
   */
  async deleteItem(id) {
    try {
      const item = await Item.findByPk(id);

      if (!item) {
        logger.warn(`Item not found for deletion: ${id}`);
        return false;
      }

      await item.destroy();
      logger.success(`Item deleted: ${id} - ${item.name}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting item ${id}`, error);
      throw error;
    }
  }
}

module.exports = new ItemService();

