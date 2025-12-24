const { sequelize, Item, ItemSize, CategoryAddOn, ItemAddOn } = require('../src/models');

async function addSampleMenuData() {
  try {
    console.log('Adding sample menu data...');

    // Update existing items with prices and images
    const items = [
      {
        id: 1,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        base_price: 299,
        categoryId: 1,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      },
      {
        id: 2,
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni with mozzarella cheese and tomato sauce',
        base_price: 349,
        categoryId: 1,
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
      },
      {
        id: 3,
        name: 'BBQ Chicken Pizza',
        description: 'Grilled chicken with BBQ sauce and red onions',
        base_price: 399,
        categoryId: 1,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      },
      {
        id: 4,
        name: 'Veggie Supreme Pizza',
        description: 'Loaded with fresh vegetables and herbs',
        base_price: 329,
        categoryId: 1,
        imageUrl: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400',
      },
      {
        id: 5,
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, and special sauce',
        base_price: 179,
        categoryId: 2,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      },
      {
        id: 6,
        name: 'Cheese Burger',
        description: 'Classic burger with extra cheese and crispy bacon',
        base_price: 229,
        categoryId: 2,
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
      },
    ];

    // Upsert items
    for (const itemData of items) {
      const { base_price, ...itemFields } = itemData;
      await Item.upsert(itemFields);
      console.log(`✓ Added/Updated: ${itemData.name}`);

      // Add sizes for this item
      const sizes = [
        { size: 'small', price: itemData.base_price },
        { size: 'medium', price: itemData.base_price + 50 },
        { size: 'large', price: itemData.base_price + 100 },
      ];

      for (const sizeData of sizes) {
        await ItemSize.upsert({
          itemId: itemData.id,
          size: sizeData.size,
          price: sizeData.price,
          isAvailable: true,
        });
      }
      console.log(`✓ Added sizes for: ${itemData.name}`);
    }

    // Link add-ons to categories
    const categoryAddOns = [
      { categoryId: 1, addOnId: 1 }, // Pizza - Extra Cheese
      { categoryId: 1, addOnId: 2 }, // Pizza - Pepperoni
      { categoryId: 1, addOnId: 3 }, // Pizza - Mushrooms
      { categoryId: 2, addOnId: 1 }, // Burgers - Extra Cheese
    ];

    for (const caData of categoryAddOns) {
      await CategoryAddOn.findOrCreate({
        where: caData,
        defaults: caData,
      });
    }
    console.log('✓ Added category add-ons');

    // Link add-ons to individual items
    const itemAddOns = [
      // Pizzas (items 1-4) get Extra Cheese, Pepperoni, Mushrooms
      { itemId: 1, addOnId: 1 },
      { itemId: 1, addOnId: 2 },
      { itemId: 1, addOnId: 3 },
      { itemId: 2, addOnId: 1 },
      { itemId: 2, addOnId: 2 },
      { itemId: 2, addOnId: 3 },
      { itemId: 3, addOnId: 1 },
      { itemId: 3, addOnId: 2 },
      { itemId: 3, addOnId: 3 },
      { itemId: 4, addOnId: 1 },
      { itemId: 4, addOnId: 2 },
      { itemId: 4, addOnId: 3 },
      // Burgers (items 5-6) get Extra Cheese
      { itemId: 5, addOnId: 1 },
      { itemId: 6, addOnId: 1 },
    ];

    for (const iaData of itemAddOns) {
      await ItemAddOn.findOrCreate({
        where: iaData,
        defaults: iaData,
      });
    }
    console.log('✓ Added item add-ons');

    console.log('\n✅ Sample menu data added successfully!');
    console.log('\nSummary:');
    console.log(`- ${items.length} items with prices and images`);
    console.log(`- ${items.length * 3} item sizes (small, medium, large)`);
    console.log(`- ${categoryAddOns.length} category add-on associations`);
    console.log(`- ${itemAddOns.length} item add-on associations`);

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await sequelize.close();
  }
}

addSampleMenuData();

