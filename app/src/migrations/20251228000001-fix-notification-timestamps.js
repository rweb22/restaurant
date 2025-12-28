'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update all notifications with NULL created_at to use current timestamp
    await queryInterface.sequelize.query(`
      UPDATE notifications
      SET created_at = CURRENT_TIMESTAMP
      WHERE created_at IS NULL;
    `);

    // Ensure created_at has NOT NULL constraint and default value
    await queryInterface.changeColumn('notifications', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert to allow NULL (though this shouldn't be needed)
    await queryInterface.changeColumn('notifications', 'created_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }
};

