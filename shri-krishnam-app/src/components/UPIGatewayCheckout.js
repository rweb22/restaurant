import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { Modal, Portal, Text, Button, IconButton, Dialog } from 'react-native-paper';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';
import { checkPaymentStatus } from '../utils/upigateway';

const UPIGatewayCheckout = ({ visible, onDismiss, paymentData, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const maxPollingAttempts = 100; // 5 minutes (3 seconds interval)

  useEffect(() => {
    console.log('[UPIGatewayCheckout] visible changed:', visible);
    if (visible && paymentData) {
      console.log('[UPIGatewayCheckout] Starting polling...');
      startPolling();
    } else if (!visible) {
      console.log('[UPIGatewayCheckout] Modal hidden, stopping polling');
      setPolling(false);
      setPollingAttempts(0);
    }
    return () => {
      setPolling(false);
      setPollingAttempts(0);
    };
  }, [visible, paymentData]);

  const startPolling = async () => {
    setPolling(true);
    setPollingAttempts(0);
    pollPaymentStatus();
  };

  const pollPaymentStatus = async () => {
    if (!paymentData?.orderId) return;

    try {
      const status = await checkPaymentStatus(paymentData.orderId);

      if (status.paymentStatus === 'completed') {
        setPolling(false);
        onSuccess(status);
        return;
      }

      if (status.paymentStatus === 'failed') {
        setPolling(false);
        onFailure(new Error('Payment failed'));
        return;
      }

      // Continue polling if payment is still pending
      if (pollingAttempts < maxPollingAttempts) {
        setPollingAttempts(prev => prev + 1);
        setTimeout(pollPaymentStatus, 3000); // Poll every 3 seconds
      } else {
        setPolling(false);
        Alert.alert(
          'Payment Status Unknown',
          'We are still processing your payment. Please check your order status in a few minutes.',
          [{ text: 'OK', onPress: onDismiss }]
        );
      }
    } catch (error) {
      console.error('Error polling payment status:', error);
      if (pollingAttempts < maxPollingAttempts) {
        setPollingAttempts(prev => prev + 1);
        setTimeout(pollPaymentStatus, 3000);
      }
    }
  };

  const handleCancel = () => {
    console.log('[UPIGatewayCheckout] handleCancel called');
    setPolling(false);
    setCancelDialogVisible(true);
  };

  const handleConfirmCancel = () => {
    console.log('[UPIGatewayCheckout] User confirmed cancel, calling onFailure');
    setCancelDialogVisible(false);
    // Call onFailure - it will handle closing the modal via CartScreen
    onFailure(new Error('Payment cancelled by user'));
  };

  const handleCancelDialogDismiss = () => {
    console.log('[UPIGatewayCheckout] User chose not to cancel, resuming polling');
    setCancelDialogVisible(false);
    // Resume polling
    if (paymentData?.orderId) {
      setPolling(true);
      pollPaymentStatus();
    }
  };

  if (!paymentData) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
        dismissable={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>UPI Payment</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={handleCancel}
            style={styles.closeButton}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Complete Payment</Text>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amount}>₹{paymentData.amount}</Text>
          </View>

          {paymentData.qrCode && (
            <View style={styles.qrContainer}>
              <Image
                source={{ uri: `data:image/png;base64,${paymentData.qrCode}` }}
                style={styles.qrCode}
                resizeMode="contain"
              />
            </View>
          )}

          {paymentData.paymentUrl && (
            <Button
              mode="contained"
              onPress={() => Linking.openURL(paymentData.paymentUrl)}
              style={styles.payButton}
              buttonColor={colors.primary[500]}
            >
              Pay Now via UPI
            </Button>
          )}

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to Pay:</Text>
            <Text style={styles.instruction}>1. Click "Pay Now via UPI" button above</Text>
            <Text style={styles.instruction}>2. Choose your UPI app (Google Pay, PhonePe, Paytm, etc.)</Text>
            <Text style={styles.instruction}>3. Verify the amount and complete payment</Text>
            <Text style={styles.instruction}>4. Your order will be confirmed automatically</Text>
          </View>

          {polling && (
            <View style={styles.pollingContainer}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
              <Text style={styles.pollingText}>
                Waiting for payment confirmation...
              </Text>
            </View>
          )}

          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            textColor="#f44336"
          >
            Cancel Payment
          </Button>
        </View>
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <Portal>
        <Dialog visible={cancelDialogVisible} onDismiss={handleCancelDialogDismiss}>
          <Dialog.Title>Cancel Payment?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to cancel this payment? Your order will not be placed.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelDialogDismiss}>No</Button>
            <Button onPress={handleConfirmCancel} textColor={colors.error}>
              Yes, Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[200],
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.secondary[900],
  },
  closeButton: {
    margin: 0,
  },
  content: {
    padding: spacing.lg,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.secondary[700],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  amountContainer: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: fontSize.sm,
    color: colors.secondary[600],
    marginBottom: spacing.xs,
  },
  amount: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.primary[600],
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: 'white',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  qrCode: {
    width: 250,
    height: 250,
  },
  payButton: {
    marginBottom: spacing.lg,
  },
  instructionsContainer: {
    backgroundColor: colors.secondary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  instructionsTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.secondary[900],
    marginBottom: spacing.sm,
  },
  instruction: {
    fontSize: fontSize.sm,
    color: colors.secondary[700],
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  pollingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  pollingText: {
    fontSize: fontSize.sm,
    color: colors.primary[700],
    marginLeft: spacing.sm,
  },
  cancelButton: {
    borderColor: colors.error,
  },
});

export default UPIGatewayCheckout;
