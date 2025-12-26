# Testing UPIGateway Without Webhook/Callback URL

## Current Situation

You have:
- ✅ UPIGateway API Key (Merchant Key)
- ❌ No Webhook Secret
- ❌ No Callback URL configured

**Good News:** You can still test the complete payment flow using **polling**!

---

## How It Works Without Webhook

### Normal Flow (With Webhook):
1. User scans QR code and pays
2. UPIGateway sends webhook to your server
3. Server updates order status immediately
4. Frontend polling detects the change
5. User sees success message

### Polling-Only Flow (Without Webhook):
1. User scans QR code and pays
2. ~~UPIGateway sends webhook~~ (skipped)
3. Frontend keeps polling `/api/payments/check-status`
4. Backend calls UPIGateway API to check status
5. When status changes to "success", frontend shows success message

**The difference:** Instead of webhook pushing updates, we pull updates via polling. It works perfectly for testing!

---

## Setup Instructions

### Step 1: Update Environment Variables

Edit `app/.env`:

```env
# Add your real UPIGateway merchant key
UPIGATEWAY_MERCHANT_KEY=your_actual_merchant_key_here

# These can be dummy values for testing (not used in polling mode)
UPIGATEWAY_WEBHOOK_SECRET=test_webhook_secret_not_required
UPIGATEWAY_CALLBACK_URL=http://localhost:3000/api/webhooks/upigateway
```

### Step 2: Restart Backend

```bash
# Stop the backend (Ctrl+C in the terminal or kill the process)
# Then restart:
cd app
npm start
```

---

## Testing Steps

### Test 1: Generate QR Code

1. **Open Client App** in browser: http://localhost:8081
2. **Login** with phone number (use mock OTP: any 6 digits)
3. **Add items to cart**
4. **Select delivery address**
5. **Click "Place Order"**

**Expected Result:**
- ✅ UPIGateway modal appears
- ✅ QR code is displayed
- ✅ Payment amount is shown
- ✅ Instructions are visible

**If QR code doesn't appear:**
- Check browser console for errors
- Check backend logs for UPIGateway API errors
- Verify your merchant key is correct

---

### Test 2: Payment Flow with Polling

1. **Scan the QR code** with any UPI app (Google Pay, PhonePe, Paytm, etc.)
2. **Complete the payment** in your UPI app
3. **Watch the frontend:**
   - Modal should show "Processing payment..."
   - Console logs will show polling attempts every 3 seconds
   - After payment is confirmed by UPIGateway, modal closes
   - Success message appears
   - Cart is cleared
   - Redirected to Order Confirmation screen

**Expected Console Logs:**
```
[CartScreen] Polling payment status... (attempt 1/100)
[CartScreen] Polling payment status... (attempt 2/100)
[CartScreen] Polling payment status... (attempt 3/100)
...
[CartScreen] Payment status changed to: completed
[CartScreen] Payment successful!
```

---

### Test 3: Manual Status Check (API Testing)

You can manually check payment status using the API:

```bash
# Get your auth token first (login via app or API)
TOKEN="your_jwt_token_here"

# Check payment status
curl -X POST http://localhost:3000/api/payments/check-status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1}'
```

**Expected Response (Before Payment):**
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

**Expected Response (After Payment):**
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "paymentStatus": "completed",
    "gatewayStatus": "success",
    "gatewayPaymentId": "UPI123456789",
    "amount": 500
  }
}
```

---

## Polling Configuration

The frontend polls every **3 seconds** for a maximum of **100 attempts** (5 minutes total).

**Current Settings** (in `client-app/src/components/UPIGatewayCheckout.js`):
```javascript
const pollingInterval = 3000; // 3 seconds
const maxPollingAttempts = 100; // 5 minutes total
```

**If you want to change polling frequency:**
1. Edit `client-app/src/components/UPIGatewayCheckout.js`
2. Change `pollingInterval` (in milliseconds)
3. Change `maxPollingAttempts` (total attempts before timeout)

---

## Troubleshooting

### Issue 1: QR Code Not Generated
**Symptoms:** Modal appears but no QR code

**Solutions:**
- Check backend logs: `tail -f app/logs/app.log` (if logging is enabled)
- Verify merchant key is correct
- Check UPIGateway API response in backend console
- Ensure UPIGateway account is active

### Issue 2: Polling Not Working
**Symptoms:** Payment completed but modal doesn't close

**Solutions:**
- Check browser console for polling errors
- Verify `/api/payments/check-status` endpoint is working
- Check if UPIGateway API is returning correct status
- Increase polling timeout if needed

### Issue 3: Payment Status Stuck on Pending
**Symptoms:** Paid but status remains "pending"

**Solutions:**
- Wait a few seconds (UPIGateway may take time to update)
- Manually check status via API (Test 3 above)
- Check UPIGateway dashboard for transaction status
- Verify merchant key has correct permissions

---

## When to Add Webhook

You should add webhook configuration when:

1. **Going to Production** - Webhooks are more reliable than polling
2. **High Traffic** - Reduces API calls to UPIGateway
3. **Real-time Updates** - Instant notification instead of 3-second delay

**To add webhook later:**
1. Get a public domain/IP (or use ngrok for testing)
2. Configure webhook URL in UPIGateway dashboard
3. Get webhook secret from UPIGateway
4. Update `app/.env` with real values
5. Restart backend

---

## Summary

✅ **You can test everything without webhook!**
- QR code generation works
- Payment flow works
- Status updates work (via polling)
- Order confirmation works

❌ **What you're missing:**
- Instant webhook notifications (but polling compensates)
- Webhook signature verification (not needed for testing)

**For testing purposes, polling is perfectly fine!** 🎉

---

## Next Steps

1. Add your real UPIGateway merchant key to `app/.env`
2. Restart backend
3. Test the complete flow (Tests 1-3 above)
4. If everything works, you're ready to build the APK!

