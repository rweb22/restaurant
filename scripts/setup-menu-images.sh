#!/bin/bash

# Simple script to create menu image directory structure
# No external dependencies required

MENU_DIR="menu/images"

echo "🖼️  Setting up menu image directories..."
echo ""

# Create main images directory
mkdir -p "$MENU_DIR"

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

for category in "${categories[@]}"; do
  mkdir -p "$MENU_DIR/$category"
  
  # Create a placeholder .gitkeep file
  touch "$MENU_DIR/$category/.gitkeep"
  
  echo "✅ Created: $MENU_DIR/$category"
done

echo ""
echo "✅ Directory structure created successfully!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Download placeholder images (optional):"
echo "   node scripts/download-placeholder-images.js"
echo ""
echo "2. Or manually add images:"
echo "   - Add category.jpg to each category folder"
echo "   - Add individual item images (e.g., veg-pakoda.jpg)"
echo ""
echo "3. Run database migration to seed menu data:"
echo "   cd app && npm run migrate"
echo ""
echo "4. Upload images to server:"
echo "   scp -r menu/images/* user@server:/path/to/app/public/uploads/menu/"
echo ""
echo "📁 Directory structure:"
tree -L 2 "$MENU_DIR" 2>/dev/null || find "$MENU_DIR" -type d | sed 's|[^/]*/| |g'
echo ""

