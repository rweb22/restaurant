'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'out_for_delivery' to the status ENUM
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_orders_status" ADD VALUE IF NOT EXISTS 'out_for_delivery' BEFORE 'completed';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing ENUM values directly
    // This would require recreating the ENUM type, which is complex
    // For now, we'll leave the ENUM value in place
    console.log('Removing ENUM values is not supported in PostgreSQL. The value will remain in the database.');
  }
};

