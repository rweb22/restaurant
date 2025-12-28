# Menu Data Setup Guide

This guide explains how to set up the complete menu data for the restaurant application, including categories, items, sizes, add-ons, and images.

## 📋 Overview

The menu setup includes:
- **17 Categories** (Snacks, Tea-Coffee, Salad, Juice, etc.)
- **160+ Menu Items** with descriptions and prices
- **Item Sizes** (all items have 'normal' size)
- **8 Common Add-ons** (Extra Cheese, Extra Butter, etc.)
- **Image Management** system for categories and items

## 🗂️ Files Created

### Database Migration
- `app/src/migrations/20251228100000-seed-menu-data.js` - Seeds all menu data

### Scripts
- `scripts/setup-menu-images.sh` - Creates image directory structure
- `scripts/download-placeholder-images.js` - Downloads placeholder images (optional)

### Documentation
- `menu/README.md` - Detailed image management guide
- `menu/menu.txt` - Original menu data (source)

### Directory Structure
```
menu/
├── menu.txt                    # Source menu data
├── README.md                   # Image management guide
├── IMG-20251228-WA000*.jpg    # Original menu images (reference)
└── images/                     # Organized menu images
    ├── snacks/
    │   ├── .gitkeep
    │   ├── category.jpg        # (to be added)
    │   ├── veg-pakoda.jpg      # (to be added)
    │   └── ...
    ├── tea-coffee/
    ├── salad/
    └── ... (17 categories total)
```

## 🚀 Quick Start

### Step 1: Setup Image Directories

```bash
# Create directory structure
./scripts/setup-menu-images.sh
```

### Step 2: Seed Database

```bash
# Run the migration
cd app
npm run migrate

# Or using Docker
docker-compose exec app npm run migrate
```

### Step 3: Add Images (Choose One Option)

#### Option A: Download Placeholders (Recommended for Testing)

```bash
# Download placeholder images from Unsplash
node scripts/download-placeholder-images.js
```

#### Option B: Add Your Own Images

1. Take photos of your actual menu items
2. Resize and optimize images
3. Save with correct naming convention
4. Place in appropriate category folders

See `menu/README.md` for detailed image guidelines.

### Step 4: Upload Images to Server

```bash
# Copy images to server's public directory
scp -r menu/images/* user@server:/path/to/app/public/uploads/menu/

# Or using Docker
docker cp menu/images/. restaurant-app:/app/public/uploads/menu/
```

## 📊 Database Schema

### Categories Table
```sql
- id (auto-increment)
- name (e.g., "Snacks", "Tea - Coffee")
- description
- is_available (boolean)
- display_order (integer)
- gst_rate (decimal, default 5.00)
- created_at, updated_at
```

### Items Table
```sql
- id (auto-increment)
- category_id (foreign key)
- name (e.g., "Veg Pakoda")
- description
- image_url (e.g., "/uploads/menu/snacks/veg-pakoda.jpg")
- is_available (boolean)
- dietary_tags (JSONB array, default ["vegetarian"])
- display_order (integer)
- created_at, updated_at
```

### Item Sizes Table
```sql
- id (auto-increment)
- item_id (foreign key)
- size (e.g., "normal")
- price (decimal)
- is_available (boolean)
- created_at, updated_at
```

### Add-ons Table
```sql
- id (auto-increment)
- name (e.g., "Extra Cheese")
- description
- price (decimal)
- is_available (boolean)
- created_at, updated_at
```

## 🖼️ Image Management

### Image URL Format
```
/uploads/menu/{category-slug}/{item-slug}.jpg
```

### Category Slugs
- Snacks → `snacks`
- Tea - Coffee → `tea-coffee`
- Shahi Sabzi → `shahi-sabzi`
- Fast Food → `fast-food`
- etc.

### Item Image Naming
Convert item names to kebab-case:
- "Veg Pakoda" → `veg-pakoda.jpg`
- "Cold Coffee Icecream" → `cold-coffee-icecream.jpg`
- "Paneer Butter Masala" → `paneer-butter-masala.jpg`

### Image Specifications

**Category Images:**
- Size: 800x600px (4:3 ratio)
- Format: JPEG
- Filename: `category.jpg`
- Max size: 200KB

**Item Images:**
- Size: 600x600px (1:1 ratio, square)
- Format: JPEG
- Filename: `{item-slug}.jpg`
- Max size: 150KB

## 🔧 Customization

### Adding New Items

1. Add item data to the migration file
2. Run migration
3. Add corresponding image
4. Upload to server

### Updating Prices

```sql
-- Update item size price
UPDATE item_sizes 
SET price = 120.00 
WHERE item_id = (SELECT id FROM items WHERE name = 'Veg Pakoda');
```

### Adding New Categories

1. Insert category in migration
2. Add items for that category
3. Create category folder in `menu/images/`
4. Add category and item images

## 📝 Menu Data Summary

| Category | Items Count | Price Range |
|----------|-------------|-------------|
| Snacks | 12 | ₹20 - ₹150 |
| Tea - Coffee | 8 | ₹20 - ₹100 |
| Salad | 4 | ₹40 - ₹60 |
| Juice | 10 | ₹30 - ₹50 |
| Icecream | 8 | ₹50 - ₹120 |
| Tandoori | 14 | ₹13 - ₹170 |
| Shahi Sabzi | 9 | ₹160 - ₹240 |
| Mausmi Sabzi | 6 | ₹120 - ₹130 |
| Daal | 6 | ₹130 - ₹150 |
| Chawal | 6 | ₹100 - ₹150 |
| Rajasthani Sabzi | 18 | ₹120 - ₹275 |
| Paratha | 7 | ₹35 - ₹80 |
| Fast Food | 18 | ₹50 - ₹240 |
| Curd | 5 | ₹50 - ₹80 |
| Lassi | 7 | ₹30 - ₹50 |
| Roti | 4 | ₹9 - ₹80 |
| Soup | 3 | ₹20 - ₹80 |

**Total: 160+ items across 17 categories**

## ✅ Verification

After setup, verify everything is working:

```bash
# Check database
docker-compose exec db psql -U postgres -d restaurant -c "SELECT COUNT(*) FROM categories;"
docker-compose exec db psql -U postgres -d restaurant -c "SELECT COUNT(*) FROM items;"
docker-compose exec db psql -U postgres -d restaurant -c "SELECT COUNT(*) FROM item_sizes;"

# Check images
ls -la menu/images/*/

# Test API endpoints
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/items?categoryId=1
```

## 🐛 Troubleshooting

### Migration fails
- Check database connection
- Ensure previous migrations have run
- Check for duplicate data

### Images not showing
- Verify file permissions (644 for files, 755 for directories)
- Check image URLs in database
- Ensure images are in correct server directory
- Clear browser cache

### Missing items
- Check migration logs
- Verify menu.txt data was parsed correctly
- Run migration again (it will skip if data exists)

## 📚 Additional Resources

- See `menu/README.md` for detailed image guidelines
- See migration file for complete item list
- See database schema in `docs/DESIGN.md`

## 🎯 Next Steps

1. ✅ Run `./scripts/setup-menu-images.sh`
2. ✅ Run `cd app && npm run migrate`
3. ⏳ Add/download images
4. ⏳ Upload images to server
5. ⏳ Test in mobile apps
6. ⏳ Replace placeholders with real photos

