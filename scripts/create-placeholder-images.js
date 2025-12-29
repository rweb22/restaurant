#!/usr/bin/env node

/**
 * Script to download placeholder images for menu categories
 * Uses placeholder.com for reliable placeholder images
 *
 * Usage: node scripts/create-placeholder-images.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../app/public/uploads/menu');

// Menu categories with colors
const categories = [
  { folder: 'snacks', name: 'Snacks', color: '#FF6B6B' },
  { folder: 'tea-coffee', name: 'Tea & Coffee', color: '#8B4513' },
  { folder: 'salad', name: 'Salad', color: '#4ECDC4' },
  { folder: 'juice', name: 'Juice', color: '#FFE66D' },
  { folder: 'icecream', name: 'Ice Cream', color: '#FFB6C1' },
  { folder: 'tandoori', name: 'Tandoori', color: '#FF8C42' },
  { folder: 'shahi-sabzi', name: 'Shahi Sabzi', color: '#FFA500' },
  { folder: 'mausmi-sabzi', name: 'Mausmi Sabzi', color: '#90EE90' },
  { folder: 'daal', name: 'Daal', color: '#DAA520' },
  { folder: 'chawal', name: 'Chawal', color: '#F5DEB3' },
  { folder: 'rajasthani-sabzi', name: 'Rajasthani Sabzi', color: '#FF4500' },
  { folder: 'paratha', name: 'Paratha', color: '#D2691E' },
  { folder: 'fast-food', name: 'Fast Food', color: '#FF1493' },
  { folder: 'curd', name: 'Curd', color: '#F0F8FF' },
  { folder: 'lassi', name: 'Lassi', color: '#FFFACD' },
  { folder: 'roti', name: 'Roti', color: '#CD853F' },
  { folder: 'soup', name: 'Soup', color: '#FFA07A' }
];

// Create directory structure
function createDirectories() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  categories.forEach(cat => {
    const catDir = path.join(IMAGES_DIR, cat.folder);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
      console.log(`✅ Created directory: ${cat.folder}`);
    }
  });
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Get placeholder image URL (using placeholder.com)
function getPlaceholderUrl(category) {
  const width = 800;
  const height = 600;
  // Use via.placeholder.com which is reliable
  const colorHex = category.color.replace('#', '');
  const text = encodeURIComponent(category.name);
  return `https://via.placeholder.com/${width}x${height}/${colorHex}/FFFFFF?text=${text}`;
}

// Main function
async function main() {
  console.log('🎨 Creating placeholder images for menu categories...\n');

  createDirectories();

  let successCount = 0;
  let errorCount = 0;

  for (const category of categories) {
    try {
      const imagePath = path.join(IMAGES_DIR, category.folder, 'category.jpg');
      const imageUrl = getPlaceholderUrl(category);

      console.log(`⬇️  Downloading: ${category.folder}/category.jpg...`);
      await downloadImage(imageUrl, imagePath);
      console.log(`✅ Created: ${category.folder}/category.jpg`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create ${category.folder}/category.jpg:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✅ Done! Created ${successCount} placeholder images`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} images failed`);
  }
  console.log('\n📝 Note: These are colored placeholders. Replace with actual food photos when ready.');
}

main().catch(console.error);

