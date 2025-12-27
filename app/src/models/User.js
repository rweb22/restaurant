'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User has many addresses
      User.hasMany(models.Address, {
        foreignKey: 'user_id',
        as: 'addresses',
        onDelete: 'CASCADE'
      });

      // User has many orders
      User.hasMany(models.Order, {
        foreignKey: 'user_id',
        as: 'orders',
        onDelete: 'SET NULL'
      });

      // User has many notifications
      User.hasMany(models.Notification, {
        foreignKey: 'user_id',
        as: 'notifications',
        onDelete: 'CASCADE'
      });

      // User has many pictures (polymorphic) - for profile pictures
      User.hasMany(models.Picture, {
        foreignKey: 'entity_id',
        constraints: false,
        scope: { entity_type: 'user' },
        as: 'pictures'
      });
    }

    /**
     * Check if user is admin
     */
    isAdmin() {
      return this.role === 'admin';
    }

    /**
     * Check if user is client
     */
    isClient() {
      return this.role === 'client';
    }

    /**
     * Get safe user object (without sensitive data)
     */
    toSafeObject() {
      return {
        id: this.id,
        phone: this.phone,
        role: this.role,
        name: this.name,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }

    /**
     * Get JSON representation
     */
    toJSON() {
      return this.toSafeObject();
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: {
        name: 'users_phone_unique',
        msg: 'Phone number already registered'
      },
      validate: {
        notNull: {
          msg: 'Phone number is required'
        },
        notEmpty: {
          msg: 'Phone number cannot be empty'
        },
        is: {
          args: /^\+?[1-9]\d{1,14}$/,
          msg: 'Phone number must be in valid international format'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'client'),
      allowNull: false,
      defaultValue: 'client',
      validate: {
        isIn: {
          args: [['admin', 'client']],
          msg: 'Role must be either admin or client'
        }
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [1, 255],
          msg: 'Name must be between 1 and 255 characters'
        }
      }
    },
    pushToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'push_token'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['phone']
      }
    ]
  });

  return User;
};

