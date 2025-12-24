/**
 * Razorpay Helper
 *
 * This is a mock implementation for Expo.
 * In production, you would use react-native-razorpay package.
 *
 * For Expo, you can either:
 * 1. Use expo-web-browser to open Razorpay checkout in a browser
 * 2. Eject from Expo and use react-native-razorpay
 * 3. Use Razorpay's Standard Checkout (web-based)
 */

// Store the payment callback globally
let paymentResolve = null;
let paymentReject = null;
let paymentOptions = null;

/**
 * Initialize Razorpay payment
 * @param {Object} options - Payment options
 * @param {string} options.orderId - Razorpay order ID
 * @param {number} options.amount - Amount in rupees
 * @param {string} options.currency - Currency code
 * @param {string} options.key - Razorpay key ID
 * @param {string} options.name - Business name
 * @param {string} options.description - Order description
 * @param {Function} options.onShow - Callback when dialog should be shown
 * @returns {Promise<Object>} - Payment result
 */
export const initializeRazorpayPayment = async (options) => {
  return new Promise((resolve, reject) => {
    console.log('[Razorpay] Initializing payment with options:', options);

    // Store callbacks and options globally
    paymentResolve = resolve;
    paymentReject = reject;
    paymentOptions = options;

    console.log('[Razorpay] Payment dialog ready, calling onShow callback');

    // Call the onShow callback to trigger the modal
    if (options.onShow) {
      options.onShow();
    }
  });
};

/**
 * Handle payment success
 */
export const handlePaymentSuccess = () => {
  if (paymentResolve && paymentOptions) {
    const mockResponse = {
      razorpay_order_id: paymentOptions.orderId,
      razorpay_payment_id: `pay_mock_${Date.now()}`,
      razorpay_signature: `mock_signature_${Date.now()}`,
    };

    console.log('[Razorpay] Payment successful (mock):', mockResponse);
    paymentResolve(mockResponse);

    // Clear callbacks
    paymentResolve = null;
    paymentReject = null;
    paymentOptions = null;
  }
};

/**
 * Handle payment failure
 */
export const handlePaymentFailure = () => {
  if (paymentReject) {
    console.log('[Razorpay] Payment failed (mock)');
    paymentReject(new Error('Payment failed'));

    // Clear callbacks
    paymentResolve = null;
    paymentReject = null;
    paymentOptions = null;
  }
};

/**
 * Handle payment cancellation
 */
export const handlePaymentCancel = () => {
  if (paymentReject) {
    console.log('[Razorpay] Payment cancelled by user');
    paymentReject(new Error('Payment cancelled by user'));

    // Clear callbacks
    paymentResolve = null;
    paymentReject = null;
    paymentOptions = null;
  }
};

/**
 * Get current payment options
 */
export const getPaymentOptions = () => {
  return paymentOptions;
};

/**
 * Check if Razorpay is available
 * @returns {boolean}
 */
export const isRazorpayAvailable = () => {
  // In production with react-native-razorpay, check if module is available
  // For now, always return true for mock
  return true;
};

/**
 * Get Razorpay configuration
 * @returns {Object}
 */
export const getRazorpayConfig = () => {
  return {
    name: 'Restaurant App',
    description: 'Food Order',
    currency: 'INR',
    theme: {
      color: '#6200ee', // Material Design primary color
    },
  };
};

