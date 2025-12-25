import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
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
import useCartStore from '../store/cartStore';
import useDeliveryStore from '../store/deliveryStore';
import AddressSelectionModal from '../components/AddressSelectionModal';
import OffersModal from '../components/OffersModal';
import QuantitySelector from '../components/QuantitySelector';
import PriceBreakdown from '../components/PriceBreakdown';
import RazorpayCheckout from '../components/RazorpayCheckout';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import addressService from '../services/addressService';
import restaurantService from '../services/restaurantService';
import { initializeRazorpayPayment, getRazorpayConfig, handlePaymentSuccess, handlePaymentFailure, handlePaymentCancel } from '../utils/razorpay';
import { API_CONFIG } from '../constants/config';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

const CartScreen = ({ navigation }) => {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore();
  const { selectedAddress, selectedLocation, loadDeliveryInfo, setSelectedAddress } = useDeliveryStore();
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [offersModalVisible, setOffersModalVisible] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [razorpayOptions, setRazorpayOptions] = useState(null);
  const [clearCartModalVisible, setClearCartModalVisible] = useState(false);
  const [clearCartSuccessModalVisible, setClearCartSuccessModalVisible] = useState(false);

  // Fetch addresses to validate selected address
  const { data: addressesData } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
    enabled: !!selectedAddress, // Only fetch if there's a selected address
  });

  // Fetch restaurant status
  const { data: statusData } = useQuery({
    queryKey: ['restaurant', 'status'],
    queryFn: () => restaurantService.getStatus(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const restaurantStatus = statusData?.data;

  useEffect(() => {
    loadDeliveryInfo();
  }, []);

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

  // Calculate price breakdown
  const calculatePriceBreakdown = () => {
    // Calculate subtotal (items + add-ons)
    const subtotal = items.reduce((total, item) => {
      const itemPrice = parseFloat(item.sizePrice) || 0;
      const addOnsPrice = (item.addOns || []).reduce((sum, addOn) => sum + parseFloat(addOn.price || 0), 0);
      return total + (itemPrice + addOnsPrice) * item.quantity;
    }, 0);

    // Calculate GST per category
    const gstAmount = items.reduce((total, item) => {
      const itemPrice = parseFloat(item.sizePrice) || 0;
      const addOnsPrice = (item.addOns || []).reduce((sum, addOn) => sum + parseFloat(addOn.price || 0), 0);
      const itemTotal = (itemPrice + addOnsPrice) * item.quantity;
      const gstRate = item.category?.gstRate || 5; // Default to 5% if not available
      const gst = (itemTotal * gstRate) / 100;
      return total + gst;
    }, 0);

    // Get delivery charge from selected location
    let deliveryCharge = selectedLocation?.deliveryCharge || 0;

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
  const categoryIds = [...new Set(items.map(item => item.category?.id).filter(Boolean))];
  const itemIds = [...new Set(items.map(item => item.id).filter(Boolean))];

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
      if (items.length === 0) {
        Alert.alert('Error', 'Your cart is empty');
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

      // Validate cart items have sizeId (required for backend)
      const invalidItems = items.filter(item => !item.sizeId);
      if (invalidItems.length > 0) {
        Alert.alert(
          'Cart Update Required',
          'Your cart contains items from an older version. Please clear your cart and add items again.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear Cart',
              style: 'destructive',
              onPress: () => {
                clearCart();
                navigation.navigate('Main', { screen: 'HomeTab' });
              }
            },
          ]
        );
        setIsCheckingOut(false);
        return;
      }

      // Prepare order data
      const orderData = {
        addressId: selectedAddress.id,
        offerCode: appliedOffer?.code || null,
        items: items.map(item => ({
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

      // Step 2: Initiate payment
      console.log('[CartScreen] Initiating payment for order:', orderId);
      const paymentInitResponse = await paymentService.initiatePayment(orderId);
      console.log('[CartScreen] Payment initiated:', paymentInitResponse);

      const paymentData = paymentInitResponse.data || paymentInitResponse;
      const razorpayOrderId = paymentData.gatewayOrderId;
      const amount = paymentData.amount;
      const currency = paymentData.currency;
      const key = paymentData.razorpayKeyId;

      console.log('[CartScreen] Payment details:', { razorpayOrderId, amount, currency, key });

      // Step 3: Open Razorpay checkout
      console.log('[CartScreen] Opening Razorpay checkout...');
      const razorpayConfig = getRazorpayConfig();

      // Prepare Razorpay options
      const paymentOptions = {
        orderId: razorpayOrderId,
        amount: amount,
        currency: currency,
        key: key,
        name: razorpayConfig.name,
        description: razorpayConfig.description,
      };

      let paymentResult;
      try {
        paymentResult = await initializeRazorpayPayment({
          ...paymentOptions,
          onShow: () => {
            console.log('[CartScreen] Showing payment modal');
            setRazorpayOptions(paymentOptions);
            setPaymentModalVisible(true);
          },
        });
        console.log('[CartScreen] Payment completed:', paymentResult);
        setPaymentModalVisible(false);
        setRazorpayOptions(null);
      } catch (paymentError) {
        console.log('[CartScreen] Payment cancelled or failed:', paymentError.message);
        setPaymentModalVisible(false);
        setRazorpayOptions(null);
        setIsCheckingOut(false);

        if (paymentError.message === 'Payment cancelled by user') {
          Alert.alert('Payment Cancelled', 'You cancelled the payment.');
        } else {
          Alert.alert('Payment Failed', 'Payment failed. Please try again.');
        }
        return;
      }

      // Step 4: Verify payment
      console.log('[CartScreen] Verifying payment...');
      const verificationResponse = await paymentService.verifyPayment(paymentResult);
      console.log('[CartScreen] Payment verified:', verificationResponse);

      // Step 5: Clear cart and navigate to confirmation
      console.log('[CartScreen] Payment successful! Clearing cart...');
      await clearCart();

      setIsCheckingOut(false);

      // Navigate to order confirmation screen
      navigation.replace('OrderConfirmation', { orderId });

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

  if (items.length === 0) {
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
            onPress={() => navigation.getParent().navigate('HomeTab')}
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Cart Items */}
        <View style={styles.section}>
          {items.map((item, index) => {
            const itemTotal = (parseFloat(item.sizePrice) +
              (item.addOns?.reduce((sum, a) => sum + parseFloat(a.price), 0) || 0)) * item.quantity;

            return (
              <Surface key={`${item.id}-${item.sizeName}-${index}`} style={styles.cartItemCard} elevation={1}>
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
                {selectedLocation ? (
                  <Text variant="bodySmall" style={styles.addressLocationText}>
                    {selectedLocation.area}, {selectedLocation.city} - {selectedLocation.pincode}
                  </Text>
                ) : null}
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
            gst={priceBreakdown.gstAmount}
            deliveryCharge={priceBreakdown.deliveryCharge}
            discount={appliedOffer && parseFloat(priceBreakdown.discountAmount) > 0 ? priceBreakdown.discountAmount : null}
            total={priceBreakdown.grandTotal}
            showWarning={!selectedLocation}
            warningText="Select delivery address to see accurate delivery charge"
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

      {/* Razorpay Payment Checkout */}
      <RazorpayCheckout
        visible={paymentModalVisible}
        options={razorpayOptions}
        onSuccess={(paymentData) => {
          console.log('[CartScreen] Payment success callback:', paymentData);
          handlePaymentSuccess(paymentData);
        }}
        onFailure={(error) => {
          console.log('[CartScreen] Payment failure callback:', error);
          handlePaymentFailure(error);
        }}
        onCancel={() => {
          console.log('[CartScreen] Payment cancel callback');
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
