'use strict';

const { Notification, User, Order } = require('../models');
const notificationTemplates = require('../config/notificationTemplates');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class NotificationService {
  /**
   * Create a notification
   * @param {string} templateName - Template name (e.g., 'ORDER_CREATED')
   * @param {object} data - Data for rendering the notification
   * @returns {Promise<Notification|null>}
   */
  async createNotification(templateName, data) {
    try {
      const template = notificationTemplates[templateName];
      
      if (!template) {
        logger.error(`Invalid notification template: ${templateName}`);
        return null;
      }

      // Get recipients (can be user IDs or 'admin')
      const recipients = template.getRecipients(data);
      
      // Resolve admin to actual admin user ID
      const resolvedRecipients = await this._resolveRecipients(recipients);
      
      if (resolvedRecipients.length === 0) {
        logger.warn(`No recipients found for notification template: ${templateName}`);
        return null;
      }

      // Render message
      const message = template.getMessage(data);
      
      // Create notifications for all recipients
      const notifications = await Promise.all(
        resolvedRecipients.map(userId =>
          Notification.create({
            userId,
            template: template.template,
            title: template.title,
            message,
            data,
            orderId: data.orderId || null
          })
        )
      );

      logger.info(`Created ${notifications.length} notification(s) for template: ${templateName}`);
      return notifications.length === 1 ? notifications[0] : notifications;
    } catch (error) {
      logger.error(`Error creating notification: ${error.message}`, { templateName, data });
      // Don't throw - notifications should not break the main flow
      return null;
    }
  }

  /**
   * Resolve recipients (convert 'admin' to actual admin user ID)
   * @param {Array<number|string>} recipients - Array of user IDs or 'admin'
   * @returns {Promise<Array<number>>}
   */
  async _resolveRecipients(recipients) {
    const resolvedIds = [];
    
    for (const recipient of recipients) {
      if (recipient === 'admin') {
        // Find admin user
        const adminUser = await User.findOne({ where: { role: 'admin' } });
        if (adminUser) {
          resolvedIds.push(adminUser.id);
        }
      } else if (typeof recipient === 'number') {
        resolvedIds.push(recipient);
      }
    }
    
    return resolvedIds;
  }

  /**
   * Get notifications for a user
   * @param {number} userId - User ID
   * @param {object} options - Query options (page, limit, isRead, orderId)
   * @returns {Promise<object>} - Notifications with pagination
   */
  async getUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      isRead = 'all', // 'true', 'false', 'all'
      orderId = null
    } = options;

    const where = { userId };
    
    // Filter by read status
    if (isRead === 'true') {
      where.isRead = true;
    } else if (isRead === 'false') {
      where.isRead = false;
    }
    
    // Filter by order
    if (orderId) {
      where.orderId = orderId;
    }

    const offset = (page - 1) * Math.min(limit, 100);
    const actualLimit = Math.min(limit, 100);

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: actualLimit,
      offset,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'status', 'totalPrice']
        }
      ]
    });

    return {
      notifications: rows.map(n => n.toSafeObject()),
      pagination: {
        page,
        limit: actualLimit,
        total: count,
        totalPages: Math.ceil(count / actualLimit)
      }
    };
  }

  /**
   * Get unread notification count for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    return await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  /**
   * Mark a notification as read
   * @param {number} notificationId - Notification ID
   * @param {number} userId - User ID (for ownership check)
   * @returns {Promise<Notification|null>}
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      return null;
    }

    if (notification.isRead) {
      return notification; // Already read
    }

    await notification.update({
      isRead: true,
      readAt: new Date()
    });

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>} - Number of notifications updated
   */
  async markAllAsRead(userId) {
    const [updatedCount] = await Notification.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          userId,
          isRead: false
        }
      }
    );

    return updatedCount;
  }

  /**
   * Delete a notification
   * @param {number} notificationId - Notification ID
   * @param {number} userId - User ID (for ownership check)
   * @returns {Promise<boolean>}
   */
  async deleteNotification(notificationId, userId) {
    const deleted = await Notification.destroy({
      where: { id: notificationId, userId }
    });

    return deleted > 0;
  }

  /**
   * Clean up old notifications (older than 30 days)
   * @returns {Promise<number>} - Number of notifications deleted
   */
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await Notification.destroy({
        where: {
          createdAt: {
            [Op.lt]: thirtyDaysAgo
          }
        }
      });

      logger.info(`Cleaned up ${deleted} old notifications (older than 30 days)`);
      return deleted;
    } catch (error) {
      logger.error(`Error cleaning up old notifications: ${error.message}`);
      return 0;
    }
  }
}

module.exports = new NotificationService();

