# Restaurant Client App

React Native mobile application for the restaurant ordering system.

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo SDK 54** - Development platform
- **React Navigation** - Navigation library
- **NativeWind** - Tailwind CSS for React Native
- **Zustand** - State management
- **TanStack Query (React Query)** - Server state management
- **Axios** - HTTP client
- **AsyncStorage** - Local storage

## Prerequisites

- Node.js 18+ (LTS)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- Backend server running on `http://localhost:3000`

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Running the App

### On Physical Device (Recommended for Testing)

1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Run `npm start` in the terminal
3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app
4. **Important**: Update the API base URL in `src/constants/config.js`:
   ```javascript
   BASE_URL: 'http://YOUR_COMPUTER_IP:3000/api'
   ```
   Replace `YOUR_COMPUTER_IP` with your computer's local IP address (e.g., `192.168.1.100`)

### On Android Emulator

1. Start Android emulator
2. Run `npm run android`
3. API base URL can use `http://10.0.2.2:3000/api` (Android emulator special IP)

### On iOS Simulator (macOS only)

1. Run `npm run ios`
2. API base URL can use `http://localhost:3000/api`

### On Web (for quick testing)

1. Run `npm run web`
2. API base URL can use `http://localhost:3000/api`

## Project Structure

```
client-app/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Button.js
│   │   ├── Input.js
│   │   └── Card.js
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.js
│   │   ├── VerifyOTPScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ItemDetailScreen.js
│   │   └── CartScreen.js
│   ├── services/         # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── menuService.js
│   │   └── orderService.js
│   ├── store/            # Zustand stores
│   │   ├── authStore.js
│   │   └── cartStore.js
│   ├── constants/        # Constants and config
│   │   └── config.js
│   └── utils/            # Utility functions
├── App.js                # Main app component
├── global.css            # Global styles (Tailwind)
├── tailwind.config.js    # Tailwind configuration
├── metro.config.js       # Metro bundler config
└── babel.config.js       # Babel configuration
```

## Features Implemented

### Phase 1: Authentication ✅
- Phone number login
- OTP verification
- Persistent authentication

### Phase 2: Menu Browsing ✅
- Category filtering
- Item listing with images
- Item detail view
- Size selection
- Add-ons selection

### Phase 3: Cart Management ✅
- Add to cart
- Update quantity
- Remove items
- Cart persistence
- Total calculation

## Configuration

### API Base URL

Update `src/constants/config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_IP:3000/api',  // Update this
  TIMEOUT: 30000,
};
```

### Finding Your Computer's IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for your local network IP (usually starts with 192.168.x.x or 10.0.x.x)

## Testing

### Test Credentials

Use any phone number for testing. The backend is configured to accept any OTP in development mode.

Example:
- Phone: `+919999999999`
- OTP: `123456` (any 6-digit code works in dev mode)

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache and restart
npm start -- --clear
```

### Network Request Failed

- Ensure backend server is running
- Check API base URL in `config.js`
- Ensure phone and computer are on same WiFi network
- Check firewall settings

### Styling Not Working

```bash
# Rebuild with cache clear
npm start -- --clear
```

## Next Steps

- [ ] Checkout flow
- [ ] Address management
- [ ] Order placement
- [ ] Payment integration (Razorpay)
- [ ] Order tracking
- [ ] Order history
- [ ] Profile management
- [ ] Offers/Coupons

## Development Notes

- Uses NativeWind for styling (Tailwind CSS)
- All API calls go through Axios interceptors for auth
- Cart and auth state persisted in AsyncStorage
- React Query handles caching and refetching

