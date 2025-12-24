'use strict';

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

/**
 * All notification routes require authentication
 */

// Get user's notifications (with pagination and filters)
router.get('/', authenticate, notificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// Mark all notifications as read
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

// Mark specific notification as read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// Delete notification
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;

