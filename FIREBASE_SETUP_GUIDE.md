# 🔥 Firebase Cloud Messaging Setup Guide

This guide will help you complete the Firebase setup for push notifications.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- Access to [Firebase Console](https://console.firebase.google.com)
- Google account
- Admin access to create Firebase projects

---

## 🚀 Step-by-Step Setup

### **STEP 1: Create Firebase Project**

1. Go to https://console.firebase.google.com
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `shri-krishnam` (or your preferred name)
4. Click **Continue**
5. Disable Google Analytics (optional, not needed for push notifications)
6. Click **Create project**
7. Wait for project creation to complete
8. Click **Continue**

---

### **STEP 2: Add Android App for Client App**

1. In Firebase Console, click **"Add app"** and select **Android**
2. Enter the following details:
   - **Android package name:** `com.shrikrishnam.app`
   - **App nickname (optional):** `Shri Krishnam Client`
   - **Debug signing certificate SHA-1 (optional):** Leave blank for now
3. Click **Register app**
4. **Download `google-services.json`**
5. Save it to: `shri-krishnam-app/android/app/google-services.json`
6. Click **Next** → **Next** → **Continue to console**

---

### **STEP 3: Add Android App for Admin App**

1. In Firebase Console, click **"Add app"** and select **Android** again
2. Enter the following details:
   - **Android package name:** `com.shrikrishnam.admin`
   - **App nickname (optional):** `Shri Krishnam Admin`
   - **Debug signing certificate SHA-1 (optional):** Leave blank for now
3. Click **Register app**
4. **Download `google-services.json`**
5. Save it to: `shri-krishnam-admin-app/android/app/google-services.json`
6. Click **Next** → **Next** → **Continue to console**

---

### **STEP 4: Generate Firebase Admin SDK Service Account**

1. In Firebase Console, click **⚙️ Settings** (gear icon) → **Project settings**
2. Go to **Service accounts** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** in the confirmation dialog
5. A JSON file will be downloaded (e.g., `shri-krishnam-firebase-adminsdk-xxxxx.json`)
6. **Rename it to:** `firebase-service-account.json`
7. **Move it to:** `app/config/firebase-service-account.json`

⚠️ **IMPORTANT:** This file contains sensitive credentials. NEVER commit it to Git!

---

### **STEP 5: Verify Files Are in Place**

Check that these files exist:

```
✅ shri-krishnam-app/android/app/google-services.json
✅ shri-krishnam-admin-app/android/app/google-services.json
✅ app/config/firebase-service-account.json
```

---

### **STEP 6: Install Dependencies**

Run these commands:

```bash
# Backend
cd app
npm install

# Client App
cd ../shri-krishnam-app
npm install

# Admin App
cd ../shri-krishnam-admin-app
npm install
```

---

### **STEP 7: Restart Backend Server**

```bash
cd app
npm run dev
```

You should see:
```
🔥 FIREBASE ADMIN SDK INITIALIZED
Project ID: shri-krishnam
Client Email: firebase-adminsdk-xxxxx@shri-krishnam.iam.gserviceaccount.com
Push notifications via Firebase Cloud Messaging are ready!
```

---

### **STEP 8: Build APKs**

```bash
# Client App
cd shri-krishnam-app
npx eas-cli build --platform android --profile preview

# Admin App
cd shri-krishnam-admin-app
npx eas-cli build --platform android --profile preview
```

---

## ✅ Testing

After installing the APKs:

1. **Login to both apps**
2. **Check backend logs** - you should see:
   ```
   📱 ADMIN APP - PUSH TOKEN OBTAINED
   🎫 Token length: 152 chars (FCM tokens are typically 152+ chars)
   ✅ Push token registered with backend successfully
   ```

3. **Test notifications:**
   - Client creates order → Admin receives NEW_ORDER notification
   - Admin cancels order → Client receives ORDER_CANCELLED notification
   - Admin changes status → Client receives status update notification

---

## 🔍 Troubleshooting

### Backend shows "Firebase not initialized"
- Check that `firebase-service-account.json` exists in `app/config/`
- Check that `.env.local` has `FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json`
- Restart backend server

### APK build fails
- Make sure `google-services.json` files are in the correct locations
- Run `npm install` in both app directories
- Try clearing cache: `npx expo start --clear`

### Notifications not received
- Check backend logs for "FCM token obtained"
- Verify token length is 152+ characters (not Expo token format)
- Check Firebase Console → Cloud Messaging for any errors

---

## 📚 Resources

- [Firebase Console](https://console.firebase.google.com)
- [React Native Firebase Docs](https://rnfirebase.io/)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)

---

**🎉 Setup Complete!** Push notifications should now work in standalone APK builds.

