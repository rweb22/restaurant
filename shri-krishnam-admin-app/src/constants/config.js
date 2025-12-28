import { API_BASE_URL, APP_VERSION, GOOGLE_MAPS_API_KEY } from '@env';

// API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
};

export const APP_CONFIG = {
  VERSION: APP_VERSION || '1.0.0',
};

// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: GOOGLE_MAPS_API_KEY || '',
};

// Default export for backward compatibility
export default {
  apiUrl: API_CONFIG.BASE_URL,
};

