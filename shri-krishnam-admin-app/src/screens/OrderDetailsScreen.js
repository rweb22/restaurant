import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Clipboard, Alert, Linking } from 'react-native';
import { Text, Card, Button, useTheme, Divider, Menu, Portal, Dialog, Chip, IconButton } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import orderService from '../services/orderService';

export default function OrderDetailsScreen({ route, navigation }) {
  const theme = useTheme();
  const { orderId } = route.params;
  const queryClient = useQueryClient();
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', orderId]);
      queryClient.invalidateQueries(['orders']);
      setDialogVisible(false);
      setMenuVisible(false);
    },
  });

  const order = orderData?.order;

  if (isLoading || !order) {
    return (
      <View style={styles.container}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  // All possible statuses with their display properties
  const allStatuses = {
    pending_payment: { label: 'Pending Payment', color: '#9E9E9E' },
    pending: { label: 'Pending', color: '#9E9E9E' },
    confirmed: { label: 'Confirmed', color: theme.colors.primary },
    preparing: { label: 'Preparing', color: '#FF9800' },
    ready: { label: 'Ready', color: '#2196F3' },
    out_for_delivery: { label: 'Out for Delivery', color: '#9C27B0' },
    completed: { label: 'Completed', color: theme.colors.tertiary },
    cancelled: { label: 'Cancelled', color: theme.colors.error },
  };

  // Valid status transitions based on current status
  const validTransitions = {
    pending_payment: ['cancelled'],
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  // Get available status options based on current order status
  const availableNextStatuses = validTransitions[order.status] || [];
  const statusOptions = availableNextStatuses.map(status => ({
    value: status,
    label: allStatuses[status].label,
    color: allStatuses[status].color
  }));

  const currentStatusOption = allStatuses[order.status] || { label: order.status, color: '#9E9E9E' };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setMenuVisible(false);
    setDialogVisible(true);
  };

  const confirmStatusChange = () => {
    updateStatusMutation.mutate({ orderId: order.id, status: selectedStatus });
  };

  const copyFullAddress = () => {
    if (!order.address) return;

    const addr = order.address;
    let addressText = '';

    if (addr.label) addressText += `${addr.label}\n`;
    if (addr.addressLine1) addressText += `${addr.addressLine1}\n`;
    if (addr.addressLine2) addressText += `${addr.addressLine2}\n`;
    if (addr.landmark) addressText += `Landmark: ${addr.landmark}\n`;
    if (addr.city) addressText += `${addr.city}`;
    if (addr.state) addressText += `, ${addr.state}`;
    if (addr.postalCode) addressText += ` - ${addr.postalCode}`;
    if (addr.city || addr.state || addr.postalCode) addressText += '\n';
    if (addr.country) addressText += `${addr.country}\n`;

    // Add coordinates if available
    if (addr.latitude && addr.longitude) {
      addressText += `\nCoordinates: ${addr.latitude}, ${addr.longitude}`;
      addressText += `\nGoogle Maps: https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`;
    }

    Clipboard.setString(addressText.trim());
    Alert.alert('Copied!', 'Address copied to clipboard');
  };

  const openInGoogleMaps = () => {
    if (!order.address || !order.address.latitude || !order.address.longitude) {
      Alert.alert('No Coordinates', 'This address does not have GPS coordinates');
      return;
    }

    const { latitude, longitude } = order.address;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Order Header */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">Order #{order.id}</Text>
            <Text variant="bodyMedium" style={styles.date}>
              {new Date(order.createdAt).toLocaleString()}
            </Text>

            <View style={styles.statusContainer}>
              <Text variant="titleMedium">Status:</Text>
              {statusOptions.length > 0 ? (
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setMenuVisible(true)}
                      style={[styles.statusButton, { borderColor: currentStatusOption?.color }]}
                      textColor={currentStatusOption?.color}
                    >
                      {currentStatusOption?.label || order.status}
                    </Button>
                  }
                >
                  {statusOptions.map((option) => (
                    <Menu.Item
                      key={option.value}
                      onPress={() => handleStatusChange(option.value)}
                      title={option.label}
                      disabled={option.value === order.status}
                    />
                  ))}
                </Menu>
              ) : (
                <Chip
                  mode="flat"
                  textStyle={{ color: currentStatusOption?.color }}
                  style={{ backgroundColor: `${currentStatusOption?.color}20` }}
                >
                  {currentStatusOption?.label || order.status}
                </Chip>
              )}
            </View>
            {statusOptions.length === 0 && (
              <Text variant="bodySmall" style={styles.finalStateNote}>
                This order is in a final state and cannot be changed.
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Customer Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Customer Information</Text>
            <Text variant="bodyMedium">{order.user?.name || 'Guest'}</Text>
            <Text variant="bodyMedium">{order.user?.phone}</Text>
          </Card.Content>
        </Card>

        {/* Delivery Address */}
        {order.address && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.addressHeader}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Delivery Address</Text>
                <View style={styles.addressActions}>
                  <IconButton
                    icon="content-copy"
                    size={20}
                    onPress={copyFullAddress}
                    mode="contained-tonal"
                  />
                  {order.address.latitude && order.address.longitude && (
                    <IconButton
                      icon="map-marker"
                      size={20}
                      onPress={openInGoogleMaps}
                      mode="contained-tonal"
                    />
                  )}
                </View>
              </View>

              {order.address.label && (
                <Text variant="bodySmall" style={styles.addressLabel}>{order.address.label}</Text>
              )}
              <Text variant="bodyMedium">{order.address.addressLine1}</Text>
              {order.address.addressLine2 && (
                <Text variant="bodyMedium">{order.address.addressLine2}</Text>
              )}
              {order.address.landmark && (
                <Text variant="bodyMedium">Landmark: {order.address.landmark}</Text>
              )}

              {/* Display city, state, postalCode if available */}
              {(order.address.city || order.address.state || order.address.postalCode) && (
                <Text variant="bodyMedium">
                  {[order.address.city, order.address.state, order.address.postalCode].filter(Boolean).join(', ')}
                </Text>
              )}
              {order.address.country && (
                <Text variant="bodyMedium">{order.address.country}</Text>
              )}

              {/* Display coordinates if available */}
              {order.address.latitude && order.address.longitude && (
                <View style={styles.coordinatesContainer}>
                  <Text variant="bodySmall" style={styles.coordinatesLabel}>GPS Coordinates:</Text>
                  <Text variant="bodySmall" style={styles.coordinates}>
                    {order.address.latitude}, {order.address.longitude}
                  </Text>
                </View>
              )}

              {order.address.location && (
                <>
                  <Divider style={styles.divider} />
                  <Text variant="bodyMedium">
                    {order.address.location.area}, {order.address.location.city}
                  </Text>
                  <Text variant="bodyMedium">Pincode: {order.address.location.pincode}</Text>
                  <Text variant="bodySmall" style={styles.deliveryInfo}>
                    Delivery Charge: ₹{order.address.location.deliveryCharge} • Est. Time: {order.address.location.estimatedDeliveryTime} mins
                  </Text>
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Order Items */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Order Items</Text>
            {order.items?.map((item, index) => (
              <View key={index}>
                {index > 0 && <Divider style={styles.divider} />}
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text variant="bodyLarge">{item.itemName}</Text>
                    <Text variant="bodySmall" style={styles.itemCategory}>
                      {item.categoryName}
                    </Text>
                    <Text variant="bodySmall" style={styles.itemSize}>
                      Size: {item.size} • Qty: {item.quantity}
                    </Text>
                    {item.addOns && item.addOns.length > 0 && (
                      <Text variant="bodySmall" style={styles.addOns}>
                        Add-ons: {item.addOns.map(a => `${a.addOnName} (₹${a.addOnPrice})`).join(', ')}
                      </Text>
                    )}
                  </View>
                  <Text variant="bodyLarge" style={styles.itemPrice}>
                    ₹{parseFloat(item.totalPrice).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Order Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Subtotal</Text>
              <Text variant="bodyMedium">₹{parseFloat(order.subtotal || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">GST</Text>
              <Text variant="bodyMedium">₹{parseFloat(order.gstAmount || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Delivery Charge</Text>
              <Text variant="bodyMedium">₹{parseFloat(order.deliveryCharge || 0).toFixed(2)}</Text>
            </View>
            {order.discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.tertiary }}>Discount</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.tertiary }}>
                  -₹{parseFloat(order.discountAmount).toFixed(2)}
                </Text>
              </View>
            )}
            <Divider style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text variant="titleMedium">Total</Text>
              <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                ₹{parseFloat(order.totalPrice).toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodySmall" style={styles.paymentInfo}>Payment Method</Text>
              <Text variant="bodySmall" style={styles.paymentInfo}>{order.paymentMethod?.toUpperCase()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodySmall" style={styles.paymentInfo}>Payment Status</Text>
              <Text variant="bodySmall" style={styles.paymentInfo}>{order.paymentStatus}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Confirmation Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Confirm Status Change</Dialog.Title>
          <Dialog.Content>
            <Text>
              Change order status to {statusOptions.find(o => o.value === selectedStatus)?.label}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmStatusChange} loading={updateStatusMutation.isPending}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  card: {
    marginBottom: 16,
  },
  date: {
    opacity: 0.6,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  statusButton: {
    flex: 1,
  },
  finalStateNote: {
    opacity: 0.6,
    marginTop: 8,
    fontStyle: 'italic',
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemCategory: {
    opacity: 0.5,
    fontSize: 12,
    marginTop: 2,
  },
  itemSize: {
    opacity: 0.6,
    marginTop: 4,
  },
  addOns: {
    opacity: 0.6,
    marginTop: 2,
  },
  itemPrice: {
    fontWeight: 'bold',
    marginLeft: 12,
  },
  divider: {
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressLabel: {
    opacity: 0.6,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 4,
  },
  coordinatesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  coordinatesLabel: {
    opacity: 0.7,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  coordinates: {
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  deliveryInfo: {
    opacity: 0.6,
    marginTop: 4,
  },
  paymentInfo: {
    opacity: 0.7,
    marginTop: 2,
  },
});

