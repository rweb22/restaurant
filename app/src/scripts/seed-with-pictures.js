const { sequelize, User, Location, Category, Item, ItemSize, AddOn, CategoryAddOn, ItemAddOn, Offer, Picture } = require('../models');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UNSPLASH_IMAGES = {
  pizza: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f'
  ],
  burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    'https://images.unsplash.com/photo-1550547660-d9450f859349'
  ],
  noodles: [
    'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624'
  ]
};

async function downloadImage(url, filename) {
  try {
    const response = await axios.get(url + '?w=800&q=80', {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const uploadsDir = path.join(__dirname, '../../uploads/pictures');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, response.data);
    
    return {
      url: `/uploads/pictures/${filename}`,
      fileSize: response.data.length,
      mimeType: response.headers['content-type'] || 'image/jpeg'
    };
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return null;
  }
}

async function seed() {
  try {
    console.log('🌱 Starting database seed with pictures...\n');

    // Create admin user
    const admin = await User.create({
      phone: '+919876543210',
      role: 'admin',
      name: 'Admin User'
    });
    console.log('✅ Created admin user');

    // Create client user
    const client = await User.create({
      phone: '+919876543211',
      role: 'client',
      name: 'Test Client'
    });
    console.log('✅ Created client user');

    // Create locations
    const location1 = await Location.create({
      name: 'Sector 17, Chandigarh',
      area: 'Sector 17',
      city: 'Chandigarh',
      pincode: '160017',
      deliveryCharge: 0,
      estimatedDeliveryTime: 30,
      isAvailable: true
    });

    const location2 = await Location.create({
      name: 'Sector 22, Chandigarh',
      area: 'Sector 22',
      city: 'Chandigarh',
      pincode: '160022',
      deliveryCharge: 30,
      estimatedDeliveryTime: 45,
      isAvailable: true
    });
    console.log('✅ Created locations');

    // Create categories
    const pizzaCategory = await Category.create({
      name: 'Pizza',
      description: 'Delicious pizzas with various toppings',
      isAvailable: true,
      displayOrder: 1,
      gstRate: 5
    });

    const noodlesCategory = await Category.create({
      name: 'Noodles',
      description: 'Asian style noodles',
      isAvailable: true,
      displayOrder: 2,
      gstRate: 5
    });

    const burgersCategory = await Category.create({
      name: 'Burgers',
      description: 'Juicy burgers with fresh ingredients',
      isAvailable: true,
      displayOrder: 3,
      gstRate: 5
    });
    console.log('✅ Created categories');

    // Create add-ons
    const extraCheese = await AddOn.create({
      name: 'Extra Cheese',
      description: 'Additional cheese topping',
      price: 50,
      isAvailable: true
    });

    const jalapeños = await AddOn.create({
      name: 'Jalapeños',
      description: 'Spicy jalapeño peppers',
      price: 30,
      isAvailable: true
    });

    const olives = await AddOn.create({
      name: 'Olives',
      description: 'Black olives',
      price: 40,
      isAvailable: true
    });
    console.log('✅ Created add-ons');

    // Associate add-ons with categories
    await CategoryAddOn.create({ categoryId: pizzaCategory.id, addOnId: extraCheese.id });
    await CategoryAddOn.create({ categoryId: pizzaCategory.id, addOnId: jalapeños.id });
    await CategoryAddOn.create({ categoryId: pizzaCategory.id, addOnId: olives.id });
    console.log('✅ Associated add-ons with categories');

    console.log('\n📸 Downloading and creating pictures...\n');

    // Create pizzas with pictures
    const pizzas = [
      { name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce, mozzarella, and basil', imageIndex: 0 },
      { name: 'Pepperoni Pizza', description: 'Loaded with pepperoni and cheese', imageIndex: 1 },
      { name: 'BBQ Chicken Pizza', description: 'BBQ sauce, chicken, onions, and cilantro', imageIndex: 2 },
      { name: 'Veggie Supreme Pizza', description: 'Loaded with fresh vegetables', imageIndex: 3 }
    ];

    for (const [index, pizzaData] of pizzas.entries()) {
      const item = await Item.create({
        categoryId: pizzaCategory.id,
        name: pizzaData.name,
        description: pizzaData.description,
        isAvailable: true,
        dietaryTags: [],
        displayOrder: index + 1
      });

      await ItemSize.bulkCreate([
        { itemId: item.id, size: 'small', price: 199, isAvailable: true },
        { itemId: item.id, size: 'medium', price: 349, isAvailable: true },
        { itemId: item.id, size: 'large', price: 499, isAvailable: true }
      ]);

      // Download and create picture
      const imageUrl = UNSPLASH_IMAGES.pizza[pizzaData.imageIndex];
      const filename = `pizza-${item.id}-${crypto.randomBytes(8).toString('hex')}.jpg`;
      const imageData = await downloadImage(imageUrl, filename);
      
      if (imageData) {
        await Picture.create({
          entityType: 'item',
          entityId: item.id,
          url: imageData.url,
          altText: pizzaData.name,
          displayOrder: 0,
          isPrimary: true,
          fileSize: imageData.fileSize,
          mimeType: imageData.mimeType
        });
        console.log(`  ✅ ${pizzaData.name} with picture`);
      }
    }

    console.log('✅ Created pizzas with pictures\n');

    // Create noodles with pictures
    const noodles = [
      { name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables', imageIndex: 0 },
      { name: 'Schezwan Noodles', description: 'Spicy Schezwan sauce noodles', imageIndex: 1 },
      { name: 'Chow Mein', description: 'Classic Chinese stir-fried noodles', imageIndex: 2 }
    ];

    for (const [index, noodleData] of noodles.entries()) {
      const item = await Item.create({
        categoryId: noodlesCategory.id,
        name: noodleData.name,
        description: noodleData.description,
        isAvailable: true,
        dietaryTags: [],
        displayOrder: index + 1
      });

      await ItemSize.bulkCreate([
        { itemId: item.id, size: 'small', price: 120, isAvailable: true },
        { itemId: item.id, size: 'medium', price: 180, isAvailable: true },
        { itemId: item.id, size: 'large', price: 250, isAvailable: true }
      ]);

      // Download and create picture
      const imageUrl = UNSPLASH_IMAGES.noodles[noodleData.imageIndex];
      const filename = `noodles-${item.id}-${crypto.randomBytes(8).toString('hex')}.jpg`;
      const imageData = await downloadImage(imageUrl, filename);

      if (imageData) {
        await Picture.create({
          entityType: 'item',
          entityId: item.id,
          url: imageData.url,
          altText: noodleData.name,
          displayOrder: 0,
          isPrimary: true,
          fileSize: imageData.fileSize,
          mimeType: imageData.mimeType
        });
        console.log(`  ✅ ${noodleData.name} with picture`);
      }
    }

    console.log('✅ Created noodles with pictures\n');

    // Create burgers with pictures
    const burgers = [
      { name: 'Classic Burger', description: 'Beef patty with lettuce, tomato, and cheese', imageIndex: 0 },
      { name: 'Cheese Burger', description: 'Double cheese with beef patty', imageIndex: 1 }
    ];

    for (const [index, burgerData] of burgers.entries()) {
      const item = await Item.create({
        categoryId: burgersCategory.id,
        name: burgerData.name,
        description: burgerData.description,
        isAvailable: true,
        dietaryTags: [],
        displayOrder: index + 1
      });

      await ItemSize.bulkCreate([
        { itemId: item.id, size: 'small', price: 99, isAvailable: true },
        { itemId: item.id, size: 'medium', price: 149, isAvailable: true },
        { itemId: item.id, size: 'large', price: 199, isAvailable: true }
      ]);

      // Download and create picture
      const imageUrl = UNSPLASH_IMAGES.burger[burgerData.imageIndex];
      const filename = `burger-${item.id}-${crypto.randomBytes(8).toString('hex')}.jpg`;
      const imageData = await downloadImage(imageUrl, filename);

      if (imageData) {
        await Picture.create({
          entityType: 'item',
          entityId: item.id,
          url: imageData.url,
          altText: burgerData.name,
          displayOrder: 0,
          isPrimary: true,
          fileSize: imageData.fileSize,
          mimeType: imageData.mimeType
        });
        console.log(`  ✅ ${burgerData.name} with picture`);
      }
    }

    console.log('✅ Created burgers with pictures\n');

    // Create an offer
    await Offer.create({
      code: 'WELCOME50',
      title: 'Welcome Offer',
      description: 'Get 50 rupees off on your first order',
      discountType: 'flat',
      discountValue: 50,
      minOrderValue: 200,
      firstOrderOnly: true,
      isActive: true
    });
    console.log('✅ Created offer');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('  - 2 users (1 admin, 1 client)');
    console.log('  - 2 locations');
    console.log('  - 3 categories');
    console.log('  - 9 items (4 pizzas, 3 noodles, 2 burgers)');
    console.log('  - 9 pictures (downloaded from Unsplash)');
    console.log('  - 3 add-ons');
    console.log('  - 1 offer\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

