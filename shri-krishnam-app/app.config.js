import 'dotenv/config';

// Feature flags
const ENABLE_FIREBASE = process.env.ENABLE_FIREBASE === 'true';

// Base plugins (always included)
const basePlugins = [
  [
    'expo-build-properties',
    {
      android: {
        usesCleartextTraffic: true,
      },
    },
  ],
];

// Firebase plugins (conditionally included)
const firebasePlugins = ENABLE_FIREBASE
  ? ['@react-native-firebase/app', '@react-native-firebase/messaging']
  : [];

export default {
  expo: {
    name: 'Shri Krishnam',
    slug: 'shri-krishnam',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FF9800',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.shrikrishnam.app',
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      package: 'com.shrikrishnam.app',
      versionCode: 2,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FF9800',
      },
      edgeToEdgeEnabled: true,
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'INTERNET',
        'ACCESS_NETWORK_STATE',
        'POST_NOTIFICATIONS', // Required for Android 13+ push notifications
      ],
      ...(ENABLE_FIREBASE && { googleServicesFile: './google-services.json' }),
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    plugins: [...basePlugins, ...firebasePlugins],
    extra: {
      eas: {
        projectId: '36941223-0688-437d-9b6e-fccea1435c54',
      },
      ENABLE_FIREBASE: process.env.ENABLE_FIREBASE || 'false',
    },
  },
};

