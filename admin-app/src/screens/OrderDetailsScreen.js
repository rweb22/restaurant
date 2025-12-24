import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, Divider, Menu, Portal, Dialog } from 'react-native-paper';
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

  const statusOptions = [
    { value: 'confirmed', label: 'Confirmed', color: theme.colors.primary },
    { value: 'preparing', label: 'Preparing', color: '#FF9800' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: '#2196F3' },
    { value: 'delivered', label: 'Delivered', color: theme.colors.tertiary },
    { value: 'cancelled', label: 'Cancelled', color: theme.colors.error },
  ];

  const currentStatusOption = statusOptions.find(opt => opt.value === order.status);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setDialogVisible(true);
  };

  const confirmStatusChange = () => {
    updateStatusMutation.mutate({ orderId: order.id, status: selectedStatus });
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
            </View>
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
        {order.deliveryAddress && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Delivery Address</Text>
              <Text variant="bodyMedium">{order.deliveryAddress.addressLine1}</Text>
              {order.deliveryAddress.addressLine2 && (
                <Text variant="bodyMedium">{order.deliveryAddress.addressLine2}</Text>
              )}
              <Text variant="bodyMedium">
                {order.deliveryAddress.area}, {order.deliveryAddress.city}
              </Text>
              <Text variant="bodyMedium">{order.deliveryAddress.pincode}</Text>
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
                    <Text variant="bodyLarge">{item.name}</Text>
                    <Text variant="bodySmall" style={styles.itemSize}>
                      Size: {item.size} • Qty: {item.quantity}
                    </Text>
                    {item.addOns && item.addOns.length > 0 && (
                      <Text variant="bodySmall" style={styles.addOns}>
                        Add-ons: {item.addOns.map(a => a.name).join(', ')}
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
                ₹{parseFloat(order.totalAmount).toFixed(2)}
              </Text>
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
});

