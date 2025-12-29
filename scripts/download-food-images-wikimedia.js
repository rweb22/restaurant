#!/usr/bin/env node

/**
 * Script to download actual food images from Wikimedia Commons
 * All images are free to use (Public Domain or Creative Commons)
 * 
 * Usage: node scripts/download-food-images-wikimedia.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../app/public/uploads/menu');

// Direct image URLs from Wikimedia Commons (all free to use)
const categories = [
  { 
    folder: 'snacks', 
    name: 'Snacks',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Pakora.jpg/800px-Pakora.jpg'
  },
  { 
    folder: 'tea-coffee', 
    name: 'Tea & Coffee',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/800px-A_small_cup_of_coffee.JPG'
  },
  { 
    folder: 'salad', 
    name: 'Salad',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Salad_platter.jpg/800px-Salad_platter.jpg'
  },
  { 
    folder: 'juice', 
    name: 'Juice',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Fruit_Juice_%288524623015%29.jpg/800px-Fruit_Juice_%288524623015%29.jpg'
  },
  { 
    folder: 'icecream', 
    name: 'Ice Cream',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg/800px-Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg'
  },
  { 
    folder: 'tandoori', 
    name: 'Tandoori',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Naan_bread_%28cropped%29.jpg/800px-Naan_bread_%28cropped%29.jpg'
  },
  { 
    folder: 'shahi-sabzi', 
    name: 'Shahi Sabzi',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Paneer_Butter_Masala.jpg/800px-Paneer_Butter_Masala.jpg'
  },
  { 
    folder: 'mausmi-sabzi', 
    name: 'Mausmi Sabzi',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Indian_vegetable_curry.jpg/800px-Indian_vegetable_curry.jpg'
  },
  { 
    folder: 'daal', 
    name: 'Daal',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Dal_Tadka.jpg/800px-Dal_Tadka.jpg'
  },
  { 
    folder: 'chawal', 
    name: 'Chawal',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Hyderabadi_Chicken_Biryani.jpg/800px-Hyderabadi_Chicken_Biryani.jpg'
  },
  { 
    folder: 'rajasthani-sabzi', 
    name: 'Rajasthani Sabzi',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Rajasthani_Thali.jpg/800px-Rajasthani_Thali.jpg'
  },
  { 
    folder: 'paratha', 
    name: 'Paratha',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Aloo_paratha.jpg/800px-Aloo_paratha.jpg'
  },
  { 
    folder: 'fast-food', 
    name: 'Fast Food',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/NCI_Visuals_Food_Hamburger.jpg/800px-NCI_Visuals_Food_Hamburger.jpg'
  },
  { 
    folder: 'curd', 
    name: 'Curd',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Raita.jpg/800px-Raita.jpg'
  },
  { 
    folder: 'lassi', 
    name: 'Lassi',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lassi_glass.jpg/600px-Lassi_glass.jpg'
  },
  { 
    folder: 'roti', 
    name: 'Roti',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chapati.JPG/800px-Chapati.JPG'
  },
  { 
    folder: 'soup', 
    name: 'Soup',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Tomato_soup.jpg/800px-Tomato_soup.jpg'
  }
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

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    https.get(url, options, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        return downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
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
        file.close();
        fs.unlinkSync(filepath);
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
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
  console.log('🍽️  Downloading food images from Wikimedia Commons...\n');
  console.log('📸 All images are free to use (Public Domain / Creative Commons)\n');

  createDirectories();

  let successCount = 0;
  let errorCount = 0;

  for (const category of categories) {
    try {
      const imagePath = path.join(IMAGES_DIR, category.folder, 'category.jpg');
      
      console.log(`⬇️  Downloading: ${category.name}...`);
      await downloadImage(category.url, imagePath);
      
      const stats = fs.statSync(imagePath);
      console.log(`✅ Downloaded: ${category.name} (${(stats.size / 1024).toFixed(1)} KB)`);
      successCount++;

      // Wait 2 seconds between downloads to avoid rate limiting
      await delay(2000);
    } catch (error) {
      console.error(`❌ Failed: ${category.name} - ${error.message}`);
      errorCount++;

      // Wait 2 seconds even on error
      await delay(2000);
    }
  }

  console.log(`\n✅ Done! Downloaded ${successCount} images`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} images failed`);
  }
  console.log('\n📝 Note: You can replace these with your own restaurant photos anytime');
}

main().catch(console.error);

