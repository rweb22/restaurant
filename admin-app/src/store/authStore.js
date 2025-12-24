import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  // Initialize auth state from storage
  initialize: async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('user'),
      ]);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        // Check if user is admin
        if (user.role === 'admin') {
          set({ user, token, isAuthenticated: true, isLoading: false });
        } else {
          // Not an admin, clear storage
          await AsyncStorage.multiRemove(['authToken', 'user']);
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },

  // Set auth data
  setAuth: async (user, token) => {
    try {
      // Verify user is admin
      if (user.role !== 'admin') {
        throw new Error('Only admin users can access this app');
      }

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Error setting auth:', error);
      throw error;
    }
  },

  // Clear auth data
  clearAuth: async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'user']);
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  },

  // Update user data
  updateUser: async (userData) => {
    try {
      const updatedUser = { ...useAuthStore.getState().user, ...userData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  },
}));

export default useAuthStore;

