# Complete Payment & Refund Testing Guide

## 🎯 Overview

This guide covers end-to-end testing of:
1. **Payment Flow** - Customer places order and pays via UPI
2. **Refund Flow** - Admin processes refund manually via UPI

---

## ⚙️ Prerequisites

### 1. UPIGateway Setup
- ✅ UPIGateway merchant account created
- ✅ Merchant key obtained from dashboard
- ✅ Added to `app/.env`:
  ```env
  UPIGATEWAY_MERCHANT_KEY=your_actual_merchant_key_here
  ```

### 2. Running Services
- ✅ Database: PostgreSQL in Docker (port 5432)
- ✅ Backend: Node.js/Express (port 3000)
- ✅ Client App: Expo (port 8081)
- ✅ Admin App: Expo (port 8082)

### 3. Test Accounts
- **Customer Account:** Any phone number (mock OTP: any 6 digits)
- **Admin Account:** Phone number with `role='admin'` in database

---

## 📱 Part 1: Payment Flow Testing

### Step 1: Customer - Place Order

1. **Open Client App:** http://localhost:8081
2. **Login:**
   - Enter phone number (e.g., `9876543210`)
   - Enter any 6-digit OTP (e.g., `123456`)
3. **Browse Menu:**
   - Navigate to Home tab
   - Browse categories and items
4. **Add Items to Cart:**
   - Click on any item
   - Select size (if applicable)
   - Select add-ons (if applicable)
   - Click "Add to Cart"
   - Repeat for multiple items
5. **Review Cart:**
   - Navigate to Cart tab
   - Verify items, quantities, prices
   - Check subtotal, GST, delivery charge, total
6. **Select Delivery Address:**
   - Click "Select Address"
   - Choose existing address or add new one
7. **Place Order:**
   - Click "Place Order" button
   - Wait for UPIGateway modal to appear

**Expected Result:**
- ✅ UPIGateway modal appears
- ✅ QR code is displayed
- ✅ Payment amount matches cart total
- ✅ Instructions are visible

---

### Step 2: Customer - Complete Payment

1. **Scan QR Code:**
   - Open any UPI app (Google Pay, PhonePe, Paytm, etc.)
   - Scan the QR code displayed in the modal
2. **Verify Payment Details:**
   - Check merchant name
   - Check amount
   - Check UPI ID
3. **Complete Payment:**
   - Enter UPI PIN
   - Confirm payment
4. **Wait for Confirmation:**
   - Frontend polls every 3 seconds
   - Watch console logs for polling attempts
   - Modal should close automatically when payment is confirmed

**Expected Result:**
- ✅ Payment successful in UPI app
- ✅ Modal closes automatically (within 3-10 seconds)
- ✅ Success message appears
- ✅ Cart is cleared
- ✅ Redirected to Orders screen
- ✅ Order appears with status "pending" or "confirmed"

**Console Logs (Client App):**
```
[CartScreen] Polling payment status... (attempt 1/100)
[CartScreen] Polling payment status... (attempt 2/100)
[CartScreen] Payment status changed to: completed
[CartScreen] Payment successful!
```

---

### Step 3: Verify Payment in Backend

**Check Backend Logs:**
```
[INFO] Payment initiated for order #1
[INFO] UPIGateway order created: order_xxx
[INFO] Payment status check: pending
[INFO] Payment status check: pending
[INFO] Payment status check: success
[INFO] Order #1 payment completed
```

**Check Database:**
```sql
-- Check order
SELECT id, status, payment_status, payment_method, total_price 
FROM orders 
WHERE id = 1;

-- Expected:
-- status: 'pending' or 'confirmed'
-- payment_status: 'completed'
-- payment_method: 'upi'

-- Check transaction
SELECT id, order_id, status, amount, upi_vpa, gateway_payment_id
FROM transactions
WHERE order_id = 1;

-- Expected:
-- status: 'captured' or 'authorized'
-- amount: matches order total
-- upi_vpa: customer's UPI ID
-- gateway_payment_id: UPIGateway transaction ID
```

---

## 🔄 Part 2: Refund Flow Testing

### Step 4: Admin - View Transaction

1. **Open Admin App:** http://localhost:8082
2. **Login as Admin:**
   - Enter admin phone number
   - Enter any 6-digit OTP
3. **Navigate to Transactions:**
   - Go to Transactions tab
   - Find the transaction for the order you just paid
4. **View Transaction Details:**
   - Click on the transaction
   - Verify transaction details:
     - Status: "Captured" or "Authorized"
     - Amount: Matches payment
     - UPI VPA: Customer's UPI ID
     - Gateway Payment ID: UPIGateway transaction ID

**Expected Result:**
- ✅ Transaction appears in list
- ✅ Status is "Captured" or "Authorized"
- ✅ "Process Refund" button is visible

---

### Step 5: Admin - Initiate Refund

1. **Click "Process Refund" Button**
2. **Refund Dialog Appears:**
   - Refund Amount: Pre-filled with transaction amount
   - Reason: Empty (required field)
3. **Enter Refund Details:**
   - Amount: Keep default (full refund) or enter partial amount
   - Reason: Enter reason (e.g., "Customer request", "Order cancelled")
4. **Click "Confirm Refund"**

**Expected Result:**
- ✅ Refund dialog closes
- ✅ Success message appears
- ✅ Transaction list refreshes
- ✅ Admin receives notification with customer VPA

**Backend Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "refundTransactionId": 2,
    "amount": 500.00,
    "status": "processing",
    "customerVpa": "customer@paytm",
    "message": "Refund initiated. Please process manually through your UPI merchant app.",
    "instructions": "Send ₹500.00 to customer@paytm using your UPI merchant app."
  }
}
```

---

### Step 6: Admin - Process Manual Refund

**IMPORTANT:** UPIGateway doesn't support automatic refunds. You must manually send money via UPI.

1. **Note Customer VPA:**
   - From the refund response or notification
   - Example: `customer@paytm`, `customer@ybl`, etc.
2. **Open Your UPI Merchant App:**
   - Google Pay for Business
   - PhonePe for Business
   - Paytm for Business
   - Or any UPI app linked to your merchant account
3. **Send Money:**
   - Enter customer VPA
   - Enter refund amount
   - Add note: "Refund for Order #1"
   - Enter UPI PIN
   - Confirm payment
4. **Verify Refund Sent:**
   - Check transaction history in UPI app
   - Take screenshot for records

**Expected Result:**
- ✅ Money sent to customer's UPI ID
- ✅ Customer receives refund in their bank account (instant)

---

### Step 7: Verify Refund in Database

```sql
-- Check order payment status
SELECT id, status, payment_status 
FROM orders 
WHERE id = 1;

-- Expected:
-- payment_status: 'processing' (refund in progress)

-- Check refund transaction
SELECT id, order_id, status, amount, metadata
FROM transactions
WHERE order_id = 1
ORDER BY created_at DESC;

-- Expected: 2 transactions
-- Transaction 1 (original payment):
--   status: 'captured' or 'authorized'
--   amount: 500.00
-- Transaction 2 (refund):
--   status: 'created'
--   amount: 500.00 (or partial amount)
--   metadata: contains refund_type, reason, customer_vpa, instructions
```

---

## ✅ Success Criteria

### Payment Flow:
- ✅ QR code generated successfully
- ✅ Customer can scan and pay
- ✅ Payment status updates automatically (via polling)
- ✅ Order status changes to "pending" or "confirmed"
- ✅ Transaction record created with status "captured"
- ✅ Customer receives order confirmation

### Refund Flow:
- ✅ Admin can view transaction details
- ✅ "Process Refund" button appears for captured transactions
- ✅ Refund dialog validates input correctly
- ✅ Refund transaction created with status "created"
- ✅ Order payment status changes to "processing"
- ✅ Admin receives customer VPA for manual refund
- ✅ Customer receives refund notification
- ✅ Admin can manually send refund via UPI

---

## 🐛 Troubleshooting

### Issue: QR Code Not Appearing
**Solution:** Check `app/.env` for correct `UPIGATEWAY_MERCHANT_KEY`

### Issue: Payment Status Stuck on "Pending"
**Solution:** 
- Wait 3-10 seconds for polling to detect payment
- Check UPIGateway dashboard for transaction status
- Manually check status via API: `POST /api/payments/check-status`

### Issue: "Process Refund" Button Not Visible
**Solution:**
- Verify transaction status is "captured" or "authorized"
- Verify order payment status is "completed"
- Check admin role in database

### Issue: Refund Dialog Validation Errors
**Solution:**
- Amount must be > 0 and <= transaction amount
- Reason is required (cannot be empty)

---

## 📊 Test Checklist

- [ ] Customer can login to client app
- [ ] Customer can add items to cart
- [ ] Customer can select delivery address
- [ ] Customer can place order
- [ ] QR code appears in modal
- [ ] Customer can scan QR code with UPI app
- [ ] Customer can complete payment
- [ ] Payment status updates automatically
- [ ] Order appears in customer's order list
- [ ] Admin can login to admin app
- [ ] Admin can view transactions
- [ ] Admin can view transaction details
- [ ] Admin can initiate refund
- [ ] Refund transaction created in database
- [ ] Admin receives customer VPA
- [ ] Admin can manually send refund via UPI
- [ ] Customer receives refund

---

**All tests passed? You're ready for production!** 🚀

