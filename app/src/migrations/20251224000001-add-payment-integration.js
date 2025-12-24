'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Create payment_status and transaction_status enums
    await queryInterface.sequelize.query(`
      CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE transaction_status AS ENUM ('created', 'authorized', 'captured', 'failed', 'refunded');
    `);

    // Step 2: Update enum_orders_status enum to include 'pending_payment'
    // First, add the new value to the existing enum (Sequelize uses enum_orders_status, not order_status)
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_orders_status ADD VALUE IF NOT EXISTS 'pending_payment' BEFORE 'pending';
    `);

    // Step 3: Add payment fields to orders table
    await queryInterface.sequelize.query(`
      ALTER TABLE orders ADD COLUMN payment_status payment_status NOT NULL DEFAULT 'pending';
    `);

    await queryInterface.addColumn('orders', 'payment_method', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('orders', 'payment_gateway_order_id', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('orders', 'payment_gateway_payment_id', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    // Step 4: Update default status for orders to 'pending_payment'
    await queryInterface.sequelize.query(`
      ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending_payment';
    `);

    // Step 5: Create transactions table
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      payment_gateway: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'razorpay'
      },
      gateway_order_id: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      gateway_payment_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      gateway_signature: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'INR'
      },
      status: {
        type: 'transaction_status',
        allowNull: false,
        defaultValue: 'created'
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      upi_vpa: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      card_network: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      card_last4: {
        type: Sequelize.STRING(4),
        allowNull: true
      },
      bank_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      wallet_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      error_code: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      error_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
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

    // Step 6: Add check constraint for positive amount
    await queryInterface.sequelize.query(`
      ALTER TABLE transactions ADD CONSTRAINT transactions_amount_check CHECK (amount >= 0);
    `);

    // Step 7: Create indexes for orders payment fields
    await queryInterface.addIndex('orders', ['payment_status']);

    // Step 8: Create indexes for transactions table
    await queryInterface.addIndex('transactions', ['order_id']);
    await queryInterface.addIndex('transactions', ['gateway_order_id']);
    await queryInterface.addIndex('transactions', ['gateway_payment_id']);
    await queryInterface.addIndex('transactions', ['status']);
    await queryInterface.addIndex('transactions', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop transactions table
    await queryInterface.dropTable('transactions');

    // Remove payment fields from orders table
    await queryInterface.removeColumn('orders', 'payment_gateway_payment_id');
    await queryInterface.removeColumn('orders', 'payment_gateway_order_id');
    await queryInterface.removeColumn('orders', 'payment_method');
    await queryInterface.removeColumn('orders', 'payment_status');

    // Revert order status default to 'pending'
    await queryInterface.sequelize.query(`
      ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';
    `);

    // Note: Cannot remove enum value 'pending_payment' from order_status enum
    // PostgreSQL doesn't support removing enum values
    // This would require recreating the enum and all dependent columns

    // Drop enums
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS transaction_status;`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS payment_status;`);
  }
};
