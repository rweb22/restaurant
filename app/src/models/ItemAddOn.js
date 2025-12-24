'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ItemAddOn extends Model {
    static associate(models) {
      // ItemAddOn belongs to Item
      ItemAddOn.belongsTo(models.Item, {
        foreignKey: 'item_id',
        as: 'item',
        onDelete: 'CASCADE'
      });

      // ItemAddOn belongs to AddOn
      ItemAddOn.belongsTo(models.AddOn, {
        foreignKey: 'add_on_id',
        as: 'addOn',
        onDelete: 'CASCADE'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        itemId: this.itemId,
        addOnId: this.addOnId,
        createdAt: this.createdAt
      };
    }
  }

  ItemAddOn.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
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
      modelName: 'ItemAddOn',
      tableName: 'item_add_ons',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['item_id', 'add_on_id'],
          name: 'item_add_ons_item_id_add_on_id_unique'
        },
        { fields: ['item_id'] },
        { fields: ['add_on_id'] }
      ]
    }
  );

  return ItemAddOn;
};

