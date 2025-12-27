'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'push_token', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Expo push notification token for the user device'
    });

    // Add index for faster lookups when sending push notifications
    await queryInterface.addIndex('users', ['push_token'], {
      name: 'users_push_token_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_push_token_idx');
    await queryInterface.removeColumn('users', 'push_token');
  }
};

