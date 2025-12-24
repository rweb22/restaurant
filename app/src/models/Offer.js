'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Offer extends Model {
    static associate(models) {
      // Offer belongs to Category (optional)
      Offer.belongsTo(models.Category, {
        foreignKey: 'applicable_category_id',
        as: 'applicableCategory',
        onDelete: 'SET NULL'
      });

      // Offer belongs to Item (optional)
      Offer.belongsTo(models.Item, {
        foreignKey: 'applicable_item_id',
        as: 'applicableItem',
        onDelete: 'SET NULL'
      });

      // Offer has many Orders
      Offer.hasMany(models.Order, {
        foreignKey: 'offer_id',
        as: 'orders',
        onDelete: 'SET NULL'
      });

      // Offer has many pictures (polymorphic)
      Offer.hasMany(models.Picture, {
        foreignKey: 'entity_id',
        constraints: false,
        scope: { entity_type: 'offer' },
        as: 'pictures'
      });
    }
  }

  Offer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'code',
        validate: {
          notNull: { msg: 'Offer code is required' },
          notEmpty: { msg: 'Offer code cannot be empty' },
          len: {
            args: [3, 50],
            msg: 'Offer code must be between 3 and 50 characters'
          }
        }
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'title',
        validate: {
          notNull: { msg: 'Offer title is required' },
          notEmpty: { msg: 'Offer title cannot be empty' }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'description'
      },
      discountType: {
        type: DataTypes.ENUM('percentage', 'flat', 'free_delivery'),
        allowNull: false,
        field: 'discount_type',
        validate: {
          notNull: { msg: 'Discount type is required' },
          isIn: {
            args: [['percentage', 'flat', 'free_delivery']],
            msg: 'Discount type must be percentage, flat, or free_delivery'
          }
        }
      },
      discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'discount_value',
        validate: {
          min: {
            args: [0],
            msg: 'Discount value must be non-negative'
          }
        }
      },
      maxDiscountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'max_discount_amount',
        validate: {
          min: {
            args: [0],
            msg: 'Max discount amount must be non-negative'
          }
        }
      },
      minOrderValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'min_order_value',
        validate: {
          min: {
            args: [0],
            msg: 'Minimum order value must be non-negative'
          }
        }
      },
      applicableCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'applicable_category_id',
        references: {
          model: 'categories',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      applicableItemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'applicable_item_id',
        references: {
          model: 'items',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      firstOrderOnly: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'first_order_only'
      },
      maxUsesPerUser: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'max_uses_per_user',
        validate: {
          min: {
            args: [1],
            msg: 'Max uses per user must be at least 1'
          }
        }
      },
      validFrom: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'valid_from'
      },
      validTo: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'valid_to'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      }
    },
    {
      sequelize,
      modelName: 'Offer',
      tableName: 'offers',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['code'], unique: true },
        { fields: ['is_active'] }
      ]
    }
  );

  return Offer;
};

