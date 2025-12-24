'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert admin user
    await queryInterface.bulkInsert('users', [
      {
        phone: process.env.ADMIN_PHONE || '+1234567890',
        role: 'admin',
        name: 'Admin User',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Insert sample categories
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Pizza',
        description: 'Delicious handcrafted pizzas with fresh ingredients',
        is_available: true,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Noodles',
        description: 'Asian-style noodles with various flavors',
        is_available: true,
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Burgers',
        description: 'Juicy burgers with premium ingredients',
        is_available: true,
        display_order: 3,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Insert sample add-ons
    await queryInterface.bulkInsert('add_ons', [
      {
        name: 'Extra Cheese',
        description: 'Additional cheese topping',
        price: 50.00,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Jalapeños',
        description: 'Spicy jalapeño peppers',
        price: 30.00,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Olives',
        description: 'Black or green olives',
        price: 40.00,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Mushrooms',
        description: 'Fresh sliced mushrooms',
        price: 45.00,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Extra Sauce',
        description: 'Additional sauce portion',
        price: 20.00,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('add_ons', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};

