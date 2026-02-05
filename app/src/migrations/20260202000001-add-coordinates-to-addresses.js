'use strict';

/**
 * Migration: Add latitude and longitude to addresses table
 * 
 * This migration adds optional coordinate fields to support map-based address selection.
 * Addresses can now have either:
 * 1. Traditional text-based address (addressLine1, city, etc.)
 * 2. Coordinates (latitude, longitude) from map picker
 * 3. Both (recommended for best accuracy)
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('addresses', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
      comment: 'Latitude coordinate from map picker (range: -90 to 90)'
    });

    await queryInterface.addColumn('addresses', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
      comment: 'Longitude coordinate from map picker (range: -180 to 180)'
    });

    // Add index for potential geospatial queries
    await queryInterface.addIndex('addresses', ['latitude', 'longitude'], {
      name: 'addresses_coordinates_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('addresses', 'addresses_coordinates_idx');
    await queryInterface.removeColumn('addresses', 'longitude');
    await queryInterface.removeColumn('addresses', 'latitude');
  }
};

