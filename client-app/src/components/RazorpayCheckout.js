import React, { useRef, useEffect } from 'react';
import { Modal, View, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

/**
 * RazorpayCheckout Component
 *
 * A cross-platform Razorpay checkout component for Expo
 * - Uses WebView for native mobile apps (iOS/Android)
 * - Uses script injection for web browsers
 * Supports all payment methods including UPI, cards, wallets, etc.
 */
const RazorpayCheckout = ({ visible, options, onSuccess, onFailure, onCancel }) => {
  const webViewRef = useRef(null);
  const isWeb = Platform.OS === 'web';

  // For web platform, check if using mock or real Razorpay
  useEffect(() => {
    if (!visible || !options || !isWeb) return;

    // Check if using mock Razorpay (placeholder keys)
    const isMockKey = options.key && (
      options.key.includes('xxxxx') ||
      options.key === 'rzp_test_mock' ||
      options.key.length < 20
    );

    if (isMockKey) {
      // Using mock mode - don't try to load real Razorpay
      console.log('[RazorpayCheckout] Mock mode detected, skipping Razorpay script');
      return;
    }

    // Load real Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      // Initialize Razorpay checkout
      const rzpOptions = {
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        name: options.name,
        description: options.description,
        order_id: options.orderId,
        theme: { color: '#FF9800' },
        modal: {
          ondismiss: function() {
            onCancel();
          }
        },
        handler: function(response) {
          onSuccess({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        }
      };

      const rzp = new window.Razorpay(rzpOptions);

      rzp.on('payment.failed', function(response) {
        onFailure(new Error(response.error.description));
      });

      // Open checkout
      rzp.open();
    };

    script.onerror = () => {
      console.error('[RazorpayCheckout] Failed to load Razorpay script');
      onFailure(new Error('Failed to load payment gateway'));
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [visible, options, isWeb, onSuccess, onFailure, onCancel]);

  const generateCheckoutHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Payment</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 40px 30px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    .logo { font-size: 64px; margin-bottom: 20px; }
    h1 { color: #333; margin: 0 0 10px 0; font-size: 24px; font-weight: 600; }
    .amount { font-size: 36px; color: #FF9800; font-weight: bold; margin: 20px 0; }
    .description { color: #666; margin-bottom: 30px; font-size: 16px; }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #FF9800;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .loading { color: #666; margin-top: 15px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🍽️</div>
    <h1>${options.name}</h1>
    <div class="amount">₹${(options.amount / 100).toFixed(2)}</div>
    <div class="description">${options.description}</div>
    <div class="spinner"></div>
    <div class="loading">Opening secure payment gateway...</div>
  </div>

  <script>
    var options = {
      key: '${options.key}',
      amount: ${options.amount},
      currency: '${options.currency}',
      name: '${options.name}',
      description: '${options.description}',
      order_id: '${options.orderId}',
      theme: { color: '#FF9800' },
      modal: {
        ondismiss: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CANCEL' }));
        }
      },
      handler: function(response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SUCCESS',
          data: {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          }
        }));
      }
    };

    var rzp = new Razorpay(options);
    
    rzp.on('payment.failed', function(response) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'FAILURE',
        error: response.error.description
      }));
    });

    setTimeout(function() { rzp.open(); }, 500);
  </script>
</body>
</html>
    `;
  };

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('[RazorpayCheckout] Received message:', message);

      switch (message.type) {
        case 'SUCCESS':
          onSuccess(message.data);
          break;
        case 'FAILURE':
          onFailure(new Error(message.error || 'Payment failed'));
          break;
        case 'CANCEL':
          onCancel();
          break;
        default:
          console.warn('[RazorpayCheckout] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[RazorpayCheckout] Error parsing message:', error);
    }
  };

  if (!visible || !options) {
    return null;
  }

  // Check if using mock Razorpay
  const isMockKey = options.key && (
    options.key.includes('xxxxx') ||
    options.key === 'rzp_test_mock' ||
    options.key.length < 20
  );

  // For web platform with real Razorpay, return null as Razorpay opens in its own modal
  if (isWeb && !isMockKey) {
    return null;
  }

  // For web platform with mock keys, show mock payment UI
  if (isWeb && isMockKey) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={styles.mockOverlay}>
          <View style={styles.mockContainer}>
            <Text style={styles.mockTitle}>Mock Payment Gateway</Text>
            <Text style={styles.mockSubtitle}>Development Mode</Text>

            <View style={styles.mockDetails}>
              <Text style={styles.mockLabel}>Order ID:</Text>
              <Text style={styles.mockValue}>{options.orderId}</Text>
            </View>

            <View style={styles.mockDetails}>
              <Text style={styles.mockLabel}>Amount:</Text>
              <Text style={styles.mockAmount}>₹{(options.amount / 100).toFixed(2)}</Text>
            </View>

            <Text style={styles.mockInstruction}>
              This is a mock payment for development.{'\n'}
              Select an option to simulate payment:
            </Text>

            <View style={styles.mockButtons}>
              <TouchableOpacity
                style={[styles.mockButton, styles.mockButtonOutline]}
                onPress={onCancel}
              >
                <Text style={styles.mockButtonTextOutline}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mockButton, styles.mockButtonDanger]}
                onPress={() => onFailure(new Error('Payment failed (simulated)'))}
              >
                <Text style={styles.mockButtonText}>Simulate Failure</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mockButton, styles.mockButtonSuccess]}
                onPress={() => {
                  onSuccess({
                    razorpay_order_id: options.orderId,
                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                    razorpay_signature: `mock_signature_${Date.now()}`,
                  });
                }}
              >
                <Text style={styles.mockButtonText}>Simulate Success</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // For native mobile apps, use WebView
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={24}
            iconColor={colors.text.primary}
            onPress={onCancel}
          />
          <Text variant="titleMedium" style={styles.headerTitle}>
            Secure Payment
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <WebView
          ref={webViewRef}
          source={{ html: generateCheckoutHTML() }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[200],
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  // Mock payment UI styles
  mockOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  mockContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mockTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  mockSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  mockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[200],
  },
  mockLabel: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  mockValue: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: '500',
  },
  mockAmount: {
    fontSize: fontSize['2xl'],
    color: colors.primary[500],
    fontWeight: 'bold',
  },
  mockInstruction: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  mockButtons: {
    gap: spacing.md,
  },
  mockButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mockButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.secondary[300],
  },
  mockButtonDanger: {
    backgroundColor: '#dc2626',
  },
  mockButtonSuccess: {
    backgroundColor: colors.primary[500],
  },
  mockButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  mockButtonTextOutline: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

export default RazorpayCheckout;

