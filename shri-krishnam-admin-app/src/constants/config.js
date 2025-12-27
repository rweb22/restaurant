import { API_BASE_URL, APP_VERSION } from '@env';

// API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
};

export const APP_CONFIG = {
  VERSION: APP_VERSION || '1.0.0',
};

// Default export for backward compatibility
export default {
  apiUrl: API_CONFIG.BASE_URL,
};

