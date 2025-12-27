import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Surface, Appbar, Divider, Chip, ActivityIndicator, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import orderService from '../services/orderService';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

const OrdersScreen = ({ navigation }) => {
  // Fetch orders
  const { data: ordersData, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders({ includeItems: true }),
  });

  const orders = ordersData?.orders || [];

  const handleOrderPress = (orderId) => {
    navigation.navigate('OrderDetails', { orderId });
  };

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
    const itemsPreview = order.items?.slice(0, 2).map(item => item.name).join(', ') || '';
    const hasMoreItems = itemCount > 2;

    return (
      <TouchableOpacity onPress={() => handleOrderPress(order.id)} activeOpacity={0.7}>
        <Surface style={styles.orderCard} elevation={2}>
          {/* Order Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <View style={styles.orderIdRow}>
                <Icon source="receipt" size={20} color={colors.primary[500]} />
                <Text variant="titleMedium" style={styles.orderId}>
                  Order #{order.id}
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.orderDate}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
            <Chip
              mode="flat"
              icon={() => <Icon source={getStatusIcon(order.status)} size={16} color={getStatusColor(order.status)} />}
              style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) + '20' }]}
              textStyle={[styles.statusText, { color: getStatusColor(order.status) }]}
            >
              {getStatusLabel(order.status)}
            </Chip>
          </View>

          {/* Items Preview */}
          <View style={styles.itemsPreview}>
            <Text variant="bodyMedium" style={styles.itemsPreviewText} numberOfLines={1}>
              {itemsPreview}
              {hasMoreItems ? ` +${itemCount - 2} more` : ''}
            </Text>
            <Text variant="bodySmall" style={styles.itemCount}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Footer */}
          <View style={styles.orderFooter}>
            <View style={styles.addressSection}>
              {order.deliveryAddress ? (
                <>
                  <Icon source="map-marker" size={16} color={colors.text.secondary} />
                  <Text variant="bodySmall" style={styles.deliveryAddress} numberOfLines={1}>
                    {order.deliveryAddress}
                  </Text>
                </>
              ) : null}
            </View>
            <View style={styles.totalSection}>
              <Text variant="bodySmall" style={styles.totalLabel}>Total</Text>
              <Text variant="titleLarge" style={styles.orderTotal}>
                ₹{parseFloat(order.totalPrice).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* View Details Arrow */}
          <View style={styles.viewDetailsIndicator}>
            <Icon source="chevron-right" size={20} color={colors.primary[500]} />
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon source="package-variant" size={80} color={colors.secondary[300]} />
      </View>
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
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          My Orders
        </Text>
        {orders.length > 0 ? (
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </Text>
        ) : null}
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon source="alert-circle" size={64} color={colors.error} />
          <Text variant="titleLarge" style={styles.errorText}>
            Failed to load orders
          </Text>
          <Text variant="bodyMedium" style={styles.errorHint}>
            Pull down to retry
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
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[200],
  },
  headerTitle: {
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    color: colors.text.secondary,
  },
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorHint: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // List
  list: {
    padding: spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // Order Card
  orderCard: {
    position: 'relative',
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderHeaderLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderId: {
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  orderDate: {
    color: colors.text.secondary,
  },
  statusChip: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Items Preview
  itemsPreview: {
    marginBottom: spacing.md,
  },
  itemsPreviewText: {
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemCount: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  divider: {
    backgroundColor: colors.secondary[200],
    marginBottom: spacing.md,
  },
  // Footer
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  addressSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  deliveryAddress: {
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  totalSection: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  orderTotal: {
    fontWeight: 'bold',
    color: colors.primary[500],
  },
  viewDetailsIndicator: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    marginTop: -10,
  },
});

export default OrdersScreen;

