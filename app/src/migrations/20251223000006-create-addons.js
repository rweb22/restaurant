'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create add_ons master catalog table
    await queryInterface.createTable('add_ons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add check constraint for positive price
    await queryInterface.sequelize.query(`
      ALTER TABLE add_ons ADD CONSTRAINT add_ons_price_check CHECK (price >= 0);
    `);

    // Create category_add_ons junction table
    await queryInterface.createTable('category_add_ons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      add_on_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'add_ons',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint
    await queryInterface.addConstraint('category_add_ons', {
      fields: ['category_id', 'add_on_id'],
      type: 'unique',
      name: 'category_add_ons_category_id_add_on_id_unique'
    });

    // Create item_add_ons junction table
    await queryInterface.createTable('item_add_ons', {
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
      add_on_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'add_ons',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint
    await queryInterface.addConstraint('item_add_ons', {
      fields: ['item_id', 'add_on_id'],
      type: 'unique',
      name: 'item_add_ons_item_id_add_on_id_unique'
    });

    // Create indexes
    await queryInterface.addIndex('category_add_ons', ['category_id']);
    await queryInterface.addIndex('category_add_ons', ['add_on_id']);
    await queryInterface.addIndex('item_add_ons', ['item_id']);
    await queryInterface.addIndex('item_add_ons', ['add_on_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('item_add_ons');
    await queryInterface.dropTable('category_add_ons');
    await queryInterface.dropTable('add_ons');
  }
};

