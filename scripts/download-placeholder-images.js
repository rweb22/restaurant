#!/usr/bin/env node

/**
 * Script to download placeholder images for menu items
 * Uses Unsplash API for high-quality food images
 * 
 * Usage: node scripts/download-placeholder-images.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../menu/images');
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'demo'; // You'll need to get this from unsplash.com

// Menu categories with search terms for Unsplash
const categories = [
  { folder: 'snacks', searchTerm: 'indian snacks pakoda', defaultImage: 'indian-snacks.jpg' },
  { folder: 'tea-coffee', searchTerm: 'indian tea coffee', defaultImage: 'tea-coffee.jpg' },
  { folder: 'salad', searchTerm: 'fresh salad', defaultImage: 'salad.jpg' },
  { folder: 'juice', searchTerm: 'fresh juice shake', defaultImage: 'juice.jpg' },
  { folder: 'icecream', searchTerm: 'ice cream kulfi', defaultImage: 'icecream.jpg' },
  { folder: 'tandoori', searchTerm: 'tandoori naan roti', defaultImage: 'tandoori.jpg' },
  { folder: 'shahi-sabzi', searchTerm: 'paneer curry', defaultImage: 'shahi-sabzi.jpg' },
  { folder: 'mausmi-sabzi', searchTerm: 'indian vegetable curry', defaultImage: 'mausmi-sabzi.jpg' },
  { folder: 'daal', searchTerm: 'dal tadka', defaultImage: 'daal.jpg' },
  { folder: 'chawal', searchTerm: 'biryani rice', defaultImage: 'chawal.jpg' },
  { folder: 'rajasthani-sabzi', searchTerm: 'rajasthani food', defaultImage: 'rajasthani-sabzi.jpg' },
  { folder: 'paratha', searchTerm: 'paratha indian bread', defaultImage: 'paratha.jpg' },
  { folder: 'fast-food', searchTerm: 'pizza burger sandwich', defaultImage: 'fast-food.jpg' },
  { folder: 'curd', searchTerm: 'raita yogurt', defaultImage: 'curd.jpg' },
  { folder: 'lassi', searchTerm: 'lassi buttermilk', defaultImage: 'lassi.jpg' },
  { folder: 'roti', searchTerm: 'roti chapati', defaultImage: 'roti.jpg' },
  { folder: 'soup', searchTerm: 'soup gulab jamun', defaultImage: 'soup.jpg' }
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

// Get placeholder image URL from Unsplash
function getUnsplashImageUrl(searchTerm, width = 800, height = 600) {
  // Using Unsplash Source API (no API key required for basic usage)
  // For production, you should use the official Unsplash API with proper attribution
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchTerm)}`;
}

// Alternative: Use Lorem Picsum for generic placeholders
function getLoremPicsumUrl(width = 800, height = 600, seed) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// Download category images
async function downloadCategoryImages() {
  console.log('📥 Downloading category placeholder images...\n');

  for (const cat of categories) {
    const filepath = path.join(IMAGES_DIR, cat.folder, 'category.jpg');
    
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping ${cat.folder}/category.jpg (already exists)`);
      continue;
    }

    try {
      const imageUrl = getUnsplashImageUrl(cat.searchTerm);
      await downloadImage(imageUrl, filepath);
      console.log(`✅ Downloaded: ${cat.folder}/category.jpg`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to download ${cat.folder}/category.jpg:`, error.message);
    }
  }
}

// Create a README file with instructions
function createReadme() {
  const readmeContent = `# Menu Images

This directory contains placeholder images for menu categories and items.

## Directory Structure

\`\`\`
menu/images/
├── snacks/
│   ├── category.jpg          # Category image
│   ├── veg-pakoda.jpg        # Item images (to be added)
│   └── ...
├── tea-coffee/
│   ├── category.jpg
│   └── ...
└── ...
\`\`\`

## Image Guidelines

### Category Images
- Size: 800x600px (4:3 ratio)
- Format: JPG
- File name: \`category.jpg\`

### Item Images
- Size: 600x600px (1:1 ratio)
- Format: JPG
- File name: Use kebab-case matching item name (e.g., \`veg-pakoda.jpg\`)

## Replacing Placeholder Images

1. Take high-quality photos of your actual menu items
2. Resize them to the recommended dimensions
3. Replace the placeholder images with the same file names
4. Update the database with the correct image URLs

## Image URLs in Database

Images will be served from: \`/uploads/menu/{category}/{filename}\`

Example: \`/uploads/menu/snacks/veg-pakoda.jpg\`

## Attribution

Placeholder images are from:
- Unsplash (https://unsplash.com) - Free high-quality images
- Lorem Picsum (https://picsum.photos) - Placeholder image service

For production, replace with your own images or properly licensed stock photos.
`;

  fs.writeFileSync(path.join(IMAGES_DIR, 'README.md'), readmeContent);
  console.log('\n✅ Created README.md with instructions');
}

// Main function
async function main() {
  console.log('🖼️  Menu Image Setup\n');
  console.log('This script will create the directory structure and download placeholder images.\n');

  createDirectories();
  console.log('');
  
  await downloadCategoryImages();
  
  createReadme();

  console.log('\n✅ Setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Review the downloaded placeholder images in menu/images/');
  console.log('2. Replace placeholders with actual photos of your menu items');
  console.log('3. Add individual item images (e.g., veg-pakoda.jpg, paneer-pakoda.jpg)');
  console.log('4. Run the seed migration to populate the database');
  console.log('5. Upload images to your server\'s /uploads/menu/ directory\n');
}

main().catch(console.error);

