import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Delivery Store
 * Manages selected address and location for delivery
 */
const useDeliveryStore = create((set, get) => ({
  // State
  selectedAddress: null,
  selectedLocation: null,

  // Actions
  loadDeliveryInfo: async () => {
    try {
      const addressData = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_ADDRESS);
      const locationData = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_LOCATION);
      
      if (addressData) {
        set({ selectedAddress: JSON.parse(addressData) });
      }
      if (locationData) {
        set({ selectedLocation: JSON.parse(locationData) });
      }
    } catch (error) {
      console.error('Error loading delivery info:', error);
    }
  },

  setSelectedAddress: async (address) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_ADDRESS, JSON.stringify(address));
      set({ selectedAddress: address });
      
      // If address has location, set it too
      if (address?.location) {
        await get().setSelectedLocation(address.location);
      }
    } catch (error) {
      console.error('Error setting selected address:', error);
    }
  },

  setSelectedLocation: async (location) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_LOCATION, JSON.stringify(location));
      set({ selectedLocation: location });
    } catch (error) {
      console.error('Error setting selected location:', error);
    }
  },

  clearDeliveryInfo: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_ADDRESS);
      await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_LOCATION);
      set({ selectedAddress: null, selectedLocation: null });
    } catch (error) {
      console.error('Error clearing delivery info:', error);
    }
  },

  // Computed values
  getDeliveryCharge: () => {
    const { selectedLocation } = get();
    return selectedLocation?.deliveryCharge || 0;
  },

  getEstimatedDeliveryTime: () => {
    const { selectedLocation } = get();
    return selectedLocation?.estimatedDeliveryTime || null;
  },
}));

export default useDeliveryStore;

