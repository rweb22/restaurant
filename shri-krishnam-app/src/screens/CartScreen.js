import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import {
  Text,
  Button,
  IconButton,
  Appbar,
  Surface,
  Divider,
  Icon,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import useCartStore from '../store/cartStore';
import useDeliveryStore from '../store/deliveryStore';
import AddressSelectionModal from '../components/AddressSelectionModal';
import OffersModal from '../components/OffersModal';
import QuantitySelector from '../components/QuantitySelector';
import PriceBreakdown from '../components/PriceBreakdown';
import UPIGatewayCheckout from '../components/UPIGatewayCheckout';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import addressService from '../services/addressService';
import restaurantService from '../services/restaurantService';
import cartService from '../services/cartService';
import { initiatePayment } from '../utils/upigateway';
import { API_CONFIG } from '../constants/config';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

const CartScreen = ({ navigation }) => {
  console.log('[CartScreen] ===== COMPONENT RENDER =====');

  const { items, updateQuantity, removeItem, clearCart, getItemCount } = useCartStore();
  const { selectedAddress, loadDeliveryInfo, setSelectedAddress, deliveryFee, fetchDeliveryFee } = useDeliveryStore();
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [offersModalVisible, setOffersModalVisible] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [razorpayOptions, setRazorpayOptions] = useState(null);
  const [clearCartModalVisible, setClearCartModalVisible] = useState(false);
  const [clearCartSuccessModalVisible, setClearCartSuccessModalVisible] = useState(false);
  const [enrichedItems, setEnrichedItems] = useState([]);
  const [isValidatingCart, setIsValidatingCart] = useState(true);
  const [cartValidationError, setCartValidationError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh

  console.log('[CartScreen] Current state:', {
    itemsCount: items.length,
    enrichedItemsCount: enrichedItems.length,
    deliveryFee,
    refreshKey,
    isValidatingCart,
  });

  // Fetch addresses to validate selected address
  const { data: addressesData, refetch: refetchAddresses, isRefetching: isRefetchingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
    enabled: !!selectedAddress, // Only fetch if there's a selected address
  });

  // Fetch restaurant status
  const { data: statusData, refetch: refetchStatus, isRefetching: isRefetchingStatus } = useQuery({
    queryKey: ['restaurant', 'status'],
    queryFn: () => restaurantService.getStatus(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const restaurantStatus = statusData?.data;

  // Validate and enrich cart items with current prices
  const validateAndEnrichCart = async () => {
    if (items.length === 0) {
      console.log('[CartScreen] No items in cart, skipping validation');
      setEnrichedItems([]);
      setIsValidatingCart(false);
      return;
    }

    try {
      setIsValidatingCart(true);
      setCartValidationError(null);

      console.log('[CartScreen] ===== VALIDATING CART =====');
      console.log('[CartScreen] Cart items to validate:', JSON.stringify(items, null, 2));

      const result = await cartService.validateCart(items);

      console.log('[CartScreen] ===== VALIDATION COMPLETE =====');
      console.log('[CartScreen] Valid items count:', result.validItems.length);
      console.log('[CartScreen] Invalid items count:', result.invalidItems.length);
      console.log('[CartScreen] Enriched items with prices:', JSON.stringify(result.validItems, null, 2));

      setEnrichedItems(result.validItems);
      console.log('[CartScreen] State updated with enriched items');

      // Show alert if there are invalid items
      if (result.hasInvalidItems) {
        const invalidItemsMessage = result.errors.join('\n');
        Alert.alert(
          'Cart Items Updated',
          `Some items in your cart are no longer available:\n\n${invalidItemsMessage}\n\nThese items have been removed from your cart.`,
          [
            {
              text: 'OK',
              onPress: async () => {
                // Remove invalid items from cart
                const validItemIndices = result.validItems.map(validItem =>
                  items.findIndex(item =>
                    item.itemId === validItem.itemId &&
                    item.sizeId === validItem.sizeId
                  )
                );

                // Remove items that are not in validItemIndices
                for (let i = items.length - 1; i >= 0; i--) {
                  if (!validItemIndices.includes(i)) {
                    await removeItem(i);
                  }
                }
              }
            }
          ]
        );
      }

      setIsValidatingCart(false);
    } catch (error) {
      console.error('[CartScreen] Error validating cart:', error);
      setCartValidationError('Failed to load cart items. Please try again.');
      setIsValidatingCart(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    console.log('[CartScreen] ===== PULL TO REFRESH =====');
    console.log('[CartScreen] Refreshing cart, prices, and delivery fee...');

    // Increment refresh key to trigger validation
    setRefreshKey(prev => prev + 1);

    // Also refetch other data
    await Promise.all([
      refetchStatus(),
      selectedAddress ? refetchAddresses() : Promise.resolve(),
    ]);

    setRefreshing(false);
  };

  const isRefreshing = refreshing || isRefetchingStatus || isRefetchingAddresses;

  useEffect(() => {
    console.log('[CartScreen] useEffect - loadDeliveryInfo');
    loadDeliveryInfo();
  }, [loadDeliveryInfo]);

  // ALTERNATIVE: Use navigation listener if useFocusEffect doesn't work
  useEffect(() => {
    console.log('[CartScreen] Setting up navigation listener');

    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[CartScreen] ===== SCREEN FOCUSED (navigation listener) =====');
      console.log('[CartScreen] Triggering validation and delivery fee refresh');

      // Force a refresh by incrementing the key
      setRefreshKey(prev => {
        console.log('[CartScreen] Incrementing refreshKey from', prev, 'to', prev + 1);
        return prev + 1;
      });
    });

    return unsubscribe;
  }, [navigation]);

  // ALSO try useFocusEffect (in case navigation listener doesn't work)
  useFocusEffect(
    useCallback(() => {
      console.log('[CartScreen] ===== SCREEN FOCUSED (useFocusEffect) =====');
      console.log('[CartScreen] Triggering validation and delivery fee refresh via useFocusEffect');

      // Force a refresh by incrementing the key
      setRefreshKey(prev => {
        console.log('[CartScreen] useFocusEffect - Incrementing refreshKey from', prev, 'to', prev + 1);
        return prev + 1;
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Run every time screen is focused
  );

  // Validate cart when screen is focused or items change
  useEffect(() => {
    console.log('[CartScreen] ===== REFRESH TRIGGERED =====');
    console.log('[CartScreen] Refresh key:', refreshKey);
    console.log('[CartScreen] Items count:', items.length);

    if (items.length > 0) {
      console.log('[CartScreen] Validating cart and fetching delivery fee...');
      validateAndEnrichCart();
      fetchDeliveryFee();
    } else {
      console.log('[CartScreen] No items in cart, skipping validation');
      setEnrichedItems([]);
      setIsValidatingCart(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, items.length]); // Re-run when refreshKey or items.length changes

  // Log when enriched items or delivery fee changes (for debugging)
  useEffect(() => {
    console.log('[CartScreen] ===== STATE CHANGED =====');
    console.log('[CartScreen] Enriched items:', enrichedItems.length);
    console.log('[CartScreen] Delivery fee:', deliveryFee);
    console.log('[CartScreen] Component will re-render with new prices');
  }, [enrichedItems, deliveryFee]);

  // Validate selected address when addresses are loaded
  useEffect(() => {
    if (selectedAddress && addressesData?.addresses) {
      const addresses = addressesData.addresses;
      const addressExists = addresses.some(addr => addr.id === selectedAddress.id);
      if (!addressExists) {
        console.log('[CartScreen] Selected address no longer exists, clearing...');
        setSelectedAddress(null);
      }
    }
  }, [selectedAddress, addressesData]);

  // Calculate price breakdown using enriched items with current prices
  const calculatePriceBreakdown = () => {
    console.log('[CartScreen] ===== CALCULATING PRICE BREAKDOWN =====');
    console.log('[CartScreen] Enriched items count:', enrichedItems.length);

    // Calculate subtotal (items + add-ons)
    const subtotal = enrichedItems.reduce((total, item) => {
      const itemPrice = parseFloat(item.sizePrice) || 0;
      const addOnsPrice = (item.addOns || []).reduce((sum, addOn) => sum + parseFloat(addOn.price || 0), 0);
      const itemSubtotal = (itemPrice + addOnsPrice) * item.quantity;
      console.log('[CartScreen] Item:', item.name, 'Price:', itemPrice, 'AddOns:', addOnsPrice, 'Qty:', item.quantity, 'Subtotal:', itemSubtotal);
      return total + itemSubtotal;
    }, 0);

    console.log('[CartScreen] Total Subtotal:', subtotal);

    // Calculate GST per category
    const gstAmount = enrichedItems.reduce((total, item) => {
      const itemPrice = parseFloat(item.sizePrice) || 0;
      const addOnsPrice = (item.addOns || []).reduce((sum, addOn) => sum + parseFloat(addOn.price || 0), 0);
      const itemTotal = (itemPrice + addOnsPrice) * item.quantity;
      const gstRate = item.category?.gstRate || 5; // Default to 5% if not available
      const gst = (itemTotal * gstRate) / 100;
      return total + gst;
    }, 0);

    console.log('[CartScreen] Total GST:', gstAmount);

    // Use delivery fee directly from store (this will trigger re-render when it changes)
    let deliveryCharge = deliveryFee;

    console.log('[CartScreen] Delivery Charge from store:', deliveryCharge);

    // Apply offer discount
    let discountAmount = 0;
    if (appliedOffer) {
      discountAmount = parseFloat(appliedOffer.discountAmount) || 0;
      // If free delivery offer, set delivery charge to 0
      if (appliedOffer.freeDelivery) {
        deliveryCharge = 0;
      }
    }

    // Calculate grand total
    const grandTotal = subtotal + gstAmount + deliveryCharge - discountAmount;

    return {
      subtotal: subtotal.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      deliveryCharge: deliveryCharge.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  };

  const priceBreakdown = calculatePriceBreakdown();

  // Get category and item IDs for offer validation
  const categoryIds = [...new Set(enrichedItems.map(item => item.category?.id).filter(Boolean))];
  const itemIds = [...new Set(enrichedItems.map(item => item.itemId).filter(Boolean))];

  // Handle select offer from modal
  const handleSelectOffer = (offer) => {
    setAppliedOffer(offer);
  };

  // Handle remove offer
  const handleRemoveOffer = () => {
    setAppliedOffer(null);
  };

  const handleCheckout = async () => {
    try {
      // Validation
      if (items.length === 0 || enrichedItems.length === 0) {
        Alert.alert('Error', 'Your cart is empty');
        return;
      }

      if (isValidatingCart) {
        Alert.alert('Please Wait', 'Validating cart items...');
        return;
      }

      if (!selectedAddress) {
        Alert.alert('Select Delivery Location', 'Please select a delivery address before checkout');
        return;
      }

      // Check if restaurant is open
      if (restaurantStatus && !restaurantStatus.isOpen) {
        Alert.alert(
          'Restaurant Closed',
          `Sorry, we are currently closed. ${restaurantStatus.reason}${
            restaurantStatus.nextOpenTime
              ? `\n\nWe will open at ${new Date(restaurantStatus.nextOpenTime).toLocaleString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`
              : ''
          }`
        );
        return;
      }

      setIsCheckingOut(true);

      console.log('[CartScreen] Starting checkout process...');

      // Prepare order data using enriched items
      const orderData = {
        addressId: selectedAddress.id,
        offerCode: appliedOffer?.code || null,
        items: enrichedItems.map(item => ({
          itemSizeId: item.sizeId,
          quantity: item.quantity,
          addOns: (item.addOns || []).map(addOn => ({
            addOnId: addOn.id,
            quantity: 1,
          })),
        })),
        specialInstructions: null,
        deliveryCharge: parseFloat(priceBreakdown.deliveryCharge),
      };

      console.log('[CartScreen] Order data:', JSON.stringify(orderData, null, 2));

      // Step 1: Create order on backend
      console.log('[CartScreen] Creating order...');
      console.log('[CartScreen] Frontend calculated total:', priceBreakdown.grandTotal);
      const orderResponse = await orderService.createOrder(orderData);
      console.log('[CartScreen] Order created:', orderResponse);

      const order = orderResponse.order;
      const orderId = order.id;
      console.log('[CartScreen] Backend calculated total:', order.totalPrice);
      console.log('[CartScreen] Difference:', parseFloat(priceBreakdown.grandTotal) - parseFloat(order.totalPrice));

      // Step 2: Initiate UPIGateway payment
      console.log('[CartScreen] Initiating UPIGateway payment for order:', orderId);
      const paymentInitResponse = await initiatePayment(orderId);
      console.log('[CartScreen] UPIGateway payment initiated:', paymentInitResponse);

      // Prepare payment data for UPIGatewayCheckout component
      const paymentData = {
        orderId: paymentInitResponse.orderId,
        transactionId: paymentInitResponse.transactionId,
        gatewayOrderId: paymentInitResponse.gatewayOrderId,
        clientTxnId: paymentInitResponse.clientTxnId,
        qrCode: paymentInitResponse.qrCode,
        qrString: paymentInitResponse.qrString,
        paymentUrl: paymentInitResponse.paymentUrl,
        amount: paymentInitResponse.amount,
        currency: paymentInitResponse.currency,
      };

      console.log('[CartScreen] Payment data:', paymentData);

      // Step 3: Show UPIGateway checkout modal
      console.log('[CartScreen] Showing UPIGateway checkout modal...');
      setRazorpayOptions(paymentData);
      setPaymentModalVisible(true);

      // Payment will be verified via webhook
      // The UPIGatewayCheckout component will poll for status and call onSuccess/onFailure
      // Success/failure will be handled by the modal callbacks

    } catch (error) {
      console.error('[CartScreen] Checkout error:', error);
      console.error('[CartScreen] Error response:', JSON.stringify(error.response?.data, null, 2));
      setIsCheckingOut(false);

      // Get detailed error message
      let errorMessage = 'Failed to complete checkout. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join('\n');
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error message
      Alert.alert(
        'Checkout Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    console.log('[CartScreen] Payment successful!', paymentData);
    setPaymentModalVisible(false);
    setRazorpayOptions(null);
    setIsCheckingOut(false);

    // Clear cart
    console.log('[CartScreen] Clearing cart...');
    await clearCart();

    // Navigate to order confirmation screen
    navigation.replace('OrderConfirmation', { orderId: paymentData.orderId });
  };

  const handlePaymentFailure = (error) => {
    console.log('[CartScreen] handlePaymentFailure called:', error);
    console.log('[CartScreen] Setting paymentModalVisible to false');
    setPaymentModalVisible(false);
    setRazorpayOptions(null);
    setIsCheckingOut(false);

    Alert.alert(
      'Payment Failed',
      error.message || 'Payment failed. Please try again.',
      [{ text: 'OK' }]
    );
  };

  const handlePaymentCancel = () => {
    console.log('[CartScreen] handlePaymentCancel called');
    console.log('[CartScreen] Setting paymentModalVisible to false');
    setPaymentModalVisible(false);
    setRazorpayOptions(null);
    setIsCheckingOut(false);

    Alert.alert(
      'Payment Cancelled',
      'You cancelled the payment. Your order has not been placed.',
      [{ text: 'OK' }]
    );
  };

  const handleClearCart = () => {
    console.log('[CartScreen] Clear cart button pressed');
    console.log('[CartScreen] Current items count:', items.length);
    setClearCartModalVisible(true);
  };

  const confirmClearCart = async () => {
    setClearCartModalVisible(false);
    try {
      console.log('[CartScreen] Calling clearCart...');
      await clearCart();
      console.log('[CartScreen] Cart cleared successfully');
      setClearCartSuccessModalVisible(true);
    } catch (error) {
      console.error('[CartScreen] Error clearing cart:', error);
      Alert.alert('Error', 'Failed to clear cart. Please try again.');
    }
  };

  // Show loading state while validating cart
  if (isValidatingCart && items.length > 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.Content title="Cart" />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text variant="bodyLarge" style={[styles.emptyText, { marginTop: spacing.lg }]}>
            Loading cart items...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if validation failed
  if (cartValidationError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.Content title="Cart" />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <Icon source="alert-circle" size={64} color={colors.error} />
          <Text variant="headlineSmall" style={[styles.emptyText, { color: colors.error }]}>
            {cartValidationError}
          </Text>
          <Button
            mode="contained"
            onPress={handleRefresh}
            style={styles.browseButton}
          >
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state
  if (items.length === 0 || enrichedItems.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.Content title="Cart" />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <Text variant="displaySmall" style={styles.emptyEmoji}>
            🛒
          </Text>
          <Text variant="headlineSmall" style={styles.emptyText}>
            Your cart is empty
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('HomeTab')}
            style={styles.browseButton}
          >
            Browse Menu
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            My Cart
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <IconButton
          icon="trash-can-outline"
          iconColor={colors.error}
          size={24}
          onPress={handleClearCart}
          style={styles.clearButton}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Cart Items */}
        <View style={styles.section}>
          {enrichedItems.map((item, index) => {
            const itemTotal = (parseFloat(item.sizePrice) +
              (item.addOns?.reduce((sum, a) => sum + parseFloat(a.price), 0) || 0)) * item.quantity;

            return (
              <Surface key={`${item.itemId}-${item.sizeName}-${index}`} style={styles.cartItemCard} elevation={1}>
                {/* Item Image */}
                <Image
                  source={{
                    uri: item.imageUrl
                      ? `${API_CONFIG.BASE_URL.replace('/api', '')}${item.imageUrl}`
                      : 'https://via.placeholder.com/80'
                  }}
                  style={styles.cartItemImage}
                />

                {/* Item Details */}
                <View style={styles.cartItemContent}>
                  <View style={styles.cartItemHeader}>
                    <View style={styles.cartItemInfo}>
                      <Text variant="titleSmall" style={styles.cartItemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {item.sizeName ? (
                        <Chip
                          mode="flat"
                          style={styles.sizeChip}
                          textStyle={styles.sizeChipText}
                        >
                          {item.sizeName.charAt(0).toUpperCase() + item.sizeName.slice(1)}
                        </Chip>
                      ) : null}
                    </View>
                    <IconButton
                      icon="delete-outline"
                      iconColor={colors.error}
                      size={20}
                      onPress={() => removeItem(index)}
                      style={styles.removeButton}
                    />
                  </View>

                  {(item.addOns && item.addOns.length > 0) ? (
                    <Text variant="bodySmall" style={styles.cartItemAddOns} numberOfLines={1}>
                      + {item.addOns.map((a) => a.name).join(', ')}
                    </Text>
                  ) : null}

                  {/* Price and Quantity Row */}
                  <View style={styles.cartItemFooter}>
                    <Text variant="titleMedium" style={styles.cartItemPrice}>
                      ₹{itemTotal.toFixed(2)}
                    </Text>
                    <QuantitySelector
                      quantity={item.quantity}
                      onIncrement={() => updateQuantity(index, item.quantity + 1)}
                      onDecrement={() => updateQuantity(index, item.quantity - 1)}
                      min={1}
                      max={99}
                      size="sm"
                    />
                  </View>
                </View>
              </Surface>
            );
          })}
        </View>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Delivery Address</Text>
          {selectedAddress ? (
            <Surface style={styles.addressCard} elevation={2}>
              <View style={styles.addressCardHeader}>
                <Icon source="map-marker" size={24} color={colors.primary[500]} />
                <Chip
                  mode="flat"
                  style={styles.addressTypeChip}
                  textStyle={styles.addressTypeChipText}
                >
                  {selectedAddress.label || 'Address'}
                </Chip>
              </View>
              <View style={styles.addressCardContent}>
                <Text variant="bodyMedium" style={styles.addressFullText}>
                  {selectedAddress.addressLine1}
                  {selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}
                </Text>
                {selectedAddress.city && (
                  <Text variant="bodySmall" style={styles.addressLocationText}>
                    {selectedAddress.city}
                    {selectedAddress.state ? `, ${selectedAddress.state}` : ''}
                    {selectedAddress.postalCode ? ` - ${selectedAddress.postalCode}` : ''}
                  </Text>
                )}
              </View>
              <Button
                mode="text"
                onPress={() => setAddressModalVisible(true)}
                textColor={colors.primary[500]}
                style={styles.changeAddressButton}
              >
                Change Address
              </Button>
            </Surface>
          ) : (
            <TouchableOpacity
              onPress={() => setAddressModalVisible(true)}
              activeOpacity={0.7}
            >
              <Surface style={styles.selectAddressCard} elevation={1}>
                <Icon source="map-marker-plus" size={32} color={colors.primary[500]} />
                <Text variant="titleSmall" style={styles.selectAddressText}>
                  Add Delivery Address
                </Text>
                <Text variant="bodySmall" style={styles.selectAddressHint}>
                  Tap to select or add a new address
                </Text>
              </Surface>
            </TouchableOpacity>
          )}
        </View>

        {/* Offers Section */}
        <View style={styles.section}>
          {appliedOffer ? (
            <Surface style={styles.appliedOfferCard} elevation={2}>
              <View style={styles.appliedOfferHeader}>
                <Icon source="tag" size={20} color={colors.success} />
                <Text variant="titleSmall" style={styles.appliedOfferTitle}>
                  Offer Applied
                </Text>
              </View>
              <View style={styles.appliedOfferBody}>
                <View style={styles.appliedOfferInfo}>
                  <Text variant="titleMedium" style={styles.appliedOfferCode}>
                    {appliedOffer.code}
                  </Text>
                  <Text variant="bodySmall" style={styles.appliedOfferSavings}>
                    {appliedOffer.freeDelivery
                      ? '🎉 Free Delivery Applied!'
                      : `💰 You saved ₹${appliedOffer.discountAmount}`}
                  </Text>
                </View>
                <IconButton
                  icon="close-circle"
                  iconColor={colors.text.secondary}
                  size={24}
                  onPress={handleRemoveOffer}
                  style={styles.removeOfferButton}
                />
              </View>
            </Surface>
          ) : (
            <TouchableOpacity
              onPress={() => setOffersModalVisible(true)}
              activeOpacity={0.7}
            >
              <Surface style={styles.applyCouponCard} elevation={1}>
                <Icon source="ticket-percent" size={24} color={colors.primary[500]} />
                <Text variant="titleSmall" style={styles.applyCouponText}>
                  Apply Coupon
                </Text>
                <Icon source="chevron-right" size={24} color={colors.text.secondary} />
              </Surface>
            </TouchableOpacity>
          )}
        </View>

        {/* Price Breakdown Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Bill Details</Text>
          <PriceBreakdown
            subtotal={priceBreakdown.subtotal}
            tax={priceBreakdown.gstAmount}
            deliveryFee={priceBreakdown.deliveryCharge}
            discount={appliedOffer && parseFloat(priceBreakdown.discountAmount) > 0 ? priceBreakdown.discountAmount : null}
            total={priceBreakdown.grandTotal}
            showWarning={!selectedAddress}
            warningText="Select delivery address to continue"
          />
        </View>
      </ScrollView>

      {/* Sticky Checkout Button */}
      <LinearGradient
        colors={[colors.primary[500], colors.primary[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.checkoutBar}
      >
        <View style={styles.checkoutBarContent}>
          <View style={styles.checkoutTotalSection}>
            <Text variant="bodySmall" style={styles.checkoutTotalLabel}>
              Total Amount
            </Text>
            <Text variant="headlineSmall" style={styles.checkoutTotal}>
              ₹{priceBreakdown.grandTotal}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCheckout}
            style={styles.checkoutButton}
            activeOpacity={0.8}
          >
            {isCheckingOut ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <View style={styles.checkoutButtonInner}>
                <Text variant="titleMedium" style={styles.checkoutButtonText}>
                  {!restaurantStatus?.isOpen
                    ? 'Restaurant Closed'
                    : !selectedAddress
                      ? 'Select Address'
                      : 'Place Order'}
                </Text>
                <Icon source="arrow-right" size={20} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Address Selection Modal */}
      <AddressSelectionModal
        visible={addressModalVisible}
        onDismiss={() => setAddressModalVisible(false)}
        onAddAddress={() => {
          setAddressModalVisible(false);
          navigation.navigate('AddAddress');
        }}
      />

      {/* Offers Modal */}
      <OffersModal
        visible={offersModalVisible}
        onDismiss={() => setOffersModalVisible(false)}
        onSelectOffer={handleSelectOffer}
        subtotal={parseFloat(priceBreakdown.subtotal)}
        categoryIds={categoryIds}
        itemIds={itemIds}
      />

      {/* UPIGateway Payment Checkout */}
      {console.log('[CartScreen] Rendering UPIGatewayCheckout, paymentModalVisible:', paymentModalVisible)}
      <UPIGatewayCheckout
        visible={paymentModalVisible}
        paymentData={razorpayOptions}
        onSuccess={(paymentData) => {
          console.log('[CartScreen] Payment success callback:', paymentData);
          handlePaymentSuccess(paymentData);
        }}
        onFailure={(error) => {
          console.log('[CartScreen] Payment failure callback:', error);
          handlePaymentFailure(error);
        }}
        onDismiss={() => {
          console.log('[CartScreen] Payment dismiss callback');
          handlePaymentCancel();
        }}
      />

      {/* Clear Cart Confirmation Modal */}
      <Modal
        visible={clearCartModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setClearCartModalVisible(false)}
      >
        <View style={styles.paymentModalOverlay}>
          <Surface style={styles.paymentModalContent} elevation={5}>
            <Text variant="headlineSmall" style={styles.paymentModalTitle}>
              🗑️ Clear Cart
            </Text>

            <Text variant="bodyMedium" style={[styles.paymentModalLabel, { textAlign: 'center', marginBottom: 24 }]}>
              Are you sure you want to remove all items from your cart?
            </Text>

            <View style={styles.paymentModalButtons}>
              <Button
                mode="outlined"
                onPress={() => setClearCartModalVisible(false)}
                style={styles.paymentModalButton}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                buttonColor="#dc2626"
                onPress={confirmClearCart}
                style={styles.paymentModalButton}
              >
                Yes, Clear Cart
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>

      {/* Clear Cart Success Modal */}
      <Modal
        visible={clearCartSuccessModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setClearCartSuccessModalVisible(false)}
      >
        <View style={styles.paymentModalOverlay}>
          <Surface style={styles.paymentModalContent} elevation={5}>
            <Text variant="headlineSmall" style={styles.paymentModalTitle}>
              ✅ Cart Cleared
            </Text>

            <Text variant="bodyMedium" style={[styles.paymentModalLabel, { textAlign: 'center', marginBottom: 24 }]}>
              All items have been removed from your cart.
            </Text>

            <Button
              mode="contained"
              onPress={() => {
                setClearCartSuccessModalVisible(false);
                navigation.navigate('HomeTab');
              }}
              style={styles.paymentModalButton}
            >
              Browse Menu
            </Button>
          </Surface>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary[50],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyText: {
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  browseButton: {
    paddingHorizontal: spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[200],
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerSubtitle: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  clearButton: {
    margin: 0,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontWeight: 'bold',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    color: colors.text.primary,
  },

  // Cart Item Card
  cartItemCard: {
    flexDirection: 'row',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  cartItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cartItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cartItemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemName: {
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.xs,
  },
  sizeChip: {
    height: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeChipText: {
    fontSize: fontSize.xs,
    color: colors.primary[700],
    textAlign: 'center',
    lineHeight: fontSize.xs,
  },
  removeButton: {
    margin: 0,
  },
  cartItemAddOns: {
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  cartItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  cartItemPrice: {
    fontWeight: 'bold',
    color: colors.primary[500],
  },

  // Address Card
  addressCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  addressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addressTypeChip: {
    height: 24,
    backgroundColor: colors.primary[50],
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressTypeChipText: {
    fontSize: fontSize.xs,
    color: colors.primary[700],
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: fontSize.xs,
  },
  addressCardContent: {
    marginBottom: spacing.md,
  },
  addressFullText: {
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  addressLocationText: {
    color: colors.text.secondary,
  },
  changeAddressButton: {
    alignSelf: 'flex-start',
  },
  selectAddressCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
  },
  selectAddressText: {
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  selectAddressHint: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Offers Section
  appliedOfferCard: {
    backgroundColor: colors.success + '15',
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.success + '40',
    ...shadows.sm,
  },
  appliedOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appliedOfferTitle: {
    fontWeight: '600',
    color: colors.success,
    marginLeft: spacing.xs,
  },
  appliedOfferBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appliedOfferInfo: {
    flex: 1,
  },
  appliedOfferCode: {
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  appliedOfferSavings: {
    color: colors.success,
    fontWeight: '600',
  },
  removeOfferButton: {
    margin: 0,
  },
  applyCouponCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.primary[200],
    ...shadows.sm,
  },
  applyCouponText: {
    flex: 1,
    marginLeft: spacing.md,
    color: colors.text.primary,
    fontWeight: '600',
  },

  // Checkout Bar
  checkoutBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.lg,
  },
  checkoutBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkoutTotalSection: {
    flex: 1,
  },
  checkoutTotalLabel: {
    color: colors.white,
    opacity: 0.9,
  },
  checkoutTotal: {
    color: colors.white,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  checkoutButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    minWidth: 140,
  },
  checkoutButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: colors.primary[500],
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },

  // Modals
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  paymentModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  paymentModalTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: colors.text.primary,
  },
  paymentModalDetails: {
    marginBottom: spacing.xl,
  },
  paymentModalLabel: {
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  paymentModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentModalValue: {
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  paymentModalAmount: {
    color: colors.primary[500],
    fontWeight: 'bold',
  },
  paymentModalInstruction: {
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  paymentModalButtons: {
    marginTop: spacing.md,
  },
  paymentModalButton: {
    marginBottom: spacing.sm,
  },
});

export default CartScreen;
