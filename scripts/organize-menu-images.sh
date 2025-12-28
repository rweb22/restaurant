#!/bin/bash

# Script to organize menu images into category folders
# This will help in uploading images to the server later

MENU_DIR="menu"
IMAGES_DIR="menu/images"

# Create main images directory
mkdir -p "$IMAGES_DIR"

# Create category directories
categories=(
  "snacks"
  "tea-coffee"
  "salad"
  "juice"
  "icecream"
  "tandoori"
  "shahi-sabzi"
  "mausmi-sabzi"
  "daal"
  "chawal"
  "rajasthani-sabzi"
  "paratha"
  "fast-food"
  "curd"
  "lassi"
  "roti"
  "soup"
)

echo "📁 Creating category directories..."
for category in "${categories[@]}"; do
  mkdir -p "$IMAGES_DIR/$category"
  echo "  ✅ Created: $IMAGES_DIR/$category"
done

echo ""
echo "✅ Directory structure created!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the menu images (IMG-20251228-WA000*.jpg) to appropriate category folders"
echo "2. Rename images to match item names (e.g., veg-pakoda.jpg, paneer-pakoda.jpg)"
echo "3. You can also add a 'category.jpg' image for each category folder"
echo ""
echo "Example structure:"
echo "  menu/images/snacks/veg-pakoda.jpg"
echo "  menu/images/snacks/paneer-pakoda.jpg"
echo "  menu/images/snacks/category.jpg"
echo ""

