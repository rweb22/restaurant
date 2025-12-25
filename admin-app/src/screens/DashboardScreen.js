import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, useTheme, IconButton, Chip, Divider } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import orderService from '../services/orderService';

export default function DashboardScreen({ navigation }) {
  const theme = useTheme();

  const { data: ordersData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () => orderService.getAllOrders({ limit: 10, sortBy: 'createdAt', sortOrder: 'DESC' }),
  });

  const orders = ordersData?.orders || [];

  // Calculate stats
  const today = new Date().toDateString();
  const todayOrders = orders.filter(order => new Date(order.createdAt).toDateString() === today);
  const pendingOrders = orders.filter(order => 
    ['pending_payment', 'confirmed', 'preparing'].includes(order.status)
  );
  const todayRevenue = todayOrders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0);

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: '#9E9E9E',
      pending: '#9E9E9E',
      confirmed: theme.colors.primary,
      preparing: '#FF9800',
      ready: '#2196F3',
      out_for_delivery: '#9C27B0',
      completed: theme.colors.tertiary,
      cancelled: theme.colors.outline,
    };
    return colors[status] || theme.colors.outline;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_payment: 'Pending Payment',
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.statLabel}>Today's Orders</Text>
              <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.primary }]}>
                {todayOrders.length}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.statLabel}>Pending Orders</Text>
              <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.error }]}>
                {pendingOrders.length}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.statLabel}>Today's Revenue</Text>
              <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.tertiary }]}>
                ₹{todayRevenue.toFixed(0)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.statLabel}>Total Orders</Text>
              <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.secondary }]}>
                {orders.length}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Recent Orders</Text>
            <IconButton
              icon="arrow-right"
              size={24}
              onPress={() => navigation.navigate('Orders')}
            />
          </View>

          {isLoading ? (
            <Card style={styles.orderCard}>
              <Card.Content>
                <Text>Loading orders...</Text>
              </Card.Content>
            </Card>
          ) : orders.length === 0 ? (
            <Card style={styles.orderCard}>
              <Card.Content>
                <Text>No orders yet</Text>
              </Card.Content>
            </Card>
          ) : (
            orders.slice(0, 5).map((order) => (
              <Card
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
              >
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <Text variant="titleMedium">Order #{order.id}</Text>
                    <Chip
                      mode="flat"
                      textStyle={{ color: getStatusColor(order.status) }}
                      style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
                    >
                      {getStatusLabel(order.status)}
                    </Chip>
                  </View>
                  <Text variant="bodyMedium" style={styles.orderAmount}>
                    ₹{parseFloat(order.totalPrice).toFixed(2)}
                  </Text>
                  <Text variant="bodySmall" style={styles.orderTime}>
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderAmount: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderTime: {
    opacity: 0.6,
  },
});

