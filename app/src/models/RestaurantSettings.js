'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RestaurantSettings extends Model {
    static associate(models) {
      // Association with User for manually_closed_by
      RestaurantSettings.belongsTo(models.User, {
        foreignKey: 'manuallyClosedBy',
        as: 'closedByUser'
      });
    }
  }

  RestaurantSettings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Manual Override
      isManuallyClosed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_manually_closed'
      },
      manualClosureReason: {
        type: DataTypes.STRING(255),
        field: 'manual_closure_reason'
      },
      manuallyClosedAt: {
        type: DataTypes.DATE,
        field: 'manually_closed_at'
      },
      manuallyClosedBy: {
        type: DataTypes.INTEGER,
        field: 'manually_closed_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      // Business Settings
      minimumOrderValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'minimum_order_value'
      },
      taxPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        field: 'tax_percentage'
      },
      estimatedPrepTimeMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
        field: 'estimated_prep_time_minutes'
      },
      // Delivery Settings
      deliveryFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 40.00,
        field: 'delivery_fee',
        validate: {
          min: { args: [0], msg: 'Delivery fee must be non-negative' }
        }
      },
      estimatedDeliveryTimeMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        field: 'estimated_delivery_time_minutes',
        validate: {
          min: { args: [0], msg: 'Estimated delivery time must be non-negative' }
        }
      },
      // Contact Information
      restaurantName: {
        type: DataTypes.STRING(255),
        field: 'restaurant_name'
      },
      restaurantPhone: {
        type: DataTypes.STRING(20),
        field: 'restaurant_phone'
      },
      restaurantAddress: {
        type: DataTypes.TEXT,
        field: 'restaurant_address'
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
      }
    },
    {
      sequelize,
      modelName: 'RestaurantSettings',
      tableName: 'restaurant_settings',
      underscored: true,
      timestamps: true
    }
  );

  return RestaurantSettings;
};

