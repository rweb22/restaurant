'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Alter the size column to allow custom size names (up to 50 characters)
    await queryInterface.changeColumn('item_sizes', 'size', {
      type: Sequelize.STRING(50),
      allowNull: false
    });
    
    // Also update the order_items size column for consistency
    await queryInterface.changeColumn('order_items', 'size', {
      type: Sequelize.STRING(50),
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to VARCHAR(20)
    await queryInterface.changeColumn('item_sizes', 'size', {
      type: Sequelize.STRING(20),
      allowNull: false
    });
    
    await queryInterface.changeColumn('order_items', 'size', {
      type: Sequelize.STRING(20),
      allowNull: false
    });
  }
};

