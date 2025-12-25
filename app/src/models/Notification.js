'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Notification belongs to User
      Notification.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE'
      });

      // Notification belongs to Order (optional)
      Notification.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order',
        onDelete: 'SET NULL'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        userId: this.userId,
        template: this.template,
        title: this.title,
        message: this.message,
        data: this.data,
        orderId: this.orderId,
        isRead: this.isRead,
        readAt: this.readAt,
        createdAt: this.createdAt
      };
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      template: {
        type: DataTypes.ENUM(
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
        ),
        allowNull: false,
        field: 'template',
        validate: {
          isIn: {
            args: [[
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
            ]],
            msg: 'Invalid notification template'
          }
        }
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'title'
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'message'
      },
      data: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'data'
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'order_id',
        references: {
          model: 'orders',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_read'
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'read_at'
      }
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['user_id', 'is_read'] },
        { fields: ['order_id'] },
        { fields: ['created_at'] }
      ]
    }
  );

  // Define associations
  Notification.associate = function(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE'
    });

    Notification.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order',
      onDelete: 'SET NULL'
    });
  };

  return Notification;
};

