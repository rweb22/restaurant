'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('locations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Location name (e.g., Sector 15, Chandigarh)'
      },
      area: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Area or sector name'
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Chandigarh'
      },
      pincode: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      delivery_charge: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Delivery charge for this location in rupees'
      },
      estimated_delivery_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Estimated delivery time in minutes'
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether delivery is available to this location'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('locations', ['city']);
    await queryInterface.addIndex('locations', ['pincode']);
    await queryInterface.addIndex('locations', ['is_available']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('locations');
  }
};

