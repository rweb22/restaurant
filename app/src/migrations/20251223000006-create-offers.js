'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create offers table
    await queryInterface.createTable('offers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      discount_type: {
        type: Sequelize.ENUM('percentage', 'flat', 'free_delivery'),
        allowNull: false
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      max_discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      min_order_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      applicable_category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      applicable_item_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'items',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      first_order_only: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      max_uses_per_user: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      valid_from: {
        type: Sequelize.DATE,
        allowNull: true
      },
      valid_to: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
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

    // Add check constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE offers ADD CONSTRAINT offers_discount_value_check CHECK (discount_value >= 0);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE offers ADD CONSTRAINT offers_max_discount_check CHECK (max_discount_amount >= 0);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE offers ADD CONSTRAINT offers_min_order_check CHECK (min_order_value >= 0);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE offers ADD CONSTRAINT offers_max_uses_check CHECK (max_uses_per_user > 0);
    `);

    // Create indexes
    await queryInterface.addIndex('offers', ['code']);
    await queryInterface.addIndex('offers', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('offers');
  }
};

