import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Cart Store - Stores only IDs, not prices
 * Prices are fetched dynamically when needed
 */
const useCartStore = create((set, get) => ({
  // State
  items: [], // Array of { itemId, sizeId, addOnIds, quantity }

  // Actions
  loadCart: async () => {
    try {
      const cartData = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      if (cartData) {
        const parsedData = JSON.parse(cartData);

        // Migrate old cart format to new format if needed
        const migratedItems = parsedData.map(item => {
          // If item has old format (with prices), convert to new format
          if (item.sizePrice !== undefined || item.addOns !== undefined) {
            console.log('[CartStore] Migrating old cart item to new format:', item.name || item.id);
            return {
              itemId: item.id,
              sizeId: item.sizeId,
              addOnIds: (item.addOns || []).map(a => a.id),
              quantity: item.quantity || 1,
            };
          }
          // Already in new format
          return item;
        });

        set({ items: migratedItems });
      }
    } catch (error) {
      console.error('[CartStore] Error loading cart:', error);
    }
  },

  addItem: async (item) => {
    const { items } = get();

    // Ensure item has required fields
    if (!item.itemId || !item.sizeId) {
      console.error('[CartStore] Invalid item - missing itemId or sizeId:', item);
      return;
    }

    // Create cart item with only IDs
    const cartItem = {
      itemId: item.itemId,
      sizeId: item.sizeId,
      addOnIds: item.addOnIds || [],
      quantity: item.quantity || 1,
    };

    // Check if item already exists (same item, size, and add-ons)
    const existingIndex = items.findIndex(
      (i) =>
        i.itemId === cartItem.itemId &&
        i.sizeId === cartItem.sizeId &&
        JSON.stringify(i.addOnIds.sort()) === JSON.stringify(cartItem.addOnIds.sort())
    );

    let newItems;
    if (existingIndex >= 0) {
      // Update quantity
      newItems = [...items];
      newItems[existingIndex].quantity += cartItem.quantity;
      console.log('[CartStore] Updated quantity for existing item:', newItems[existingIndex]);
    } else {
      // Add new item
      newItems = [...items, cartItem];
      console.log('[CartStore] Added new item to cart:', cartItem);
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
    console.log('[CartStore] Clearing cart');
    await AsyncStorage.removeItem(STORAGE_KEYS.CART);
    set({ items: [] });
  },

  // Computed values
  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },
}));

export default useCartStore;

