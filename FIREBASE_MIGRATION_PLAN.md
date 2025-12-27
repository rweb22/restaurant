# Firebase Cloud Messaging (FCM) Migration Plan

## 📋 Overview

Migrate from **Expo Push Notifications** to **Firebase Cloud Messaging (FCM)** to fix push notification issues in standalone APK builds.

---

## 🎯 Why Firebase?

| Feature | Expo Push Notifications | Firebase Cloud Messaging |
|---------|------------------------|--------------------------|
| **Reliability** | ❌ Not working in APK | ✅ Industry standard |
| **Free Tier** | ✅ Yes | ✅ Yes (unlimited) |
| **Setup Complexity** | ✅ Simple | ⚠️ Moderate |
| **Platform Support** | ✅ iOS + Android | ✅ iOS + Android |
| **Token Format** | `ExponentPushToken[...]` | FCM token (152 chars) |
| **Works in APK** | ❌ Issues reported | ✅ Proven to work |

---

## 📦 Prerequisites

### 1. Firebase Project Setup
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Add Android app to Firebase project (Client App)
- [ ] Add Android app to Firebase project (Admin App)
- [ ] Download `google-services.json` for both apps
- [ ] Generate Firebase Admin SDK service account key

### 2. Package Names
- **Client App:** `com.shrikrishnam.app` (from `app.json`)
- **Admin App:** `com.shrikrishnam.admin` (from `app.json`)

---

## 🔧 Implementation Steps

### **PHASE 1: Backend Changes**

#### 1.1 Install Firebase Admin SDK
```bash
cd app
npm install firebase-admin
```

#### 1.2 Add Service Account Credentials
- Download service account JSON from Firebase Console
- Save as `app/config/firebase-service-account.json`
- Add to `.gitignore`
- Add path to `.env`: `FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json`

#### 1.3 Initialize Firebase Admin SDK
Create `app/src/config/firebase.js`:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
```

#### 1.4 Update Push Notification Service
File: `app/src/services/pushNotificationService.js`

**Changes:**
- Remove `expo-server-sdk` import
- Import Firebase Admin SDK
- Replace `Expo.isExpoPushToken()` with FCM token validation (regex)
- Replace `expo.sendPushNotificationsAsync()` with `admin.messaging().sendEachForMulticast()`
- Update token validation logic
- Keep all existing logging

**Token Validation:**
```javascript
// Old: Expo.isExpoPushToken(token)
// New: FCM token is 152+ characters, alphanumeric with special chars
const isFCMToken = (token) => {
  return token && typeof token === 'string' && token.length >= 140;
};
```

#### 1.5 Remove Expo Server SDK
```bash
cd app
npm uninstall expo-server-sdk
```

---

### **PHASE 2: Client App Changes**

#### 2.1 Install React Native Firebase
```bash
cd shri-krishnam-app
npm install @react-native-firebase/app @react-native-firebase/messaging
```

#### 2.2 Configure Android
1. Place `google-services.json` in `shri-krishnam-app/android/app/`
2. Update `android/build.gradle`:
   ```gradle
   dependencies {
       classpath 'com.google.gms:google-services:4.4.0'
   }
   ```
3. Update `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

#### 2.3 Update app.json
Add Firebase plugin:
```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/messaging"
    ]
  }
}
```

#### 2.4 Update Push Notification Service
File: `shri-krishnam-app/src/services/pushNotificationService.js`

**Changes:**
- Remove `expo-notifications` import
- Import `@react-native-firebase/messaging`
- Replace `Notifications.getExpoPushTokenAsync()` with `messaging().getToken()`
- Replace `Notifications.requestPermissionsAsync()` with `messaging().requestPermission()`
- Update notification handlers
- Remove Expo Go detection (not needed)
- Remove project ID (not needed)

#### 2.5 Uninstall Expo Notifications
```bash
cd shri-krishnam-app
npm uninstall expo-notifications expo-device
```

---

### **PHASE 3: Admin App Changes**

Same as Client App (PHASE 2) but for `shri-krishnam-admin-app/`

### Client/Admin Apps: `src/services/pushNotificationService.js`

**BEFORE (Expo):**
```javascript
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Get token
const tokenData = await Notifications.getExpoPushTokenAsync({
  projectId: '36941223-0688-437d-9b6e-fccea1435c54'
});
const pushToken = tokenData.data; // ExponentPushToken[...]

// Request permission
const { status } = await Notifications.requestPermissionsAsync();

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

// Add listener
Notifications.addNotificationReceivedListener(notification => {
  console.log('Notification received:', notification);
});
```

**AFTER (Firebase):**
```javascript
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

// Request permission
const authStatus = await messaging().requestPermission();
const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

// Get token
const pushToken = await messaging().getToken(); // FCM token (152 chars)

// Foreground message handler
messaging().onMessage(async remoteMessage => {
  console.log('Notification received:', remoteMessage);
  // Show local notification if needed
});

// Background message handler (in index.js)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification:', remoteMessage);
});
```

---

## 🗂️ Files to Modify

### Backend (3 files)
1. ✅ `app/package.json` - Remove expo-server-sdk, add firebase-admin
2. ✅ `app/src/config/firebase.js` - NEW FILE - Initialize Firebase Admin
3. ✅ `app/src/services/pushNotificationService.js` - Replace Expo with FCM
4. ✅ `app/.env` - Add FIREBASE_SERVICE_ACCOUNT_PATH
5. ✅ `app/.gitignore` - Add firebase-service-account.json

### Client App (5 files)
1. ✅ `shri-krishnam-app/package.json` - Remove expo-notifications, add Firebase
2. ✅ `shri-krishnam-app/app.json` - Add Firebase plugins
3. ✅ `shri-krishnam-app/src/services/pushNotificationService.js` - Replace Expo with FCM
4. ✅ `shri-krishnam-app/App.js` - Update notification listener setup
5. ✅ `shri-krishnam-app/android/app/google-services.json` - NEW FILE - Firebase config
6. ✅ `shri-krishnam-app/android/build.gradle` - Add Google Services plugin
7. ✅ `shri-krishnam-app/android/app/build.gradle` - Apply Google Services plugin

### Admin App (5 files)
Same as Client App but in `shri-krishnam-admin-app/`

---

## 🔐 Security Considerations

### Firebase Service Account
- **NEVER** commit `firebase-service-account.json` to Git
- Add to `.gitignore` immediately
- Store securely on server
- Use environment variable for path

### Token Storage
- FCM tokens are longer than Expo tokens (152+ chars vs ~50 chars)
- Database field `users.push_token` is `VARCHAR(255)` - ✅ Sufficient
- No schema changes needed

---

## 🧪 Testing Plan

### 1. Backend Testing
```bash
# Test token validation
node -e "
const isFCMToken = (token) => token && token.length >= 140;
console.log('Valid FCM token:', isFCMToken('eF5fRoKhSDG...152chars'));
console.log('Invalid token:', isFCMToken('short'));
"

# Test Firebase Admin SDK
node -e "
const admin = require('./src/config/firebase');
console.log('Firebase initialized:', !!admin.messaging);
"
```

### 2. Client/Admin App Testing
1. Build APK with Firebase
2. Install on physical device
3. Login and check token registration
4. Verify token in database (should be 152+ chars)
5. Send test notification from backend
6. Verify notification received

### 3. End-to-End Testing
- [ ] Client creates order → Admin receives NEW_ORDER notification
- [ ] Payment completed → Client receives PAYMENT_COMPLETED notification
- [ ] Admin cancels order → Client receives ORDER_CANCELLED notification
- [ ] Admin changes status → Client receives status update notification
- [ ] Client cancels order → Admin receives ORDER_CANCELLED_BY_CLIENT notification

---

## 📊 Migration Checklist

### Pre-Migration
- [ ] Create Firebase project
- [ ] Add both Android apps to Firebase
- [ ] Download google-services.json files
- [ ] Generate service account key
- [ ] Backup current database

### Backend Migration
- [ ] Install firebase-admin
- [ ] Create firebase.js config
- [ ] Update pushNotificationService.js
- [ ] Update .env and .gitignore
- [ ] Remove expo-server-sdk
- [ ] Test locally

### Client App Migration
- [ ] Install Firebase packages
- [ ] Add google-services.json
- [ ] Update build.gradle files
- [ ] Update app.json
- [ ] Update pushNotificationService.js
- [ ] Update App.js
- [ ] Remove expo-notifications
- [ ] Build and test APK

### Admin App Migration
- [ ] Same steps as Client App
- [ ] Build and test APK

### Post-Migration
- [ ] Test all notification scenarios
- [ ] Monitor backend logs
- [ ] Check database for FCM tokens
- [ ] Deploy to production
- [ ] Update documentation

---

## 🚀 Deployment Steps

### 1. Backend Deployment
```bash
# On server
cd /path/to/restaurant/app
git pull origin main
npm install
# Upload firebase-service-account.json to app/config/
# Update .env with FIREBASE_SERVICE_ACCOUNT_PATH
pm2 restart restaurant-api
pm2 logs restaurant-api
```

### 2. Client/Admin App Deployment
```bash
# Build new APKs
cd shri-krishnam-app
npx eas-cli build --platform android --profile preview

cd ../shri-krishnam-admin-app
npx eas-cli build --platform android --profile preview

# Download and distribute APKs
```

---

## 🔄 Rollback Plan

If Firebase doesn't work:

1. **Revert Git commits:**
   ```bash
   git revert HEAD~3..HEAD
   git push origin main
   ```

2. **Reinstall Expo packages:**
   ```bash
   cd app && npm install expo-server-sdk
   cd ../shri-krishnam-app && npm install expo-notifications expo-device
   cd ../shri-krishnam-admin-app && npm install expo-notifications expo-device
   ```

3. **Rebuild APKs** with Expo notifications

---

## 📚 Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase Docs](https://rnfirebase.io/)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Expo to Firebase Migration Guide](https://rnfirebase.io/messaging/usage)

---

## ⏱️ Estimated Timeline

| Phase | Task | Time Estimate |
|-------|------|---------------|
| Setup | Create Firebase project, download configs | 30 min |
| Backend | Install packages, update code | 1 hour |
| Client App | Install packages, configure, update code | 1.5 hours |
| Admin App | Same as Client App | 1.5 hours |
| Testing | Build APKs, test all scenarios | 2 hours |
| **TOTAL** | | **~6.5 hours** |

---

## 💡 Key Differences: Expo vs Firebase

| Aspect | Expo | Firebase |
|--------|------|----------|
| **Token Format** | `ExponentPushToken[xxx]` | 152-char alphanumeric |
| **Token Retrieval** | `Notifications.getExpoPushTokenAsync()` | `messaging().getToken()` |
| **Permission** | `Notifications.requestPermissionsAsync()` | `messaging().requestPermission()` |
| **Send (Backend)** | `expo.sendPushNotificationsAsync()` | `admin.messaging().sendEachForMulticast()` |
| **Foreground Handler** | `Notifications.setNotificationHandler()` | `messaging().onMessage()` |
| **Background Handler** | Automatic | `messaging().setBackgroundMessageHandler()` |
| **Validation** | `Expo.isExpoPushToken()` | `token.length >= 140` |
| **Project ID** | Required | Not required |
| **Config File** | None | `google-services.json` |

---

## ✅ Success Criteria

Migration is successful when:

1. ✅ Backend can send notifications via Firebase
2. ✅ Client app receives notifications in APK
3. ✅ Admin app receives notifications in APK
4. ✅ All 13 notification scenarios work
5. ✅ Tokens are saved to database during login
6. ✅ No errors in backend logs
7. ✅ No errors in app logs
8. ✅ Notifications work without Expo Go installed

---

**Ready to start implementation?** 🚀


---

## 📝 Detailed Code Changes

### Backend: `app/src/services/pushNotificationService.js`

**BEFORE (Expo):**
```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

// Validate token
const isValid = Expo.isExpoPushToken(pushToken);

// Send notification
const messages = pushTokens.map(token => ({
  to: token,
  sound: 'default',
  title: notification.title,
  body: notification.body,
  data: notification.data
}));
const tickets = await expo.sendPushNotificationsAsync(messages);
```

**AFTER (Firebase):**
```javascript
const admin = require('../config/firebase');

// Validate token
const isFCMToken = (token) => token && token.length >= 140;

// Send notification
const message = {
  notification: {
    title: notification.title,
    body: notification.body
  },
  data: notification.data,
  tokens: pushTokens,
  android: {
    priority: 'high',
    notification: {
      sound: 'default',
      channelId: 'default'
    }
  }
};
const response = await admin.messaging().sendEachForMulticast(message);
```

---


