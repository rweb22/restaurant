# Menu Images

This directory contains placeholder images for menu categories and items.

## Directory Structure

```
menu/images/
├── snacks/
│   ├── category.jpg          # Category image
│   ├── veg-pakoda.jpg        # Item images (to be added)
│   └── ...
├── tea-coffee/
│   ├── category.jpg
│   └── ...
└── ...
```

## Image Guidelines

### Category Images
- Size: 800x600px (4:3 ratio)
- Format: JPG
- File name: `category.jpg`

### Item Images
- Size: 600x600px (1:1 ratio)
- Format: JPG
- File name: Use kebab-case matching item name (e.g., `veg-pakoda.jpg`)

## Replacing Placeholder Images

1. Take high-quality photos of your actual menu items
2. Resize them to the recommended dimensions
3. Replace the placeholder images with the same file names
4. Update the database with the correct image URLs

## Image URLs in Database

Images will be served from: `/uploads/menu/{category}/{filename}`

Example: `/uploads/menu/snacks/veg-pakoda.jpg`

## Attribution

Placeholder images are from:
- Unsplash (https://unsplash.com) - Free high-quality images
- Lorem Picsum (https://picsum.photos) - Placeholder image service

For production, replace with your own images or properly licensed stock photos.
