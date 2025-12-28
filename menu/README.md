# Menu Data and Images

This directory contains menu data and placeholder images for the restaurant application.

## Files

- `menu.txt` - Menu items with prices organized by category
- `IMG-20251228-WA000*.jpg` - Original menu images (for reference)
- `images/` - Directory for organized menu images (to be created)

## Setup Instructions

### 1. Download Placeholder Images

Run the image download script to create the directory structure and download placeholder images:

```bash
node scripts/download-placeholder-images.js
```

This will:
- Create `menu/images/` directory with category subdirectories
- Download placeholder category images from Unsplash
- Create a README with image guidelines

### 2. Seed the Database

Run the database migration to populate menu data:

```bash
cd app
npm run migrate
```

This will insert:
- 17 categories (Snacks, Tea-Coffee, Salad, etc.)
- 160+ menu items with descriptions
- Item sizes (all items have 'normal' size)
- Common add-ons (Extra Cheese, Extra Butter, etc.)

### 3. Upload Images to Server

The images need to be uploaded to your server's public directory:

```bash
# On your server
mkdir -p /path/to/app/public/uploads/menu

# Copy images from local to server
scp -r menu/images/* user@server:/path/to/app/public/uploads/menu/
```

Or if using Docker:

```bash
# Copy to Docker volume
docker cp menu/images/. restaurant-app:/app/public/uploads/menu/
```

## Image URL Structure

Images are referenced in the database with URLs like:

```
/uploads/menu/{category-slug}/{item-slug}.jpg
```

Examples:
- `/uploads/menu/snacks/veg-pakoda.jpg`
- `/uploads/menu/tea-coffee/cold-coffee.jpg`
- `/uploads/menu/tandoori/butter-naan.jpg`

## Category Slugs

| Category Name | Slug |
|--------------|------|
| Snacks | snacks |
| Tea - Coffee | tea-coffee |
| Salad | salad |
| Juice | juice |
| Icecream | icecream |
| Tandoori | tandoori |
| Shahi Sabzi | shahi-sabzi |
| Mausmi Sabzi | mausmi-sabzi |
| Daal | daal |
| Chawal | chawal |
| Rajasthani Sabzi | rajasthani-sabzi |
| Paratha | paratha |
| Fast Food | fast-food |
| Curd | curd |
| Lassi | lassi |
| Roti | roti |
| Soup | soup |

## Adding Real Images

### For Category Images

1. Take a high-quality photo representing the category
2. Resize to 800x600px (4:3 ratio)
3. Save as `category.jpg` in the category folder
4. Example: `menu/images/snacks/category.jpg`

### For Item Images

1. Take a high-quality photo of the dish
2. Resize to 600x600px (1:1 ratio, square)
3. Convert item name to kebab-case for filename
4. Save in the appropriate category folder

Examples:
- "Veg Pakoda" → `veg-pakoda.jpg`
- "Cold Coffee Icecream" → `cold-coffee-icecream.jpg`
- "Paneer Butter Masala" → `paneer-butter-masala.jpg`

## Image Guidelines

### Quality
- Use high-resolution images (minimum 600x600px for items)
- Good lighting and clear focus
- Appetizing presentation
- Consistent style across all images

### Format
- Use JPEG format (.jpg)
- Optimize for web (compress to 100-200KB per image)
- Use tools like TinyPNG or ImageOptim

### Naming Convention
- Use lowercase letters
- Replace spaces with hyphens (-)
- Remove special characters
- Examples: `veg-pakoda.jpg`, `butter-naan.jpg`

## Updating Images

To update an image:

1. Replace the file in `menu/images/{category}/`
2. Keep the same filename
3. Upload to server
4. Clear browser cache to see changes

No database changes needed - the URLs remain the same!

## Placeholder Images

The placeholder images are downloaded from:
- **Unsplash** (https://unsplash.com) - Free high-quality stock photos
- **Lorem Picsum** (https://picsum.photos) - Random placeholder images

**Important**: For production use, replace all placeholders with:
- Your own photographs of actual menu items
- Properly licensed stock photos with attribution
- Images you have rights to use

## Troubleshooting

### Images not showing in app

1. Check file permissions: `chmod 644 menu/images/**/*.jpg`
2. Verify image URLs in database match actual file paths
3. Check server's public directory configuration
4. Ensure images are in `/public/uploads/menu/` on server

### Missing images

Run this query to find items without images:

```sql
SELECT id, name, image_url FROM items WHERE image_url IS NULL;
```

Then add the missing images to the appropriate folders.

