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
        projectId: '8f7561f7-8524-4cd2-8cff-ec9572806f33',
      });

      const pushToken = tokenData.data;
      console.log('Push token obtained:', pushToken);

      // Send token to backend
      try {
        await api.post('/auth/register-push-token', { pushToken });
        console.log('Push token registered with backend');
      } catch (error) {
        console.error('Failed to register push token with backend:', error);
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
    try {
      await api.post('/auth/remove-push-token');
      console.log('Push token removed from backend');
    } catch (error) {
      console.error('Failed to remove push token:', error);
    }
  }

  /**
   * Add listener for when notification is received while app is in foreground
   * @param {Function} callback - Function to call when notification is received
   * @returns {Subscription} - Subscription object to remove listener
   */
  addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add listener for when user taps on notification
   * @param {Function} callback - Function to call when notification is tapped
   * @returns {Subscription} - Subscription object to remove listener
   */
  addNotificationResponseReceivedListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
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

