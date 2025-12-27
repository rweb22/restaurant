# Complete Notification Scenarios

This document lists ALL situations where notifications are sent to clients or admins in the restaurant app.

---

## 📱 CLIENT NOTIFICATIONS (Sent to Customer)

### 1. **ORDER_CREATED** - Order Placed
- **When:** Client creates a new order
- **Triggered by:** `orderService.createOrder()` (line 356)
- **File:** `app/src/services/orderService.js`
- **Message:** "Your order #[ID] is being processed. Total amount: ₹[AMOUNT]. Please complete the payment to confirm your order."
- **Recipient:** Client who created the order

### 2. **PAYMENT_COMPLETED** - Payment Successful
- **When:** Payment is successfully completed via UPI Gateway
- **Triggered by:** `paymentService.handleWebhook()` (line 216)
- **File:** `app/src/services/paymentService.js`
- **Message:** "Payment of ₹[AMOUNT] received for order #[ID]. Your order is now awaiting confirmation from the restaurant."
- **Recipient:** Client who made the payment

### 3. **PAYMENT_FAILED** - Payment Failed
- **When:** Payment fails at UPI Gateway
- **Triggered by:** Currently NOT implemented (template exists but no trigger found)
- **File:** Template defined in `app/src/config/notificationTemplates.js`
- **Message:** "Payment for order #[ID] failed. [ERROR]. Please try again or use a different payment method."
- **Recipient:** Client whose payment failed
- **Status:** ⚠️ NOT TRIGGERED ANYWHERE

### 4. **ORDER_CONFIRMED** - Order Confirmed by Restaurant
- **When:** Admin changes order status to 'confirmed'
- **Triggered by:** `orderService.updateOrderStatus()` (line 423)
- **File:** `app/src/services/orderService.js`
- **Message:** "Your order #[ID] has been confirmed by the restaurant. We'll notify you when it's being prepared."
- **Recipient:** Client who owns the order

### 5. **ORDER_PREPARING** - Order Being Prepared
- **When:** Admin changes order status to 'preparing'
- **Triggered by:** `orderService.updateOrderStatus()` (line 423)
- **File:** `app/src/services/orderService.js`
- **Message:** "Great news! Your order #[ID] is now being prepared. It will be ready soon."
- **Recipient:** Client who owns the order

### 6. **ORDER_READY** - Order Ready for Pickup/Delivery
- **When:** Admin changes order status to 'ready'
- **Triggered by:** `orderService.updateOrderStatus()` (line 423)
- **File:** `app/src/services/orderService.js`
- **Message:** "Your order #[ID] is ready! [Delivery/Pickup message]"
- **Recipient:** Client who owns the order

### 7. **ORDER_COMPLETED** - Order Delivered
- **When:** Admin changes order status to 'completed'
- **Triggered by:** `orderService.updateOrderStatus()` (line 423)
- **File:** `app/src/services/orderService.js`
- **Message:** "Your order #[ID] has been completed. Thank you for your order! We hope you enjoyed your meal."
- **Recipient:** Client who owns the order

### 8. **ORDER_CANCELLED** - Order Cancelled
- **When:** Admin or client cancels an order
- **Triggered by:** `orderService.cancelOrder()` (line 474)
- **File:** `app/src/services/orderService.js`
- **Message:** "Your order #[ID] has been cancelled. [Refund message if applicable]"
- **Recipient:** Client who owns the order

### 9. **REFUND_PROCESSED** - Refund Completed
- **When:** Refund is processed for a cancelled order
- **Triggered by:** ❌ BROKEN - Code tries to use 'REFUND_INITIATED' which doesn't exist (line 439)
- **File:** `app/src/services/paymentService.js`
- **Message:** "A refund of ₹[AMOUNT] for order #[ID] has been processed. It will be credited to your account within 5-7 business days."
- **Recipient:** Client who received the refund
- **Status:** 🐛 **BUG** - Template exists but code uses wrong template name 'REFUND_INITIATED'

---

## 👨‍💼 ADMIN NOTIFICATIONS (Sent to Restaurant Admin)

### 1. **NEW_ORDER** - New Order with Payment
- **When:** Payment is completed for a new order
- **Triggered by:** `paymentService.handleWebhook()` (line 223)
- **File:** `app/src/services/paymentService.js`
- **Message:** "New order #[ID] received from [PHONE]. Total amount: ₹[AMOUNT]. Payment completed."
- **Recipient:** Admin user

### 2. **PAYMENT_RECEIVED** - Payment Received
- **When:** Payment is completed for an order
- **Triggered by:** `paymentService.handleWebhook()` (line 230)
- **File:** `app/src/services/paymentService.js`
- **Message:** "Payment of ₹[AMOUNT] received for order #[ID] from [PHONE]."
- **Recipient:** Admin user

### 3. **ORDER_CANCELLED_BY_CLIENT** - Client Cancelled Order
- **When:** Client cancels their own order
- **Triggered by:** `orderService.cancelOrder()` (line 483)
- **File:** `app/src/services/orderService.js`
- **Message:** "Order #[ID] from [PHONE] has been cancelled by the customer. [Refund message if applicable]"
- **Recipient:** Admin user

### 4. **REFUND_REQUESTED** - Refund Processed
- **When:** Refund is initiated for a cancelled order
- **Triggered by:** `paymentService.initiateRefund()` (line 446)
- **File:** `app/src/services/paymentService.js`
- **Message:** "Refund of ₹[AMOUNT] processed for order #[ID] ([PHONE])."
- **Recipient:** Admin user

---

## 📊 SUMMARY

### Total Notification Types: 13
- **Client Notifications:** 9 templates
- **Admin Notifications:** 4 templates

### Active Triggers: 11
- ✅ ORDER_CREATED
- ✅ PAYMENT_COMPLETED
- ✅ ORDER_CONFIRMED
- ✅ ORDER_PREPARING
- ✅ ORDER_READY
- ✅ ORDER_COMPLETED
- ✅ ORDER_CANCELLED
- ✅ NEW_ORDER
- ✅ PAYMENT_RECEIVED
- ✅ ORDER_CANCELLED_BY_CLIENT
- ✅ REFUND_REQUESTED

### Inactive/Broken Templates: 2
- ⚠️ **PAYMENT_FAILED** - Template exists but not triggered anywhere
- 🐛 **REFUND_PROCESSED** - Template exists but code uses wrong name 'REFUND_INITIATED' (line 439 in paymentService.js)

---

## 🐛 BUGS FOUND

### 1. REFUND_INITIATED Template Missing
- **Location:** `app/src/services/paymentService.js` line 439
- **Issue:** Code tries to create notification with template 'REFUND_INITIATED' which doesn't exist
- **Fix:** Change 'REFUND_INITIATED' to 'REFUND_PROCESSED'
- **Impact:** Refund notifications to clients are failing silently

---

## 🔍 Key Files

1. **Notification Templates:** `app/src/config/notificationTemplates.js`
2. **Notification Service:** `app/src/services/notificationService.js`
3. **Order Service:** `app/src/services/orderService.js`
4. **Payment Service:** `app/src/services/paymentService.js`

