'use strict';

const { Model } = require('sequelize');
const { serializeDate } = require('../utils/dateSerializer');

module.exports = (sequelize, DataTypes) => {
  class AddOn extends Model {
    static associate(models) {
      // AddOn belongs to many categories through category_add_ons
      AddOn.belongsToMany(models.Category, {
        through: models.CategoryAddOn,
        foreignKey: 'add_on_id',
        otherKey: 'category_id',
        as: 'categories',
        onDelete: 'CASCADE'
      });

      // AddOn belongs to many items through item_add_ons
      AddOn.belongsToMany(models.Item, {
        through: models.ItemAddOn,
        foreignKey: 'add_on_id',
        otherKey: 'item_id',
        as: 'items',
        onDelete: 'CASCADE'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        price: parseFloat(this.price),
        isAvailable: this.isAvailable,
        createdAt: serializeDate(this.createdAt),
        updatedAt: serializeDate(this.updatedAt)
      };
    }
  }

  AddOn.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name cannot be empty' },
          len: { args: [1, 100], msg: 'Name must be between 1 and 100 characters' }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
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
      modelName: 'AddOn',
      tableName: 'add_ons',
      timestamps: true,
      underscored: true
    }
  );

  return AddOn;
};

