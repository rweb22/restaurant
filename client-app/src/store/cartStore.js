import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Cart Store
 */
const useCartStore = create((set, get) => ({
  // State
  items: [],
  
  // Actions
  loadCart: async () => {
    try {
      const cartData = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      if (cartData) {
        set({ items: JSON.parse(cartData) });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  },

  addItem: async (item) => {
    const { items } = get();

    // Ensure item has a quantity (default to 1 if not provided)
    const itemWithQuantity = {
      ...item,
      quantity: item.quantity || 1
    };

    // Check if item already exists (same item, size, and add-ons)
    const existingIndex = items.findIndex(
      (i) =>
        i.id === itemWithQuantity.id &&
        i.sizeId === itemWithQuantity.sizeId &&
        JSON.stringify(i.addOns) === JSON.stringify(itemWithQuantity.addOns)
    );

    let newItems;
    if (existingIndex >= 0) {
      // Update quantity
      newItems = [...items];
      newItems[existingIndex].quantity += itemWithQuantity.quantity;
    } else {
      // Add new item
      newItems = [...items, itemWithQuantity];
    }

    await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newItems));
    set({ items: newItems });
  },

  updateQuantity: async (index, quantity) => {
    const { items } = get();
    const newItems = [...items];

    if (quantity <= 0) {
      newItems.splice(index, 1);
    } else {
      newItems[index].quantity = quantity;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newItems));
    set({ items: newItems });
  },

  removeItem: async (index) => {
    const { items } = get();
    const newItems = items.filter((_, i) => i !== index);
    await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newItems));
    set({ items: newItems });
  },

  clearCart: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.CART);
    set({ items: [] });
  },

  // Computed values
  getTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      const itemPrice = parseFloat(item.sizePrice) || 0;
      const addOnsPrice = (item.addOns || []).reduce((sum, addOn) => sum + parseFloat(addOn.price || 0), 0);
      return total + (itemPrice + addOnsPrice) * item.quantity;
    }, 0).toFixed(2);
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },
}));

export default useCartStore;

