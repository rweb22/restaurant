'use strict';

const { admin, isInitialized } = require('../config/firebase');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Validate FCM token format
 * FCM tokens are typically 152+ characters long
 * @param {string} token - Token to validate
 * @returns {boolean}
 */
const isFCMToken = (token) => {
  return token && typeof token === 'string' && token.length >= 140;
};

class PushNotificationService {
  constructor() {
    // Firebase Admin SDK is initialized in config/firebase.js
    this.messaging = isInitialized() ? admin.messaging() : null;

    if (!this.messaging) {
      logger.warn('⚠️  Firebase not initialized - push notifications will not work');
    }
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
        const isValid = user.pushToken && isFCMToken(user.pushToken) ? '✅' : '❌';
        logger.info(`   ${hasToken} User #${user.id} (${user.name || 'No name'}) - Token: ${isValid} ${user.pushToken ? 'Valid' : 'Missing/Invalid'}`);
      });

      // Filter users with valid push tokens
      const usersWithTokens = users.filter(user => user.pushToken && isFCMToken(user.pushToken));
      const pushTokens = usersWithTokens.map(user => user.pushToken);

      if (pushTokens.length === 0) {
        logger.warn('❌ No valid push tokens found for users:', userIds);
        logger.warn('💡 Users need to log in on a physical device to register push tokens');
        return { success: false, error: 'No valid push tokens' };
      }

      logger.info(`✅ Found ${pushTokens.length} valid push token(s)`);
      logger.info(`📤 Preparing to send push notifications via Firebase...`);

      // Check if Firebase is initialized
      if (!this.messaging) {
        logger.error('❌ Firebase not initialized - cannot send notifications');
        logger.error('💡 Please configure Firebase service account in .env');
        return { success: false, error: 'Firebase not initialized' };
      }

      // Log each recipient
      usersWithTokens.forEach((user, index) => {
        logger.info(`📨 Recipient #${index + 1}: User #${user.id} (${user.name})`);
      });

      // Prepare Firebase multicast message
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data ? Object.fromEntries(
          Object.entries(notification.data).map(([key, value]) => [key, String(value)])
        ) : {},
        tokens: pushTokens,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default'
          }
        }
      };

      logger.info(`📮 Sending to ${pushTokens.length} device(s)...`);

      // Send via Firebase Cloud Messaging
      try {
        const response = await this.messaging.sendEachForMulticast(message);

        logger.info(`✅ Firebase response received`);
        logger.info(`   Success count: ${response.successCount}`);
        logger.info(`   Failure count: ${response.failureCount}`);

        // Log individual results
        response.responses.forEach((resp, idx) => {
          const user = usersWithTokens[idx];
          if (resp.success) {
            logger.info(`   ✅ Message ${idx + 1} sent to User #${user.id} (${user.name})`);
          } else {
            logger.error(`   ❌ Message ${idx + 1} failed for User #${user.id}: ${resp.error?.message || 'Unknown error'}`);
            logger.error(`      Error code: ${resp.error?.code || 'N/A'}`);
          }
        });

        const duration = Date.now() - startTime;

        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('📊 PUSH NOTIFICATION RESULTS');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info(`✅ Successful: ${response.successCount}`);
        logger.info(`❌ Failed: ${response.failureCount}`);
        logger.info(`⏱️  Duration: ${duration}ms`);
        logger.info(`📋 Recipients:`);
        usersWithTokens.forEach(user => {
          logger.info(`   - User #${user.id}: ${user.name} (${user.phone})`);
        });
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return {
          success: true,
          sent: response.successCount,
          failed: response.failureCount,
          responses: response.responses,
          recipients: usersWithTokens.map(u => ({ id: u.id, name: u.name, phone: u.phone }))
        };
      } catch (sendError) {
        logger.error(`❌ Error sending via Firebase: ${sendError.message}`);
        logger.error('   Stack:', sendError.stack);
        throw sendError;
      }
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
   * @param {string} pushToken - FCM push token
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

      // Validate the push token (FCM tokens are 152+ chars)
      const isValid = isFCMToken(pushToken);
      logger.info(`✅ Token validation: ${isValid ? 'VALID FCM TOKEN' : 'INVALID'}`);
      logger.info(`   Token length: ${pushToken.length} chars (FCM tokens are typically 152+ chars)`);

      if (!isValid) {
        logger.warn('❌ Invalid FCM push token format');
        logger.warn('   Expected: 152+ character alphanumeric string');
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

