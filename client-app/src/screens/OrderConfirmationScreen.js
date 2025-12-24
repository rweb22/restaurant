import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import orderService from '../services/orderService';

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { orderId } = route.params;

  // Fetch order details
  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
  });

  const order = orderData?.order;

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Header */}
        <Surface style={styles.successCard} elevation={0}>
          <Text variant="displaySmall" style={styles.successEmoji}>
            ✅
          </Text>
          <Text variant="headlineMedium" style={styles.successTitle}>
            Order Placed Successfully!
          </Text>
          <Text variant="bodyLarge" style={styles.successSubtitle}>
            Your order has been confirmed
          </Text>
        </Surface>

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
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Home')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Continue Shopping
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Orders')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            View My Orders
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
  scrollContent: {
    padding: 16,
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
  successCard: {
    padding: 32,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    color: '#666',
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
  buttonContent: {
    paddingVertical: 8,
  },
});

export default OrderConfirmationScreen;

