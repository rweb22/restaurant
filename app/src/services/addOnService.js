const { AddOn } = require('../models');
const logger = require('../utils/logger');

class AddOnService {
  /**
   * Get all add-ons with optional filters
   */
  async getAllAddOns(filters = {}) {
    const where = {};

    // Filter by availability
    if (filters.available !== undefined) {
      where.isAvailable = filters.available;
    }

    const addOns = await AddOn.findAll({
      where,
      order: [['name', 'ASC']]
    });

    logger.info(`Retrieved ${addOns.length} add-ons`);
    return addOns;
  }

  /**
   * Get add-on by ID
   */
  async getAddOnById(id) {
    const addOn = await AddOn.findByPk(id);

    if (!addOn) {
      const error = new Error('Add-on not found');
      error.name = 'NotFoundError';
      throw error;
    }

    logger.info(`Retrieved add-on: ${id}`);
    return addOn;
  }

  /**
   * Create a new add-on
   */
  async createAddOn(addOnData) {
    const addOn = await AddOn.create(addOnData);
    logger.success(`Add-on created: ${addOn.id} - ${addOn.name}`);
    return addOn;
  }

  /**
   * Update an add-on
   */
  async updateAddOn(id, updateData) {
    const addOn = await this.getAddOnById(id);

    await addOn.update(updateData);
    logger.success(`Add-on updated: ${id} - ${addOn.name}`);
    return addOn;
  }

  /**
   * Delete an add-on
   */
  async deleteAddOn(id) {
    const addOn = await this.getAddOnById(id);

    await addOn.destroy();
    logger.success(`Add-on deleted: ${id} - ${addOn.name}`);
  }
}

module.exports = new AddOnService();

