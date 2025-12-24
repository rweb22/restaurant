# Pictures Table Design

## Overview

The pictures table will store multiple images for items, categories, and potentially other entities. This allows for:
- Multiple product images per item (gallery view)
- Category banner images
- Different image sizes/formats
- Image ordering for display

---

## Database Schema

### Table: `pictures`

```sql
CREATE TABLE pictures (
  id SERIAL PRIMARY KEY,
  
  -- Polymorphic relationship (can belong to different entities)
  entity_type VARCHAR(50) NOT NULL,  -- 'item', 'category', 'offer', etc.
  entity_id INTEGER NOT NULL,         -- ID of the related entity
  
  -- Image details
  url TEXT NOT NULL,                  -- Full URL or path to image
  alt_text VARCHAR(255),              -- Alt text for accessibility
  display_order INTEGER DEFAULT 0,    -- Order for displaying multiple images
  is_primary BOOLEAN DEFAULT false,   -- Primary/featured image
  
  -- Image metadata
  width INTEGER,                      -- Image width in pixels
  height INTEGER,                     -- Image height in pixels
  file_size INTEGER,                  -- File size in bytes
  mime_type VARCHAR(50),              -- image/jpeg, image/png, etc.
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_pictures_entity (entity_type, entity_id),
  INDEX idx_pictures_primary (entity_type, entity_id, is_primary)
);
```

---

## Enum: `picture_entity_type`

```sql
CREATE TYPE picture_entity_type AS ENUM (
  'item',
  'category',
  'offer',
  'user'  -- For future: profile pictures
);
```

**Updated Schema with Enum**:
```sql
CREATE TABLE pictures (
  id SERIAL PRIMARY KEY,
  entity_type picture_entity_type NOT NULL,
  entity_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pictures_entity ON pictures(entity_type, entity_id);
CREATE INDEX idx_pictures_primary ON pictures(entity_type, entity_id, is_primary);
CREATE INDEX idx_pictures_display_order ON pictures(entity_type, entity_id, display_order);
```

---

## Business Rules

1. **Primary Image**: Each entity should have exactly one primary image (`is_primary = true`)
2. **Display Order**: Images are ordered by `display_order` ASC, then `created_at` ASC
3. **Entity Validation**: `entity_id` must reference a valid record in the corresponding table
4. **URL Format**: Can be:
   - Full URL: `https://cdn.example.com/images/item-123.jpg`
   - Relative path: `/uploads/items/item-123.jpg`
   - Cloud storage: `s3://bucket/images/item-123.jpg`
5. **Deletion**: When an entity is deleted, its pictures should be deleted (CASCADE)

---

## API Endpoints (To Be Implemented)

### Public Endpoints

```
GET    /api/pictures?entityType=item&entityId=1
       - Get all pictures for an entity
       - Returns: Array of pictures ordered by display_order

GET    /api/pictures/:id
       - Get specific picture details
       - Returns: Picture object
```

### Admin Endpoints

```
POST   /api/pictures
       - Upload new picture
       - Body: {
           entityType: 'item',
           entityId: 1,
           url: 'https://...',
           altText: 'Delicious pizza',
           isPrimary: false
         }
       - Returns: Created picture

PUT    /api/pictures/:id
       - Update picture details (alt text, order, primary status)
       - Body: { altText, displayOrder, isPrimary }
       - Returns: Updated picture

DELETE /api/pictures/:id
       - Delete picture
       - Returns: Success message

PATCH  /api/pictures/:id/primary
       - Set as primary image (unsets other primary images for same entity)
       - Returns: Updated picture

PATCH  /api/pictures/reorder
       - Reorder multiple pictures
       - Body: { pictures: [{ id: 1, displayOrder: 0 }, { id: 2, displayOrder: 1 }] }
       - Returns: Success message
```

---

## Sequelize Model

```javascript
// models/Picture.js
const { Model, DataTypes } = require('sequelize');

class Picture extends Model {
  static associate(models) {
    // Polymorphic associations
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
  }
  
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
      createdAt: this.createdAt
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
      field: 'entity_type'
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'entity_id'
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    altText: {
      type: DataTypes.STRING(255),
      field: 'alt_text'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'display_order'
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_primary'
    },
    width: DataTypes.INTEGER,
    height: DataTypes.INTEGER,
    fileSize: {
      type: DataTypes.INTEGER,
      field: 'file_size'
    },
    mimeType: {
      type: DataTypes.STRING(50),
      field: 'mime_type'
    }
  }, {
    sequelize,
    modelName: 'Picture',
    tableName: 'pictures',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Picture;
};
```

---

## Migration File

```javascript
// migrations/YYYYMMDDHHMMSS-create-pictures.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create enum
    await queryInterface.sequelize.query(`
      CREATE TYPE picture_entity_type AS ENUM ('item', 'category', 'offer', 'user');
    `);
    
    // Create table
    await queryInterface.createTable('pictures', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      entity_type: {
        type: 'picture_entity_type',
        allowNull: false
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      alt_text: {
        type: Sequelize.STRING(255)
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      width: Sequelize.INTEGER,
      height: Sequelize.INTEGER,
      file_size: Sequelize.INTEGER,
      mime_type: Sequelize.STRING(50),
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    // Create indexes
    await queryInterface.addIndex('pictures', ['entity_type', 'entity_id'], {
      name: 'idx_pictures_entity'
    });
    
    await queryInterface.addIndex('pictures', ['entity_type', 'entity_id', 'is_primary'], {
      name: 'idx_pictures_primary'
    });
    
    await queryInterface.addIndex('pictures', ['entity_type', 'entity_id', 'display_order'], {
      name: 'idx_pictures_display_order'
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pictures');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS picture_entity_type;');
  }
};
```

---

## Usage Examples

### Get Item with Pictures

```javascript
const item = await Item.findByPk(1, {
  include: [{
    model: Picture,
    as: 'pictures',
    where: { entity_type: 'item' },
    required: false,
    order: [['display_order', 'ASC']]
  }]
});
```

### Set Primary Image

```javascript
// Unset all primary images for this entity
await Picture.update(
  { isPrimary: false },
  { where: { entityType: 'item', entityId: 1 } }
);

// Set new primary image
await Picture.update(
  { isPrimary: true },
  { where: { id: pictureId } }
);
```

---

## Image Storage Strategy

### Option 1: Local Storage (Development)
- Store in `/uploads` directory
- Serve via Express static middleware
- URL format: `http://localhost:3000/uploads/items/item-1-image-1.jpg`

### Option 2: Cloud Storage (Production)
- Use AWS S3, Cloudinary, or similar
- Upload via multipart/form-data
- Store URL in database
- URL format: `https://cdn.cloudinary.com/restaurant/items/item-1.jpg`

### Recommended: Cloudinary
- Free tier: 25GB storage, 25GB bandwidth
- Automatic image optimization
- On-the-fly transformations (resize, crop, format)
- CDN delivery

---

## Implementation Priority

1. **Phase 1**: Database migration + Sequelize model
2. **Phase 2**: API endpoints (CRUD operations)
3. **Phase 3**: Image upload functionality (multipart/form-data)
4. **Phase 4**: Cloud storage integration (Cloudinary)
5. **Phase 5**: Frontend integration (image gallery, upload UI)

---

## Notes

- For MVP, we can use placeholder image URLs (e.g., Unsplash, Lorem Picsum)
- Image upload can be added later - for now, admin can paste image URLs
- Consider adding image validation (max file size, allowed formats)
- Consider adding image optimization (compression, WebP conversion)

