/**
 * Razorpay Payment Gateway Configuration
 * 
 * This file contains all Razorpay-related configuration settings.
 * 
 * Environment Variables Required:
 * - RAZORPAY_KEY_ID: Razorpay API Key ID (starts with rzp_test_ or rzp_live_)
 * - RAZORPAY_KEY_SECRET: Razorpay API Key Secret
 * - RAZORPAY_WEBHOOK_SECRET: Webhook signature secret for verifying webhook authenticity
 * - PAYMENT_CURRENCY: Currency code (default: INR)
 * - PAYMENT_ORDER_EXPIRY: Order expiry time in seconds (default: 900 = 15 minutes)
 * - PAYMENT_ENABLED: Enable/disable payment processing (default: true)
 */

module.exports = {
  // Razorpay API credentials
  keyId: process.env.RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  
  // Webhook configuration
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  
  // Payment settings
  currency: process.env.PAYMENT_CURRENCY || 'INR',
  orderExpiry: parseInt(process.env.PAYMENT_ORDER_EXPIRY) || 900, // 15 minutes in seconds
  
  // Feature flag
  enabled: process.env.PAYMENT_ENABLED === 'true',
  
  // Razorpay API base URL
  apiBaseUrl: 'https://api.razorpay.com/v1',
  
  // Supported payment methods
  supportedMethods: ['card', 'netbanking', 'wallet', 'upi'],
  
  // Payment method specific settings
  upi: {
    flow: 'collect', // collect or intent
    enabled: true
  },
  
  card: {
    enabled: true
  },
  
  netbanking: {
    enabled: true
  },
  
  wallet: {
    enabled: true
  },
  
  // Order notes prefix
  orderNotesPrefix: 'Restaurant Order',
  
  // Refund settings
  refund: {
    speed: 'normal', // normal or optimum
    enabled: true
  },
  
  // Validation
  validate() {
    const errors = [];
    
    if (!this.keyId) {
      errors.push('RAZORPAY_KEY_ID is not configured');
    }
    
    if (!this.keySecret) {
      errors.push('RAZORPAY_KEY_SECRET is not configured');
    }
    
    if (!this.webhookSecret) {
      errors.push('RAZORPAY_WEBHOOK_SECRET is not configured');
    }
    
    if (this.enabled && errors.length > 0) {
      throw new Error(`Razorpay configuration errors: ${errors.join(', ')}`);
    }
    
    return errors.length === 0;
  }
};

