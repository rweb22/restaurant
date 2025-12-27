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
    const startTime = Date.now();
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('📱 PUSH NOTIFICATION REQUEST');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`📋 Target User IDs: [${userIds.join(', ')}]`);
    logger.info(`📝 Title: "${notification.title}"`);
    logger.info(`💬 Body: "${notification.body}"`);
    logger.info(`📦 Data:`, JSON.stringify(notification.data, null, 2));

    try {
      if (!userIds || userIds.length === 0) {
        logger.warn('❌ No user IDs provided for push notification');
        return { success: false, error: 'No recipients' };
      }

      // Get push tokens for all users
      logger.info(`🔍 Fetching push tokens for ${userIds.length} user(s)...`);
      const users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'pushToken', 'name', 'phone']
      });

      logger.info(`📊 Found ${users.length} user(s) in database:`);
      users.forEach(user => {
        const hasToken = user.pushToken ? '✅' : '❌';
        const isValid = user.pushToken && Expo.isExpoPushToken(user.pushToken) ? '✅' : '❌';
        logger.info(`   ${hasToken} User #${user.id} (${user.name || 'No name'}) - Token: ${isValid} ${user.pushToken ? 'Valid' : 'Missing/Invalid'}`);
      });

      // Filter users with valid push tokens
      const usersWithTokens = users.filter(user => user.pushToken && Expo.isExpoPushToken(user.pushToken));
      const pushTokens = usersWithTokens.map(user => user.pushToken);

      if (pushTokens.length === 0) {
        logger.warn('❌ No valid push tokens found for users:', userIds);
        logger.warn('💡 Users need to log in on a physical device to register push tokens');
        return { success: false, error: 'No valid push tokens' };
      }

      logger.info(`✅ Found ${pushTokens.length} valid push token(s)`);
      logger.info(`📤 Preparing to send push notifications...`);

      // Create messages for Expo Push API
      const messages = pushTokens.map((pushToken, index) => {
        const user = usersWithTokens[index];
        logger.info(`📨 Message #${index + 1} for User #${user.id} (${user.name})`);
        return {
          to: pushToken,
          sound: 'default',
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          priority: 'high',
          channelId: 'default'
        };
      });

      logger.info(`📮 Total messages prepared: ${messages.length}`);

      // Send notifications in chunks (Expo recommends max 100 per request)
      const chunks = this.expo.chunkPushNotifications(messages);
      logger.info(`📦 Split into ${chunks.length} chunk(s) for sending`);

      const tickets = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        logger.info(`🚀 Sending chunk ${i + 1}/${chunks.length} (${chunk.length} messages)...`);
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          logger.info(`✅ Chunk ${i + 1} sent successfully`);

          // Log individual ticket results
          ticketChunk.forEach((ticket, idx) => {
            if (ticket.status === 'error') {
              logger.error(`   ❌ Message ${idx + 1}: ${ticket.message} (${ticket.details?.error || 'Unknown error'})`);
            } else {
              logger.info(`   ✅ Message ${idx + 1}: Queued with ID ${ticket.id}`);
            }
          });
        } catch (error) {
          logger.error(`❌ Error sending chunk ${i + 1}:`, error.message);
          logger.error('   Stack:', error.stack);
        }
      }

      // Log results
      const successCount = tickets.filter(ticket => ticket.status === 'ok').length;
      const errorCount = tickets.filter(ticket => ticket.status === 'error').length;
      const duration = Date.now() - startTime;

      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('📊 PUSH NOTIFICATION RESULTS');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info(`✅ Successful: ${successCount}`);
      logger.info(`❌ Failed: ${errorCount}`);
      logger.info(`⏱️  Duration: ${duration}ms`);
      logger.info(`📋 Recipients:`);
      usersWithTokens.forEach(user => {
        logger.info(`   - User #${user.id}: ${user.name} (${user.phone})`);
      });
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return {
        success: true,
        sent: successCount,
        failed: errorCount,
        tickets,
        recipients: usersWithTokens.map(u => ({ id: u.id, name: u.name, phone: u.phone }))
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.error('❌ PUSH NOTIFICATION ERROR');
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.error('Error in sendPushNotification:', error.message);
      logger.error('Stack:', error.stack);
      logger.error(`⏱️  Duration: ${duration}ms`);
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🔐 PUSH TOKEN REGISTRATION');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`👤 User ID: ${userId}`);
    logger.info(`🎫 Token: ${pushToken}`);

    try {
      if (!pushToken) {
        logger.warn('❌ No push token provided for user:', userId);
        return false;
      }

      // Validate the push token
      const isValid = Expo.isExpoPushToken(pushToken);
      logger.info(`✅ Token validation: ${isValid ? 'VALID' : 'INVALID'}`);

      if (!isValid) {
        logger.warn('❌ Invalid Expo push token format');
        return false;
      }

      // Get user info
      const user = await User.findByPk(userId, { attributes: ['id', 'name', 'phone', 'pushToken'] });
      if (user) {
        logger.info(`📋 User: ${user.name} (${user.phone})`);
        if (user.pushToken && user.pushToken !== pushToken) {
          logger.info(`🔄 Updating existing token (was: ${user.pushToken.substring(0, 20)}...)`);
        } else if (user.pushToken === pushToken) {
          logger.info(`ℹ️  Token already registered (no change)`);
        } else {
          logger.info(`🆕 Registering new token`);
        }
      }

      // Update user's push token
      await User.update(
        { pushToken },
        { where: { id: userId } }
      );

      logger.info(`✅ Push token successfully registered for user ${userId}`);
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return true;
    } catch (error) {
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.error('❌ Error registering push token:', error.message);
      logger.error('Stack:', error.stack);
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return false;
    }
  }

  /**
   * Remove push token for a user (on logout)
   * @param {number} userId - User ID
   * @returns {Promise<boolean>}
   */
  async removePushToken(userId) {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🗑️  PUSH TOKEN REMOVAL');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`👤 User ID: ${userId}`);

    try {
      const user = await User.findByPk(userId, { attributes: ['id', 'name', 'phone', 'pushToken'] });
      if (user) {
        logger.info(`📋 User: ${user.name} (${user.phone})`);
        if (user.pushToken) {
          logger.info(`🎫 Removing token: ${user.pushToken.substring(0, 20)}...`);
        } else {
          logger.info(`ℹ️  No token to remove (already null)`);
        }
      }

      await User.update(
        { pushToken: null },
        { where: { id: userId } }
      );

      logger.info(`✅ Push token removed for user ${userId}`);
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return true;
    } catch (error) {
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.error('❌ Error removing push token:', error.message);
      logger.error('Stack:', error.stack);
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return false;
    }
  }
}

module.exports = new PushNotificationService();

