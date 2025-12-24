'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Category has many items
      Category.hasMany(models.Item, {
        foreignKey: 'category_id',
        as: 'items',
        onDelete: 'CASCADE'
      });

      // Category has many add-ons through category_add_ons
      Category.belongsToMany(models.AddOn, {
        through: models.CategoryAddOn,
        foreignKey: 'category_id',
        otherKey: 'add_on_id',
        as: 'addOns',
        onDelete: 'CASCADE'
      });

      // Category has many offers
      Category.hasMany(models.Offer, {
        foreignKey: 'applicable_category_id',
        as: 'offers',
        onDelete: 'SET NULL'
      });

      // Category has many pictures (polymorphic)
      Category.hasMany(models.Picture, {
        foreignKey: 'entity_id',
        constraints: false,
        scope: { entity_type: 'category' },
        as: 'pictures'
      });
    }

    /**
     * Convert category to safe object for API response
     * @returns {Object}
     */
    toSafeObject() {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        isAvailable: this.isAvailable,
        displayOrder: this.displayOrder,
        gstRate: this.gstRate,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
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

  Category.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Category name cannot be empty'
          },
          len: {
            args: [1, 100],
            msg: 'Category name must be between 1 and 100 characters'
          }
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
      displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'display_order',
        validate: {
          isInt: {
            msg: 'Display order must be an integer'
          },
          min: {
            args: [0],
            msg: 'Display order must be non-negative'
          }
        }
      },
      gstRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 5.00,
        field: 'gst_rate',
        validate: {
          isDecimal: {
            msg: 'GST rate must be a valid decimal number'
          },
          min: {
            args: [0],
            msg: 'GST rate must be non-negative'
          },
          max: {
            args: [100],
            msg: 'GST rate cannot exceed 100%'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'categories',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['is_available']
        },
        {
          fields: ['display_order']
        }
      ]
    }
  );

  return Category;
};

