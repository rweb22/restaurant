import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Surface, Appbar, Divider, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import orderService from '../services/orderService';

const OrdersScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders
  const { data: ordersData, isLoading, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders({ includeItems: true }),
  });

  const orders = ordersData?.orders || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleOrderPress = (orderId) => {
    navigation.navigate('OrderDetails', { orderId });
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const renderOrderItem = ({ item: order }) => {
    const itemCount = order.items?.length || 0;
    
    return (
      <TouchableOpacity onPress={() => handleOrderPress(order.id)}>
        <Surface style={styles.orderCard} elevation={1}>
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Text variant="titleMedium" style={styles.orderId}>
                Order #{order.id}
              </Text>
              <Text variant="bodySmall" style={styles.orderDate}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) + '20' }]}
              textStyle={[styles.statusText, { color: getStatusColor(order.status) }]}
            >
              {getStatusLabel(order.status)}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.orderDetails}>
            <Text variant="bodyMedium" style={styles.itemCount}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
            <Text variant="titleMedium" style={styles.orderTotal}>
              ₹{parseFloat(order.totalPrice).toFixed(2)}
            </Text>
          </View>

          {order.deliveryAddress && (
            <Text variant="bodySmall" style={styles.deliveryAddress} numberOfLines={1}>
              📍 {order.deliveryAddress}
            </Text>
          )}
        </Surface>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="displaySmall" style={styles.emptyEmoji}>
        📦
      </Text>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Orders Yet
      </Text>
      <Text variant="bodyLarge" style={styles.emptyText}>
        Your order history will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.Content title="My Orders" />
      </Appbar.Header>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>
            Failed to load orders
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#dc2626']} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
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
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
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
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#292524',
  },
  emptyText: {
    color: '#78716c',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontWeight: 'bold',
    color: '#292524',
    marginBottom: 4,
  },
  orderDate: {
    color: '#78716c',
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    marginBottom: 12,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    color: '#78716c',
  },
  orderTotal: {
    fontWeight: 'bold',
    color: '#dc2626',
  },
  deliveryAddress: {
    color: '#78716c',
    marginTop: 4,
  },
});

export default OrdersScreen;

