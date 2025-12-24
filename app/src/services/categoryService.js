'use strict';

const { Category, Item, AddOn, Picture } = require('../models');
const logger = require('../utils/logger');

/**
 * Category Service
 * Business logic for category operations
 */
class CategoryService {
  /**
   * Get all categories
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getAllCategories(filters = {}) {
    try {
      const where = {};
      const include = [];

      // Filter by availability
      if (filters.available !== undefined) {
        where.isAvailable = filters.available;
      }

      // Include items if requested
      if (filters.includeItems) {
        include.push({
          model: Item,
          as: 'items',
          attributes: ['id', 'name', 'description', 'imageUrl', 'isAvailable', 'displayOrder'],
          required: false
        });
      }

      // Include add-ons if requested
      if (filters.includeAddOns) {
        include.push({
          model: AddOn,
          as: 'addOns',
          attributes: ['id', 'name', 'price', 'isAvailable'],
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

      const categories = await Category.findAll({
        where,
        include: include.length > 0 ? include : undefined,
        order: [
          ['displayOrder', 'ASC'],
          ['name', 'ASC'],
          [{ model: Picture, as: 'pictures' }, 'displayOrder', 'ASC'],
          [{ model: Picture, as: 'pictures' }, 'createdAt', 'ASC']
        ]
      });

      logger.info(`Retrieved ${categories.length} categories`);
      return categories;
    } catch (error) {
      logger.error('Error getting all categories', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>}
   */
  async getCategoryById(id, options = {}) {
    try {
      const include = [];

      // Include items if requested
      if (options.includeItems) {
        include.push({
          model: Item,
          as: 'items',
          attributes: ['id', 'name', 'description', 'imageUrl', 'isAvailable', 'displayOrder'],
          required: false,
          order: [['displayOrder', 'ASC'], ['name', 'ASC']]
        });
      }

      // Include add-ons if requested
      if (options.includeAddOns) {
        include.push({
          model: AddOn,
          as: 'addOns',
          attributes: ['id', 'name', 'price', 'isAvailable'],
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

      const category = await Category.findByPk(id, {
        include: include.length > 0 ? include : undefined,
        order: [
          [{ model: Picture, as: 'pictures' }, 'displayOrder', 'ASC'],
          [{ model: Picture, as: 'pictures' }, 'createdAt', 'ASC']
        ]
      });

      if (!category) {
        logger.warn(`Category not found: ${id}`);
        return null;
      }

      logger.info(`Retrieved category: ${id}`);
      return category;
    } catch (error) {
      logger.error(`Error getting category ${id}`, error);
      throw error;
    }
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>}
   */
  async createCategory(categoryData) {
    try {
      const category = await Category.create(categoryData);
      logger.success(`Category created: ${category.id} - ${category.name}`);
      return category;
    } catch (error) {
      logger.error('Error creating category', error);
      throw error;
    }
  }

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>}
   */
  async updateCategory(id, updateData) {
    try {
      const category = await Category.findByPk(id);

      if (!category) {
        logger.warn(`Category not found for update: ${id}`);
        return null;
      }

      await category.update(updateData);
      logger.success(`Category updated: ${id} - ${category.name}`);
      return category;
    } catch (error) {
      logger.error(`Error updating category ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete category
   * @param {number} id - Category ID
   * @returns {Promise<boolean>}
   */
  async deleteCategory(id) {
    try {
      const category = await Category.findByPk(id);

      if (!category) {
        logger.warn(`Category not found for deletion: ${id}`);
        return false;
      }

      await category.destroy();
      logger.success(`Category deleted: ${id} - ${category.name}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting category ${id}`, error);
      throw error;
    }
  }

  /**
   * Check if category exists
   * @param {number} id - Category ID
   * @returns {Promise<boolean>}
   */
  async categoryExists(id) {
    try {
      const count = await Category.count({ where: { id } });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking category existence ${id}`, error);
      throw error;
    }
  }
}

module.exports = new CategoryService();

