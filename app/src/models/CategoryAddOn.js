'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CategoryAddOn extends Model {
    static associate(models) {
      // CategoryAddOn belongs to Category
      CategoryAddOn.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
        onDelete: 'CASCADE'
      });

      // CategoryAddOn belongs to AddOn
      CategoryAddOn.belongsTo(models.AddOn, {
        foreignKey: 'add_on_id',
        as: 'addOn',
        onDelete: 'CASCADE'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        categoryId: this.categoryId,
        addOnId: this.addOnId,
        createdAt: this.createdAt
      };
    }
  }

  CategoryAddOn.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
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
      addOnId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'add_on_id',
        references: {
          model: 'add_ons',
          key: 'id'
        },
        onDelete: 'CASCADE',
        validate: {
          notNull: { msg: 'Add-on ID is required' },
          isInt: { msg: 'Add-on ID must be an integer' }
        }
      }
    },
    {
      sequelize,
      modelName: 'CategoryAddOn',
      tableName: 'category_add_ons',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['category_id', 'add_on_id'],
          name: 'category_add_ons_category_id_add_on_id_unique'
        },
        { fields: ['category_id'] },
        { fields: ['add_on_id'] }
      ]
    }
  );

  return CategoryAddOn;
};

