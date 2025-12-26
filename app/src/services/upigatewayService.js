/**
 * UPIGateway Service
 * 
 * This service handles all direct interactions with the UPIGateway API.
 * UPIGateway is a Dynamic QR Code Service for UPI payments.
 * 
 * Key Features:
 * - Generate dynamic QR codes for UPI payments
 * - Check transaction status
 * - Verify webhook signatures
 * 
 * API Documentation: https://upigateway.com/docs
 */

const axios = require('axios');
const crypto = require('crypto');
const upigatewayConfig = require('../config/upigateway');
const logger = require('../utils/logger');

class UPIGatewayService {
  constructor() {
    this.apiBaseUrl = upigatewayConfig.apiBaseUrl;
    this.merchantKey = upigatewayConfig.merchantKey;
    
    if (upigatewayConfig.enabled) {
      try {
        upigatewayConfig.validate();
        logger.info('UPIGateway service initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize UPIGateway service:', error);
        throw error;
      }
    } else {
      logger.warn('UPIGateway service is disabled');
    }
  }

  /**
   * Create payment order and generate QR code
   * @param {number} amount - Amount in INR (rupees, not paise)
   * @param {string} clientTxnId - Unique client transaction ID
   * @param {string} customerName - Customer name
   * @param {string} customerEmail - Customer email
   * @param {string} customerMobile - Customer mobile number
   * @param {object} customFields - Custom fields (udf1, udf2, udf3)
   * @returns {Promise<Object>} - Order details with QR code
   */
  async createOrder(amount, clientTxnId, customerName, customerEmail, customerMobile, customFields = {}) {
    if (!upigatewayConfig.enabled) {
      throw new Error('Payment service is disabled');
    }

    // Test mode - return mock response without calling actual API
    if (upigatewayConfig.testMode) {
      logger.warn('UPIGateway TEST MODE: Returning mock payment response');
      logger.info('Creating UPIGateway order (TEST MODE):', {
        clientTxnId,
        amount,
        customerMobile
      });

      const mockOrderId = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const mockQrString = `upi://pay?pa=merchant@upi&pn=${encodeURIComponent(customerName || 'Customer')}&am=${amount}&tn=${encodeURIComponent(clientTxnId)}`;
      const mockQrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // 1x1 transparent PNG

      return {
        success: true,
        orderId: mockOrderId,
        qrCode: mockQrCode,
        qrString: mockQrString,
        paymentUrl: `https://test.upigateway.com/pay/${mockOrderId}`,
        amount: amount,
        currency: 'INR',
        clientTxnId: clientTxnId
      };
    }

    try {
      const payload = {
        key: this.merchantKey,
        client_txn_id: clientTxnId,
        amount: amount.toString(),
        p_info: `${upigatewayConfig.orderNotesPrefix} #${clientTxnId}`,
        customer_name: customerName || 'Customer',
        customer_email: customerEmail || '',
        customer_mobile: customerMobile || '',
        redirect_url: upigatewayConfig.callbackUrl || 'http://google.com',
        udf1: customFields.udf1 || '',
        udf2: customFields.udf2 || '',
        udf3: customFields.udf3 || ''
      };

      logger.info('Creating UPIGateway order:', {
        clientTxnId,
        amount,
        customerMobile
      });

      const response = await axios.post(`${this.apiBaseUrl}/create_order`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      logger.debug('UPIGateway API response:', response.data);

      if (response.data.status === true || response.data.status === 'true') {
        logger.info('UPIGateway order created successfully:', {
          clientTxnId,
          gatewayOrderId: response.data.data?.order_id
        });

        return {
          success: true,
          orderId: response.data.data.order_id,
          qrCode: response.data.data.qr_code, // Base64 QR code image
          qrString: response.data.data.qr_string, // UPI intent string
          paymentUrl: response.data.data.payment_url, // Payment page URL
          amount: amount,
          currency: 'INR',
          clientTxnId: clientTxnId
        };
      } else {
        const errorMsg = response.data.msg || response.data.message || 'Failed to create UPIGateway order';
        logger.error('UPIGateway order creation failed:', {
          clientTxnId,
          error: errorMsg,
          response: response.data
        });
        throw new Error(errorMsg);
      }
    } catch (error) {
      if (error.response) {
        logger.error('UPIGateway API error:', {
          status: error.response.status,
          data: error.response.data,
          clientTxnId
        });
        throw new Error(`UPIGateway API error: ${error.response.data?.msg || error.message}`);
      } else if (error.request) {
        logger.error('UPIGateway network error:', { clientTxnId, error: error.message });
        throw new Error('Network error: Unable to reach UPIGateway API');
      } else {
        logger.error('UPIGateway order creation failed:', { clientTxnId, error: error.message });
        throw new Error(`UPIGateway order creation failed: ${error.message}`);
      }
    }
  }

  /**
   * Check transaction status
   * @param {string} clientTxnId - Client transaction ID
   * @returns {Promise<Object>} - Transaction status
   */
  async checkTransactionStatus(clientTxnId) {
    if (!upigatewayConfig.enabled) {
      throw new Error('Payment service is disabled');
    }

    // Test mode - return mock pending status
    if (upigatewayConfig.testMode) {
      logger.warn('UPIGateway TEST MODE: Returning mock transaction status (pending)');
      logger.info('Checking transaction status (TEST MODE):', { clientTxnId });

      return {
        success: true,
        status: 'pending', // Always return pending in test mode
        txnId: `test_txn_${Date.now()}`,
        upiTxnId: `test_upi_${Date.now()}`,
        amount: 0,
        customerVpa: 'test@upi',
        clientTxnId: clientTxnId
      };
    }

    try {
      const payload = {
        key: this.merchantKey,
        client_txn_id: clientTxnId
      };

      logger.info('Checking transaction status:', { clientTxnId });

      const response = await axios.post(`${this.apiBaseUrl}/check_order_status`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000 // 15 seconds timeout
      });

      if (response.data.status === true || response.data.status === 'true') {
        logger.info('Transaction status retrieved:', {
          clientTxnId,
          status: response.data.data?.status
        });

        return {
          success: true,
          status: response.data.data.status, // 'success', 'pending', 'failed'
          txnId: response.data.data.txn_id,
          upiTxnId: response.data.data.upi_txn_id,
          amount: parseFloat(response.data.data.amount),
          customerVpa: response.data.data.customer_vpa,
          clientTxnId: clientTxnId
        };
      } else {
        const errorMsg = response.data.msg || response.data.message || 'Failed to check transaction status';
        throw new Error(errorMsg);
      }
    } catch (error) {
      logger.error('Failed to check transaction status:', {
        clientTxnId,
        error: error.message
      });
      throw new Error(`Transaction status check failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * @param {Object} payload - Webhook payload
   * @param {string} signature - Webhook signature from headers
   * @returns {boolean} - Verification result
   */
  verifyWebhookSignature(payload, signature) {
    try {
      if (!signature) {
        logger.warn('Webhook signature is missing');
        return false;
      }

      // UPIGateway uses HMAC SHA256 for webhook verification
      const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', upigatewayConfig.webhookSecret)
        .update(payloadString)
        .digest('hex');

      const isValid = signature === expectedSignature;

      if (isValid) {
        logger.info('Webhook signature verified successfully');
      } else {
        logger.warn('Webhook signature verification failed', {
          expected: expectedSignature.substring(0, 10) + '...',
          received: signature.substring(0, 10) + '...'
        });
      }

      return isValid;
    } catch (error) {
      logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}

module.exports = new UPIGatewayService();

