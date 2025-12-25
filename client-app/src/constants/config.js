/**
 * App Configuration
 */

// API Configuration
export const API_CONFIG = {
  // Update this to your backend URL
  // For local development on physical device, use your computer's IP address
  // For Android emulator, use 10.0.2.2
  // For iOS simulator, use localhost
  BASE_URL: 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Restaurant App',
  VERSION: '1.0.0',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  CART: '@cart',
  ADDRESSES: '@addresses',
  SELECTED_ADDRESS: '@selected_address',
  SELECTED_LOCATION: '@selected_location',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Payment Methods
export const PAYMENT_METHODS = {
  UPIGATEWAY: 'upigateway',
  COD: 'cod',
};

