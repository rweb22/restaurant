# Environment Configuration Guide

This app uses environment variables to configure branding, API endpoints, and other settings.

## 📋 Setup Instructions

### 1. Create Your `.env` File

Copy the example file and customize it:

```bash
cp .env.example .env
```

### 2. Edit `.env` File

Open `.env` and replace the placeholder values with your actual information:

```env
# Restaurant Branding Configuration
APP_NAME=Your Restaurant Name
APP_TAGLINE=Your custom tagline here 🍔
APP_LOGO_TYPE=icon
APP_LOGO_ICON=food

# API Configuration
API_BASE_URL=https://api.yourrestaurant.com/api

# App Configuration
APP_VERSION=1.0.0
```

---

## 🎨 Branding Configuration

### App Name
**Variable:** `APP_NAME`  
**Example:** `Tasty Bites`, `Pizza Palace`, `Burger King`  
**Where it appears:**
- Login screen (large display text)
- App title throughout the application

### Tagline
**Variable:** `APP_TAGLINE`  
**Example:** `Delicious food, delivered fast 🍕`  
**Where it appears:**
- Login screen (below app name)
- Can include emojis for visual appeal

### Logo Configuration

#### Option 1: Use Material Design Icon (Recommended for Quick Setup)

```env
APP_LOGO_TYPE=icon
APP_LOGO_ICON=food
```

**Available icon names:**
- `food` - Generic food icon
- `pizza` - Pizza slice
- `hamburger` - Burger icon
- `silverware-fork-knife` - Cutlery
- `noodles` - Noodles/pasta
- `rice` - Rice bowl
- `coffee` - Coffee cup
- `cake` - Cake/dessert

[Browse all icons](https://pictogrammers.com/library/mdi/)

#### Option 2: Use Custom Logo Image

1. Create a logo image:
   - Size: 512x512 pixels (square)
   - Format: PNG with transparent background
   - Keep it simple and recognizable

2. Save it as: `client-app/assets/logo.png`

3. Update `.env`:
```env
APP_LOGO_TYPE=image
```

---

## 🌐 API Configuration

### Development (Local Testing)

**For iOS Simulator:**
```env
API_BASE_URL=http://localhost:3000/api
```

**For Android Emulator:**
```env
API_BASE_URL=http://10.0.2.2:3000/api
```

**For Physical Device (same WiFi network):**
```env
API_BASE_URL=http://YOUR_COMPUTER_IP:3000/api
```
Replace `YOUR_COMPUTER_IP` with your computer's local IP address (e.g., `192.168.1.100`)

### Production (APK Build)

**IMPORTANT:** Before building APK, update to your production server:

```env
API_BASE_URL=https://api.yourrestaurant.com/api
```

Your backend must be:
- Deployed to a cloud server (AWS, DigitalOcean, Heroku, etc.)
- Accessible via HTTPS (SSL certificate required)
- Publicly accessible from the internet

---

## 🔄 Applying Changes

After modifying `.env`:

1. **Stop the development server** (Ctrl+C)
2. **Clear Metro bundler cache:**
   ```bash
   npm start -- --clear
   ```
3. **Restart the app**

**Note:** Environment variables are bundled at build time, not runtime. You must restart the bundler for changes to take effect.

---

## 🚀 Building APK

Before building production APK:

1. ✅ Update `APP_NAME` to your restaurant name
2. ✅ Update `APP_TAGLINE` to your tagline
3. ✅ Set `APP_LOGO_TYPE` and configure logo
4. ✅ **CRITICAL:** Update `API_BASE_URL` to production server URL
5. ✅ Verify all values are correct

Then build:
```bash
npx eas-cli build --platform android --profile preview
```

---

## 📝 Example Configurations

### Example 1: Pizza Restaurant with Icon
```env
APP_NAME=Pizza Paradise
APP_TAGLINE=Hot & Fresh, Delivered to Your Door 🍕
APP_LOGO_TYPE=icon
APP_LOGO_ICON=pizza
API_BASE_URL=https://api.pizzaparadise.com/api
```

### Example 2: Burger Joint with Custom Logo
```env
APP_NAME=Burger Bliss
APP_TAGLINE=Gourmet Burgers, Fast Delivery 🍔
APP_LOGO_TYPE=image
API_BASE_URL=https://api.burgerbliss.com/api
```
(Plus `logo.png` file in assets folder)

### Example 3: Multi-Cuisine Restaurant
```env
APP_NAME=FoodHub
APP_TAGLINE=Your favorite cuisines, one app 🍽️
APP_LOGO_TYPE=icon
APP_LOGO_ICON=silverware-fork-knife
API_BASE_URL=https://api.foodhub.com/api
```

---

## ⚠️ Important Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Always use `.env.example`** - This is the template for other developers
3. **Environment variables are case-sensitive**
4. **No quotes needed** - Values are used as-is
5. **Restart required** - Changes need Metro bundler restart

---

## 🐛 Troubleshooting

### Logo not showing?
- Check `APP_LOGO_TYPE` is set correctly
- If using `image`, verify `logo.png` exists in `assets/` folder
- If using `icon`, verify icon name is valid

### App name not updating?
- Clear Metro cache: `npm start -- --clear`
- Restart the development server

### API not connecting?
- Verify `API_BASE_URL` is correct
- Check backend server is running
- For physical devices, ensure same WiFi network
- For production, verify HTTPS and public accessibility

---

## 📞 Support

If you encounter issues, check:
1. `.env` file exists and has correct values
2. Metro bundler was restarted after changes
3. No typos in variable names
4. Backend server is accessible from the device

