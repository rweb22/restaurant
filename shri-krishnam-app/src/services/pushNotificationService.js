import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from './api';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configure how notifications should be handled when app is in foreground
// Only set if not in Expo Go (SDK 53+ doesn't support push notifications in Expo Go)
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

class PushNotificationService {
  /**
   * Get push token without registering with backend
   * @returns {Promise<string|null>} - Push token or null if failed
   */
  async getPushToken() {
    try {
      // Check if running in Expo Go
      if (isExpoGo) {
        console.log('[getPushToken] Skipping - Expo Go detected');
        return null;
      }

      // Check if running on physical device
      if (!Device.isDevice) {
        console.log('[getPushToken] Skipping - Not a physical device');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[getPushToken] Permission not granted');
        return null;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '36941223-0688-437d-9b6e-fccea1435c54',
      });

      const pushToken = tokenData.data;
      console.log('[getPushToken] Token obtained:', pushToken);
      return pushToken;
    } catch (error) {
      console.error('[getPushToken] Error:', error);
      return null;
    }
  }

  /**
   * Register for push notifications and send token to backend
   * @param {number} userId - User ID (optional, for logging)
   * @returns {Promise<string|null>} - Push token or null if failed
   */
  async registerForPushNotifications(userId = null) {
    try {
      // Check if running in Expo Go
      if (isExpoGo) {
        console.log('⚠️ Push notifications are not supported in Expo Go (SDK 53+)');
        console.log('📱 To test push notifications, create a development build:');
        console.log('   npx expo run:android  or  npx expo run:ios');
        console.log('   Read more: https://docs.expo.dev/develop/development-builds/introduction/');
        return null;
      }

      // Check if running on physical device
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '36941223-0688-437d-9b6e-fccea1435c54',
      });

      const pushToken = tokenData.data;
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 CLIENT APP - PUSH TOKEN OBTAINED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎫 Token:', pushToken);
      console.log('👤 User ID:', userId || 'Not provided');

      // Send token to backend
      try {
        console.log('📤 Sending token to backend...');
        const response = await api.post('/auth/register-push-token', { pushToken });
        console.log('✅ Push token registered with backend successfully');
        console.log('📋 Response:', response.data);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Failed to register push token with backend');
        console.error('Error:', error.response?.data || error.message);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return pushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Remove push token from backend (on logout)
   */
  async removePushToken() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  CLIENT APP - REMOVING PUSH TOKEN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
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
   * @returns {Subscription} - Subscription object to remove listener
   */
  addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener((notification) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔔 CLIENT APP - NOTIFICATION RECEIVED (FOREGROUND)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 Title:', notification.request.content.title);
      console.log('💬 Body:', notification.request.content.body);
      console.log('📦 Data:', JSON.stringify(notification.request.content.data, null, 2));
      console.log('⏰ Received at:', new Date().toLocaleString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      callback(notification);
    });
  }

  /**
   * Add listener for when user taps on notification
   * @param {Function} callback - Function to call when notification is tapped
   * @returns {Subscription} - Subscription object to remove listener
   */
  addNotificationResponseReceivedListener(callback) {
    return Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👆 CLIENT APP - NOTIFICATION TAPPED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 Title:', response.notification.request.content.title);
      console.log('💬 Body:', response.notification.request.content.body);
      console.log('📦 Data:', JSON.stringify(response.notification.request.content.data, null, 2));
      console.log('🎯 Action:', response.actionIdentifier);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      callback(response);
    });
  }

  /**
   * Get badge count
   * @returns {Promise<number>}
   */
  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   * @param {number} count
   */
  async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }
}

export default new PushNotificationService();

