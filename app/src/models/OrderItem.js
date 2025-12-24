'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // OrderItem belongs to Order
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order',
        onDelete: 'CASCADE'
      });

      // OrderItem belongs to Item (optional - for reference)
      OrderItem.belongsTo(models.Item, {
        foreignKey: 'item_id',
        as: 'item',
        onDelete: 'SET NULL'
      });

      // OrderItem belongs to ItemSize (optional - for reference)
      OrderItem.belongsTo(models.ItemSize, {
        foreignKey: 'item_size_id',
        as: 'itemSize',
        onDelete: 'SET NULL'
      });

      // OrderItem has many OrderItemAddOns
      OrderItem.hasMany(models.OrderItemAddOn, {
        foreignKey: 'order_item_id',
        as: 'addOns',
        onDelete: 'CASCADE'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        orderId: this.orderId,
        itemId: this.itemId,
        itemSizeId: this.itemSizeId,
        quantity: this.quantity,
        categoryName: this.categoryName,
        itemName: this.itemName,
        size: this.size,
        basePrice: parseFloat(this.basePrice),
        createdAt: this.createdAt
      };
    }
  }

  OrderItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_id',
        references: {
          model: 'orders',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'item_id',
        references: {
          model: 'items',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      itemSizeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'item_size_id',
        references: {
          model: 'item_sizes',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'quantity',
        validate: {
          min: {
            args: [1],
            msg: 'Quantity must be at least 1'
          }
        }
      },
      categoryName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'category_name'
      },
      itemName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'item_name'
      },
      size: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'size'
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'base_price',
        validate: {
          min: {
            args: [0],
            msg: 'Base price must be non-negative'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'OrderItem',
      tableName: 'order_items',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        { fields: ['order_id'] }
      ]
    }
  );

  return OrderItem;
};

