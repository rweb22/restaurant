const { CategoryAddOn, Category, AddOn } = require('../models');
const logger = require('../utils/logger');

class CategoryAddOnService {
  /**
   * Get all category add-on associations with optional filters
   */
  async getAllCategoryAddOns(filters = {}) {
    const where = {};

    // Filter by category ID
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Filter by add-on ID
    if (filters.addOnId) {
      where.addOnId = filters.addOnId;
    }

    const categoryAddOns = await CategoryAddOn.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: AddOn,
          as: 'addOn',
          attributes: ['id', 'name', 'price', 'isAvailable']
        }
      ],
      order: [['categoryId', 'ASC'], ['addOnId', 'ASC']]
    });

    logger.info(`Retrieved ${categoryAddOns.length} category add-on associations`);
    return categoryAddOns;
  }

  /**
   * Get category add-on by ID
   */
  async getCategoryAddOnById(id) {
    const categoryAddOn = await CategoryAddOn.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: AddOn,
          as: 'addOn',
          attributes: ['id', 'name', 'price', 'isAvailable']
        }
      ]
    });

    if (!categoryAddOn) {
      const error = new Error('Category add-on association not found');
      error.name = 'NotFoundError';
      throw error;
    }

    logger.info(`Retrieved category add-on: ${id}`);
    return categoryAddOn;
  }

  /**
   * Create a new category add-on association
   */
  async createCategoryAddOn(categoryAddOnData) {
    // Verify category exists
    const category = await Category.findByPk(categoryAddOnData.categoryId);
    if (!category) {
      const error = new Error('Category not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Verify add-on exists
    const addOn = await AddOn.findByPk(categoryAddOnData.addOnId);
    if (!addOn) {
      const error = new Error('Add-on not found');
      error.name = 'NotFoundError';
      throw error;
    }

    const categoryAddOn = await CategoryAddOn.create(categoryAddOnData);
    logger.success(
      `Category add-on created: ${categoryAddOn.id} - Category ${categoryAddOn.categoryId} + AddOn ${categoryAddOn.addOnId}`
    );

    return await this.getCategoryAddOnById(categoryAddOn.id);
  }

  /**
   * Delete a category add-on association
   */
  async deleteCategoryAddOn(id) {
    const categoryAddOn = await this.getCategoryAddOnById(id);

    await categoryAddOn.destroy();
    logger.success(
      `Category add-on deleted: ${id} - Category ${categoryAddOn.categoryId} + AddOn ${categoryAddOn.addOnId}`
    );
  }
}

module.exports = new CategoryAddOnService();

