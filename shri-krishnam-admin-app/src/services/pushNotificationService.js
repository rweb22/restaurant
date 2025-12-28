import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import api from './api';

class PushNotificationService {
  /**
   * Create Android notification channel
   * Required for Android 8.0+ to show notifications with sound/vibration
   * Uses notifee for advanced channel configuration
   */
  async createNotificationChannel() {
    if (Platform.OS === 'android') {
      try {
        console.log('📱 Creating Android notification channel...');

        // Dynamically import notifee to avoid build-time issues
        const notifee = require('@notifee/react-native').default;
        const { AndroidImportance } = require('@notifee/react-native');

        await notifee.createChannel({
          id: 'default',
          name: 'Default Notifications',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500],
        });

        console.log('✅ Android notification channel created');
      } catch (error) {
        console.error('❌ Error creating notification channel:', error);
        console.error('   This is expected if @notifee/react-native is not installed');
      }
    }
  }
  /**
   * Get FCM push token without registering with backend
   * @returns {Promise<string|null>} - FCM push token or null if failed
   */
  async getPushToken() {
    try {
      console.log('[getPushToken] Requesting Firebase Cloud Messaging token...');

      // Request permission for notifications
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('[getPushToken] Permission not granted');
        console.log('[getPushToken] Authorization status:', authStatus);
        return null;
      }

      console.log('[getPushToken] Permission granted');

      // Get FCM token
      const fcmToken = await messaging().getToken();

      if (!fcmToken) {
        console.log('[getPushToken] Failed to get FCM token');
        return null;
      }

      console.log('[getPushToken] FCM token obtained');
      console.log('[getPushToken] Token length:', fcmToken.length, 'chars');
      console.log('[getPushToken] Token preview:', fcmToken.substring(0, 20) + '...');

      return fcmToken;
    } catch (error) {
      console.error('[getPushToken] Error:', error);
      console.error('[getPushToken] Error details:', error.message);
      return null;
    }
  }

  /**
   * Register for push notifications and send token to backend
   * @param {number} userId - User ID (optional, for logging)
   * @returns {Promise<string|null>} - FCM push token or null if failed
   */
  async registerForPushNotifications(userId = null) {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 ADMIN APP - REGISTERING FOR PUSH NOTIFICATIONS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 User ID:', userId || 'Not provided');

      // Create notification channel for Android
      await this.createNotificationChannel();

      // Request permission for notifications
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('❌ Push notification permission not granted');
        console.log('   Authorization status:', authStatus);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return null;
      }

      console.log('✅ Permission granted');

      // Get FCM token
      const fcmToken = await messaging().getToken();

      if (!fcmToken) {
        console.log('❌ Failed to get FCM token');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return null;
      }

      console.log('✅ FCM token obtained');
      console.log('🎫 Token length:', fcmToken.length, 'chars');
      console.log('🎫 Token preview:', fcmToken.substring(0, 20) + '...');

      // Send token to backend
      try {
        console.log('📤 Sending token to backend...');
        const response = await api.post('/auth/register-push-token', { pushToken: fcmToken });
        console.log('✅ Push token registered with backend successfully');
        console.log('📋 Response:', response.data);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Failed to register push token with backend');
        console.error('Error:', error.response?.data || error.message);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }

      return fcmToken;
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ Error registering for push notifications:', error);
      console.error('   Error details:', error.message);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return null;
    }
  }

  /**
   * Remove push token from backend (on logout)
   */
  async removePushToken() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  ADMIN APP - REMOVING PUSH TOKEN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      // Delete FCM token from device
      await messaging().deleteToken();
      console.log('✅ FCM token deleted from device');

      // Remove from backend
      await api.post('/auth/remove-push-token');
      console.log('✅ Push token removed from backend successfully');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      console.error('❌ Failed to remove push token');
      console.error('Error:', error.response?.data || error.message);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }

  /**
   * Add listener for when notification is received while app is in foreground
   * @param {Function} callback - Function to call when notification is received
   * @returns {Function} - Unsubscribe function
   */
  addNotificationReceivedListener(callback) {
    return messaging().onMessage(async (remoteMessage) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔔 ADMIN APP - NOTIFICATION RECEIVED (FOREGROUND)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 Title:', remoteMessage.notification?.title);
      console.log('💬 Body:', remoteMessage.notification?.body);
      console.log('📦 Data:', JSON.stringify(remoteMessage.data, null, 2));
      console.log('⏰ Received at:', new Date().toLocaleString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      callback(remoteMessage);
    });
  }

  /**
   * Add listener for when user taps on notification (background/quit state)
   * @param {Function} callback - Function to call when notification is tapped
   * @returns {Function} - Unsubscribe function
   */
  addNotificationResponseReceivedListener(callback) {
    // Handle notification opened from background state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👆 ADMIN APP - NOTIFICATION TAPPED (BACKGROUND)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 Title:', remoteMessage.notification?.title);
      console.log('💬 Body:', remoteMessage.notification?.body);
      console.log('📦 Data:', JSON.stringify(remoteMessage.data, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      callback(remoteMessage);
    });

    // Handle notification opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('👆 ADMIN APP - NOTIFICATION TAPPED (QUIT STATE)');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📝 Title:', remoteMessage.notification?.title);
          console.log('💬 Body:', remoteMessage.notification?.body);
          console.log('📦 Data:', JSON.stringify(remoteMessage.data, null, 2));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          callback(remoteMessage);
        }
      });

    // Return unsubscribe function
    return () => {
      console.log('Unsubscribing from notification tap listeners');
    };
  }

  /**
   * Set up background message handler
   * Must be called outside of component lifecycle
   */
  static setBackgroundMessageHandler(handler) {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔔 ADMIN APP - BACKGROUND MESSAGE RECEIVED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 Title:', remoteMessage.notification?.title);
      console.log('💬 Body:', remoteMessage.notification?.body);
      console.log('📦 Data:', JSON.stringify(remoteMessage.data, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      if (handler) {
        await handler(remoteMessage);
      }
    });
  }
}

export default new PushNotificationService();

