const { Location } = require('../models');
const logger = require('../utils/logger');

class LocationService {
  /**
   * Get all locations with optional filters
   */
  async getAllLocations(filters = {}) {
    const where = {};

    // Filter by availability
    if (filters.available !== undefined) {
      where.isAvailable = filters.available;
    }

    // Filter by city
    if (filters.city) {
      where.city = filters.city;
    }

    const locations = await Location.findAll({
      where,
      order: [['deliveryCharge', 'ASC'], ['name', 'ASC']]
    });

    logger.info(`Retrieved ${locations.length} locations`);
    return locations;
  }

  /**
   * Get location by ID
   */
  async getLocationById(id) {
    const location = await Location.findByPk(id);

    if (!location) {
      const error = new Error('Location not found');
      error.name = 'NotFoundError';
      throw error;
    }

    logger.info(`Retrieved location: ${id}`);
    return location;
  }

  /**
   * Create new location (admin only)
   */
  async createLocation(locationData) {
    const location = await Location.create(locationData);
    logger.info(`Location created: ${location.id}`);
    return location;
  }

  /**
   * Update location (admin only)
   */
  async updateLocation(id, locationData) {
    const location = await Location.findByPk(id);

    if (!location) {
      const error = new Error('Location not found');
      error.name = 'NotFoundError';
      throw error;
    }

    await location.update(locationData);
    logger.info(`Location updated: ${id}`);
    return location;
  }

  /**
   * Delete location (admin only)
   */
  async deleteLocation(id) {
    const location = await Location.findByPk(id);

    if (!location) {
      return false;
    }

    await location.destroy();
    logger.info(`Location deleted: ${id}`);
    return true;
  }
}

module.exports = new LocationService();

