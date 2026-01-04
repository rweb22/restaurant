#!/bin/bash

# Push Notifications Diagnostic Script
# This script checks if push notifications are properly configured

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 PUSH NOTIFICATIONS DIAGNOSTIC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Check Backend Firebase Configuration
echo "1️⃣  Checking Backend Firebase Configuration..."
echo ""

if [ -f "app/config/firebase-service-account.json" ]; then
    PROJECT_ID=$(cat app/config/firebase-service-account.json | grep -o '"project_id"[^,]*' | cut -d'"' -f4)
    echo "   ✅ Firebase service account file exists"
    echo "   📋 Project ID: $PROJECT_ID"
else
    echo "   ❌ Firebase service account file NOT found"
    echo "   💡 Download from Firebase Console and save as:"
    echo "      app/config/firebase-service-account.json"
fi

echo ""

# 2. Check Frontend Firebase Configuration
echo "2️⃣  Checking Frontend Firebase Configuration..."
echo ""

if [ -f "shri-krishnam-app/google-services.json" ]; then
    FRONTEND_PROJECT_ID=$(cat shri-krishnam-app/google-services.json | grep -o '"project_id"[^,]*' | cut -d'"' -f4)
    echo "   ✅ google-services.json exists (root)"
    echo "   📋 Project ID: $FRONTEND_PROJECT_ID"
else
    echo "   ❌ google-services.json NOT found in root"
fi

if [ -f "shri-krishnam-app/android/app/google-services.json" ]; then
    ANDROID_PROJECT_ID=$(cat shri-krishnam-app/android/app/google-services.json | grep -o '"project_id"[^,]*' | cut -d'"' -f4)
    echo "   ✅ google-services.json exists (android/app)"
    echo "   📋 Project ID: $ANDROID_PROJECT_ID"
else
    echo "   ❌ google-services.json NOT found in android/app"
fi

echo ""

# 3. Check if Project IDs match
echo "3️⃣  Checking Project ID Consistency..."
echo ""

if [ "$PROJECT_ID" = "$FRONTEND_PROJECT_ID" ] && [ "$PROJECT_ID" = "$ANDROID_PROJECT_ID" ]; then
    echo "   ✅ All Firebase configurations use the same project: $PROJECT_ID"
else
    echo "   ❌ Project ID mismatch detected!"
    echo "   Backend: $PROJECT_ID"
    echo "   Frontend (root): $FRONTEND_PROJECT_ID"
    echo "   Frontend (android): $ANDROID_PROJECT_ID"
fi

echo ""

# 4. Check Backend .env
echo "4️⃣  Checking Backend .env Configuration..."
echo ""

if grep -q "FIREBASE_SERVICE_ACCOUNT_PATH" app/.env; then
    FIREBASE_PATH=$(grep "FIREBASE_SERVICE_ACCOUNT_PATH" app/.env | cut -d'=' -f2)
    echo "   ✅ FIREBASE_SERVICE_ACCOUNT_PATH is set"
    echo "   📋 Path: $FIREBASE_PATH"
else
    echo "   ❌ FIREBASE_SERVICE_ACCOUNT_PATH not set in app/.env"
fi

echo ""

# 5. Check Frontend .env
echo "5️⃣  Checking Frontend .env Configuration..."
echo ""

if [ -f "shri-krishnam-app/.env" ]; then
    if grep -q "ENABLE_FIREBASE=true" shri-krishnam-app/.env; then
        echo "   ✅ ENABLE_FIREBASE=true in .env"
    else
        echo "   ⚠️  ENABLE_FIREBASE is not true in .env"
        echo "   💡 This is OK if using EAS build (uses eas.json config)"
    fi
else
    echo "   ⚠️  .env file not found (ignored by git)"
    echo "   💡 This is OK - EAS build uses eas.json config"
fi

echo ""

# 6. Check EAS Build Configuration
echo "6️⃣  Checking EAS Build Configuration..."
echo ""

if [ -f "shri-krishnam-app/eas.json" ]; then
    echo "   ✅ eas.json exists"
    
    # Check production profile
    if grep -A 10 '"production"' shri-krishnam-app/eas.json | grep -q '"ENABLE_FIREBASE": "true"'; then
        echo "   ✅ Production profile has ENABLE_FIREBASE=true"
    else
        echo "   ❌ Production profile does NOT have ENABLE_FIREBASE=true"
    fi
    
    # Check preview profile
    if grep -A 10 '"preview"' shri-krishnam-app/eas.json | grep -q '"ENABLE_FIREBASE": "false"'; then
        echo "   ⚠️  Preview profile has ENABLE_FIREBASE=false (expected)"
    fi
else
    echo "   ❌ eas.json not found"
fi

echo ""

# 7. Check Firebase packages
echo "7️⃣  Checking Firebase Packages..."
echo ""

if [ -f "shri-krishnam-app/package.json" ]; then
    if grep -q "@react-native-firebase/app" shri-krishnam-app/package.json; then
        echo "   ✅ @react-native-firebase/app installed"
    else
        echo "   ❌ @react-native-firebase/app NOT installed"
    fi
    
    if grep -q "@react-native-firebase/messaging" shri-krishnam-app/package.json; then
        echo "   ✅ @react-native-firebase/messaging installed"
    else
        echo "   ❌ @react-native-firebase/messaging NOT installed"
    fi
    
    if grep -q "@notifee/react-native" shri-krishnam-app/package.json; then
        echo "   ✅ @notifee/react-native installed"
    else
        echo "   ❌ @notifee/react-native NOT installed"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next Steps:"
echo ""
echo "1. If all checks passed (✅), push notifications should work!"
echo ""
echo "2. To test push notifications:"
echo "   - Install the production APK on a physical device"
echo "   - Log in to the app"
echo "   - Grant notification permissions"
echo "   - Check app logs for FCM token registration"
echo "   - Send test notification via backend API or Firebase Console"
echo ""
echo "3. For detailed troubleshooting, see:"
echo "   PUSH_NOTIFICATIONS_TROUBLESHOOTING.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

