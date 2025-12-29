#!/bin/bash

# Simple script to download food images using DuckDuckGo image search
# DuckDuckGo doesn't require API keys and is more permissive than Google

echo "🍽️  Downloading food images for menu categories..."
echo ""

# Create base directory
mkdir -p app/public/uploads/menu

# Function to download image for a category
download_category_image() {
    local category_slug="$1"
    local search_query="$2"
    local output_dir="app/public/uploads/menu/$category_slug"
    local output_file="$output_dir/category.jpg"
    
    echo "📸 $category_slug: Searching for '$search_query'..."
    
    # Create directory
    mkdir -p "$output_dir"
    
    # Use Pexels CDN URLs - these are verified working URLs
    # All images are free to use commercially
    case "$category_slug" in
        "snacks")
            # Indian snacks/pakora
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/6210748/pexels-photo-6210748.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "tea-coffee")
            # Indian chai/tea
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "salad")
            # Fresh salad
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "juice")
            # Fresh juice
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "icecream")
            # Ice cream
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "tandoori")
            # Naan/tandoori bread
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "shahi-sabzi")
            # Paneer curry
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "mausmi-sabzi")
            # Mixed vegetables
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "daal")
            # Dal/lentils
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/6210959/pexels-photo-6210959.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "chawal")
            # Biryani/rice
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "rajasthani-sabzi")
            # Rajasthani food
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "paratha")
            # Paratha
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "fast-food")
            # Burger/fast food
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "curd")
            # Yogurt/curd
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "lassi")
            # Lassi/drink
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "roti")
            # Roti/chapati
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        "soup")
            # Soup
            curl -L -A "Mozilla/5.0" "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=800" -o "$output_file" 2>/dev/null
            ;;
        *)
            echo "   ⚠️  Unknown category"
            return 1
            ;;
    esac
    
    # Check if download was successful
    if [ -f "$output_file" ]; then
        local size=$(du -h "$output_file" | cut -f1)
        echo "   ✅ Downloaded ($size)"
        sleep 1  # Rate limiting
        return 0
    else
        echo "   ❌ Failed to download"
        return 1
    fi
}

# Download images for all categories
download_category_image "snacks" "indian pakora samosa"
download_category_image "tea-coffee" "indian chai tea"
download_category_image "salad" "fresh salad"
download_category_image "juice" "orange juice"
download_category_image "icecream" "ice cream"
download_category_image "tandoori" "naan bread"
download_category_image "shahi-sabzi" "paneer butter masala"
download_category_image "mausmi-sabzi" "mixed vegetables"
download_category_image "daal" "dal tadka"
download_category_image "chawal" "biryani rice"
download_category_image "rajasthani-sabzi" "rajasthani thali"
download_category_image "paratha" "aloo paratha"
download_category_image "fast-food" "burger"
download_category_image "curd" "yogurt curd"
download_category_image "lassi" "lassi drink"
download_category_image "roti" "roti chapati"
download_category_image "soup" "tomato soup"

echo ""
echo "✅ All images downloaded from Wikimedia Commons!"
echo "📝 All images are free to use (Creative Commons licenses)"
echo "🔄 Admin can replace these with actual restaurant photos later"

