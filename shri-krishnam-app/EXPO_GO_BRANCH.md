# Expo Go Branch 📱

This is the `expo-go` branch - configured to work with **Expo Go** for rapid testing.

---

## 🔥 Firebase Packages Removed

The following packages have been **temporarily removed** from this branch to enable Expo Go compatibility:

```json
"@notifee/react-native": "^9.1.8",
"@react-native-firebase/app": "^21.14.0",
"@react-native-firebase/messaging": "^21.14.0",
"expo-dev-client": "~6.0.20"
```

---

## 🔄 To Re-enable Firebase

When you're ready to enable Firebase on this branch:

### **Step 1: Install Firebase Packages**

```bash
npm install @react-native-firebase/app@^21.14.0 @react-native-firebase/messaging@^21.14.0 @notifee/react-native@^9.1.8 expo-dev-client@~6.0.20
```

### **Step 2: Enable Firebase in .env**

```bash
# Change this line in .env:
ENABLE_FIREBASE=true
```

### **Step 3: Build Development Client**

```bash
# You can no longer use Expo Go after this
npx expo run:android
# or
npx expo run:ios
```

---

## 🚀 Current Usage (Expo Go)

Since Firebase is removed, you can use **Expo Go**:

```bash
cd shri-krishnam-app
npx expo start

# Scan QR code with Expo Go app
```

---

## 📋 Branch Comparison

| Feature | `main` Branch | `expo-go` Branch |
|---------|---------------|------------------|
| Firebase | ✅ Enabled | ❌ Removed |
| Push Notifications | ✅ Works | ❌ Disabled |
| Testing Method | Development Build | Expo Go |
| Build Time | ~10 minutes | Instant |
| Hot Reload | ✅ Yes | ✅ Yes |

---

## 🔀 Switching Between Branches

### **Switch to main (with Firebase)**

```bash
git checkout main
npm install
npx expo run:android
```

### **Switch to expo-go (without Firebase)**

```bash
git checkout expo-go
npm install
npx expo start
```

---

## ⚠️ Important Notes

1. **Don't merge expo-go into main** - Keep them separate
2. **Feature flag still works** - `ENABLE_FIREBASE` in `.env` controls behavior
3. **Code is the same** - Only package.json differs
4. **Eventually enable Firebase here too** - When ready for testing

---

## 🎯 Purpose

This branch exists for:
- ✅ Rapid testing without building
- ✅ Quick UI/UX iterations
- ✅ Testing non-Firebase features
- ✅ Onboarding new developers

Once Firebase is needed, switch to `main` branch or re-enable Firebase here.

