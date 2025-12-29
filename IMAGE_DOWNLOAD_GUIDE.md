# Complete Image Download Guide for Restaurant Menu

## Problem Statement

Currently we have:
- ✅ 17 category images (but they don't match the categories correctly)
- ❌ 0 item images (145+ items need images)

## Solution Options

### Option 1: Use Your Own Restaurant Photos (RECOMMENDED) ⭐

**This is the best option** because:
- Shows customers exactly what they'll get
- Builds trust and authenticity
- No copyright issues
- Differentiates from competitors

**How to do it:**
1. Take photos of each dish with a smartphone
2. Ensure good lighting (natural light is best)
3. Clean, simple background
4. Food is well-presented
5. Minimum 800x600 pixels
6. Save as JPEG

**Upload to:**
```
app/public/uploads/menu/{category-slug}/category.jpg  (for category)
app/public/uploads/menu/{category-slug}/{item-slug}.jpg  (for items)
```

---

### Option 2: Download from Free Stock Photo Sites

Visit these sites and manually download appropriate images:

#### **Pexels.com** (Recommended - No attribution required)
https://www.pexels.com/

#### **Pixabay.com** (No attribution required)
https://pixabay.com/

#### **Unsplash.com** (No attribution required)
https://unsplash.com/

### Specific Search Terms for Each Category:

| Category | Search Terms | Example Items |
|----------|--------------|---------------|
| **Snacks** | "pakora", "samosa", "indian snacks", "bhajiya" | Veg Pakoda, Paneer Pakoda, Samosa |
| **Tea - Coffee** | "indian chai", "masala tea", "coffee cup" | Tea, Coffee, Cold Coffee |
| **Salad** | "fresh salad", "vegetable salad", "green salad" | Green Salad, Onion Salad |
| **Juice** | "fresh juice", "fruit juice", "smoothie" | Orange Juice, Pineapple Juice |
| **Icecream** | "ice cream", "kulfi", "dessert" | Vanilla, Chocolate, Kulfi |
| **Tandoori** | "naan bread", "tandoori roti", "indian bread" | Tandoori Roti, Butter Naan |
| **Shahi Sabzi** | "paneer butter masala", "paneer curry", "shahi paneer" | Paneer Butter Masala, Shahi Paneer |
| **Mausmi Sabzi** | "mixed vegetables", "vegetable curry", "sabzi" | Mix Veg, Aloo Gobhi |
| **Daal** | "dal tadka", "lentils", "dal fry" | Dal Tadka, Dal Fry |
| **Chawal** | "biryani", "rice", "pulao", "fried rice" | Veg Biryani, Jeera Rice |
| **Rajasthani Sabzi** | "rajasthani food", "gatte ki sabzi", "ker sangri" | Gatte Ki Sabzi, Papad Ki Sabzi |
| **Paratha** | "paratha", "aloo paratha", "stuffed paratha" | Aloo Paratha, Paneer Paratha |
| **Fast Food** | "burger", "pizza", "sandwich", "pasta" | Veg Burger, Pizza, Sandwich |
| **Curd** | "yogurt", "raita", "curd", "dahi" | Plain Curd, Boondi Raita |
| **Lassi** | "lassi", "buttermilk", "yogurt drink" | Sweet Lassi, Salted Lassi |
| **Roti** | "roti", "chapati", "phulka" | Roti, Missi Roti |
| **Soup** | "tomato soup", "soup bowl", "gulab jamun" | Tomato Soup, Gulab Jamun |

---

### Option 3: For Testing - Use Generic Placeholders

If you just want to test the app functionality, you can use generic food images temporarily.

**Quick command to download generic images:**
```bash
# This will download generic food images (not category-specific)
./scripts/download-images-curl.sh
```

**Then replace them later with proper images.**

---

## Directory Structure

### For Category Images:
```
app/public/uploads/menu/
├── snacks/category.jpg
├── tea-coffee/category.jpg
├── salad/category.jpg
├── juice/category.jpg
├── icecream/category.jpg
├── tandoori/category.jpg
├── shahi-sabzi/category.jpg
├── mausmi-sabzi/category.jpg
├── daal/category.jpg
├── chawal/category.jpg
├── rajasthani-sabzi/category.jpg
├── paratha/category.jpg
├── fast-food/category.jpg
├── curd/category.jpg
├── lassi/category.jpg
├── roti/category.jpg
└── soup/category.jpg
```

### For Item Images (when you add them):
```
app/public/uploads/menu/
├── snacks/
│   ├── category.jpg
│   ├── veg-pakoda.jpg
│   ├── paneer-pakoda.jpg
│   └── samosa.jpg
├── daal/
│   ├── category.jpg
│   ├── dal-tadka.jpg
│   └── dal-fry.jpg
└── ... (etc)
```

---

## Image Specifications

- **Format:** JPEG (.jpg)
- **Minimum Size:** 800x600 pixels
- **Recommended Size:** 800x600 to 1200x900 pixels
- **File Size:** Keep under 500 KB for fast loading
- **Aspect Ratio:** 4:3 or 16:9 works best
- **Quality:** 80-90% JPEG quality

---

## How to Add Item Images

Currently, items don't have images defined in the migration. To add them:

1. **Take/download images for each item**
2. **Save with item slug as filename:**
   - "Veg Pakoda" → `veg-pakoda.jpg`
   - "Dal Tadka" → `dal-tadka.jpg`
   - "Paneer Butter Masala" → `paneer-butter-masala.jpg`

3. **Update the migration** to include item images (or add them via admin panel later)

---

## Recommendation

**For Production:** Use Option 1 (your own photos)  
**For Testing:** Use Option 3 (generic placeholders) then replace later  
**For Quick Setup:** Use Option 2 (manual download from stock sites)

The current images are just placeholders to get the system working. Replace them with actual restaurant photos for the best customer experience!

