import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Chip,
  Button,
  Portal,
  Dialog,
  TextInput,
  HelperText,
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactionById, processRefund } from '../services/transactionService';

const TransactionDetailsScreen = ({ route, navigation }) => {
  const { transactionId } = route.params;
  const queryClient = useQueryClient();

  const [refundDialogVisible, setRefundDialogVisible] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [errors, setErrors] = useState({});

  // Fetch transaction details
  const { data, isLoading, error } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId)
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: processRefund,
    onSuccess: () => {
      queryClient.invalidateQueries(['transaction', transactionId]);
      queryClient.invalidateQueries(['transactions']);
      setRefundDialogVisible(false);
      setRefundAmount('');
      setRefundReason('');
      setErrors({});
    },
    onError: (error) => {
      setErrors({ submit: error.response?.data?.message || error.message });
    }
  });

  const transaction = data?.data?.transaction;

  const getStatusColor = (status) => {
    const colors = {
      created: '#9E9E9E',
      authorized: '#2196F3',
      captured: '#4CAF50',
      failed: '#F44336',
      refunded: '#FF9800'
    };
    return colors[status] || '#9E9E9E';
  };

  const getStatusLabel = (status) => {
    const labels = {
      created: 'Created',
      authorized: 'Authorized',
      captured: 'Captured',
      failed: 'Failed',
      refunded: 'Refunded'
    };
    return labels[status] || status;
  };

  const canRefund = transaction && (transaction.status === 'captured' || transaction.status === 'authorized');

  const handleRefundPress = () => {
    setRefundAmount(transaction.amount);
    setRefundReason('');
    setErrors({});
    setRefundDialogVisible(true);
  };

  const handleRefundConfirm = () => {
    const newErrors = {};

    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      newErrors.amount = 'Please enter a valid refund amount';
    } else if (parseFloat(refundAmount) > parseFloat(transaction.amount)) {
      newErrors.amount = 'Refund amount cannot exceed transaction amount';
    }

    if (!refundReason.trim()) {
      newErrors.reason = 'Please provide a reason for refund';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    refundMutation.mutate({
      orderId: transaction.orderId,
      amount: parseFloat(refundAmount),
      reason: refundReason
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={styles.centered}>
        <Text>Error loading transaction details</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Transaction Details" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text variant="headlineMedium">₹{parseFloat(transaction.amount).toFixed(2)}</Text>
              <Chip
                icon="circle"
                style={[styles.statusChip, { backgroundColor: getStatusColor(transaction.status) }]}
                textStyle={styles.statusChipText}
              >
                {getStatusLabel(transaction.status)}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>Transaction ID:</Text>
              <Text variant="bodyMedium">{transaction.id}</Text>
            </View>

            <View style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>Order ID:</Text>
              <Text variant="bodyMedium">#{transaction.orderId}</Text>
            </View>

            <View style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>Payment Gateway:</Text>
              <Text variant="bodyMedium">{transaction.paymentGateway}</Text>
            </View>

            {transaction.gatewayOrderId && (
              <View style={styles.row}>
                <Text variant="bodySmall" style={styles.label}>Gateway Order ID:</Text>
                <Text variant="bodySmall" style={styles.monospace}>
                  {transaction.gatewayOrderId}
                </Text>
              </View>
            )}

            {transaction.gatewayPaymentId && (
              <View style={styles.row}>
                <Text variant="bodySmall" style={styles.label}>Gateway Payment ID:</Text>
                <Text variant="bodySmall" style={styles.monospace}>
                  {transaction.gatewayPaymentId}
                </Text>
              </View>
            )}

            {transaction.paymentMethod && (
              <View style={styles.row}>
                <Text variant="bodySmall" style={styles.label}>Payment Method:</Text>
                <Text variant="bodyMedium">{transaction.paymentMethod.toUpperCase()}</Text>
              </View>
            )}

            {transaction.upiVpa && (
              <View style={styles.row}>
                <Text variant="bodySmall" style={styles.label}>UPI VPA:</Text>
                <Text variant="bodyMedium">{transaction.upiVpa}</Text>
              </View>
            )}

            {transaction.cardLast4 && (
              <>
                <View style={styles.row}>
                  <Text variant="bodySmall" style={styles.label}>Card Network:</Text>
                  <Text variant="bodyMedium">{transaction.cardNetwork}</Text>
                </View>
                <View style={styles.row}>
                  <Text variant="bodySmall" style={styles.label}>Card Last 4:</Text>
                  <Text variant="bodyMedium">•••• {transaction.cardLast4}</Text>
                </View>
              </>
            )}

            {transaction.bankName && (
              <View style={styles.row}>
                <Text variant="bodySmall" style={styles.label}>Bank:</Text>
                <Text variant="bodyMedium">{transaction.bankName}</Text>
              </View>
            )}

            {transaction.walletName && (
              <View style={styles.row}>
                <Text variant="bodySmall" style={styles.label}>Wallet:</Text>
                <Text variant="bodyMedium">{transaction.walletName}</Text>
              </View>
            )}

            <Divider style={styles.divider} />

            <View style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>Created At:</Text>
              <Text variant="bodyMedium">
                {new Date(transaction.createdAt).toLocaleString()}
              </Text>
            </View>

            <View style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>Updated At:</Text>
              <Text variant="bodyMedium">
                {new Date(transaction.updatedAt).toLocaleString()}
              </Text>
            </View>

            {transaction.status === 'failed' && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.errorBox}>
                  <Text variant="titleSmall" style={styles.errorTitle}>Error Details</Text>
                  {transaction.errorCode && (
                    <Text variant="bodySmall">Code: {transaction.errorCode}</Text>
                  )}
                  {transaction.errorDescription && (
                    <Text variant="bodyMedium" style={styles.errorDescription}>
                      {transaction.errorDescription}
                    </Text>
                  )}
                </View>
              </>
            )}

            {transaction.order && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleMedium" style={styles.sectionTitle}>Order Information</Text>
                {transaction.order.user && (
                  <>
                    <View style={styles.row}>
                      <Text variant="bodySmall" style={styles.label}>Customer:</Text>
                      <Text variant="bodyMedium">{transaction.order.user.name}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text variant="bodySmall" style={styles.label}>Phone:</Text>
                      <Text variant="bodyMedium">{transaction.order.user.phone}</Text>
                    </View>
                  </>
                )}
              </>
            )}

            {canRefund && (
              <Button
                mode="contained"
                onPress={handleRefundPress}
                style={styles.refundButton}
                buttonColor="#FF9800"
              >
                Process Refund
              </Button>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog visible={refundDialogVisible} onDismiss={() => setRefundDialogVisible(false)}>
          <Dialog.Title>Process Refund</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.warningText}>
              ⚠️ This action cannot be undone. Please verify the refund details carefully.
            </Text>

            <TextInput
              label="Refund Amount"
              value={refundAmount}
              onChangeText={setRefundAmount}
              keyboardType="decimal-pad"
              error={!!errors.amount}
              style={styles.dialogInput}
              left={<TextInput.Affix text="₹" />}
            />
            <HelperText type="error" visible={!!errors.amount}>
              {errors.amount}
            </HelperText>

            <TextInput
              label="Reason for Refund *"
              value={refundReason}
              onChangeText={setRefundReason}
              error={!!errors.reason}
              style={styles.dialogInput}
              multiline
              numberOfLines={3}
            />
            <HelperText type="error" visible={!!errors.reason}>
              {errors.reason}
            </HelperText>

            {errors.submit && (
              <HelperText type="error" visible={true}>
                {errors.submit}
              </HelperText>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRefundDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleRefundConfirm}
              loading={refundMutation.isPending}
              buttonColor="#FF9800"
            >
              Confirm Refund
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    padding: 16
  },
  card: {
    marginBottom: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  statusChip: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusChipText: {
    color: '#fff',
    lineHeight: 32,
    marginVertical: 0
  },
  divider: {
    marginVertical: 16
  },
  row: {
    marginBottom: 8
  },
  label: {
    color: '#666',
    marginBottom: 2
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: 12
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8
  },
  errorTitle: {
    color: '#c62828',
    fontWeight: 'bold',
    marginBottom: 4
  },
  errorDescription: {
    color: '#c62828',
    marginTop: 4
  },
  refundButton: {
    marginTop: 16
  },
  warningText: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: '#856404'
  },
  dialogInput: {
    marginTop: 8
  }
});

export default TransactionDetailsScreen;

