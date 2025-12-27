'use strict';

const { Expo } = require('expo-server-sdk');
const { User } = require('../models');
const logger = require('../utils/logger');

class PushNotificationService {
  constructor() {
    // Create a new Expo SDK client
    this.expo = new Expo();
  }

  /**
   * Send push notification to specific users
   * @param {Array<number>} userIds - Array of user IDs to send notification to
   * @param {object} notification - Notification object with title, body, and data
   * @returns {Promise<object>} - Result of sending push notifications
   */
  async sendPushNotification(userIds, notification) {
    try {
      if (!userIds || userIds.length === 0) {
        logger.warn('No user IDs provided for push notification');
        return { success: false, error: 'No recipients' };
      }

      // Get push tokens for all users
      const users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'pushToken']
      });

      // Filter users with valid push tokens
      const pushTokens = users
        .filter(user => user.pushToken && Expo.isExpoPushToken(user.pushToken))
        .map(user => user.pushToken);

      if (pushTokens.length === 0) {
        logger.warn('No valid push tokens found for users:', userIds);
        return { success: false, error: 'No valid push tokens' };
      }

      // Create messages for Expo Push API
      const messages = pushTokens.map(pushToken => ({
        to: pushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: 'high',
        channelId: 'default'
      }));

      // Send notifications in chunks (Expo recommends max 100 per request)
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          logger.error('Error sending push notification chunk:', error);
        }
      }

      // Log results
      const successCount = tickets.filter(ticket => ticket.status === 'ok').length;
      const errorCount = tickets.filter(ticket => ticket.status === 'error').length;

      logger.info(`Push notifications sent: ${successCount} successful, ${errorCount} failed`);

      return {
        success: true,
        sent: successCount,
        failed: errorCount,
        tickets
      };
    } catch (error) {
      logger.error('Error in sendPushNotification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register or update push token for a user
   * @param {number} userId - User ID
   * @param {string} pushToken - Expo push token
   * @returns {Promise<boolean>}
   */
  async registerPushToken(userId, pushToken) {
    try {
      if (!pushToken) {
        logger.warn('No push token provided for user:', userId);
        return false;
      }

      // Validate the push token
      if (!Expo.isExpoPushToken(pushToken)) {
        logger.warn('Invalid Expo push token:', pushToken);
        return false;
      }

      // Update user's push token
      await User.update(
        { pushToken },
        { where: { id: userId } }
      );

      logger.info(`Push token registered for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error registering push token:', error);
      return false;
    }
  }

  /**
   * Remove push token for a user (on logout)
   * @param {number} userId - User ID
   * @returns {Promise<boolean>}
   */
  async removePushToken(userId) {
    try {
      await User.update(
        { pushToken: null },
        { where: { id: userId } }
      );

      logger.info(`Push token removed for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error removing push token:', error);
      return false;
    }
  }
}

module.exports = new PushNotificationService();

