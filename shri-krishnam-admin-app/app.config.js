import 'dotenv/config';

export default {
  expo: {
    name: 'Shri Krishnam Admin',
    slug: 'shri-krishnam-admin',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1976D2',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.shrikrishnam.admin',
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      package: 'com.shrikrishnam.admin',
      versionCode: 2,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1976D2',
      },
      edgeToEdgeEnabled: true,
      permissions: [
        'INTERNET',
        'ACCESS_NETWORK_STATE',
        'POST_NOTIFICATIONS', // Required for Android 13+ push notifications
      ],
      googleServicesFile: './google-services.json',
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
    ],
    extra: {
      eas: {
        projectId: '8f7561f7-8524-4cd2-8cff-ec9572806f33',
      },
    },
  },
};

