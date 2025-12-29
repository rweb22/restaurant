# Manual Image Download Instructions

Due to API rate limiting and restrictions, automated image downloads are not working reliably. Here's how to manually download free food images for your restaurant menu.

## Quick Solution: Use wget/curl (Recommended)

Run this command to download all images at once:

```bash
# Create directories
mkdir -p app/public/uploads/menu/{snacks,tea-coffee,salad,juice,icecream,tandoori,shahi-sabzi,mausmi-sabzi,daal,chawal,rajasthani-sabzi,paratha,fast-food,curd,lassi,roti,soup}

# Download images one by one with delays
curl -L "https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/snacks/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/tea-coffee/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/salad/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/juice/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/icecream/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/tandoori/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/shahi-sabzi/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/mausmi-sabzi/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/daal/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/chawal/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/rajasthani-sabzi/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/paratha/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/fast-food/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/curd/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/lassi/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/roti/category.jpg && sleep 2
curl -L "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/soup/category.jpg

echo "✅ All images downloaded!"
```

## Alternative: Download from Free Stock Photo Sites

Visit these sites and search for the food items:

1. **Pexels.com** (No attribution required)
   - https://www.pexels.com/search/indian%20food/
   
2. **Pixabay.com** (No attribution required)
   - https://pixabay.com/images/search/indian%20food/
   
3. **Unsplash.com** (No attribution required)
   - https://unsplash.com/s/photos/indian-food

### Search Terms for Each Category:

- **Snacks**: "pakora", "samosa", "indian snacks"
- **Tea & Coffee**: "chai", "indian tea", "coffee"
- **Salad**: "salad", "fresh vegetables"
- **Juice**: "fruit juice", "fresh juice"
- **Ice Cream**: "ice cream", "kulfi"
- **Tandoori**: "naan", "tandoori roti", "indian bread"
- **Shahi Sabzi**: "paneer butter masala", "paneer curry"
- **Mausmi Sabzi**: "vegetable curry", "indian vegetables"
- **Daal**: "dal tadka", "lentils", "dal"
- **Chawal**: "biryani", "rice", "pulao"
- **Rajasthani Sabzi**: "rajasthani thali", "rajasthani food"
- **Paratha**: "paratha", "aloo paratha"
- **Fast Food**: "burger", "pizza", "sandwich"
- **Curd**: "raita", "yogurt", "curd"
- **Lassi**: "lassi", "buttermilk"
- **Roti**: "roti", "chapati"
- **Soup**: "tomato soup", "soup"

### Save Images To:

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

## For Production:

**Best option**: Take photos of your actual restaurant dishes! This will:
- Show customers exactly what they'll get
- Build trust and authenticity
- Differentiate from competitors
- Comply with advertising standards

You can use a smartphone camera - just ensure:
- Good lighting (natural light is best)
- Clean, simple background
- Food is well-presented
- Image is in focus
- Minimum 800x600 pixels

## License Information:

All images from Pexels, Pixabay, and Unsplash are free to use for commercial purposes without attribution (though attribution is appreciated).

