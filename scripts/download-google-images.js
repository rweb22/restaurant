#!/usr/bin/env node

/**
 * Download food images from Google Images
 * Uses Google Custom Search API (free tier: 100 queries/day)
 * 
 * Setup:
 * 1. Get API key: https://developers.google.com/custom-search/v1/overview
 * 2. Get Search Engine ID: https://programmablesearchengine.google.com/
 * 3. Set environment variables: GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID
 */

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

// Google Custom Search API credentials
const API_KEY = process.env.GOOGLE_API_KEY || '';
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || '';

// Category search terms
const CATEGORY_SEARCHES = {
  'snacks': 'indian pakora samosa snacks',
  'tea-coffee': 'indian chai tea coffee',
  'salad': 'fresh green salad',
  'juice': 'fresh fruit juice glass',
  'icecream': 'ice cream kulfi dessert',
  'tandoori': 'tandoori naan bread',
  'shahi-sabzi': 'paneer butter masala curry',
  'mausmi-sabzi': 'mixed vegetable curry sabzi',
  'daal': 'dal tadka lentils',
  'chawal': 'biryani rice pulao',
  'rajasthani-sabzi': 'rajasthani thali gatte ki sabzi',
  'paratha': 'aloo paratha stuffed bread',
  'fast-food': 'burger pizza sandwich',
  'curd': 'yogurt raita dahi',
  'lassi': 'lassi buttermilk drink',
  'roti': 'roti chapati indian bread',
  'soup': 'tomato soup bowl'
};

/**
 * Search Google Images
 */
async function searchGoogleImages(query) {
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=3&imgSize=medium`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Download image from URL
 */
async function downloadImage(imageUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(imageUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    protocol.get(imageUrl, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        return downloadImage(res.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      
      const fileStream = require('fs').createWriteStream(outputPath);
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(outputPath);
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(outputPath).catch(() => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Main function
 */
async function main() {
  if (!API_KEY || !SEARCH_ENGINE_ID) {
    console.error('❌ Error: Google API credentials not set');
    console.error('');
    console.error('Please set environment variables:');
    console.error('  export GOOGLE_API_KEY="your-api-key"');
    console.error('  export GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id"');
    console.error('');
    console.error('Get credentials from:');
    console.error('  API Key: https://developers.google.com/custom-search/v1/overview');
    console.error('  Search Engine ID: https://programmablesearchengine.google.com/');
    process.exit(1);
  }

  console.log('🔍 Downloading food images from Google Images...\n');

  for (const [categorySlug, searchQuery] of Object.entries(CATEGORY_SEARCHES)) {
    try {
      console.log(`📸 ${categorySlug}: Searching for "${searchQuery}"...`);
      
      // Search Google Images
      const results = await searchGoogleImages(searchQuery);
      
      if (!results.items || results.items.length === 0) {
        console.log(`   ⚠️  No results found`);
        continue;
      }
      
      // Try to download first image
      let downloaded = false;
      for (let i = 0; i < Math.min(3, results.items.length); i++) {
        const imageUrl = results.items[i].link;
        const outputDir = path.join(__dirname, '../app/public/uploads/menu', categorySlug);
        const outputPath = path.join(outputDir, 'category.jpg');
        
        try {
          // Create directory if needed
          await fs.mkdir(outputDir, { recursive: true });
          
          // Download image
          await downloadImage(imageUrl, outputPath);
          
          // Verify it's a valid image file
          const stats = await fs.stat(outputPath);
          if (stats.size < 1000) {
            throw new Error('File too small');
          }
          
          console.log(`   ✅ Downloaded (${Math.round(stats.size / 1024)} KB)`);
          downloaded = true;
          break;
        } catch (error) {
          console.log(`   ⚠️  Failed to download image ${i + 1}: ${error.message}`);
        }
      }
      
      if (!downloaded) {
        console.log(`   ❌ Failed to download any image for ${categorySlug}`);
      }
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Done!');
}

main().catch(console.error);

