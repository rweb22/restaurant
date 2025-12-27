import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Authentication Store
 */
const useAuthStore = create((set) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  tempPhone: null,
  tempSecret: null,

  // Actions
  setTempPhone: (phone) => set({ tempPhone: phone }),

  setTempSecret: (secret) => set({ tempSecret: secret }),

  login: async (token, user) => {
    try {
      console.log('[AuthStore] Saving auth data to AsyncStorage...');
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      console.log('[AuthStore] Auth data saved successfully');
      set({ token, user, isAuthenticated: true, tempPhone: null, tempSecret: null });
    } catch (error) {
      console.error('[AuthStore] Error saving auth data:', error);
      throw error;
    }
  },

  setAuth: async (token, user) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  },

  loadAuth: async () => {
    try {
      console.log('[AuthStore] Loading auth data from AsyncStorage...');
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

      console.log('[AuthStore] Token exists:', !!token);
      console.log('[AuthStore] User data exists:', !!userData);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log('[AuthStore] Auth data loaded successfully. User:', parsedUser.phone);
        set({
          token,
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        console.log('[AuthStore] No auth data found in storage');
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('[AuthStore] Error loading auth data:', error);
      set({ isLoading: false });
    }
  },

  updateUser: async (userData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      set({ user: userData });
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  },

  logout: async () => {
    try {
      console.log('[AuthStore] Logging out and clearing auth data...');
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      set({ token: null, user: null, isAuthenticated: false });
      console.log('[AuthStore] Logout successful');
    } catch (error) {
      console.error('[AuthStore] Error during logout:', error);
    }
  },
}));

export default useAuthStore;

