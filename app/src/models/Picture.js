'use strict';

const { Model, DataTypes } = require('sequelize');
const { serializeDate } = require('../utils/dateSerializer');

class Picture extends Model {
  static associate(models) {
    // Polymorphic associations
    // Note: We don't use foreign key constraints for polymorphic associations
    // The relationship is managed through entity_type and entity_id
    
    // For querying purposes, we can define belongsTo associations with constraints: false
    Picture.belongsTo(models.Item, {
      foreignKey: 'entity_id',
      constraints: false,
      as: 'item',
      scope: { entity_type: 'item' }
    });
    
    Picture.belongsTo(models.Category, {
      foreignKey: 'entity_id',
      constraints: false,
      as: 'category',
      scope: { entity_type: 'category' }
    });
    
    Picture.belongsTo(models.Offer, {
      foreignKey: 'entity_id',
      constraints: false,
      as: 'offer',
      scope: { entity_type: 'offer' }
    });
    
    Picture.belongsTo(models.User, {
      foreignKey: 'entity_id',
      constraints: false,
      as: 'user',
      scope: { entity_type: 'user' }
    });
  }
  
  /**
   * Convert to safe object for API responses
   */
  toSafeObject() {
    return {
      id: this.id,
      entityType: this.entityType,
      entityId: this.entityId,
      url: this.url,
      altText: this.altText,
      displayOrder: this.displayOrder,
      isPrimary: this.isPrimary,
      width: this.width,
      height: this.height,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      createdAt: serializeDate(this.createdAt),
      updatedAt: serializeDate(this.updatedAt)
    };
  }
}

module.exports = (sequelize) => {
  Picture.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    entityType: {
      type: DataTypes.ENUM('item', 'category', 'offer', 'user'),
      allowNull: false,
      field: 'entity_type',
      validate: {
        isIn: {
          args: [['item', 'category', 'offer', 'user']],
          msg: 'Entity type must be one of: item, category, offer, user'
        }
      }
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'entity_id',
      validate: {
        isInt: {
          msg: 'Entity ID must be an integer'
        },
        min: {
          args: [1],
          msg: 'Entity ID must be positive'
        }
      }
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'URL cannot be empty'
        }
      }
    },
    altText: {
      type: DataTypes.STRING(255),
      field: 'alt_text'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
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
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_primary'
    },
    width: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: {
          msg: 'Width must be an integer'
        },
        min: {
          args: [1],
          msg: 'Width must be positive'
        }
      }
    },
    height: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: {
          msg: 'Height must be an integer'
        },
        min: {
          args: [1],
          msg: 'Height must be positive'
        }
      }
    },
    fileSize: {
      type: DataTypes.INTEGER,
      field: 'file_size',
      validate: {
        isInt: {
          msg: 'File size must be an integer'
        },
        min: {
          args: [1],
          msg: 'File size must be positive'
        }
      }
    },
    mimeType: {
      type: DataTypes.STRING(50),
      field: 'mime_type',
      validate: {
        is: {
          args: /^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/i,
          msg: 'MIME type must be a valid image type'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Picture',
    tableName: 'pictures',
    underscored: true,
    timestamps: true
  });
  
  return Picture;
};

