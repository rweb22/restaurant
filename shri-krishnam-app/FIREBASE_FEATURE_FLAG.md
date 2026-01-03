# Firebase Feature Flag System 🎛️

This document explains how to enable/disable Firebase in the Shri Krishnam app with a simple feature flag.

---

## 🎯 Overview

Firebase (and push notifications) can now be **enabled or disabled** with a single environment variable:

```bash
ENABLE_FIREBASE=true   # Enable Firebase & push notifications
ENABLE_FIREBASE=false  # Disable Firebase & push notifications
```

When Firebase is **disabled**:
- ✅ App works in **Expo Go** (no native modules required)
- ✅ No Firebase dependencies loaded at runtime
- ✅ Push notification service returns gracefully (no errors)
- ❌ Push notifications won't work

When Firebase is **enabled**:
- ✅ Full Firebase functionality
- ✅ Push notifications work
- ✅ Requires development build or production build
- ❌ Won't work in Expo Go

---

## 🚀 Quick Start

### **Option 1: Test in Expo Go (Firebase Disabled)**

```bash
# 1. Set feature flag in .env
echo "ENABLE_FIREBASE=false" >> shri-krishnam-app/.env

# 2. Start Expo dev server
cd shri-krishnam-app
npx expo start

# 3. Scan QR code with Expo Go app
```

### **Option 2: Build with Firebase (Development Build)**

```bash
# 1. Set feature flag in .env
echo "ENABLE_FIREBASE=true" >> shri-krishnam-app/.env

# 2. Build development client
cd shri-krishnam-app
npx expo run:android
# or
npx expo run:ios
```

### **Option 3: Build with EAS (Cloud Build)**

```bash
cd shri-krishnam-app

# Without Firebase (works in Expo Go)
eas build --profile preview --platform android

# With Firebase (requires development build)
eas build --profile development --platform android

# Production with Firebase
eas build --profile production --platform android
```

---

## 📋 Build Profiles

| Profile | Firebase | Use Case | Command |
|---------|----------|----------|---------|
| **development** | ✅ Enabled | Dev build with Firebase | `eas build --profile development` |
| **development-no-firebase** | ❌ Disabled | Dev build without Firebase | `eas build --profile development-no-firebase` |
| **preview** | ❌ Disabled | Testing without Firebase | `eas build --profile preview` |
| **production** | ✅ Enabled | Production release | `eas build --profile production` |

---

## 🔧 How It Works

### **1. Environment Variable (.env)**

```bash
# shri-krishnam-app/.env
ENABLE_FIREBASE=false  # Change to 'true' to enable
```

### **2. App Configuration (app.config.js)**

Firebase plugins are conditionally included:

```javascript
const ENABLE_FIREBASE = process.env.ENABLE_FIREBASE === 'true';

const firebasePlugins = ENABLE_FIREBASE
  ? ['@react-native-firebase/app', '@react-native-firebase/messaging']
  : [];

export default {
  expo: {
    plugins: [...basePlugins, ...firebasePlugins],
    // ...
  }
};
```

### **3. Runtime Feature Detection (src/config/features.js)**

```javascript
export const FIREBASE_ENABLED = env.ENABLE_FIREBASE === 'true';

export const features = {
  firebase: FIREBASE_ENABLED,
  pushNotifications: FIREBASE_ENABLED,
};
```

### **4. Conditional Service Loading**

All Firebase code is conditionally loaded:

```javascript
// src/services/pushNotificationService.js
let messaging = null;
if (features.firebase) {
  messaging = require('@react-native-firebase/messaging').default;
}

// All methods check if Firebase is enabled
async registerForPushNotifications() {
  if (!features.firebase || !messaging) {
    console.log('Firebase is disabled - skipping');
    return null;
  }
  // ... Firebase code
}
```

---

## 📝 Files Modified

1. **`.env`** - Added `ENABLE_FIREBASE` flag
2. **`app.config.js`** - Conditional Firebase plugin inclusion
3. **`eas.json`** - Build profiles with Firebase flag
4. **`index.js`** - Conditional background message handler
5. **`src/config/features.js`** - Feature flag configuration (NEW)
6. **`src/services/pushNotificationService.js`** - Conditional Firebase usage
7. **`App.js`** - Feature flag logging

---

## 🎛️ Switching Between Modes

### **Enable Firebase**

```bash
# Update .env
sed -i 's/ENABLE_FIREBASE=false/ENABLE_FIREBASE=true/' shri-krishnam-app/.env

# Rebuild app
cd shri-krishnam-app
npx expo run:android
```

### **Disable Firebase**

```bash
# Update .env
sed -i 's/ENABLE_FIREBASE=true/ENABLE_FIREBASE=false/' shri-krishnam-app/.env

# Restart Expo
cd shri-krishnam-app
npx expo start --clear
```

---

## ✅ Benefits

1. **Faster Development** - Test in Expo Go without building
2. **Flexible Deployment** - Choose Firebase on/off per build
3. **No Code Changes** - Just flip the environment variable
4. **Graceful Degradation** - App works without Firebase
5. **Easy Testing** - Test both modes easily

---

## 🐛 Troubleshooting

### **"Failed to download remote update" in Expo Go**

This happens when Firebase is enabled. Solution:

```bash
# Disable Firebase in .env
ENABLE_FIREBASE=false

# Clear cache and restart
npx expo start --clear
```

### **Push notifications not working**

Check if Firebase is enabled:

```bash
# Should see in logs:
🎛️  FEATURE FLAGS
🔥 Firebase: ✅ ENABLED
🔔 Push Notifications: ✅ ENABLED
```

If disabled, enable it:

```bash
# Update .env
ENABLE_FIREBASE=true

# Rebuild (can't use Expo Go)
npx expo run:android
```

---

## 📚 Additional Resources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [React Native Firebase](https://rnfirebase.io/)

