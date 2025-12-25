'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OperatingHours extends Model {
    static associate(models) {
      // No associations needed
    }
  }

  OperatingHours.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      dayOfWeek: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'day_of_week',
        validate: {
          min: 0,
          max: 6
        }
      },
      openTime: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'open_time'
      },
      closeTime: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'close_time'
      },
      isClosed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_closed'
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
      modelName: 'OperatingHours',
      tableName: 'operating_hours',
      underscored: true,
      timestamps: true
    }
  );

  return OperatingHours;
};

