import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import {
  Text,
  Button,
  IconButton,
  Appbar,
  Surface,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import useCartStore from '../store/cartStore';
import useDeliveryStore from '../store/deliveryStore';
import AddressSelectionModal from '../components/AddressSelectionModal';
import OffersModal from '../components/OffersModal';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import addressService from '../services/addressService';
import restaurantService from '../services/restaurantService';
import { initializeRazorpayPayment, getRazorpayConfig, handlePaymentSuccess, handlePaymentFailure, handlePaymentCancel, getPaymentOptions } from '../utils/razorpay';
import { API_CONFIG } from '../constants/config';

const CartScreen = ({ navigation }) => {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore();
  const { selectedAddress, selectedLocation, loadDeliveryInfo, setSelectedAddress } = useDeliveryStore();
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [offersModalVisible, setOffersModalVisible] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
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
                navigation.navigate('Home');
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

      let paymentResult;
      try {
        paymentResult = await initializeRazorpayPayment({
          orderId: razorpayOrderId,
          amount: amount,
          currency: currency,
          key: key,
          name: razorpayConfig.name,
          description: razorpayConfig.description,
          onShow: () => {
            console.log('[CartScreen] Showing payment modal');
            setPaymentModalVisible(true);
          },
        });
        console.log('[CartScreen] Payment completed:', paymentResult);
        setPaymentModalVisible(false);
      } catch (paymentError) {
        console.log('[CartScreen] Payment cancelled or failed:', paymentError.message);
        setPaymentModalVisible(false);
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
          <Appbar.BackAction onPress={() => navigation.goBack()} />
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
            onPress={() => navigation.navigate('Home')}
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
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Cart" subtitle={`${getItemCount()} items`} />
        <Appbar.Action
          icon="trash-can-outline"
          onPress={handleClearCart}
          accessibilityLabel="Clear cart"
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Cart Items */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Items</Text>
          {items.map((item, index) => (
            <View key={`${item.id}-${item.sizeName}-${index}`}>
              <Surface style={styles.itemContainer} elevation={0}>
                <Image
                  source={{
                    uri: item.imageUrl
                      ? `${API_CONFIG.BASE_URL.replace('/api', '')}${item.imageUrl}`
                      : 'https://via.placeholder.com/80'
                  }}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text variant="titleMedium" style={styles.itemName}>
                    {item.name}
                  </Text>
                  {item.sizeName && (
                    <Text variant="bodySmall" style={styles.itemMeta}>
                      Size: {item.sizeName.charAt(0).toUpperCase() + item.sizeName.slice(1)}
                    </Text>
                  )}
                  {item.addOns && item.addOns.length > 0 && (
                    <Text variant="bodySmall" style={styles.itemMeta}>
                      Add-ons: {item.addOns.map((a) => a.name).join(', ')}
                    </Text>
                  )}
                  <View style={styles.itemPriceRow}>
                    <Text variant="titleMedium" style={styles.itemPrice}>
                      ₹{item.sizePrice}
                    </Text>
                    {item.addOns && item.addOns.length > 0 && (
                      <Text variant="bodySmall" style={styles.addOnsPrice}>
                        + ₹{item.addOns.reduce((sum, a) => sum + parseFloat(a.price), 0).toFixed(2)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.quantityContainer}>
                    <IconButton
                      icon="minus"
                      size={20}
                      mode="contained-tonal"
                      onPress={() => updateQuantity(index, item.quantity - 1)}
                    />
                    <Text variant="titleMedium" style={styles.quantity}>
                      {item.quantity}
                    </Text>
                    <IconButton
                      icon="plus"
                      size={20}
                      mode="contained-tonal"
                      onPress={() => updateQuantity(index, item.quantity + 1)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor="#dc2626"
                      onPress={() => removeItem(index)}
                      style={styles.deleteButton}
                    />
                  </View>
                </View>
              </Surface>
              <Divider />
            </View>
          ))}
        </View>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Delivery Address</Text>
          {selectedAddress ? (
            <TouchableOpacity
              onPress={() => setAddressModalVisible(true)}
              activeOpacity={0.7}
            >
              <Surface style={styles.addressCard} elevation={0}>
                <View style={styles.addressContent}>
                  <Text variant="labelSmall" style={styles.deliverTo}>
                    DELIVERING TO
                  </Text>
                  <Text variant="titleSmall" style={styles.addressLabel}>
                    {selectedAddress.label || 'Address'}
                  </Text>
                  <Text variant="bodySmall" style={styles.addressText}>
                    {selectedAddress.addressLine1}
                  </Text>
                  {selectedAddress.addressLine2 && (
                    <Text variant="bodySmall" style={styles.addressText}>
                      {selectedAddress.addressLine2}
                    </Text>
                  )}
                  {selectedLocation && (
                    <Text variant="bodySmall" style={styles.locationText}>
                      📍 {selectedLocation.area}, {selectedLocation.city} - {selectedLocation.pincode}
                    </Text>
                  )}
                </View>
                <Button mode="text" compact onPress={() => setAddressModalVisible(true)}>
                  Change
                </Button>
              </Surface>
            </TouchableOpacity>
          ) : (
            <Button
              mode="outlined"
              icon="map-marker"
              onPress={() => setAddressModalVisible(true)}
              style={styles.selectAddressButton}
            >
              Select Delivery Address
            </Button>
          )}
        </View>

        {/* Offers Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Offers & Discounts</Text>
          {appliedOffer ? (
            <Surface style={styles.appliedOfferCard} elevation={0}>
              <View style={styles.appliedOfferContent}>
                <View style={styles.offerIconContainer}>
                  <Text style={styles.offerIcon}>🎉</Text>
                </View>
                <View style={styles.appliedOfferDetails}>
                  <Text variant="titleSmall" style={styles.appliedOfferCode}>
                    {appliedOffer.code}
                  </Text>
                  <Text variant="bodySmall" style={styles.appliedOfferSavings}>
                    {appliedOffer.freeDelivery
                      ? 'Free Delivery Applied!'
                      : `You saved ₹${appliedOffer.discountAmount}`}
                  </Text>
                  {appliedOffer.description && (
                    <Text variant="bodySmall" style={styles.appliedOfferDescription}>
                      {appliedOffer.description}
                    </Text>
                  )}
                </View>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={handleRemoveOffer}
                />
              </View>
            </Surface>
          ) : (
            <Button
              mode="outlined"
              icon="tag"
              onPress={() => setOffersModalVisible(true)}
              style={styles.viewOffersButton}
            >
              View Available Offers
            </Button>
          )}
        </View>

        {/* Price Breakdown Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Bill Details</Text>
          <Surface style={styles.billCard} elevation={0}>

            <View style={styles.priceRow}>
              <Text variant="bodyMedium" style={styles.priceLabel}>Item Total</Text>
              <Text variant="bodyMedium">₹{priceBreakdown.subtotal}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text variant="bodyMedium" style={styles.priceLabel}>GST</Text>
              <Text variant="bodyMedium">₹{priceBreakdown.gstAmount}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text variant="bodyMedium" style={styles.priceLabel}>
                Delivery Charge
                {!selectedLocation && <Text style={styles.warningText}> *</Text>}
              </Text>
              <Text variant="bodyMedium">₹{priceBreakdown.deliveryCharge}</Text>
            </View>
            {appliedOffer && parseFloat(priceBreakdown.discountAmount) > 0 && (
              <View style={styles.priceRow}>
                <Text variant="bodyMedium" style={styles.discountLabel}>Discount</Text>
                <Text variant="bodyMedium" style={styles.discountAmount}>
                  - ₹{priceBreakdown.discountAmount}
                </Text>
              </View>
            )}
            {!selectedLocation && (
              <Text variant="bodySmall" style={styles.warningText}>
                * Select delivery address to see delivery charge
              </Text>
            )}
          </Surface>
        </View>
      </ScrollView>

      {/* Clear Cart Button */}
      <View style={styles.clearCartContainer}>
        <Button
          mode="text"
          onPress={handleClearCart}
          icon="trash-can-outline"
          textColor="#dc2626"
        >
          Clear Cart
        </Button>
      </View>

      {/* Bottom Bar - Only Total and Checkout */}
      <Surface style={styles.bottomBar} elevation={4}>
        <View style={styles.bottomBarContent}>
          <View style={styles.totalSection}>
            <Text variant="titleMedium" style={styles.bottomTotalLabel}>Total</Text>
            <Text variant="headlineMedium" style={styles.bottomTotal}>
              ₹{priceBreakdown.grandTotal}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleCheckout}
            style={styles.checkoutButton}
            contentStyle={styles.checkoutButtonContent}
            disabled={isCheckingOut || !restaurantStatus?.isOpen}
            loading={isCheckingOut}
          >
            {!restaurantStatus?.isOpen
              ? 'Restaurant Closed'
              : isCheckingOut
                ? 'Processing...'
                : 'Checkout'}
          </Button>
        </View>
      </Surface>

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

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          handlePaymentCancel();
          setPaymentModalVisible(false);
          setIsCheckingOut(false);
        }}
      >
        <View style={styles.paymentModalOverlay}>
          <Surface style={styles.paymentModalContent} elevation={5}>
            <Text variant="headlineSmall" style={styles.paymentModalTitle}>
              Mock Payment Gateway
            </Text>

            <View style={styles.paymentModalDetails}>
              <Text variant="bodyMedium" style={styles.paymentModalLabel}>
                This is a mock payment for development.
              </Text>

              <View style={styles.paymentModalRow}>
                <Text variant="bodyMedium" style={styles.paymentModalLabel}>Order ID:</Text>
                <Text variant="bodyMedium" style={styles.paymentModalValue}>
                  {getPaymentOptions()?.orderId}
                </Text>
              </View>

              <View style={styles.paymentModalRow}>
                <Text variant="bodyMedium" style={styles.paymentModalLabel}>Amount:</Text>
                <Text variant="titleLarge" style={styles.paymentModalAmount}>
                  ₹{parseFloat(getPaymentOptions()?.amount || 0).toFixed(2)}
                </Text>
              </View>

              <Text variant="bodySmall" style={styles.paymentModalInstruction}>
                Select an option to simulate payment:
              </Text>
            </View>

            <View style={styles.paymentModalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  handlePaymentCancel();
                  setPaymentModalVisible(false);
                  setIsCheckingOut(false);
                }}
                style={styles.paymentModalButton}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                buttonColor="#dc2626"
                onPress={() => {
                  handlePaymentFailure();
                }}
                style={styles.paymentModalButton}
              >
                Simulate Failure
              </Button>

              <Button
                mode="contained"
                onPress={() => {
                  handlePaymentSuccess();
                }}
                style={styles.paymentModalButton}
              >
                Simulate Success
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>

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
                navigation.navigate('Home');
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
    backgroundColor: '#fafaf9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    color: '#78716c',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 8,
    color: '#292524',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemMeta: {
    color: '#78716c',
    marginBottom: 2,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  itemPrice: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  addOnsPrice: {
    color: '#78716c',
    marginLeft: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  addressCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressContent: {
    flex: 1,
  },
  deliverTo: {
    color: '#78716c',
    fontWeight: '600',
    marginBottom: 2,
  },
  addressLabel: {
    fontWeight: 'bold',
    color: '#292524',
    marginBottom: 4,
  },
  addressText: {
    color: '#57534e',
    marginBottom: 2,
  },
  locationText: {
    color: '#78716c',
    marginTop: 4,
  },
  selectAddressButton: {
    marginHorizontal: 16,
  },
  viewOffersButton: {
    marginHorizontal: 16,
  },
  appliedOfferCard: {
    backgroundColor: '#dcfce7',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  appliedOfferContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerIconContainer: {
    marginRight: 12,
  },
  offerIcon: {
    fontSize: 24,
  },
  appliedOfferDetails: {
    flex: 1,
  },
  appliedOfferCode: {
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 2,
  },
  appliedOfferSavings: {
    color: '#15803d',
    marginBottom: 4,
  },
  appliedOfferDescription: {
    color: '#166534',
    fontSize: 12,
  },
  billCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    color: '#78716c',
  },
  discountLabel: {
    color: '#15803d',
    fontWeight: '600',
  },
  discountAmount: {
    color: '#15803d',
    fontWeight: '600',
  },
  warningText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
  },
  bottomBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalSection: {
    flex: 1,
  },
  bottomTotalLabel: {
    color: '#78716c',
    marginBottom: 2,
  },
  bottomTotal: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  clearCartContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
    alignItems: 'center',
  },
  checkoutButton: {
    marginLeft: 16,
  },
  checkoutButtonContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paymentModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  paymentModalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#292524',
  },
  paymentModalDetails: {
    marginBottom: 24,
  },
  paymentModalLabel: {
    color: '#78716c',
    marginBottom: 8,
  },
  paymentModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentModalValue: {
    color: '#292524',
    fontFamily: 'monospace',
  },
  paymentModalAmount: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  paymentModalInstruction: {
    color: '#78716c',
    marginTop: 16,
    textAlign: 'center',
  },
  paymentModalButtons: {
    gap: 12,
  },
  paymentModalButton: {
    marginBottom: 8,
  },
});

export default CartScreen;
