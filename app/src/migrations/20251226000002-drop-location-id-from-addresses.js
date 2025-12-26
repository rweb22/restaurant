'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if location_id column exists before trying to drop it
    const tableDescription = await queryInterface.describeTable('addresses');
    
    if (tableDescription.location_id) {
      // Drop the index first if it exists
      try {
        await queryInterface.removeIndex('addresses', ['location_id']);
      } catch (error) {
        // Index might not exist, continue
        console.log('Index on location_id does not exist or already removed');
      }
      
      // Drop the column
      await queryInterface.removeColumn('addresses', 'location_id');
    }
  },

  async down(queryInterface, Sequelize) {
    // Re-add location_id column
    await queryInterface.addColumn('addresses', 'location_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    
    // Re-add index
    await queryInterface.addIndex('addresses', ['location_id']);
  }
};

