#!/bin/bash

# Script to download food images using curl
# Uses Pexels free stock photos

echo "🍽️  Downloading food images from Pexels..."
echo ""

# Create directories
echo "📁 Creating directories..."
mkdir -p app/public/uploads/menu/{snacks,tea-coffee,salad,juice,icecream,tandoori,shahi-sabzi,mausmi-sabzi,daal,chawal,rajasthani-sabzi,paratha,fast-food,curd,lassi,roti,soup}

# Download images with delays to avoid rate limiting
echo ""
echo "⬇️  Downloading images (this will take about 1 minute)..."
echo ""

curl -L "https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/snacks/category.jpg && echo "✅ Snacks" && sleep 2

curl -L "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/tea-coffee/category.jpg && echo "✅ Tea & Coffee" && sleep 2

curl -L "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/salad/category.jpg && echo "✅ Salad" && sleep 2

curl -L "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/juice/category.jpg && echo "✅ Juice" && sleep 2

curl -L "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/icecream/category.jpg && echo "✅ Ice Cream" && sleep 2

curl -L "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/tandoori/category.jpg && echo "✅ Tandoori" && sleep 2

curl -L "https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/shahi-sabzi/category.jpg && echo "✅ Shahi Sabzi" && sleep 2

curl -L "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/mausmi-sabzi/category.jpg && echo "✅ Mausmi Sabzi" && sleep 2

curl -L "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/daal/category.jpg && echo "✅ Daal" && sleep 2

curl -L "https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/chawal/category.jpg && echo "✅ Chawal" && sleep 2

curl -L "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/rajasthani-sabzi/category.jpg && echo "✅ Rajasthani Sabzi" && sleep 2

curl -L "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/paratha/category.jpg && echo "✅ Paratha" && sleep 2

curl -L "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/fast-food/category.jpg && echo "✅ Fast Food" && sleep 2

curl -L "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/curd/category.jpg && echo "✅ Curd" && sleep 2

curl -L "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/lassi/category.jpg && echo "✅ Lassi" && sleep 2

curl -L "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/roti/category.jpg && echo "✅ Roti" && sleep 2

curl -L "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/soup/category.jpg && echo "✅ Soup" && sleep 2

echo ""
echo "✅ All images downloaded!"
echo ""
echo "📸 Images from Pexels.com - Free to use"
echo "📝 You can replace these with your own restaurant photos anytime"

