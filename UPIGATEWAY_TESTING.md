# UPIGateway Integration Testing Guide

## Prerequisites

Before testing, ensure you have:

1. **UPIGateway Account**
   - Sign up at https://upigateway.com
   - Get your merchant key and webhook secret
   - Configure webhook URL in UPIGateway dashboard

2. **Environment Configuration**
   - Update `app/.env` with UPIGateway credentials:
     ```env
     UPIGATEWAY_MERCHANT_KEY=your_merchant_key_here
     UPIGATEWAY_WEBHOOK_SECRET=your_webhook_secret_here
     UPIGATEWAY_CALLBACK_URL=https://your-domain.com/api/webhooks/upigateway
     ```

3. **Backend Running**
   - Start backend: `cd app && npm start`
   - Verify health: `curl http://localhost:3000/health`

4. **Frontend Running**
   - Start client app: `cd client-app && npm start`
   - For mobile: `npx expo start`

---

## Test Cases

### 1. Backend API Testing

#### Test 1.1: Payment Initiation
```bash
# Create an order first (requires authentication)
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": 1,
    "items": [{"itemId": 1, "sizeId": 1, "quantity": 2}]
  }'

# Initiate payment
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "transactionId": 123,
    "gatewayOrderId": "upi_order_xxx",
    "clientTxnId": "order_1_1234567890",
    "qrCode": "base64_encoded_qr_image...",
    "qrString": "upi://pay?...",
    "paymentUrl": "https://upigateway.com/pay/...",
    "amount": 500,
    "currency": "INR"
  }
}
```

#### Test 1.2: Payment Status Check
```bash
curl -X POST http://localhost:3000/api/payments/check-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "paymentStatus": "pending",
    "gatewayStatus": "pending"
  }
}
```

#### Test 1.3: Webhook Handler
```bash
# Simulate UPIGateway webhook
curl -X POST http://localhost:3000/api/webhooks/upigateway \
  -H "Content-Type: application/json" \
  -H "x-upigateway-signature: SIGNATURE_HERE" \
  -d '{
    "client_txn_id": "order_1_1234567890",
    "status": "success",
    "txn_id": "UPI123456789",
    "upi_txn_id": "123456789012",
    "amount": "500.00",
    "customer_vpa": "customer@upi",
    "customer_name": "Customer Name",
    "customer_mobile": "9876543210"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

### 2. Frontend Testing

#### Test 2.1: QR Code Display (Web Browser)
1. Open browser: http://localhost:19006 (or your Expo web URL)
2. Login with phone number
3. Add items to cart
4. Select delivery address
5. Click "Place Order"
6. **Verify:**
   - ✅ UPIGateway modal appears
   - ✅ QR code image is displayed
   - ✅ Payment amount is shown correctly
   - ✅ Instructions are clear
   - ✅ Cancel button is visible

#### Test 2.2: QR Code Display (Mobile App)
1. Open Expo Go app on your phone
2. Scan QR code from `npx expo start`
3. Login with phone number
4. Add items to cart
5. Select delivery address
6. Click "Place Order"
7. **Verify:**
   - ✅ UPIGateway modal appears
   - ✅ QR code image is displayed clearly
   - ✅ Payment amount is shown correctly
   - ✅ Instructions are clear
   - ✅ Cancel button works

#### Test 2.3: Payment Flow - Success
1. Generate QR code (follow Test 2.1 or 2.2)
2. Open any UPI app (Google Pay, PhonePe, Paytm, etc.)
3. Scan the QR code
4. Complete payment
5. **Verify:**
   - ✅ Modal shows "Processing payment..."
   - ✅ Polling starts (check console logs)
   - ✅ After payment, modal closes automatically
   - ✅ Success message appears
   - ✅ Cart is cleared
   - ✅ Redirected to Order Confirmation screen
   - ✅ Order status is "confirmed" or "pending"

#### Test 2.4: Payment Flow - Cancellation
1. Generate QR code
2. Click "Cancel Payment" button
3. Confirm cancellation
4. **Verify:**
   - ✅ Confirmation dialog appears
   - ✅ Modal closes after confirmation
   - ✅ "Payment Cancelled" alert appears
   - ✅ Order remains in cart
   - ✅ Can retry payment

#### Test 2.5: Payment Flow - Timeout
1. Generate QR code
2. Wait for 5 minutes without paying
3. **Verify:**
   - ✅ Polling stops after max attempts (100 attempts × 3 seconds = 5 minutes)
   - ✅ Timeout message appears
   - ✅ Modal closes
   - ✅ Can retry payment

---

### 3. Database Verification

After completing a payment, verify database records:

```sql
-- Check transaction record
SELECT * FROM transactions WHERE order_id = 1;

-- Check order status
SELECT * FROM orders WHERE id = 1;

-- Verify payment details
SELECT 
  o.id as order_id,
  o.status as order_status,
  o.total_price,
  t.payment_status,
  t.gateway_order_id,
  t.gateway_payment_id,
  t.amount
FROM orders o
LEFT JOIN transactions t ON o.id = t.order_id
WHERE o.id = 1;
```

**Expected Results:**
- Transaction record exists with `payment_gateway = 'upigateway'`
- Transaction status is `completed`
- Order status is updated (e.g., `confirmed`)
- Gateway IDs are populated

---

## Common Issues & Troubleshooting

### Issue 1: QR Code Not Displaying
**Symptoms:** Modal shows but QR code is blank or broken image

**Solutions:**
- Check backend logs for payment initiation errors
- Verify UPIGateway credentials in `.env`
- Check if `qrCode` field in response is valid base64 string
- Verify network request in browser DevTools

### Issue 2: Polling Not Working
**Symptoms:** Payment completed but modal doesn't close

**Solutions:**
- Check browser console for polling errors
- Verify `/api/payments/check-status` endpoint is working
- Check if webhook is configured correctly in UPIGateway dashboard
- Verify webhook secret matches in `.env`

### Issue 3: Webhook Not Received
**Symptoms:** Payment completed but order status not updated

**Solutions:**
- Verify webhook URL is publicly accessible (use ngrok for local testing)
- Check UPIGateway dashboard for webhook delivery logs
- Verify webhook signature validation is working
- Check backend logs for webhook processing errors

### Issue 4: Payment Status Stuck on Pending
**Symptoms:** Payment completed but status remains "pending"

**Solutions:**
- Check if webhook was received (backend logs)
- Verify webhook signature is correct
- Check if transaction record was updated
- Manually trigger status check via API

---

## Production Checklist

Before deploying to production:

- [ ] UPIGateway merchant account is verified and active
- [ ] Production webhook URL is configured in UPIGateway dashboard
- [ ] Environment variables are set correctly in production
- [ ] SSL certificate is installed (HTTPS required for webhooks)
- [ ] Webhook signature validation is enabled
- [ ] Error logging and monitoring is set up
- [ ] Payment failure notifications are configured
- [ ] Refund process is documented and tested
- [ ] Customer support process for payment issues is defined
- [ ] Load testing completed for high-traffic scenarios

---

## Notes

1. **UPI-Only Payments:** UPIGateway only supports UPI payments. Customers without UPI apps cannot complete payment.

2. **Manual Refunds:** UPIGateway doesn't support automatic refunds. All refunds must be processed manually through your merchant UPI app.

3. **Webhook Delays:** Payment confirmation via webhook may take a few seconds. Polling ensures real-time updates on the frontend.

4. **Testing Environment:** Use UPIGateway's trial period for testing. You'll need a real merchant account for production.

5. **Security:** Never commit `.env` files with real credentials to version control.

