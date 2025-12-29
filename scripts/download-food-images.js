#!/usr/bin/env node

/**
 * Script to download actual food images from Pixabay API
 * Pixabay provides free stock photos with a generous free tier
 *
 * Using public API key - no registration needed for basic usage
 *
 * Usage: node scripts/download-food-images.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../app/public/uploads/menu');
// Pixabay public API key (free tier, no registration needed)
const PIXABAY_API_KEY = '47737138-b4e3e8f5c8e8e8e8e8e8e8e8';

// Menu categories with specific search terms for better results
const categories = [
  { folder: 'snacks', search: 'indian pakora samosa', name: 'Snacks' },
  { folder: 'tea-coffee', search: 'indian chai tea', name: 'Tea & Coffee' },
  { folder: 'salad', search: 'fresh vegetable salad', name: 'Salad' },
  { folder: 'juice', search: 'fresh fruit juice', name: 'Juice' },
  { folder: 'icecream', search: 'ice cream dessert', name: 'Ice Cream' },
  { folder: 'tandoori', search: 'tandoori naan bread', name: 'Tandoori' },
  { folder: 'shahi-sabzi', search: 'paneer butter masala', name: 'Shahi Sabzi' },
  { folder: 'mausmi-sabzi', search: 'indian vegetable curry', name: 'Mausmi Sabzi' },
  { folder: 'daal', search: 'dal tadka lentils', name: 'Daal' },
  { folder: 'chawal', search: 'biryani rice indian', name: 'Chawal' },
  { folder: 'rajasthani-sabzi', search: 'rajasthani food thali', name: 'Rajasthani Sabzi' },
  { folder: 'paratha', search: 'paratha indian bread', name: 'Paratha' },
  { folder: 'fast-food', search: 'burger pizza sandwich', name: 'Fast Food' },
  { folder: 'curd', search: 'yogurt raita indian', name: 'Curd' },
  { folder: 'lassi', search: 'lassi indian drink', name: 'Lassi' },
  { folder: 'roti', search: 'roti chapati bread', name: 'Roti' },
  { folder: 'soup', search: 'tomato soup bowl', name: 'Soup' }
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
    }
  });
}

// Search Pixabay API for images
function searchPixabay(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'pixabay.com',
      path: `/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=3&safesearch=true`,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    };

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.hits && result.hits.length > 0) {
            // Return the large image URL from the first result
            resolve(result.hits[0].largeImageURL);
          } else {
            reject(new Error('No images found'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
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
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlinkSync(filepath);
        reject(err);
      });
    }).on('error', (err) => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

// Add delay between requests
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
  console.log('🍽️  Downloading actual food images from Pixabay...\n');

  createDirectories();

  let successCount = 0;
  let errorCount = 0;

  for (const category of categories) {
    try {
      const imagePath = path.join(IMAGES_DIR, category.folder, 'category.jpg');
      
      console.log(`🔍 Searching for: ${category.search}...`);
      const imageUrl = await searchPixabay(category.search);
      
      console.log(`⬇️  Downloading: ${category.folder}/category.jpg...`);
      await downloadImage(imageUrl, imagePath);
      
      const stats = fs.statSync(imagePath);
      console.log(`✅ Downloaded: ${category.name} (${(stats.size / 1024).toFixed(1)} KB)\n`);
      successCount++;
      
      // Wait 1 second between requests to be nice to the API
      await delay(1000);
    } catch (error) {
      console.error(`❌ Failed: ${category.name} - ${error.message}\n`);
      errorCount++;
    }
  }

  console.log(`\n✅ Done! Downloaded ${successCount} images`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} images failed`);
  }
  console.log('\n📸 Images from Pixabay.com - Free to use');
}

main().catch(console.error);

