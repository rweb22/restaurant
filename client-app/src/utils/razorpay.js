/**
 * Razorpay Helper for Expo
 *
 * This implementation uses RazorpayCheckout component with WebView
 * which supports all payment methods including UPI, cards, wallets, etc.
 *
 * Note: The actual payment UI is handled by the RazorpayCheckout component.
 * This file provides helper functions for configuration and compatibility.
 */

// Store the payment callback globally for the component to use
let paymentResolve = null;
let paymentReject = null;
let paymentOptions = null;

/**
 * Initialize Razorpay payment
 * This function is called by CartScreen and stores the payment options
 * The actual payment UI is shown via RazorpayCheckout component
 *
 * @param {Object} options - Payment options
 * @param {string} options.orderId - Razorpay order ID
 * @param {number} options.amount - Amount in paise (smallest currency unit)
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
 * Called by RazorpayCheckout component when payment succeeds
 */
export const handlePaymentSuccess = (paymentData) => {
  if (paymentResolve) {
    console.log('[Razorpay] Payment successful:', paymentData);
    paymentResolve(paymentData);

    // Clear callbacks
    paymentResolve = null;
    paymentReject = null;
    paymentOptions = null;
  }
};

/**
 * Handle payment failure
 * Called by RazorpayCheckout component when payment fails
 */
export const handlePaymentFailure = (error) => {
  if (paymentReject) {
    console.log('[Razorpay] Payment failed:', error);
    paymentReject(error);

    // Clear callbacks
    paymentResolve = null;
    paymentReject = null;
    paymentOptions = null;
  }
};

/**
 * Handle payment cancellation
 * Called by RazorpayCheckout component when user cancels
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

