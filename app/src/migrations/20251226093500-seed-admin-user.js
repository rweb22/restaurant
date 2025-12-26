'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if admin user already exists
    const [results] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE phone = '${process.env.ADMIN_PHONE || '+911234567890'}';`
    );

    // Only insert if admin doesn't exist
    if (results.length === 0) {
      await queryInterface.bulkInsert('users', [
        {
          phone: process.env.ADMIN_PHONE || '+911234567890',
          role: 'admin',
          name: 'Admin User',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️  Admin user already exists, skipping...');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the admin user
    await queryInterface.bulkDelete('users', {
      phone: process.env.ADMIN_PHONE || '+911234567890'
    }, {});
  }
};

