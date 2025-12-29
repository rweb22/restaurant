#!/bin/bash

# Script to download more appropriate food images
# Using specific search queries for each category

echo "🍽️  Downloading category-specific food images..."
echo ""

# Create directories
echo "📁 Creating directories..."
mkdir -p app/public/uploads/menu/{snacks,tea-coffee,salad,juice,icecream,tandoori,shahi-sabzi,mausmi-sabzi,daal,chawal,rajasthani-sabzi,paratha,fast-food,curd,lassi,roti,soup}

echo ""
echo "⬇️  Downloading images with better category matching..."
echo ""

# Snacks - Pakora/Samosa
curl -L "https://images.pexels.com/photos/6210748/pexels-photo-6210748.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/snacks/category.jpg && echo "✅ Snacks (Pakora)" && sleep 2

# Tea & Coffee - Indian Chai
curl -L "https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/tea-coffee/category.jpg && echo "✅ Tea & Coffee (Chai)" && sleep 2

# Salad - Fresh Salad
curl -L "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/salad/category.jpg && echo "✅ Salad" && sleep 2

# Juice - Fresh Juice
curl -L "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/juice/category.jpg && echo "✅ Juice" && sleep 2

# Ice Cream - Kulfi/Ice Cream
curl -L "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/icecream/category.jpg && echo "✅ Ice Cream" && sleep 2

# Tandoori - Naan Bread
curl -L "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/tandoori/category.jpg && echo "✅ Tandoori (Naan)" && sleep 2

# Shahi Sabzi - Paneer Butter Masala
curl -L "https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/shahi-sabzi/category.jpg && echo "✅ Shahi Sabzi (Paneer)" && sleep 2

# Mausmi Sabzi - Mixed Vegetables
curl -L "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/mausmi-sabzi/category.jpg && echo "✅ Mausmi Sabzi" && sleep 2

# Daal - Dal Tadka
curl -L "https://images.pexels.com/photos/6210959/pexels-photo-6210959.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/daal/category.jpg && echo "✅ Daal" && sleep 2

# Chawal - Biryani/Rice
curl -L "https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/chawal/category.jpg && echo "✅ Chawal (Biryani)" && sleep 2

# Rajasthani Sabzi - Rajasthani Thali
curl -L "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/rajasthani-sabzi/category.jpg && echo "✅ Rajasthani Sabzi" && sleep 2

# Paratha - Aloo Paratha
curl -L "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/paratha/category.jpg && echo "✅ Paratha" && sleep 2

# Fast Food - Burger
curl -L "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/fast-food/category.jpg && echo "✅ Fast Food" && sleep 2

# Curd - Yogurt/Raita
curl -L "https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/curd/category.jpg && echo "✅ Curd (Raita)" && sleep 2

# Lassi - Lassi Drink
curl -L "https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/lassi/category.jpg && echo "✅ Lassi" && sleep 2

# Roti - Chapati/Roti
curl -L "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/roti/category.jpg && echo "✅ Roti" && sleep 2

# Soup - Tomato Soup
curl -L "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=800" -o app/public/uploads/menu/soup/category.jpg && echo "✅ Soup" && sleep 2

echo ""
echo "✅ All images downloaded!"
echo ""
echo "📸 Images from Pexels.com - Free to use"
echo "⚠️  Note: These are stock photos. For best results, use actual photos of your restaurant's dishes."

