'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add delivery_fee column
    await queryInterface.addColumn('restaurant_settings', 'delivery_fee', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 40.00,
      comment: 'Standard delivery fee for all orders in rupees'
    });

    // Add estimated_delivery_time_minutes column
    await queryInterface.addColumn('restaurant_settings', 'estimated_delivery_time_minutes', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 30,
      comment: 'Estimated delivery time in minutes'
    });

    // Update existing row with default values
    await queryInterface.sequelize.query(`
      UPDATE restaurant_settings 
      SET delivery_fee = 40.00, 
          estimated_delivery_time_minutes = 30 
      WHERE id = 1
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('restaurant_settings', 'delivery_fee');
    await queryInterface.removeColumn('restaurant_settings', 'estimated_delivery_time_minutes');
  }
};

