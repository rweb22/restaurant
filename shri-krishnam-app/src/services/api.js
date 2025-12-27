import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

/**
 * Axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      console.log('═══════════════════════════════════════');
      console.log('[API] 🚀 REQUEST DETAILS:');
      console.log('[API] URL:', config.baseURL + config.url);
      console.log('[API] Method:', config.method?.toUpperCase());
      console.log('[API] Headers:', JSON.stringify(config.headers, null, 2));
      console.log('[API] Data:', JSON.stringify(config.data, null, 2));
      console.log('[API] Token exists:', !!token);
      if (token) {
        console.log('[API] Token (first 20 chars):', token.substring(0, 20) + '...');
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('[API] No token found in AsyncStorage');
      }
      console.log('═══════════════════════════════════════');
    } catch (error) {
      console.error('[API] ❌ Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('[API] ❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
api.interceptors.response.use(
  (response) => {
    console.log('═══════════════════════════════════════');
    console.log('[API] ✅ RESPONSE SUCCESS:');
    console.log('[API] Status:', response.status);
    console.log('[API] Data:', JSON.stringify(response.data, null, 2));
    console.log('═══════════════════════════════════════');
    return response;
  },
  async (error) => {
    console.log('═══════════════════════════════════════');
    console.log('[API] ❌ RESPONSE ERROR:');
    console.log('[API] Error message:', error.message);
    console.log('[API] Error code:', error.code);
    console.log('[API] Response status:', error.response?.status);
    console.log('[API] Response data:', JSON.stringify(error.response?.data, null, 2));
    console.log('[API] Request URL:', error.config?.url);
    console.log('[API] Request method:', error.config?.method);
    console.log('[API] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.log('═══════════════════════════════════════');

    if (error.response?.status === 401) {
      console.log('[API] 401 Unauthorized - Token expired or invalid');
      // Token expired or invalid - clear auth data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      console.log('[API] Auth data cleared due to 401 response');
      // Note: The app will automatically redirect to login when auth state changes
    }
    return Promise.reject(error);
  }
);

export default api;

