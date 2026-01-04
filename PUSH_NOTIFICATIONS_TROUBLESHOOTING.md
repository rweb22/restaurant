# Push Notifications Troubleshooting Guide

## 🔍 Diagnostic Checklist

### **1. Frontend (Mobile App) Checks**

#### ✅ Check if Firebase is enabled in the build
```bash
# In the APK, check logs when app starts
# You should see:
# 🎛️  FEATURE FLAGS
# 🔥 Firebase: ✅ ENABLED
# 🔔 Push Notifications: ✅ ENABLED
```

#### ✅ Check if FCM token is generated
```bash
# After login, check logs for:
# 📱 CLIENT APP - REGISTERING FOR PUSH NOTIFICATIONS
# 📱 Creating Android notification channel...
# ✅ Android notification channel created
# [getPushToken] Requesting Firebase Cloud Messaging token...
# [getPushToken] Permission granted
# [getPushToken] FCM token obtained
# [getPushToken] Token length: 152 chars (or more)
```

#### ✅ Check if token is sent to backend
```bash
# You should see:
# 📤 Sending token to backend...
# ✅ Push token registered with backend successfully
```

**If you DON'T see these logs:**
- Firebase might be disabled (check `ENABLE_FIREBASE` in build)
- Permissions not granted
- google-services.json mismatch

---

### **2. Backend Checks**

#### ✅ Check if Firebase Admin SDK is initialized
```bash
# When backend starts, check logs for:
# 🔥 FIREBASE ADMIN SDK INITIALIZED
# Project ID: your-project-id
# Client Email: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# Push notifications via Firebase Cloud Messaging are ready!
```

**If you see warnings instead:**
```bash
# ⚠️  FIREBASE NOT CONFIGURED
# FIREBASE_SERVICE_ACCOUNT_PATH not set in .env
```

**Solution:** Configure Firebase service account (see Step 3 below)

#### ✅ Check if push tokens are being saved
```bash
# Query database to check if users have push tokens
SELECT id, name, phone, 
       CASE WHEN "pushToken" IS NULL THEN '❌ No token' 
            ELSE '✅ Has token' END as token_status,
       LENGTH("pushToken") as token_length
FROM users 
WHERE id IN (1, 2, 3);  -- Replace with your user IDs
```

**Expected result:**
- `token_status`: ✅ Has token
- `token_length`: 152+ characters

---

### **3. Firebase Configuration**

#### ✅ Backend: Firebase Service Account

**Check if file exists:**
```bash
cd app
ls -la config/firebase-service-account.json
```

**If file is missing:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create one)
3. Go to **Project Settings** (⚙️ icon) > **Service Accounts**
4. Click **"Generate New Private Key"**
5. Save the JSON file as `app/config/firebase-service-account.json`
6. Add to `app/.env`:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
   ```
7. Restart backend:
   ```bash
   cd app
   npm run dev
   ```

#### ✅ Frontend: google-services.json

**Check if file exists:**
```bash
cd shri-krishnam-app
ls -la google-services.json android/app/google-services.json
```

**Verify it matches your Firebase project:**
```bash
cat google-services.json | grep project_id
# Should show: "project_id": "your-project-id"
```

**If project_id doesn't match or file is missing:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** > **Your apps** > **Android app**
4. Download `google-services.json`
5. Replace both files:
   ```bash
   cp ~/Downloads/google-services.json shri-krishnam-app/google-services.json
   cp ~/Downloads/google-services.json shri-krishnam-app/android/app/google-services.json
   ```
6. Rebuild the APK:
   ```bash
   cd shri-krishnam-app
   eas build --profile production --platform android
   ```

---

### **4. Test Push Notifications**

#### Method 1: Via Backend API (Recommended)

```bash
# Get your auth token first
TOKEN="your-jwt-token-here"

# Send test notification
curl -X POST http://206.189.141.60:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": 1,
    "title": "Test Notification",
    "body": "Testing push notifications!",
    "data": {
      "type": "test"
    }
  }'
```

#### Method 2: Via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Engage** > **Messaging**
4. Click **"Create your first campaign"** > **"Firebase Notification messages"**
5. Enter title and body
6. Click **"Send test message"**
7. Enter your FCM token (from app logs)
8. Click **"Test"**

---

## 🐛 Common Issues

### Issue 1: "Firebase is disabled - push notifications unavailable"

**Cause:** `ENABLE_FIREBASE` is false in the build

**Solution:**
1. Check `eas.json` production profile has `ENABLE_FIREBASE: "true"`
2. Rebuild APK with production profile
3. Don't use preview profile (has Firebase disabled)

### Issue 2: "No valid push tokens found"

**Cause:** Users haven't logged in on the APK, or token registration failed

**Solution:**
1. Install the APK on a physical device
2. Log in to the app
3. Grant notification permissions when prompted
4. Check backend logs for token registration
5. Query database to verify token is saved

### Issue 3: "Firebase not initialized - cannot send notifications"

**Cause:** Backend Firebase service account not configured

**Solution:** Follow Step 3 above to configure Firebase service account

### Issue 4: Notifications not appearing on device

**Possible causes:**
- App is in foreground (notifications only show in background by default)
- Notification channel not created
- Device has "Do Not Disturb" enabled
- App notifications disabled in device settings

**Solution:**
1. Put app in background or close it
2. Send test notification
3. Check device notification settings
4. Check app notification permissions

---

## 📋 Quick Diagnostic Commands

```bash
# Backend: Check if Firebase is initialized
cd app && npm run dev 2>&1 | grep -A 5 "FIREBASE"

# Backend: Check if service account file exists
ls -la app/config/firebase-service-account.json

# Frontend: Check if google-services.json exists
ls -la shri-krishnam-app/google-services.json

# Database: Check user push tokens
psql -U your_user -d restaurant_db -c "SELECT id, name, CASE WHEN \"pushToken\" IS NULL THEN 'No token' ELSE 'Has token' END FROM users LIMIT 10;"
```

---

## ✅ Success Indicators

When everything is working correctly, you should see:

**Backend logs:**
```
🔥 FIREBASE ADMIN SDK INITIALIZED
Project ID: your-project-id
Push notifications via Firebase Cloud Messaging are ready!
```

**Frontend logs (after login):**
```
🎛️  FEATURE FLAGS
🔥 Firebase: ✅ ENABLED
📱 CLIENT APP - REGISTERING FOR PUSH NOTIFICATIONS
[getPushToken] FCM token obtained
📤 Sending token to backend...
✅ Push token registered with backend successfully
```

**Database:**
```sql
SELECT id, name, LENGTH("pushToken") as token_length 
FROM users WHERE id = 1;
-- token_length should be 152+
```

**Test notification:**
```
✅ Notification appears on device
✅ Tapping notification opens the app
✅ Navigation works (if orderId provided)
```

