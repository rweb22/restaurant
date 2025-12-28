'use strict';

const { Model } = require('sequelize');
const { serializeDate } = require('../utils/dateSerializer');

module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    static associate(models) {
      // Item belongs to one category
      Item.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
        onDelete: 'CASCADE'
      });

      // Item has many sizes
      Item.hasMany(models.ItemSize, {
        foreignKey: 'item_id',
        as: 'sizes',
        onDelete: 'CASCADE'
      });

      // Item has many add-ons through item_add_ons
      Item.belongsToMany(models.AddOn, {
        through: models.ItemAddOn,
        foreignKey: 'item_id',
        otherKey: 'add_on_id',
        as: 'addOns',
        onDelete: 'CASCADE'
      });

      // Item has many offers
      Item.hasMany(models.Offer, {
        foreignKey: 'applicable_item_id',
        as: 'offers',
        onDelete: 'SET NULL'
      });

      // Item has many pictures (polymorphic)
      Item.hasMany(models.Picture, {
        foreignKey: 'entity_id',
        constraints: false,
        scope: { entity_type: 'item' },
        as: 'pictures'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        categoryId: this.categoryId,
        name: this.name,
        description: this.description,
        isAvailable: this.isAvailable,
        dietaryTags: this.dietaryTags,
        displayOrder: this.displayOrder,
        createdAt: serializeDate(this.createdAt),
        updatedAt: serializeDate(this.updatedAt)
      };
    }

    /**
     * Get primary picture URL
     * @returns {string|null} Primary picture URL or null
     */
    getPrimaryPictureUrl() {
      if (!this.pictures || this.pictures.length === 0) {
        return null;
      }

      // Find primary picture
      const primaryPicture = this.pictures.find(p => p.isPrimary);
      if (primaryPicture) {
        return primaryPicture.url;
      }

      // Fallback to first picture
      return this.pictures[0].url;
    }
  }

  Item.init(
    {
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'category_id',
        references: {
          model: 'categories',
          key: 'id'
        },
        onDelete: 'CASCADE',
        validate: {
          notNull: { msg: 'Category ID is required' },
          isInt: { msg: 'Category ID must be an integer' }
        }
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Item name cannot be empty' },
          len: { args: [1, 255], msg: 'Item name must be between 1 and 255 characters' }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_available'
      },
      dietaryTags: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        field: 'dietary_tags',
        validate: {
          isArray(value) {
            if (!Array.isArray(value)) {
              throw new Error('Dietary tags must be an array');
            }
          }
        }
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'display_order',
        validate: {
          isInt: { msg: 'Display order must be an integer' },
          min: { args: [0], msg: 'Display order must be non-negative' }
        }
      }
    },
    {
      sequelize,
      modelName: 'Item',
      tableName: 'items',
      timestamps: true,
      underscored: true
    }
  );

  return Item;
};

