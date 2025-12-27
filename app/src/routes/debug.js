'use strict';

const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/debug/env
 * @desc    Get environment variables (admin only)
 * @access  Admin
 */
router.get('/env', authenticate, requireAdmin, async (req, res) => {
  try {
    const envInfo = {
      // Application
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      
      // Database (hide password)
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD ? '***HIDDEN***' : 'NOT SET',
      
      // JWT
      JWT_SECRET: process.env.JWT_SECRET ? '***HIDDEN***' : 'NOT SET',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      
      // OTP Service
      USE_MOCK_OTP: process.env.USE_MOCK_OTP,
      OTP_SERVICE_URL: process.env.OTP_SERVICE_URL,
      OTP_SERVICE_API_KEY: process.env.OTP_SERVICE_API_KEY ? '***HIDDEN***' : 'NOT SET',
      OTP_SERVICE_TIMEOUT: process.env.OTP_SERVICE_TIMEOUT,
      OTP_SMS_TEMPLATE_NAME: process.env.OTP_SMS_TEMPLATE_NAME || 'NOT SET',
      
      // CORS
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
      
      // Admin
      ADMIN_PHONE: process.env.ADMIN_PHONE,
      
      // Payment Gateway
      UPIGATEWAY_MERCHANT_KEY: process.env.UPIGATEWAY_MERCHANT_KEY ? '***HIDDEN***' : 'NOT SET',
      UPIGATEWAY_WEBHOOK_SECRET: process.env.UPIGATEWAY_WEBHOOK_SECRET ? '***HIDDEN***' : 'NOT SET',
      UPIGATEWAY_CALLBACK_URL: process.env.UPIGATEWAY_CALLBACK_URL,
      UPIGATEWAY_TEST_MODE: process.env.UPIGATEWAY_TEST_MODE,
      PAYMENT_ENABLED: process.env.PAYMENT_ENABLED,
      PAYMENT_CURRENCY: process.env.PAYMENT_CURRENCY,
      PAYMENT_ORDER_EXPIRY: process.env.PAYMENT_ORDER_EXPIRY,
    };

    res.json({
      success: true,
      data: envInfo
    });
  } catch (error) {
    console.error('Error getting environment variables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get environment variables'
    });
  }
});

/**
 * @route   GET /api/debug/db
 * @desc    Get database connection info and stats (admin only)
 * @access  Admin
 */
router.get('/db', authenticate, requireAdmin, async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();

    // Get database stats
    const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    const [adminCount] = await sequelize.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const [categoryCount] = await sequelize.query('SELECT COUNT(*) as count FROM categories');
    const [itemCount] = await sequelize.query('SELECT COUNT(*) as count FROM items');
    const [orderCount] = await sequelize.query('SELECT COUNT(*) as count FROM orders');
    const [addressCount] = await sequelize.query('SELECT COUNT(*) as count FROM addresses');

    // Get migrations status
    const [migrations] = await sequelize.query('SELECT name FROM "SequelizeMeta" ORDER BY name');

    const dbInfo = {
      connection: {
        status: 'connected',
        host: sequelize.config.host,
        port: sequelize.config.port,
        database: sequelize.config.database,
        username: sequelize.config.username,
        dialect: sequelize.config.dialect
      },
      stats: {
        totalUsers: parseInt(userCount[0].count),
        adminUsers: parseInt(adminCount[0].count),
        categories: parseInt(categoryCount[0].count),
        items: parseInt(itemCount[0].count),
        orders: parseInt(orderCount[0].count),
        addresses: parseInt(addressCount[0].count)
      },
      migrations: {
        total: migrations.length,
        latest: migrations[migrations.length - 1]?.name || 'None',
        all: migrations.map(m => m.name)
      }
    };

    res.json({
      success: true,
      data: dbInfo
    });
  } catch (error) {
    console.error('Error getting database info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get database info',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/debug/users
 * @desc    List all users (admin only)
 * @access  Admin
 */
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const [users] = await sequelize.query(`
      SELECT id, phone, role, name, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: {
        total: users.length,
        users: users
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

module.exports = router;

