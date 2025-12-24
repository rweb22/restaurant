'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static associate(models) {
      // Location has many addresses
      Location.hasMany(models.Address, {
        foreignKey: 'location_id',
        as: 'addresses',
        onDelete: 'SET NULL'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        name: this.name,
        area: this.area,
        city: this.city,
        pincode: this.pincode,
        deliveryCharge: this.deliveryCharge,
        estimatedDeliveryTime: this.estimatedDeliveryTime,
        isAvailable: this.isAvailable,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }
  }

  Location.init(
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
          notNull: { msg: 'Location name is required' },
          notEmpty: { msg: 'Location name cannot be empty' },
          len: { args: [1, 100], msg: 'Location name must be between 1 and 100 characters' }
        }
      },
      area: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: { args: [0, 100], msg: 'Area must not exceed 100 characters' }
        }
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Chandigarh',
        validate: {
          notNull: { msg: 'City is required' },
          notEmpty: { msg: 'City cannot be empty' },
          len: { args: [1, 100], msg: 'City must be between 1 and 100 characters' }
        }
      },
      pincode: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
          len: { args: [0, 10], msg: 'Pincode must not exceed 10 characters' }
        }
      },
      deliveryCharge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'delivery_charge',
        validate: {
          notNull: { msg: 'Delivery charge is required' },
          isDecimal: { msg: 'Delivery charge must be a valid decimal number' },
          min: { args: [0], msg: 'Delivery charge must be non-negative' }
        }
      },
      estimatedDeliveryTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'estimated_delivery_time',
        validate: {
          isInt: { msg: 'Estimated delivery time must be an integer' },
          min: { args: [0], msg: 'Estimated delivery time must be non-negative' }
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
      modelName: 'Location',
      tableName: 'locations',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['city'] },
        { fields: ['pincode'] },
        { fields: ['is_available'] }
      ]
    }
  );

  return Location;
};

