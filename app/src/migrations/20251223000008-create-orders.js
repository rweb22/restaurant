'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create orders table
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      address_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'addresses',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      offer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'offers',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      delivery_charge: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      special_instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      delivery_address: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add check constraint for positive total_price
    await queryInterface.sequelize.query(`
      ALTER TABLE orders ADD CONSTRAINT orders_total_price_check CHECK (total_price >= 0);
    `);

    // Create order_items table
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'items',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      item_size_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'item_sizes',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      category_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      item_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      size: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add check constraint for positive quantity
    await queryInterface.sequelize.query(`
      ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_check CHECK (quantity > 0);
    `);

    // Create order_item_add_ons table
    await queryInterface.createTable('order_item_add_ons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'order_items',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      add_on_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'add_ons',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      add_on_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      add_on_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add check constraint for positive quantity
    await queryInterface.sequelize.query(`
      ALTER TABLE order_item_add_ons ADD CONSTRAINT order_item_add_ons_quantity_check CHECK (quantity > 0);
    `);

    // Create indexes
    await queryInterface.addIndex('orders', ['user_id']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('order_items', ['order_id']);
    await queryInterface.addIndex('order_item_add_ons', ['order_item_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('order_item_add_ons');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
  }
};

