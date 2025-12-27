import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../constants/config';

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
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

// Response interceptor to handle errors
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
      console.log('401 Unauthorized - clearing auth');
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // Reload the page to trigger auth state update
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

