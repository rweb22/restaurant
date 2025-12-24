'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      // Address belongs to one user
      Address.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE'
      });

      // Address belongs to one location
      Address.belongsTo(models.Location, {
        foreignKey: 'location_id',
        as: 'location',
        onDelete: 'SET NULL'
      });

      // Address has many orders
      Address.hasMany(models.Order, {
        foreignKey: 'address_id',
        as: 'orders',
        onDelete: 'SET NULL'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        userId: this.userId,
        label: this.label,
        addressLine1: this.addressLine1,
        addressLine2: this.addressLine2,
        city: this.city,
        state: this.state,
        postalCode: this.postalCode,
        country: this.country,
        landmark: this.landmark,
        locationId: this.locationId,
        isDefault: this.isDefault,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }
  }

  Address.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        validate: {
          notNull: { msg: 'User ID is required' },
          isInt: { msg: 'User ID must be an integer' }
        }
      },
      label: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          len: { args: [0, 50], msg: 'Label must not exceed 50 characters' }
        }
      },
      addressLine1: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'address_line1',
        validate: {
          notNull: { msg: 'Address line 1 is required' },
          notEmpty: { msg: 'Address line 1 cannot be empty' },
          len: { args: [1, 255], msg: 'Address line 1 must be between 1 and 255 characters' }
        }
      },
      addressLine2: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'address_line2',
        validate: {
          len: { args: [0, 255], msg: 'Address line 2 must not exceed 255 characters' }
        }
      },
      // Legacy fields - kept for backward compatibility but now optional
      // Location data is now stored in the Location model via locationId
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: { args: [0, 100], msg: 'City must not exceed 100 characters' }
        }
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: { args: [0, 100], msg: 'State must not exceed 100 characters' }
        }
      },
      postalCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'postal_code',
        validate: {
          len: { args: [0, 20], msg: 'Postal code must not exceed 20 characters' }
        }
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'India',
        validate: {
          len: { args: [0, 100], msg: 'Country must not exceed 100 characters' }
        }
      },
      landmark: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          len: { args: [0, 255], msg: 'Landmark must not exceed 255 characters' }
        }
      },
      locationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'location_id',
        references: {
          model: 'locations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        validate: {
          isInt: { msg: 'Location ID must be an integer' }
        }
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_default'
      }
    },
    {
      sequelize,
      modelName: 'Address',
      tableName: 'addresses',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['user_id', 'is_default'] },
        { fields: ['location_id'] }
      ]
    }
  );

  return Address;
};

