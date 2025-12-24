'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ItemSize extends Model {
    static associate(models) {
      // ItemSize belongs to one item
      ItemSize.belongsTo(models.Item, {
        foreignKey: 'item_id',
        as: 'item',
        onDelete: 'CASCADE'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        itemId: this.itemId,
        size: this.size,
        price: parseFloat(this.price),
        isAvailable: this.isAvailable,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }
  }

  ItemSize.init(
    {
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'item_id',
        references: {
          model: 'items',
          key: 'id'
        },
        onDelete: 'CASCADE',
        validate: {
          notNull: { msg: 'Item ID is required' },
          isInt: { msg: 'Item ID must be an integer' }
        }
      },
      size: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Size cannot be empty' },
          len: { args: [1, 50], msg: 'Size must be between 1 and 50 characters' }
        }
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: 'Price is required' },
          isDecimal: { msg: 'Price must be a valid decimal number' },
          min: {
            args: [0],
            msg: 'Price must be non-negative'
          }
        }
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_available'
      }
    },
    {
      sequelize,
      modelName: 'ItemSize',
      tableName: 'item_sizes',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['item_id', 'size'],
          name: 'item_sizes_item_id_size_unique'
        },
        {
          fields: ['item_id']
        }
      ]
    }
  );

  return ItemSize;
};

