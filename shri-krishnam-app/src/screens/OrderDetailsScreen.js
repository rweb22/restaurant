import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Button, Surface, Divider, Appbar, Chip, Icon, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import orderService from '../services/orderService';
import menuService from '../services/menuService';
import useCartStore from '../store/cartStore';
import OrderTimeline from '../components/OrderTimeline';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [isReordering, setIsReordering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showReorderSuccessModal, setShowReorderSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reorderItemCount, setReorderItemCount] = useState(0);
  const { addItem } = useCartStore();

  // Fetch order details with polling
  const { data: orderData, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    refetchInterval: (data) => {
      // Poll every 10 seconds if order is not in a final state
      const order = data?.order;
      if (!order) return false;

      const finalStatuses = ['completed', 'cancelled'];
      const shouldPoll = !finalStatuses.includes(order.status);

      return shouldPoll ? 10000 : false; // 10 seconds
    },
  });

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Log polling status
  useEffect(() => {
    const order = orderData?.order;
    if (order) {
      const finalStatuses = ['completed', 'cancelled'];
      const isPolling = !finalStatuses.includes(order.status);
      console.log(`[OrderDetails] Order ${orderId} status: ${order.status}, polling: ${isPolling}`);
    }
  }, [orderData, orderId]);

  const order = orderData?.order;

  const getStatusColor = (status) => {
    const statusColors = {
      pending_payment: colors.warning,
      pending: colors.info,
      confirmed: '#8b5cf6',
      preparing: colors.primary[600],
      ready: colors.success,
      out_for_delivery: '#9c27b0',
      completed: colors.success,
      cancelled: colors.error,
    };
    return statusColors[status] || colors.text.secondary;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending_payment: 'clock-alert-outline',
      pending: 'clock-outline',
      confirmed: 'check-circle-outline',
      preparing: 'chef-hat',
      ready: 'food',
      out_for_delivery: 'bike-fast',
      completed: 'check-all',
      cancelled: 'close-circle-outline',
    };
    return icons[status] || 'information-outline';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_payment: 'Payment Pending',
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      out_for_delivery: 'Out for Delivery',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    setShowCancelModal(false);
    setIsCancelling(true);

    try {
      console.log('[OrderDetails] Cancelling order:', orderId);

      const response = await orderService.cancelOrder(orderId);

      console.log('[OrderDetails] Order cancelled successfully:', response);

      // Refetch order to get updated status
      await refetch();

      setIsCancelling(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('[OrderDetails] Cancel order error:', error);
      console.error('[OrderDetails] Error response:', error.response?.data);
      setIsCancelling(false);
      setErrorMessage(error.response?.data?.error || error.response?.data?.message || 'Failed to cancel order. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleReorder = async () => {
    if (!order || !order.items || order.items.length === 0) {
      setErrorMessage('No items to reorder');
      setShowErrorModal(true);
      return;
    }

    setIsReordering(true);

    try {
      console.log('[OrderDetails] Reordering items from order:', orderId);

      let successCount = 0;
      const skippedItems = [];

      // For each order item, fetch the full item details and add to cart
      for (const orderItem of order.items) {
        try {
          // Fetch full item details to get category, imageUrl, etc.
          const itemResponse = await menuService.getItemById(orderItem.itemId, {
            includeSizes: true,
            includeAddOns: true,
          });

          const item = itemResponse.item;

          // Check if item is available
          if (!item.isAvailable) {
            console.warn(`[OrderDetails] Item ${item.name} is no longer available, skipping`);
            skippedItems.push({ name: orderItem.itemName, reason: 'no longer available' });
            continue;
          }

          // Find the size that matches the order item
          const size = item.sizes?.find(s => s.id === orderItem.itemSizeId);

          if (!size) {
            console.warn(`[OrderDetails] Size not found for item ${orderItem.itemId}, skipping`);
            skippedItems.push({ name: orderItem.itemName, reason: 'size no longer available' });
            continue;
          }

          // Validate and map add-ons using current data
          const validAddOns = [];
          if (orderItem.addOns && orderItem.addOns.length > 0) {
            for (const orderAddOn of orderItem.addOns) {
              // Find the current add-on data
              const currentAddOn = item.addOns?.find(a => a.id === orderAddOn.addOnId);

              if (currentAddOn && currentAddOn.isAvailable) {
                // Use current price, not old price
                validAddOns.push({
                  id: currentAddOn.id,
                  name: currentAddOn.name,
                  price: currentAddOn.price,
                });
              } else {
                console.warn(`[OrderDetails] Add-on ${orderAddOn.addOnName} is no longer available for ${item.name}`);
              }
            }
          }

          // Add item to cart with only IDs (prices will be fetched dynamically)
          addItem({
            itemId: item.id,
            sizeId: size.id,
            addOnIds: validAddOns.map(a => a.id),
            quantity: orderItem.quantity || 1,
          });

          successCount++;
          console.log(`[OrderDetails] Added ${orderItem.quantity}x ${item.name} to cart`);
        } catch (itemError) {
          console.error(`[OrderDetails] Error fetching item ${orderItem.itemId}:`, itemError);
          skippedItems.push({ name: orderItem.itemName, reason: 'no longer exists' });
          // Continue with other items even if one fails
        }
      }

      setIsReordering(false);

      if (successCount === 0) {
        // No items were added
        setErrorMessage('None of the items from this order are currently available. Please browse the menu to add items.');
        setShowErrorModal(true);
      } else {
        // Show success with count of successfully added items
        setReorderItemCount(successCount);

        // If some items were skipped, update the error message to inform the user
        if (skippedItems.length > 0) {
          const skippedNames = skippedItems.map(item => `${item.name} (${item.reason})`).join(', ');
          setErrorMessage(`Note: Some items could not be added: ${skippedNames}`);
        }

        setShowReorderSuccessModal(true);
      }
    } catch (error) {
      console.error('[OrderDetails] Reorder error:', error);
      setIsReordering(false);
      setErrorMessage('Failed to add items to cart. Please try again.');
      setShowErrorModal(true);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={`Order #${orderId}`} />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={`Order #${orderId}`} />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Icon source="alert-circle" size={64} color={colors.error} />
          <Text variant="titleLarge" style={styles.errorText}>
            Failed to load order details
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
            style={styles.button}
            buttonColor={colors.primary[500]}
          >
            Go to Home
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Order #${orderId}`} />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Status Card */}
        <Surface style={styles.statusCard} elevation={2}>
          <Chip
            mode="flat"
            icon={() => <Icon source={getStatusIcon(order.status)} size={18} color={getStatusColor(order.status)} />}
            style={[styles.statusChipLarge, { backgroundColor: getStatusColor(order.status) + '20' }]}
            textStyle={[styles.statusTextLarge, { color: getStatusColor(order.status) }]}
          >
            {getStatusLabel(order.status)}
          </Chip>
          <Text variant="bodyMedium" style={styles.statusSubtitle}>
            {order.status === 'completed' ? 'Your order has been delivered' :
             order.status === 'cancelled' ? 'This order was cancelled' :
             order.status === 'out_for_delivery' ? 'Your order is on the way' :
             order.status === 'ready' ? 'Your order is ready for pickup' :
             order.status === 'preparing' ? 'Your order is being prepared' :
             order.status === 'confirmed' ? 'Your order has been confirmed' :
             order.status === 'pending_payment' ? 'Waiting for payment confirmation' :
             'Your order is being processed'}
          </Text>
        </Surface>

        {/* Order Timeline */}
        <OrderTimeline status={order.status} paymentStatus={order.paymentStatus} />

        {/* Order Details */}
        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Icon source="receipt" size={24} color={colors.primary[500]} />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Order Details
            </Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={styles.label}>
              Order ID
            </Text>
            <Text variant="titleMedium" style={styles.value}>
              #{order.id}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={styles.label}>
              Payment Status
            </Text>
            <Chip
              mode="flat"
              style={[styles.paymentChip, {
                backgroundColor: order.paymentStatus === 'paid' ? colors.success + '20' : colors.warning + '20'
              }]}
              textStyle={[styles.paymentChipText, {
                color: order.paymentStatus === 'paid' ? colors.success : colors.warning
              }]}
            >
              {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'N/A'}
            </Chip>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={styles.label}>
              Total Amount
            </Text>
            <Text variant="headlineSmall" style={styles.totalText}>
              ₹{parseFloat(order.totalPrice).toFixed(2)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={styles.label}>
              Order Placed
            </Text>
            <Text variant="bodyMedium" style={styles.value}>
              {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : 'N/A'}
            </Text>
          </View>
        </Surface>

        {/* Delivery Address */}
        {order.deliveryAddress ? (
          <Surface style={styles.card} elevation={2}>
            <View style={styles.cardHeader}>
              <Icon source="map-marker" size={24} color={colors.primary[500]} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Delivery Address
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.addressContainer}>
              <Icon source="home" size={20} color={colors.text.secondary} />
              <Text variant="bodyLarge" style={styles.addressText}>
                {order.deliveryAddress}
              </Text>
            </View>
          </Surface>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Cancel button - only show for pending_payment status */}
          {order.status === 'pending_payment' && (
            <Button
              mode="outlined"
              onPress={handleCancelOrder}
              style={[styles.button, styles.cancelButton]}
              contentStyle={styles.buttonContent}
              disabled={isCancelling}
              loading={isCancelling}
              buttonColor="#fee2e2"
              textColor="#dc2626"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}

          {/* Reorder button - show for all orders except cancelled */}
          {order.status !== 'cancelled' && (
            <Button
              mode="contained"
              onPress={handleReorder}
              style={styles.button}
              contentStyle={styles.buttonContent}
              disabled={isReordering || !order.items || order.items.length === 0}
              loading={isReordering}
            >
              {isReordering ? 'Adding to Cart...' : 'Reorder'}
            </Button>
          )}

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Browse Menu
          </Button>
        </View>
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Cancel Order
            </Text>
            <Text variant="bodyLarge" style={styles.modalMessage}>
              Are you sure you want to cancel this order?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowCancelModal(false)}
                style={styles.modalButton}
              >
                No
              </Button>
              <Button
                mode="contained"
                onPress={confirmCancelOrder}
                style={styles.modalButton}
                buttonColor="#dc2626"
              >
                Yes, Cancel
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <Text variant="displaySmall" style={styles.successEmoji}>
              ✅
            </Text>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Order Cancelled
            </Text>
            <Text variant="bodyLarge" style={styles.modalMessage}>
              Your order has been cancelled successfully.
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowSuccessModal(false)}
              style={styles.modalButtonFull}
            >
              OK
            </Button>
          </Surface>
        </View>
      </Modal>

      {/* Reorder Success Modal */}
      <Modal
        visible={showReorderSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowReorderSuccessModal(false);
          setErrorMessage(''); // Clear any warning message
        }}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <Text variant="displaySmall" style={styles.successEmoji}>
              🛒
            </Text>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Items Added to Cart
            </Text>
            <Text variant="bodyLarge" style={styles.modalMessage}>
              {reorderItemCount} item(s) from this order have been added to your cart.
            </Text>
            {errorMessage && (
              <Text variant="bodyMedium" style={styles.warningMessage}>
                ⚠️ {errorMessage}
              </Text>
            )}
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowReorderSuccessModal(false);
                  setErrorMessage(''); // Clear any warning message
                }}
                style={styles.modalButton}
              >
                Continue Shopping
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setShowReorderSuccessModal(false);
                  setErrorMessage(''); // Clear any warning message
                  navigation.navigate('Cart');
                }}
                style={styles.modalButton}
              >
                View Cart
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <Text variant="displaySmall" style={styles.errorEmoji}>
              ❌
            </Text>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Error
            </Text>
            <Text variant="bodyLarge" style={styles.modalMessage}>
              {errorMessage}
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowErrorModal(false)}
              style={styles.modalButtonFull}
            >
              OK
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    color: colors.error,
  },
  // Status Card
  statusCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: colors.white,
    ...shadows.md,
  },
  statusChipLarge: {
    height: 36,
    marginBottom: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTextLarge: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusSubtitle: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // Cards
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginLeft: spacing.sm,
    color: colors.text.primary,
  },
  divider: {
    backgroundColor: colors.secondary[200],
    marginBottom: spacing.lg,
  },
  // Detail Rows
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text.secondary,
  },
  value: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  paymentChip: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  totalText: {
    color: colors.primary[500],
    fontWeight: 'bold',
  },
  // Address
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    lineHeight: 24,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  // Buttons
  buttonContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  button: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  cancelButton: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
    color: colors.text.primary,
  },
  modalMessage: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.secondary,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    marginHorizontal: -spacing.xs,
  },
  modalButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  modalButtonFull: {
    width: '100%',
    borderRadius: borderRadius.md,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  warningMessage: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    color: colors.warning,
    backgroundColor: colors.warning + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    width: '100%',
  },
});

export default OrderDetailsScreen;

