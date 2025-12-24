'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create notification_template enum
    await queryInterface.sequelize.query(`
      CREATE TYPE notification_template AS ENUM (
        'ORDER_CREATED',
        'PAYMENT_COMPLETED',
        'PAYMENT_FAILED',
        'ORDER_CONFIRMED',
        'ORDER_PREPARING',
        'ORDER_READY',
        'ORDER_COMPLETED',
        'ORDER_CANCELLED',
        'REFUND_PROCESSED',
        'NEW_ORDER',
        'PAYMENT_RECEIVED',
        'ORDER_CANCELLED_BY_CLIENT',
        'REFUND_REQUESTED'
      );
    `);

    // Create notifications table
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      template: {
        type: 'notification_template',
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for performance
    await queryInterface.addIndex('notifications', ['user_id'], {
      name: 'idx_notifications_user'
    });

    await queryInterface.addIndex('notifications', ['user_id', 'is_read'], {
      name: 'idx_notifications_user_read'
    });

    await queryInterface.addIndex('notifications', ['order_id'], {
      name: 'idx_notifications_order'
    });

    await queryInterface.addIndex('notifications', ['created_at'], {
      name: 'idx_notifications_created'
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes
    await queryInterface.removeIndex('notifications', 'idx_notifications_user');
    await queryInterface.removeIndex('notifications', 'idx_notifications_user_read');
    await queryInterface.removeIndex('notifications', 'idx_notifications_order');
    await queryInterface.removeIndex('notifications', 'idx_notifications_created');

    // Drop table
    await queryInterface.dropTable('notifications');

    // Drop enum
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS notification_template;');
  }
};

