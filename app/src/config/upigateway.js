/**
 * UPIGateway Payment Gateway Configuration
 * 
 * This file contains all UPIGateway-related configuration settings.
 * UPIGateway is a Dynamic QR Code Service for UPI payments.
 * 
 * Environment Variables Required:
 * - UPIGATEWAY_MERCHANT_KEY: UPIGateway API Merchant Key
 * - UPIGATEWAY_WEBHOOK_SECRET: Webhook signature secret for verifying webhook authenticity
 * - UPIGATEWAY_CALLBACK_URL: Callback URL for payment notifications
 * - PAYMENT_CURRENCY: Currency code (UPIGateway only supports INR)
 * - PAYMENT_ORDER_EXPIRY: Order expiry time in seconds (default: 900 = 15 minutes)
 * - PAYMENT_ENABLED: Enable/disable payment processing (default: true)
 */

module.exports = {
  // UPIGateway API credentials
  merchantKey: process.env.UPIGATEWAY_MERCHANT_KEY || '',
  
  // Webhook configuration
  webhookSecret: process.env.UPIGATEWAY_WEBHOOK_SECRET || '',
  
  // Callback URL for payment notifications
  callbackUrl: process.env.UPIGATEWAY_CALLBACK_URL || '',
  
  // Payment settings
  currency: 'INR', // UPIGateway only supports INR
  orderExpiry: parseInt(process.env.PAYMENT_ORDER_EXPIRY) || 900, // 15 minutes in seconds
  
  // Feature flag
  enabled: process.env.PAYMENT_ENABLED === 'true',

  // Test mode (simulates UPIGateway responses without calling actual API)
  testMode: process.env.UPIGATEWAY_TEST_MODE === 'true',

  // UPIGateway API base URL
  apiBaseUrl: 'https://merchant.upigateway.com/api',
  
  // Supported payment methods (UPI only)
  supportedMethods: ['upi'],
  
  // UPI specific settings
  upi: {
    enabled: true,
    qrCodeFormat: 'base64', // base64 or url
    intentEnabled: true // Enable UPI intent links
  },
  
  // Order notes prefix
  orderNotesPrefix: 'Restaurant Order',
  
  // Refund settings (UPIGateway doesn't support automatic refunds)
  refund: {
    enabled: false,
    manual: true // Refunds must be processed manually through merchant UPI app
  },
  
  // Polling settings for payment status checks
  polling: {
    enabled: true,
    interval: 3000, // 3 seconds
    maxAttempts: 100, // 5 minutes total (100 * 3 seconds)
    timeout: 300000 // 5 minutes in milliseconds
  },
  
  // Validation
  validate() {
    const errors = [];
    const warnings = [];

    // Merchant key is required
    if (!this.merchantKey) {
      errors.push('UPIGATEWAY_MERCHANT_KEY is not configured');
    }

    // Webhook secret and callback URL are optional for testing (polling will work without them)
    if (!this.webhookSecret) {
      warnings.push('UPIGATEWAY_WEBHOOK_SECRET is not configured - webhook verification will be skipped');
    }

    if (!this.callbackUrl) {
      warnings.push('UPIGATEWAY_CALLBACK_URL is not configured - webhooks will not work (polling will be used)');
    }

    // Log warnings
    if (warnings.length > 0) {
      console.warn('[UPIGateway Config] Warnings:', warnings.join(', '));
    }

    // Only throw error if merchant key is missing
    if (this.enabled && errors.length > 0) {
      throw new Error(`UPIGateway configuration errors: ${errors.join(', ')}`);
    }

    return errors.length === 0;
  }
};

