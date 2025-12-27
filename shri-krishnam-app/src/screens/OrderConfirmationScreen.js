import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, Divider, Icon, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import orderService from '../services/orderService';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Header */}
        <Surface style={styles.successCard} elevation={0}>
          <View style={styles.successIconContainer}>
            <Icon source="check-circle" size={80} color={colors.success} />
          </View>
          <Text variant="headlineMedium" style={styles.successTitle}>
            Order Placed Successfully!
          </Text>
          <Text variant="bodyLarge" style={styles.successSubtitle}>
            Your order has been confirmed and will be delivered soon
          </Text>
          <View style={styles.orderIdBadge}>
            <Icon source="receipt" size={20} color={colors.primary[500]} />
            <Text variant="titleMedium" style={styles.orderIdText}>
              Order #{order.id}
            </Text>
          </View>
        </Surface>

        {/* Order Summary */}
        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Icon source="information" size={24} color={colors.primary[500]} />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Order Summary
            </Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Icon source="clock-outline" size={20} color={colors.text.secondary} />
              <View style={styles.summaryTextContainer}>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Status
                </Text>
                <Text variant="bodyLarge" style={styles.summaryValue}>
                  {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ') : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Icon source="credit-card" size={20} color={colors.text.secondary} />
              <View style={styles.summaryTextContainer}>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Payment
                </Text>
                <Text variant="bodyLarge" style={styles.summaryValue}>
                  {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text variant="titleMedium" style={styles.totalLabel}>
              Total Amount
            </Text>
            <Text variant="headlineMedium" style={styles.totalAmount}>
              ₹{parseFloat(order.totalPrice).toFixed(2)}
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

        {/* Estimated Delivery Time */}
        <Surface style={styles.estimateCard} elevation={1}>
          <Icon source="truck-delivery" size={32} color={colors.primary[500]} />
          <View style={styles.estimateTextContainer}>
            <Text variant="titleMedium" style={styles.estimateTitle}>
              Estimated Delivery
            </Text>
            <Text variant="bodyMedium" style={styles.estimateTime}>
              30-45 minutes
            </Text>
          </View>
        </Surface>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
            style={styles.outlinedButton}
            contentStyle={styles.buttonContent}
            textColor={colors.primary[500]}
          >
            Continue Shopping
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Main', { screen: 'OrdersTab' })}
            style={styles.containedButton}
            contentStyle={styles.buttonContent}
            buttonColor={colors.primary[500]}
          >
            Track Order
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
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
  errorText: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    color: colors.error,
  },
  // Success Card
  successCard: {
    padding: spacing['2xl'],
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.text.primary,
  },
  successSubtitle: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  orderIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    marginTop: spacing.md,
  },
  orderIdText: {
    color: colors.primary[500],
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  // Cards
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryTextContainer: {
    marginLeft: spacing.sm,
  },
  summaryLabel: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  totalLabel: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  totalAmount: {
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
  // Estimate Card
  estimateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
  },
  estimateTextContainer: {
    marginLeft: spacing.lg,
  },
  estimateTitle: {
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  estimateTime: {
    color: colors.primary[500],
    fontWeight: 'bold',
  },
  // Buttons
  buttonContainer: {
    marginTop: spacing.sm,
  },
  outlinedButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.primary[500],
    marginBottom: spacing.md,
  },
  containedButton: {
    borderRadius: borderRadius.md,
  },
  button: {
    borderRadius: borderRadius.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});

export default OrderConfirmationScreen;

