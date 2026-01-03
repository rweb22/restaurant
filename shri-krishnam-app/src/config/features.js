import Constants from 'expo-constants';

/**
 * Feature Flags Configuration
 * Controls which features are enabled/disabled in the app
 */

// Get environment variables
const env = Constants.expoConfig?.extra || {};

/**
 * Check if Firebase is enabled
 * Set ENABLE_FIREBASE=true in .env to enable Firebase features
 */
export const FIREBASE_ENABLED = env.ENABLE_FIREBASE === 'true' || env.ENABLE_FIREBASE === true;

/**
 * Feature flags object
 */
export const features = {
  firebase: FIREBASE_ENABLED,
  pushNotifications: FIREBASE_ENABLED, // Push notifications require Firebase
};

/**
 * Log feature flags on app start
 */
export const logFeatureFlags = () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎛️  FEATURE FLAGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔥 Firebase:', features.firebase ? '✅ ENABLED' : '❌ DISABLED');
  console.log('🔔 Push Notifications:', features.pushNotifications ? '✅ ENABLED' : '❌ DISABLED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

export default features;

