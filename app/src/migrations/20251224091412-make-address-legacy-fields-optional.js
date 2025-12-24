'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Make legacy address fields optional since location data is now stored via locationId
    await queryInterface.changeColumn('addresses', 'city', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.changeColumn('addresses', 'state', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.changeColumn('addresses', 'postal_code', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    await queryInterface.changeColumn('addresses', 'country', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: 'India',
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert to making fields required
    await queryInterface.changeColumn('addresses', 'city', {
      type: Sequelize.STRING(100),
      allowNull: false,
    });

    await queryInterface.changeColumn('addresses', 'state', {
      type: Sequelize.STRING(100),
      allowNull: false,
    });

    await queryInterface.changeColumn('addresses', 'postal_code', {
      type: Sequelize.STRING(20),
      allowNull: false,
    });

    await queryInterface.changeColumn('addresses', 'country', {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: 'India',
    });
  }
};
