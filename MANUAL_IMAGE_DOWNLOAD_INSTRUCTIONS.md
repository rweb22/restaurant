# Manual Image Download Instructions

Since automated Google Images downloading requires API keys and has limitations, here's a simple manual process to get proper food images:

## Quick Manual Download Process (15-20 minutes)

For each category, follow these steps:

### 1. Snacks (Pakora/Samosa)
```bash
# Search Google Images for: "indian pakora samosa"
# Right-click first good image → "Copy image address"
# Then run:
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/snacks/category.jpg
```

### 2. Tea & Coffee
```bash
# Search: "indian chai tea masala"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/tea-coffee/category.jpg
```

### 3. Salad
```bash
# Search: "fresh green salad"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/salad/category.jpg
```

### 4. Juice
```bash
# Search: "fresh fruit juice glass"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/juice/category.jpg
```

### 5. Ice Cream
```bash
# Search: "ice cream kulfi"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/icecream/category.jpg
```

### 6. Tandoori
```bash
# Search: "tandoori naan bread"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/tandoori/category.jpg
```

### 7. Shahi Sabzi
```bash
# Search: "paneer butter masala"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/shahi-sabzi/category.jpg
```

### 8. Mausmi Sabzi
```bash
# Search: "mixed vegetable curry sabzi"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/mausmi-sabzi/category.jpg
```

### 9. Daal
```bash
# Search: "dal tadka lentils"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/daal/category.jpg
```

### 10. Chawal (Rice)
```bash
# Search: "vegetable biryani rice"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/chawal/category.jpg
```

### 11. Rajasthani Sabzi
```bash
# Search: "rajasthani thali gatte ki sabzi"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/rajasthani-sabzi/category.jpg
```

### 12. Paratha
```bash
# Search: "aloo paratha stuffed"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/paratha/category.jpg
```

### 13. Fast Food
```bash
# Search: "burger pizza sandwich"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/fast-food/category.jpg
```

### 14. Curd
```bash
# Search: "yogurt raita dahi"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/curd/category.jpg
```

### 15. Lassi
```bash
# Search: "lassi buttermilk drink glass"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/lassi/category.jpg
```

### 16. Roti
```bash
# Search: "roti chapati indian bread"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/roti/category.jpg
```

### 17. Soup
```bash
# Search: "tomato soup bowl"
curl -L "PASTE_URL_HERE" -o app/public/uploads/menu/soup/category.jpg
```

---

## Alternative: Use Current Pexels Images

The current images from Pexels are generic food photos. They're not category-specific but they're:
- ✅ Free to use commercially
- ✅ High quality
- ✅ Better than nothing

You can keep them for now and replace later with:
1. Your own restaurant photos (BEST option)
2. Manually downloaded images using the process above
3. Images from the admin panel upload feature

---

## Automated Solution (Requires Setup)

If you want automated downloads, you need to:

1. **Get Google Custom Search API credentials:**
   - API Key: https://developers.google.com/custom-search/v1/overview
   - Search Engine ID: https://programmablesearchengine.google.com/
   - Free tier: 100 queries/day

2. **Set environment variables:**
   ```bash
   export GOOGLE_API_KEY="your-api-key"
   export GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id"
   ```

3. **Run the script:**
   ```bash
   node scripts/download-google-images.js
   ```

---

## Recommendation

**For now:** Keep the current Pexels images (they work, even if not perfect)

**After deployment:** Replace with actual restaurant photos via admin panel

**Why?** The migration will work, images will display, and you can improve them later without blocking deployment.

