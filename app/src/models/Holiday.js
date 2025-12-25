'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Holiday extends Model {
    static associate(models) {
      // No associations needed
    }
  }

  Holiday.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
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
      modelName: 'Holiday',
      tableName: 'holidays',
      underscored: true,
      timestamps: true
    }
  );

  return Holiday;
};

