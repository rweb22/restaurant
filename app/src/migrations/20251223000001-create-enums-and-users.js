'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create custom ENUM types
    await queryInterface.sequelize.query(`
      CREATE TYPE user_role AS ENUM ('admin', 'client');
    `);
    
    await queryInterface.sequelize.query(`
      CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
    `);

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      role: {
        type: Sequelize.ENUM('admin', 'client'),
        allowNull: false,
        defaultValue: 'client'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create index on phone
    await queryInterface.addIndex('users', ['phone']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS user_role;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS order_status;');
  }
};

