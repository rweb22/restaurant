'use strict';

const notificationService = require('../services/notificationService');
const { Notification, User, Order } = require('../models');
const logger = require('../utils/logger');

/**
 * Get user's notifications
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, isRead, orderId } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      isRead: isRead || 'all',
      orderId: orderId ? parseInt(orderId) : null
    };

    const result = await notificationService.getUserNotifications(userId, options);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`Error fetching notifications: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_NOTIFICATIONS_ERROR',
        message: 'Failed to fetch notifications'
      }
    });
  }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error(`Error fetching unread count: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_UNREAD_COUNT_ERROR',
        message: 'Failed to fetch unread count'
      }
    });
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id);

    const notification = await notificationService.markAsRead(notificationId, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: notification.toSafeObject()
    });
  } catch (error) {
    logger.error(`Error marking notification as read: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'MARK_READ_ERROR',
        message: 'Failed to mark notification as read'
      }
    });
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedCount = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      data: { updated: updatedCount }
    });
  } catch (error) {
    logger.error(`Error marking all notifications as read: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'MARK_ALL_READ_ERROR',
        message: 'Failed to mark all notifications as read'
      }
    });
  }
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id);

    const deleted = await notificationService.deleteNotification(notificationId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting notification: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_NOTIFICATION_ERROR',
        message: 'Failed to delete notification'
      }
    });
  }
};

/**
 * Get all notifications (Admin only)
 * GET /api/notifications/all
 */
const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50, isRead, userId, type } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (userId) where.userId = parseInt(userId);
    if (type) where.type = type;

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'role'],
          where: { role: 'admin' }, // Only get notifications for admin users
          required: true // Inner join to ensure we only get admin notifications
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'status', 'totalPrice']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`Error fetching all notifications: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ALL_NOTIFICATIONS_ERROR',
        message: 'Failed to fetch all notifications'
      }
    });
  }
};

module.exports = {
  getAllNotifications,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

