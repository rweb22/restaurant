'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create enum for entity types
    await queryInterface.sequelize.query(`
      CREATE TYPE picture_entity_type AS ENUM ('item', 'category', 'offer', 'user');
    `);

    // Create pictures table
    await queryInterface.createTable('pictures', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      entity_type: {
        type: 'picture_entity_type',
        allowNull: false
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      alt_text: {
        type: Sequelize.STRING(255)
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      width: {
        type: Sequelize.INTEGER
      },
      height: {
        type: Sequelize.INTEGER
      },
      file_size: {
        type: Sequelize.INTEGER
      },
      mime_type: {
        type: Sequelize.STRING(50)
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

    // Create indexes
    await queryInterface.addIndex('pictures', ['entity_type', 'entity_id'], {
      name: 'idx_pictures_entity'
    });

    await queryInterface.addIndex('pictures', ['entity_type', 'entity_id', 'is_primary'], {
      name: 'idx_pictures_primary'
    });

    await queryInterface.addIndex('pictures', ['entity_type', 'entity_id', 'display_order'], {
      name: 'idx_pictures_display_order'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('pictures');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS picture_entity_type;');
  }
};
