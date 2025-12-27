import menuService from './menuService';

/**
 * Cart Service - Validates cart items and fetches current prices
 */
const cartService = {
  /**
   * Validate and enrich cart items with current prices
   * @param {Array} cartItems - Array of cart items with IDs only
   * @returns {Promise<Object>} - { validItems, invalidItems, errors }
   */
  validateCart: async (cartItems) => {
    console.log('[CartService] ===== STARTING CART VALIDATION =====');
    console.log('[CartService] Number of items to validate:', cartItems.length);

    const validItems = [];
    const invalidItems = [];
    const errors = [];

    for (const cartItem of cartItems) {
      try {
        console.log('[CartService] Validating item:', cartItem.itemId);

        // Fetch current item data with sizes and addons
        const itemResponse = await menuService.getItemById(cartItem.itemId, {
          includeSizes: true,
          includeAddOns: true,
        });

        console.log('[CartService] API Response for item', cartItem.itemId, ':', itemResponse);
        const item = itemResponse.item;

        // Check if item exists and is available
        if (!item) {
          invalidItems.push({
            ...cartItem,
            reason: 'Item no longer exists',
          });
          errors.push(`Item ID ${cartItem.itemId} not found`);
          continue;
        }

        if (!item.isAvailable) {
          invalidItems.push({
            ...cartItem,
            reason: 'Item is no longer available',
            itemName: item.name,
          });
          errors.push(`${item.name} is no longer available`);
          continue;
        }

        // Find the selected size
        const selectedSize = item.sizes?.find(s => s.id === cartItem.sizeId);
        if (!selectedSize) {
          invalidItems.push({
            ...cartItem,
            reason: 'Selected size no longer exists',
            itemName: item.name,
          });
          errors.push(`Selected size for ${item.name} not found`);
          continue;
        }

        if (!selectedSize.isAvailable) {
          invalidItems.push({
            ...cartItem,
            reason: 'Selected size is no longer available',
            itemName: item.name,
            sizeName: selectedSize.size,
          });
          errors.push(`${selectedSize.size} size for ${item.name} is no longer available`);
          continue;
        }

        // Validate and enrich add-ons
        const enrichedAddOns = [];
        let addOnsValid = true;

        if (cartItem.addOnIds && cartItem.addOnIds.length > 0) {
          for (const addOnId of cartItem.addOnIds) {
            const addOn = item.addOns?.find(a => a.id === addOnId);
            
            if (!addOn) {
              invalidItems.push({
                ...cartItem,
                reason: 'Selected add-on no longer exists',
                itemName: item.name,
              });
              errors.push(`Add-on ID ${addOnId} for ${item.name} not found`);
              addOnsValid = false;
              break;
            }

            if (!addOn.isAvailable) {
              invalidItems.push({
                ...cartItem,
                reason: `Add-on "${addOn.name}" is no longer available`,
                itemName: item.name,
              });
              errors.push(`${addOn.name} for ${item.name} is no longer available`);
              addOnsValid = false;
              break;
            }

            enrichedAddOns.push({
              id: addOn.id,
              name: addOn.name,
              price: parseFloat(addOn.price),
            });
          }
        }

        if (!addOnsValid) {
          continue;
        }

        // Create enriched cart item with current prices
        const enrichedItem = {
          // Original cart data
          itemId: cartItem.itemId,
          sizeId: cartItem.sizeId,
          addOnIds: cartItem.addOnIds || [],
          quantity: cartItem.quantity,

          // Enriched data with current prices
          name: item.name,
          imageUrl: item.imageUrl,
          sizeName: selectedSize.size,
          sizePrice: parseFloat(selectedSize.price),
          addOns: enrichedAddOns,
          category: {
            id: item.category.id,
            name: item.category.name,
            gstRate: parseFloat(item.category.gstRate),
          },
          isAvailable: item.isAvailable && selectedSize.isAvailable,
        };

        console.log('[CartService] ✅ Enriched item:', {
          itemId: enrichedItem.itemId,
          name: enrichedItem.name,
          sizePrice: enrichedItem.sizePrice,
          addOns: enrichedItem.addOns,
        });

        validItems.push(enrichedItem);
      } catch (error) {
        console.error(`[CartService] Error validating cart item:`, error);
        invalidItems.push({
          ...cartItem,
          reason: 'Error fetching item data',
        });
        errors.push(`Failed to validate item: ${error.message}`);
      }
    }

    console.log('[CartService] ===== VALIDATION SUMMARY =====');
    console.log('[CartService] Total valid items:', validItems.length);
    console.log('[CartService] Total invalid items:', invalidItems.length);
    console.log('[CartService] Errors:', errors);

    return {
      validItems,
      invalidItems,
      errors,
      hasInvalidItems: invalidItems.length > 0,
    };
  },
};

export default cartService;

