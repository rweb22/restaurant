'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItemAddOn extends Model {
    static associate(models) {
      // OrderItemAddOn belongs to OrderItem
      OrderItemAddOn.belongsTo(models.OrderItem, {
        foreignKey: 'order_item_id',
        as: 'orderItem',
        onDelete: 'CASCADE'
      });

      // OrderItemAddOn belongs to AddOn (optional - for reference)
      OrderItemAddOn.belongsTo(models.AddOn, {
        foreignKey: 'add_on_id',
        as: 'addOn',
        onDelete: 'SET NULL'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        orderItemId: this.orderItemId,
        addOnId: this.addOnId,
        quantity: this.quantity,
        addOnName: this.addOnName,
        addOnPrice: parseFloat(this.addOnPrice),
        createdAt: this.createdAt
      };
    }
  }

  OrderItemAddOn.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      orderItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_item_id',
        references: {
          model: 'order_items',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      addOnId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'add_on_id',
        references: {
          model: 'add_ons',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'quantity',
        validate: {
          min: {
            args: [1],
            msg: 'Quantity must be at least 1'
          }
        }
      },
      addOnName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'add_on_name'
      },
      addOnPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'add_on_price',
        validate: {
          min: {
            args: [0],
            msg: 'Add-on price must be non-negative'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'OrderItemAddOn',
      tableName: 'order_item_add_ons',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        { fields: ['order_item_id'] }
      ]
    }
  );

  return OrderItemAddOn;
};

