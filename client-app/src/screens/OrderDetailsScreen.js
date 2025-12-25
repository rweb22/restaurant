import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, Divider, Appbar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import orderService from '../services/orderService';
import menuService from '../services/menuService';
import useCartStore from '../store/cartStore';
import OrderTimeline from '../components/OrderTimeline';

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
  const { data: orderData, isLoading, error, refetch } = useQuery({
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
    const colors = {
      pending_payment: '#f59e0b',
      pending: '#3b82f6',
      confirmed: '#8b5cf6',
      preparing: '#f97316',
      ready: '#10b981',
      out_for_delivery: '#9c27b0',
      completed: '#22c55e',
      cancelled: '#ef4444',
    };
    return colors[status] || '#78716c';
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

      // For each order item, fetch the full item details and add to cart
      for (const orderItem of order.items) {
        try {
          // Fetch full item details to get category, imageUrl, etc.
          const itemResponse = await menuService.getItemById(orderItem.itemId, {
            includeSizes: true,
            includeAddOns: true,
          });

          const item = itemResponse.item;

          // Find the size that matches the order item
          const size = item.sizes?.find(s => s.id === orderItem.itemSizeId);

          if (!size) {
            console.warn(`[OrderDetails] Size not found for item ${orderItem.itemId}, skipping`);
            continue;
          }

          // Map order item add-ons to cart add-ons format
          const addOns = orderItem.addOns?.map(orderAddOn => ({
            id: orderAddOn.addOnId,
            name: orderAddOn.addOnName,
            price: orderAddOn.addOnPrice,
          })) || [];

          // Add item to cart with the same quantity
          for (let i = 0; i < orderItem.quantity; i++) {
            addItem({
              id: item.id,
              name: item.name,
              imageUrl: item.imageUrl,
              sizeId: size.id,
              sizeName: size.size,
              sizePrice: size.price,
              addOns: addOns,
              category: {
                id: item.categoryId,
                gstRate: item.category?.gstRate || 5.0,
              },
            });
          }

          console.log(`[OrderDetails] Added ${orderItem.quantity}x ${item.name} to cart`);
        } catch (itemError) {
          console.error(`[OrderDetails] Error fetching item ${orderItem.itemId}:`, itemError);
          // Continue with other items even if one fails
        }
      }

      setIsReordering(false);
      setReorderItemCount(order.items.length);
      setShowReorderSuccessModal(true);
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
        <View style={styles.loadingContainer}>
          <Text variant="bodyLarge">Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorEmoji}>
            ❌
          </Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            Failed to load order details
          </Text>
          <Button mode="contained" onPress={() => navigation.navigate('Home')} style={styles.button}>
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Timeline */}
        <OrderTimeline status={order.status} paymentStatus={order.paymentStatus} />

        {/* Order Details */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Order Details
          </Text>
          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="bodyLarge" style={styles.label}>
              Order ID
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              #{order.id}
            </Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodyLarge" style={styles.label}>
              Status
            </Text>
            <Text variant="bodyLarge" style={[styles.value, styles.statusText]}>
              {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ') : 'N/A'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodyLarge" style={styles.label}>
              Payment Status
            </Text>
            <Text variant="bodyLarge" style={[styles.value, styles.statusText]}>
              {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'N/A'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodyLarge" style={styles.label}>
              Total Amount
            </Text>
            <Text variant="headlineSmall" style={[styles.value, styles.totalText]}>
              ₹{parseFloat(order.totalPrice).toFixed(2)}
            </Text>
          </View>
        </Surface>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <Surface style={styles.card} elevation={1}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Delivery Address
            </Text>
            <Divider style={styles.divider} />
            <Text variant="bodyLarge" style={styles.addressText}>
              {order.deliveryAddress}
            </Text>
          </Surface>
        )}

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
            onPress={() => navigation.navigate('Home')}
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
        onRequestClose={() => setShowReorderSuccessModal(false)}
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
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowReorderSuccessModal(false)}
                style={styles.modalButton}
              >
                Continue Shopping
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setShowReorderSuccessModal(false);
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
    backgroundColor: '#fafaf9',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  statusCard: {
    padding: 24,
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusChipLarge: {
    height: 36,
    marginBottom: 12,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusSubtitle: {
    color: '#78716c',
    textAlign: 'center',
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#666',
  },
  value: {
    fontWeight: '500',
  },
  statusText: {
    color: '#6200ee',
  },
  totalText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  addressText: {
    lineHeight: 24,
    color: '#333',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: '#dc2626',
    borderWidth: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
  modalButtonFull: {
    width: '100%',
    borderRadius: 8,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
});

export default OrderDetailsScreen;

