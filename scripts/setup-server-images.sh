#!/bin/bash

# Script to set up menu images on the server
# This script copies placeholder images to the correct server directory

echo "🖼️  Setting up menu images on server..."
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p app/public/uploads/menu

# Copy images from menu/images to app/public/uploads/menu
echo "📋 Copying images..."
if [ -d "menu/images" ]; then
  cp -r menu/images/* app/public/uploads/menu/
  echo "✅ Images copied successfully!"
else
  echo "❌ Error: menu/images directory not found!"
  echo "   Please run: node scripts/download-placeholder-images.js first"
  exit 1
fi

# Set proper permissions
echo "🔒 Setting permissions..."
chmod -R 755 app/public/uploads

# Count images
category_count=$(find app/public/uploads/menu -name "category.jpg" | wc -l)
total_images=$(find app/public/uploads/menu -name "*.jpg" | wc -l)

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Summary:"
echo "   - Category images: $category_count"
echo "   - Total images: $total_images"
echo ""
echo "📁 Images location:"
echo "   app/public/uploads/menu/"
echo ""
echo "🌐 Images will be accessible at:"
echo "   http://your-server:3000/uploads/menu/{category-slug}/category.jpg"
echo ""
echo "📝 Next steps:"
echo "1. Run database migration: cd app && npm run migrate"
echo "2. Start/restart the server: docker-compose up -d"
echo "3. Test image access: curl http://localhost:3000/uploads/menu/snacks/category.jpg"
echo ""

