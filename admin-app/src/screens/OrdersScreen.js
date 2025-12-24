import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Chip, useTheme, Searchbar, SegmentedButtons } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import orderService from '../services/orderService';

export default function OrdersScreen({ navigation }) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: ordersData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () => orderService.getAllOrders({ limit: 100, sortBy: 'createdAt', sortOrder: 'DESC' }),
  });

  const orders = ordersData?.orders || [];

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.id.toString().includes(searchQuery) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: theme.colors.error,
      confirmed: theme.colors.primary,
      preparing: '#FF9800',
      out_for_delivery: '#2196F3',
      delivered: theme.colors.tertiary,
      cancelled: theme.colors.outline,
    };
    return colors[status] || theme.colors.outline;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_payment: 'Pending Payment',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search by order ID or customer"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <SegmentedButtons
            value={statusFilter}
            onValueChange={setStatusFilter}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'pending_payment', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'preparing', label: 'Preparing' },
              { value: 'out_for_delivery', label: 'Delivery' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            style={styles.segmentedButtons}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {isLoading ? (
          <Card style={styles.orderCard}>
            <Card.Content>
              <Text>Loading orders...</Text>
            </Card.Content>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card style={styles.orderCard}>
            <Card.Content>
              <Text>No orders found</Text>
            </Card.Content>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
            >
              <Card.Content>
                <View style={styles.orderHeader}>
                  <View>
                    <Text variant="titleMedium">Order #{order.id}</Text>
                    <Text variant="bodySmall" style={styles.customerName}>
                      {order.user?.name || 'Guest'}
                    </Text>
                  </View>
                  <Chip
                    mode="flat"
                    textStyle={{ color: getStatusColor(order.status), fontSize: 12 }}
                    style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
                  >
                    {getStatusLabel(order.status)}
                  </Chip>
                </View>

                <View style={styles.orderDetails}>
                  <Text variant="bodyMedium" style={styles.orderAmount}>
                    ₹{parseFloat(order.totalAmount).toFixed(2)}
                  </Text>
                  <Text variant="bodySmall" style={styles.orderTime}>
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
                </View>

                {order.deliveryAddress && (
                  <Text variant="bodySmall" style={styles.address} numberOfLines={1}>
                    📍 {order.deliveryAddress.area}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
  },
  filterContainer: {
    marginBottom: 8,
  },
  segmentedButtons: {
    minWidth: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  customerName: {
    opacity: 0.6,
    marginTop: 2,
  },
  orderDetails: {
    marginBottom: 4,
  },
  orderAmount: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderTime: {
    opacity: 0.6,
  },
  address: {
    opacity: 0.7,
    marginTop: 4,
  },
});

