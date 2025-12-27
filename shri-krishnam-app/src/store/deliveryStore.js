import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import api from '../services/api';

/**
 * Delivery Store
 * Manages selected address for delivery
 */
const useDeliveryStore = create((set, get) => ({
  // State
  selectedAddress: null,
  deliveryFee: 40, // Default delivery fee
  estimatedDeliveryTime: 30, // Default estimated delivery time in minutes

  // Actions
  loadDeliveryInfo: async () => {
    try {
      const addressData = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_ADDRESS);

      if (addressData) {
        set({ selectedAddress: JSON.parse(addressData) });
      }

      // Fetch delivery fee from restaurant settings
      await get().fetchDeliveryFee();
    } catch (error) {
      console.error('Error loading delivery info:', error);
    }
  },

  fetchDeliveryFee: async () => {
    try {
      console.log('[DeliveryStore] Fetching delivery fee from API...');
      const response = await api.get('/restaurant/delivery-fee');
      console.log('[DeliveryStore] API Response:', response.data);

      if (response.data.success) {
        const newDeliveryFee = response.data.data.deliveryFee;
        const newEstimatedTime = response.data.data.estimatedDeliveryTime;

        console.log('[DeliveryStore] ✅ Updating delivery fee:', {
          old: get().deliveryFee,
          new: newDeliveryFee,
        });

        set({
          deliveryFee: newDeliveryFee,
          estimatedDeliveryTime: newEstimatedTime,
        });
      }
    } catch (error) {
      console.error('[DeliveryStore] ❌ Error fetching delivery fee:', error);
      // Keep default values if fetch fails
    }
  },

  setSelectedAddress: async (address) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_ADDRESS, JSON.stringify(address));
      set({ selectedAddress: address });
    } catch (error) {
      console.error('Error setting selected address:', error);
    }
  },

  clearDeliveryInfo: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_ADDRESS);
      set({ selectedAddress: null });
    } catch (error) {
      console.error('Error clearing delivery info:', error);
    }
  },

  // Computed values
  getDeliveryCharge: () => {
    const { deliveryFee } = get();
    return deliveryFee;
  },

  getEstimatedDeliveryTime: () => {
    const { estimatedDeliveryTime } = get();
    return estimatedDeliveryTime;
  },
}));

export default useDeliveryStore;

