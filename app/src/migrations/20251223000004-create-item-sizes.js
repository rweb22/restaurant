'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('item_sizes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'items',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      size: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Add unique constraint
    await queryInterface.addConstraint('item_sizes', {
      fields: ['item_id', 'size'],
      type: 'unique',
      name: 'item_sizes_item_id_size_unique'
    });

    // Add check constraint for positive price
    await queryInterface.sequelize.query(`
      ALTER TABLE item_sizes ADD CONSTRAINT item_sizes_price_check CHECK (price >= 0);
    `);

    // Create index
    await queryInterface.addIndex('item_sizes', ['item_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('item_sizes');
  }
};

