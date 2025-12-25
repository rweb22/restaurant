import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { Modal, Portal, Text, Button, IconButton } from 'react-native-paper';
import { theme } from '../styles/theme';
import { checkPaymentStatus } from '../utils/upigateway';

const UPIGatewayCheckout = ({ visible, onDismiss, paymentData, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const maxPollingAttempts = 100; // 5 minutes (3 seconds interval)

  useEffect(() => {
    if (visible && paymentData) {
      startPolling();
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
    setPolling(false);
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel this payment? Your order will not be placed.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            onFailure(new Error('Payment cancelled by user'));
          }
        }
      ]
    );
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
          <Text style={styles.subtitle}>Scan QR Code to Pay</Text>

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

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to Pay:</Text>
            <Text style={styles.instruction}>1. Open any UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.)</Text>
            <Text style={styles.instruction}>2. Scan the QR code above</Text>
            <Text style={styles.instruction}>3. Verify the amount and complete payment</Text>
            <Text style={styles.instruction}>4. Your order will be confirmed automatically</Text>
          </View>

          {polling && (
            <View style={styles.pollingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
              <Text style={styles.pollingText}>
                Waiting for payment confirmation...
              </Text>
            </View>
          )}

          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            textColor={theme.colors.error}
          >
            Cancel Payment
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '600',
    color: theme.colors.gray[900],
  },
  closeButton: {
    margin: 0,
  },
  content: {
    padding: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '500',
    color: theme.colors.gray[700],
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  amountContainer: {
    backgroundColor: theme.colors.primary[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  amount: {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  qrCode: {
    width: 250,
    height: 250,
  },
  instructionsContainer: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  instructionsTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.gray[900],
    marginBottom: theme.spacing.sm,
  },
  instruction: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
  },
  pollingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  pollingText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary[700],
    marginLeft: theme.spacing.sm,
  },
  cancelButton: {
    borderColor: theme.colors.error,
  },
});

export default UPIGatewayCheckout;
