/**
 * App Configuration
 */
import {
  API_BASE_URL,
  APP_NAME,
  APP_TAGLINE,
  APP_LOGO_TYPE,
  APP_LOGO_ICON,
  APP_VERSION,
} from '@env';

// API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: APP_NAME || 'Shri Krishnam',
  VERSION: APP_VERSION || '1.0.0',
  TAGLINE: APP_TAGLINE || 'Delicious food, delivered fast',
  LOGO_TYPE: APP_LOGO_TYPE || 'image', // 'icon' or 'image' - Changed default to 'image'
  LOGO_ICON: APP_LOGO_ICON || 'food', // Material Design icon name
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

