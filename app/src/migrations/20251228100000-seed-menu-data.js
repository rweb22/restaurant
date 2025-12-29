'use strict';

/**
 * Seed migration for menu data
 * This migration populates:
 * - Categories
 * - Items
 * - Item Sizes (all items have 'normal' size)
 * - Add-ons (common add-ons for categories)
 * - Category-AddOn associations
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Check if categories already exist
      const [existingCategories] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM categories;',
        { transaction }
      );

      if (existingCategories[0].count > 0) {
        console.log('ℹ️  Menu data already exists, skipping seed...');
        await transaction.commit();
        return;
      }

      console.log('🌱 Seeding menu data...');

      // 1. Insert Categories
      const categories = [
        { name: 'Snacks', description: 'Delicious snacks and appetizers', display_order: 1, gst_rate: 5.00 },
        { name: 'Tea - Coffee', description: 'Hot and cold beverages', display_order: 2, gst_rate: 5.00 },
        { name: 'Salad', description: 'Fresh salads', display_order: 3, gst_rate: 5.00 },
        { name: 'Juice', description: 'Fresh juices and shakes', display_order: 4, gst_rate: 5.00 },
        { name: 'Icecream', description: 'Delicious ice cream varieties', display_order: 5, gst_rate: 5.00 },
        { name: 'Tandoori', description: 'Tandoori breads and dishes', display_order: 6, gst_rate: 5.00 },
        { name: 'Shahi Sabzi', description: 'Royal vegetable curries', display_order: 7, gst_rate: 5.00 },
        { name: 'Mausmi Sabzi', description: 'Seasonal vegetable dishes', display_order: 8, gst_rate: 5.00 },
        { name: 'Daal', description: 'Lentil dishes', display_order: 9, gst_rate: 5.00 },
        { name: 'Chawal', description: 'Rice dishes', display_order: 10, gst_rate: 5.00 },
        { name: 'Rajasthani Sabzi', description: 'Traditional Rajasthani vegetables', display_order: 11, gst_rate: 5.00 },
        { name: 'Paratha', description: 'Stuffed Indian flatbreads', display_order: 12, gst_rate: 5.00 },
        { name: 'Fast Food', description: 'Quick bites and fast food', display_order: 13, gst_rate: 5.00 },
        { name: 'Curd', description: 'Yogurt and raita', display_order: 14, gst_rate: 5.00 },
        { name: 'Lassi', description: 'Traditional yogurt drinks', display_order: 15, gst_rate: 5.00 },
        { name: 'Roti', description: 'Indian flatbreads', display_order: 16, gst_rate: 5.00 },
        { name: 'Soup', description: 'Soups and desserts', display_order: 17, gst_rate: 5.00 }
      ];

      const categoryRecords = categories.map(cat => ({
        ...cat,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('categories', categoryRecords, { transaction });
      console.log('✅ Categories inserted');

      // Get category IDs
      const [categoryRows] = await queryInterface.sequelize.query(
        'SELECT id, name FROM categories ORDER BY id;',
        { transaction }
      );

      const categoryMap = {};
      categoryRows.forEach(row => {
        categoryMap[row.name] = row.id;
      });

      // 2. Insert Items with their sizes
      // Image URLs will be in format: /uploads/menu/{category-slug}/{item-slug}.jpg
      const itemsData = [
        // Snacks
        { category: 'Snacks', name: 'Veg Pakoda', price: 110, description: 'Crispy vegetable fritters', image: 'veg-pakoda.jpg' },
        { category: 'Snacks', name: 'Paneer Pakoda', price: 150, description: 'Cottage cheese fritters' },
        { category: 'Snacks', name: 'Pyaaz Pakoda', price: 100, description: 'Onion fritters' },
        { category: 'Snacks', name: 'Paneer Kachcha', price: 130, description: 'Raw paneer preparation' },
        { category: 'Snacks', name: 'Fry Paneer', price: 150, description: 'Fried cottage cheese' },
        { category: 'Snacks', name: 'Peanut Masala', price: 150, description: 'Spicy peanuts' },
        { category: 'Snacks', name: 'Masala Paapad', price: 50, description: 'Spiced crispy papad' },
        { category: 'Snacks', name: 'Fry Papad', price: 30, description: 'Fried papad' },
        { category: 'Snacks', name: 'Plain Paapad', price: 20, description: 'Plain roasted papad' },
        { category: 'Snacks', name: 'Butter Toast Plain', price: 50, description: 'Buttered toast' },
        { category: 'Snacks', name: 'Dahi Kachumar', price: 80, description: 'Yogurt salad' },
        { category: 'Snacks', name: 'Namkeen Kachumar', price: 70, description: 'Savory salad' },

        // Tea - Coffee
        { category: 'Tea - Coffee', name: 'Tea', price: 20, description: 'Traditional Indian tea' },
        { category: 'Tea - Coffee', name: 'Tea Kulhad', price: 25, description: 'Tea in clay cup' },
        { category: 'Tea - Coffee', name: 'Hot Coffee', price: 30, description: 'Hot brewed coffee' },
        { category: 'Tea - Coffee', name: 'Hot Coffee Kulhad', price: 35, description: 'Coffee in clay cup' },
        { category: 'Tea - Coffee', name: 'Cold Coffee', price: 80, description: 'Chilled coffee' },
        { category: 'Tea - Coffee', name: 'Cold Coffee Icecream', price: 100, description: 'Cold coffee with ice cream' },
        { category: 'Tea - Coffee', name: 'Hot Milk', price: 50, description: 'Hot milk' },
        { category: 'Tea - Coffee', name: 'Black Tea', price: 30, description: 'Black tea without milk' },

        // Salad
        { category: 'Salad', name: 'Green Salad', price: 60, description: 'Fresh green vegetables' },
        { category: 'Salad', name: 'Tomato Salad', price: 50, description: 'Fresh tomato salad' },
        { category: 'Salad', name: 'Kheera Salad', price: 50, description: 'Cucumber salad' },
        { category: 'Salad', name: 'Pyaaz Salad', price: 40, description: 'Onion salad' },

        // Juice
        { category: 'Juice', name: 'Papaya', price: 30, description: 'Fresh papaya juice' },
        { category: 'Juice', name: 'Papaya Shake', price: 40, description: 'Papaya milkshake' },
        { category: 'Juice', name: 'Papaya Shake Icecream', price: 50, description: 'Papaya shake with ice cream' },
        { category: 'Juice', name: 'Banana', price: 30, description: 'Fresh banana juice' },
        { category: 'Juice', name: 'Banana Shake', price: 40, description: 'Banana milkshake' },
        { category: 'Juice', name: 'Banana Shake Icecream', price: 50, description: 'Banana shake with ice cream' },
        { category: 'Juice', name: 'Mango', price: 30, description: 'Fresh mango juice' },
        { category: 'Juice', name: 'Mango Shake', price: 40, description: 'Mango milkshake' },
        { category: 'Juice', name: 'Mango Shake Icecream', price: 50, description: 'Mango shake with ice cream' },
        { category: 'Juice', name: 'Beel', price: 40, description: 'Wood apple juice' },
        { category: 'Juice', name: 'Mausami', price: 50, description: 'Sweet lime juice' },

        // Icecream
        { category: 'Icecream', name: 'Vanilla Kulhad', price: 50, description: 'Vanilla ice cream in clay cup' },
        { category: 'Icecream', name: 'Strawberry Kulhad', price: 60, description: 'Strawberry ice cream in clay cup' },
        { category: 'Icecream', name: 'Chocolate Kulhad', price: 60, description: 'Chocolate ice cream in clay cup' },
        { category: 'Icecream', name: 'Butter Scotch Kulhad', price: 70, description: 'Butterscotch ice cream in clay cup' },
        { category: 'Icecream', name: 'Pista Kulhad', price: 80, description: 'Pistachio ice cream in clay cup' },
        { category: 'Icecream', name: 'American Nuts Kulhad', price: 90, description: 'Mixed nuts ice cream in clay cup' },
        { category: 'Icecream', name: 'Vanilla with Gulaab Jaamun', price: 100, description: 'Vanilla ice cream with gulab jamun' },
        { category: 'Icecream', name: 'Special Krishnam Kulhad', price: 120, description: 'Special house ice cream' },

        // Tandoori
        { category: 'Tandoori', name: 'Tandoori Roti', price: 13, description: 'Tandoor baked bread' },
        { category: 'Tandoori', name: 'Tandoori Butter Roti', price: 15, description: 'Buttered tandoor bread' },
        { category: 'Tandoori', name: 'Butter Naan', price: 30, description: 'Buttered naan bread' },
        { category: 'Tandoori', name: 'Plain Naan', price: 25, description: 'Plain naan bread' },
        { category: 'Tandoori', name: 'Garlic Naan', price: 60, description: 'Garlic flavored naan' },
        { category: 'Tandoori', name: 'Stuff Naan', price: 80, description: 'Stuffed naan bread' },
        { category: 'Tandoori', name: 'Lachchha Paratha', price: 60, description: 'Layered paratha' },
        { category: 'Tandoori', name: 'Onion Lachchha Paratha', price: 70, description: 'Layered paratha with onion' },
        { category: 'Tandoori', name: 'Malai Tikka', price: 140, description: 'Creamy tikka' },
        { category: 'Tandoori', name: 'Tandoor Aloo Paratha', price: 80, description: 'Potato stuffed tandoor paratha' },
        { category: 'Tandoori', name: 'Tandoor Paneer Paratha', price: 110, description: 'Paneer stuffed tandoor paratha' },
        { category: 'Tandoori', name: 'Special Krishnam Paneer Tikka Masala', price: 170, description: 'Special paneer tikka masala' },
        { category: 'Tandoori', name: 'Missi Plain Roti', price: 40, description: 'Gram flour bread' },
        { category: 'Tandoori', name: 'Missi Masala Onion', price: 70, description: 'Spiced gram flour bread with onion' },

        // Shahi Sabzi
        { category: 'Shahi Sabzi', name: 'Matar Paneer', price: 160, description: 'Peas and cottage cheese curry' },
        { category: 'Shahi Sabzi', name: 'Shahi Paneer (Red)', price: 210, description: 'Royal cottage cheese curry' },
        { category: 'Shahi Sabzi', name: 'Paneer Do Pyaaza', price: 170, description: 'Paneer with double onions' },
        { category: 'Shahi Sabzi', name: 'Kadhai Paneer', price: 190, description: 'Paneer in kadhai gravy' },
        { category: 'Shahi Sabzi', name: 'Haandi Paneer', price: 200, description: 'Paneer in clay pot gravy' },
        { category: 'Shahi Sabzi', name: 'Paneer Butter Masala', price: 220, description: 'Paneer in butter masala gravy' },
        { category: 'Shahi Sabzi', name: 'Kaaju Curry', price: 240, description: 'Cashew nut curry' },
        { category: 'Shahi Sabzi', name: 'Kaaju Paneer', price: 220, description: 'Cashew and paneer curry' },
        { category: 'Shahi Sabzi', name: 'Malai Kofta', price: 200, description: 'Creamy vegetable dumplings' },

        // Mausmi Sabzi
        { category: 'Mausmi Sabzi', name: 'Gaazar Matar', price: 120, description: 'Carrot and peas' },
        { category: 'Mausmi Sabzi', name: 'Gaazar Matar Masala', price: 130, description: 'Spiced carrot and peas' },
        { category: 'Mausmi Sabzi', name: 'Gobhi Matar', price: 120, description: 'Cauliflower and peas' },
        { category: 'Mausmi Sabzi', name: 'Gobhi Masala', price: 130, description: 'Spiced cauliflower' },
        { category: 'Mausmi Sabzi', name: 'Aloo Gobhi', price: 120, description: 'Potato and cauliflower' },
        { category: 'Mausmi Sabzi', name: 'Aloo Gobhi Matar', price: 130, description: 'Potato, cauliflower and peas' },

        // Daal
        { category: 'Daal', name: 'Daal Makhani', price: 150, description: 'Creamy black lentils' },
        { category: 'Daal', name: 'Daal Fry', price: 130, description: 'Fried lentils' },
        { category: 'Daal', name: 'Daal Butter', price: 140, description: 'Buttered lentils' },
        { category: 'Daal', name: 'Daal Tadka Rajasthani', price: 130, description: 'Rajasthani style tempered lentils' },
        { category: 'Daal', name: 'Daal Tadka Punjabi', price: 130, description: 'Punjabi style tempered lentils' },
        { category: 'Daal', name: 'Lahsoon Chutney', price: 130, description: 'Garlic chutney' },

        // Chawal
        { category: 'Chawal', name: 'Veg Pulav', price: 140, description: 'Vegetable rice pilaf' },
        { category: 'Chawal', name: 'Matar Pulav', price: 130, description: 'Peas rice pilaf' },
        { category: 'Chawal', name: 'Paneer Pulav', price: 150, description: 'Paneer rice pilaf' },
        { category: 'Chawal', name: 'Plain Rice', price: 100, description: 'Steamed rice' },
        { category: 'Chawal', name: 'Zeera Rice', price: 120, description: 'Cumin flavored rice' },
        { category: 'Chawal', name: 'Veg Biryani', price: 140, description: 'Vegetable biryani' },

        // Rajasthani Sabzi
        { category: 'Rajasthani Sabzi', name: 'Kair Sangri', price: 250, description: 'Traditional Rajasthani desert beans' },
        { category: 'Rajasthani Sabzi', name: 'Kaazu Sangri', price: 275, description: 'Cashew with desert beans' },
        { category: 'Rajasthani Sabzi', name: 'Kadhi Sangri', price: 150, description: 'Yogurt curry with desert beans' },
        { category: 'Rajasthani Sabzi', name: 'Kadhi Fry', price: 130, description: 'Fried yogurt curry' },
        { category: 'Rajasthani Sabzi', name: 'Dum Aloo', price: 140, description: 'Slow cooked potatoes' },
        { category: 'Rajasthani Sabzi', name: 'Chana Masala', price: 150, description: 'Spiced chickpeas' },
        { category: 'Rajasthani Sabzi', name: 'Aloo Pyaaz', price: 130, description: 'Potato and onion' },
        { category: 'Rajasthani Sabzi', name: 'Aloo Matar', price: 130, description: 'Potato and peas' },
        { category: 'Rajasthani Sabzi', name: 'Mix Veg', price: 150, description: 'Mixed vegetables' },
        { category: 'Rajasthani Sabzi', name: 'Green Mix Veg', price: 180, description: 'Green mixed vegetables' },
        { category: 'Rajasthani Sabzi', name: 'Aloo Chhola', price: 120, description: 'Potato and chickpeas' },
        { category: 'Rajasthani Sabzi', name: 'Zeera Aloo', price: 130, description: 'Cumin flavored potatoes' },
        { category: 'Rajasthani Sabzi', name: 'Sev Bhaaji', price: 150, description: 'Crispy noodles with vegetables' },
        { category: 'Rajasthani Sabzi', name: 'Sev Bhaaji Masala', price: 140, description: 'Spiced crispy noodles with vegetables' },
        { category: 'Rajasthani Sabzi', name: 'Sev Tamatar', price: 130, description: 'Crispy noodles with tomatoes' },
        { category: 'Rajasthani Sabzi', name: 'Bhindi Masala', price: 150, description: 'Spiced okra' },
        { category: 'Rajasthani Sabzi', name: 'Gawar Fali', price: 140, description: 'Cluster beans' },
        { category: 'Rajasthani Sabzi', name: 'Tamatar Pyaaz Chutney', price: 200, description: 'Tomato onion chutney' },

        // Paratha
        { category: 'Paratha', name: 'Sadaa Paratha', price: 35, description: 'Plain paratha' },
        { category: 'Paratha', name: 'Aloo Paratha', price: 60, description: 'Potato stuffed paratha' },
        { category: 'Paratha', name: 'Paneer Paratha', price: 70, description: 'Paneer stuffed paratha' },
        { category: 'Paratha', name: 'Mix Veg Paratha', price: 65, description: 'Mixed vegetable paratha' },
        { category: 'Paratha', name: 'Tava Lachchha Paratha', price: 80, description: 'Layered griddle paratha' },
        { category: 'Paratha', name: 'Gobhi Paratha', price: 50, description: 'Cauliflower stuffed paratha' },
        { category: 'Paratha', name: 'Aloo Pyaaz Paratha', price: 60, description: 'Potato onion paratha' },

        // Fast Food
        { category: 'Fast Food', name: 'Poha', price: 70, description: 'Flattened rice snack' },
        { category: 'Fast Food', name: 'Maggie Plain', price: 50, description: 'Plain instant noodles' },
        { category: 'Fast Food', name: 'Maggie Veg', price: 70, description: 'Vegetable instant noodles' },
        { category: 'Fast Food', name: 'Maggie Masala', price: 80, description: 'Spiced instant noodles' },
        { category: 'Fast Food', name: 'Veg Sandwich', price: 60, description: 'Vegetable sandwich' },
        { category: 'Fast Food', name: 'Cheese Sandwich', price: 80, description: 'Cheese sandwich' },
        { category: 'Fast Food', name: 'Veg Burger', price: 70, description: 'Vegetable burger' },
        { category: 'Fast Food', name: 'Cheese Burger', price: 80, description: 'Cheese burger' },
        { category: 'Fast Food', name: 'French Fry', price: 80, description: 'French fries' },
        { category: 'Fast Food', name: 'Paneer Cheese Pizza', price: 180, description: 'Paneer and cheese pizza' },
        { category: 'Fast Food', name: 'Spices Cheese Pizza', price: 200, description: 'Spiced cheese pizza' },
        { category: 'Fast Food', name: 'Hot Cheese Pizza', price: 210, description: 'Hot and spicy cheese pizza' },
        { category: 'Fast Food', name: 'Special Krishnam Pizza', price: 240, description: 'Special house pizza' },
        { category: 'Fast Food', name: 'Chow Mein', price: 90, description: 'Stir-fried noodles' },
        { category: 'Fast Food', name: 'Chilli Paneer', price: 160, description: 'Spicy paneer' },
        { category: 'Fast Food', name: 'Chilli Potato', price: 140, description: 'Spicy potatoes' },
        { category: 'Fast Food', name: 'Veg Fry Rice', price: 130, description: 'Vegetable fried rice' },
        { category: 'Fast Food', name: 'Paneer Fry Rice', price: 150, description: 'Paneer fried rice' },

        // Curd
        { category: 'Curd', name: 'Curd', price: 50, description: 'Plain yogurt' },
        { category: 'Curd', name: 'Veg Raita', price: 80, description: 'Vegetable yogurt' },
        { category: 'Curd', name: 'Boondi Raita', price: 70, description: 'Yogurt with fried gram flour balls' },
        { category: 'Curd', name: 'Tadka Raita', price: 80, description: 'Tempered yogurt' },
        { category: 'Curd', name: 'Veg Mix Raita', price: 70, description: 'Mixed vegetable yogurt' },

        // Lassi
        { category: 'Lassi', name: 'Sada Chhachh', price: 30, description: 'Plain buttermilk' },
        { category: 'Lassi', name: 'Zeera Chhachh', price: 35, description: 'Cumin buttermilk' },
        { category: 'Lassi', name: 'Chhachh Pudina', price: 35, description: 'Mint buttermilk' },
        { category: 'Lassi', name: 'Chhachh Namkin', price: 35, description: 'Salted buttermilk' },
        { category: 'Lassi', name: 'Sweet Lassi', price: 50, description: 'Sweet yogurt drink' },
        { category: 'Lassi', name: 'Namkeen Lassi', price: 40, description: 'Salted yogurt drink' },
        { category: 'Lassi', name: 'Shikanji', price: 40, description: 'Lemonade' },

        // Roti
        { category: 'Roti', name: 'Tava Roti Plain', price: 9, description: 'Plain griddle bread' },
        { category: 'Roti', name: 'Tava Roti Butter', price: 12, description: 'Buttered griddle bread' },
        { category: 'Roti', name: 'Missi Roti', price: 40, description: 'Gram flour bread' },
        { category: 'Roti', name: 'Saata Roti', price: 80, description: 'Whole wheat bread' },

        // Soup
        { category: 'Soup', name: 'Tomato Soup', price: 80, description: 'Tomato soup' },
        { category: 'Soup', name: 'Gulaab Jamun', price: 20, description: 'Sweet fried dumplings' },
        { category: 'Soup', name: 'Rajbhog', price: 30, description: 'Sweet saffron rasgulla' },
      ];

      // Helper function to create slug from category name
      const createSlug = (text) => {
        return text.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      };

      // Prepare items for bulk insert
      const itemRecords = itemsData.map((item, index) => {
        return {
          category_id: categoryMap[item.category],
          name: item.name,
          description: item.description,
          is_available: true,
          dietary_tags: '["vegetarian"]',
          display_order: index,
          created_at: new Date(),
          updated_at: new Date()
        };
      });

      await queryInterface.bulkInsert('items', itemRecords, { transaction });
      console.log(`✅ ${itemRecords.length} items inserted`);

      // Get item IDs
      const [itemRows] = await queryInterface.sequelize.query(
        'SELECT id, name, category_id FROM items ORDER BY id;',
        { transaction }
      );

      // Prepare item sizes (all items have 'normal' size)
      const itemSizeRecords = itemRows.map((item, index) => ({
        item_id: item.id,
        size: 'normal',
        price: itemsData[index].price,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('item_sizes', itemSizeRecords, { transaction });
      console.log(`✅ ${itemSizeRecords.length} item sizes inserted`);

      // 3. Insert common add-ons
      const addOns = [
        { name: 'Extra Cheese', description: 'Additional cheese topping', price: 30 },
        { name: 'Extra Butter', description: 'Additional butter', price: 10 },
        { name: 'Extra Paneer', description: 'Additional paneer', price: 50 },
        { name: 'Extra Spicy', description: 'Make it extra spicy', price: 0 },
        { name: 'Less Spicy', description: 'Make it less spicy', price: 0 },
        { name: 'Extra Onion', description: 'Additional onions', price: 20 },
        { name: 'Extra Garlic', description: 'Additional garlic', price: 15 },
        { name: 'Extra Cream', description: 'Additional cream', price: 25 },
      ];

      const addOnRecords = addOns.map(addOn => ({
        ...addOn,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('add_ons', addOnRecords, { transaction });
      console.log(`✅ ${addOnRecords.length} add-ons inserted`);

      // 4. Insert Pictures for categories
      const categoryPictures = categoryRows.map(cat => {
        const categorySlug = createSlug(cat.name);
        return {
          entity_type: 'category',
          entity_id: cat.id,
          url: `/uploads/menu/${categorySlug}/category.jpg`,
          alt_text: `${cat.name} category image`,
          display_order: 0,
          is_primary: true,
          width: 800,
          height: 600,
          mime_type: 'image/jpeg',
          created_at: new Date(),
          updated_at: new Date()
        };
      });

      await queryInterface.bulkInsert('pictures', categoryPictures, { transaction });
      console.log(`✅ ${categoryPictures.length} category pictures inserted`);

      // 5. Insert Pictures for items (all items reference their category's image)
      const itemPictures = [];
      itemRows.forEach((item, index) => {
        const itemData = itemsData[index];
        if (itemData) {
          const categorySlug = createSlug(itemData.category);
          // All items reference their category's image
          // Admin can replace with specific item images later
          itemPictures.push({
            entity_type: 'item',
            entity_id: item.id,
            url: `/uploads/menu/${categorySlug}/category.jpg`,
            alt_text: `${item.name} image`,
            display_order: 0,
            is_primary: true,
            width: 800,
            height: 600,
            mime_type: 'image/jpeg',
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      });

      if (itemPictures.length > 0) {
        await queryInterface.bulkInsert('pictures', itemPictures, { transaction });
        console.log(`✅ ${itemPictures.length} item pictures inserted`);
      }

      await transaction.commit();
      console.log('✅ Menu data seeded successfully!');
      console.log(`📊 Summary: ${categoryRows.length} categories, ${itemRows.length} items, ${itemSizeRecords.length} sizes, ${addOnRecords.length} add-ons, ${categoryPictures.length + itemPictures.length} pictures`);

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error seeding menu data:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Delete in reverse order of dependencies
      // Delete pictures for categories and items
      await queryInterface.sequelize.query(
        `DELETE FROM pictures WHERE entity_type IN ('category', 'item');`,
        { transaction }
      );
      await queryInterface.bulkDelete('item_sizes', null, { transaction });
      await queryInterface.bulkDelete('items', null, { transaction });
      await queryInterface.bulkDelete('category_add_ons', null, { transaction });
      await queryInterface.bulkDelete('add_ons', null, { transaction });
      await queryInterface.bulkDelete('categories', null, { transaction });
      await transaction.commit();
      console.log('✅ Menu data removed successfully');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

