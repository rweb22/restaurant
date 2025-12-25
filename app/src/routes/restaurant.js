'use strict';

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public routes
router.get('/status', restaurantController.getStatus);
router.get('/info', restaurantController.getInfo);
router.get('/hours', restaurantController.getOperatingHours);

// Admin routes - require authentication and admin role
router.get('/settings', authenticate, requireRole(['admin']), restaurantController.getSettings);
router.put('/settings', authenticate, requireRole(['admin']), restaurantController.updateSettings);
router.post('/manual-close', authenticate, requireRole(['admin']), restaurantController.manualClose);
router.post('/manual-open', authenticate, requireRole(['admin']), restaurantController.manualOpen);
router.put('/operating-hours/:day', authenticate, requireRole(['admin']), restaurantController.updateOperatingHoursForDay);
router.get('/holidays', authenticate, requireRole(['admin']), restaurantController.getHolidays);
router.post('/holidays', authenticate, requireRole(['admin']), restaurantController.createHoliday);
router.put('/holidays/:id', authenticate, requireRole(['admin']), restaurantController.updateHoliday);
router.delete('/holidays/:id', authenticate, requireRole(['admin']), restaurantController.deleteHoliday);

module.exports = router;

