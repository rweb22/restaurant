'use strict';

/**
 * Notification Templates
 * 
 * Each template defines:
 * - template: Enum value for the notification type
 * - title: Static title for the notification
 * - getMessage: Function that renders the message with dynamic data
 * - getRecipients: Function that determines who should receive the notification
 */

const notificationTemplates = {
  // ==================== CLIENT NOTIFICATIONS ====================
  
  ORDER_CREATED: {
    template: 'ORDER_CREATED',
    title: 'Order Being Processed',
    getMessage: (data) => {
      return `Your order #${data.orderId} is being processed. Total amount: ₹${data.totalPrice}. Please complete the payment to confirm your order.`;
    },
    getRecipients: (data) => [data.userId] // Client who created the order
  },

  PAYMENT_COMPLETED: {
    template: 'PAYMENT_COMPLETED',
    title: 'Payment Successful',
    getMessage: (data) => {
      return `Payment of ₹${data.amount} received for order #${data.orderId}. Your order is now awaiting confirmation from the restaurant.`;
    },
    getRecipients: (data) => [data.userId] // Client who made the payment
  },

  PAYMENT_FAILED: {
    template: 'PAYMENT_FAILED',
    title: 'Payment Failed',
    getMessage: (data) => {
      return `Payment for order #${data.orderId} failed. ${data.errorDescription || 'Please try again or use a different payment method.'}`;
    },
    getRecipients: (data) => [data.userId] // Client whose payment failed
  },

  ORDER_CONFIRMED: {
    template: 'ORDER_CONFIRMED',
    title: 'Order Confirmed',
    getMessage: (data) => {
      return `Your order #${data.orderId} has been confirmed by the restaurant. We'll notify you when it's being prepared.`;
    },
    getRecipients: (data) => [data.userId] // Client who owns the order
  },

  ORDER_PREPARING: {
    template: 'ORDER_PREPARING',
    title: 'Order is Being Prepared',
    getMessage: (data) => {
      return `Great news! Your order #${data.orderId} is now being prepared. It will be ready soon.`;
    },
    getRecipients: (data) => [data.userId] // Client who owns the order
  },

  ORDER_READY: {
    template: 'ORDER_READY',
    title: 'Order Ready for Pickup/Delivery',
    getMessage: (data) => {
      return `Your order #${data.orderId} is ready! ${data.deliveryAddress ? 'It will be delivered to your address shortly.' : 'You can pick it up now.'}`;
    },
    getRecipients: (data) => [data.userId] // Client who owns the order
  },

  ORDER_COMPLETED: {
    template: 'ORDER_COMPLETED',
    title: 'Order Delivered',
    getMessage: (data) => {
      return `Your order #${data.orderId} has been completed. Thank you for your order! We hope you enjoyed your meal.`;
    },
    getRecipients: (data) => [data.userId] // Client who owns the order
  },

  ORDER_CANCELLED: {
    template: 'ORDER_CANCELLED',
    title: 'Order Cancelled',
    getMessage: (data) => {
      return `Your order #${data.orderId} has been cancelled. ${data.refundAmount ? `A refund of ₹${data.refundAmount} will be processed shortly.` : ''}`;
    },
    getRecipients: (data) => [data.userId] // Client who owns the order
  },

  REFUND_PROCESSED: {
    template: 'REFUND_PROCESSED',
    title: 'Refund Processed',
    getMessage: (data) => {
      return `A refund of ₹${data.refundAmount} for order #${data.orderId} has been processed. It will be credited to your account within 5-7 business days.`;
    },
    getRecipients: (data) => [data.userId] // Client who received the refund
  },

  // ==================== ADMIN NOTIFICATIONS ====================

  NEW_ORDER: {
    template: 'NEW_ORDER',
    title: 'New Order Received',
    getMessage: (data) => {
      return `New order #${data.orderId} received from ${data.customerPhone}. Total amount: ₹${data.totalPrice}. Payment completed.`;
    },
    getRecipients: (data) => ['admin'] // Admin user
  },

  PAYMENT_RECEIVED: {
    template: 'PAYMENT_RECEIVED',
    title: 'Payment Received',
    getMessage: (data) => {
      return `Payment of ₹${data.amount} received for order #${data.orderId} from ${data.customerPhone}.`;
    },
    getRecipients: (data) => ['admin'] // Admin user
  },

  ORDER_CANCELLED_BY_CLIENT: {
    template: 'ORDER_CANCELLED_BY_CLIENT',
    title: 'Order Cancelled',
    getMessage: (data) => {
      return `Order #${data.orderId} from ${data.customerPhone} has been cancelled by the customer. ${data.refundAmount ? `Refund of ₹${data.refundAmount} processed.` : ''}`;
    },
    getRecipients: (data) => ['admin'] // Admin user
  },

  REFUND_REQUESTED: {
    template: 'REFUND_REQUESTED',
    title: 'Refund Processed',
    getMessage: (data) => {
      return `Refund of ₹${data.refundAmount} processed for order #${data.orderId} (${data.customerPhone}).`;
    },
    getRecipients: (data) => ['admin'] // Admin user
  },

  // ==================== TEMPORARY TEST NOTIFICATION ====================

  NEW_ORDER_TEMP: {
    template: 'NEW_ORDER_TEMP',
    title: '🧪 TEST: New Order Created',
    getMessage: (data) => {
      return `🧪 TEMPORARY TEST: Order #${data.orderId} created by ${data.customerName} (${data.customerPhone}). Total: ₹${data.totalPrice}. Payment NOT yet completed.`;
    },
    getRecipients: (data) => ['admin'] // Admin user
  }
};

module.exports = notificationTemplates;

