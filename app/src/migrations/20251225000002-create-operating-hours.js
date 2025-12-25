'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create restaurant_settings table
    await queryInterface.createTable('restaurant_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      is_manually_closed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      manual_closure_reason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      manually_closed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      manually_closed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      minimum_order_value: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      tax_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      estimated_prep_time_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 30
      },
      restaurant_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      restaurant_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      restaurant_address: {
        type: Sequelize.TEXT,
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

    // Add constraint to ensure only one row
    await queryInterface.addConstraint('restaurant_settings', {
      fields: ['id'],
      type: 'check',
      where: {
        id: 1
      },
      name: 'restaurant_settings_single_row'
    });

    // Create operating_hours table
    await queryInterface.createTable('operating_hours', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '0=Sunday, 1=Monday, ..., 6=Saturday'
      },
      open_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      close_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      is_closed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    // Add constraints and indexes for operating_hours
    await queryInterface.addConstraint('operating_hours', {
      fields: ['day_of_week'],
      type: 'check',
      where: {
        day_of_week: {
          [Sequelize.Op.gte]: 0,
          [Sequelize.Op.lte]: 6
        }
      },
      name: 'valid_day_of_week'
    });

    await queryInterface.addConstraint('operating_hours', {
      fields: ['day_of_week', 'open_time'],
      type: 'unique',
      name: 'unique_day_time'
    });

    await queryInterface.addIndex('operating_hours', ['day_of_week']);

    // Create holidays table
    await queryInterface.createTable('holidays', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('holidays', ['date']);

    // Insert default restaurant settings
    await queryInterface.bulkInsert('restaurant_settings', [{
      id: 1,
      restaurant_name: 'My Restaurant',
      restaurant_phone: '+91 9999999999',
      restaurant_address: '123 Main Street, City',
      tax_percentage: 5.0,
      minimum_order_value: 100,
      estimated_prep_time_minutes: 30,
      is_manually_closed: false,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Insert default operating hours (9 AM - 10 PM for all days)
    const defaultHours = [];
    for (let day = 0; day <= 6; day++) {
      defaultHours.push({
        day_of_week: day,
        open_time: '09:00:00',
        close_time: '22:00:00',
        is_closed: false,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    await queryInterface.bulkInsert('operating_hours', defaultHours);

    // Insert sample holidays (Indian holidays for 2025)
    await queryInterface.bulkInsert('holidays', [
      {
        date: '2025-01-26',
        name: 'Republic Day',
        description: 'National Holiday',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        date: '2025-03-14',
        name: 'Holi',
        description: 'Festival of Colors',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        date: '2025-08-15',
        name: 'Independence Day',
        description: 'National Holiday',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        date: '2025-10-02',
        name: 'Gandhi Jayanti',
        description: 'National Holiday',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        date: '2025-10-24',
        name: 'Diwali',
        description: 'Festival of Lights',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        date: '2025-12-25',
        name: 'Christmas',
        description: 'Christmas Day',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('holidays');
    await queryInterface.dropTable('operating_hours');
    await queryInterface.dropTable('restaurant_settings');
  }
};

