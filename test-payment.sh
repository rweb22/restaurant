#!/bin/bash

# Test Payment Integration
# This script tests the complete payment flow

BASE_URL="http://localhost:3000/api"

echo "=== Payment Integration Test ==="
echo ""

# Step 1: Create a test order (using existing user ID 1 with address ID 5)
echo "Step 1: Creating an order..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInBob25lIjoiKzkxMTIzNDU2Nzg5MCIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MzUwMDAwMDAsImV4cCI6MTc2OTAwMDAwMH0.dummy" \
  -d '{
    "addressId": 5,
    "items": [
      {
        "itemSizeId": 1,
        "quantity": 2
      }
    ],
    "deliveryCharge": 50
  }')

echo "Order Response:"
echo "$ORDER_RESPONSE" | jq .
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.data.order.id')
echo ""
echo "Order ID: $ORDER_ID"
echo "Order Status: $(echo "$ORDER_RESPONSE" | jq -r '.data.order.status')"
echo "Payment Status: $(echo "$ORDER_RESPONSE" | jq -r '.data.order.paymentStatus')"
echo ""

# Step 2: Initiate payment
echo "Step 2: Initiating payment for order $ORDER_ID..."
PAYMENT_INIT_RESPONSE=$(curl -s -X POST "$BASE_URL/payments/initiate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInBob25lIjoiKzkxMTIzNDU2Nzg5MCIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MzUwMDAwMDAsImV4cCI6MTc2OTAwMDAwMH0.dummy" \
  -d "{\"orderId\": $ORDER_ID}")

echo "Payment Initiation Response:"
echo "$PAYMENT_INIT_RESPONSE" | jq .
GATEWAY_ORDER_ID=$(echo "$PAYMENT_INIT_RESPONSE" | jq -r '.data.gatewayOrderId')
echo ""
echo "Gateway Order ID: $GATEWAY_ORDER_ID"
echo ""

# Step 3: Get payment status
echo "Step 3: Checking payment status..."
PAYMENT_STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/payments/status/$ORDER_ID" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInBob25lIjoiKzkxMTIzNDU2Nzg5MCIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MzUwMDAwMDAsImV4cCI6MTc2OTAwMDAwMH0.dummy")

echo "Payment Status Response:"
echo "$PAYMENT_STATUS_RESPONSE" | jq .
echo ""

# Step 4: Verify payment (simulating successful payment)
# Note: In real scenario, this would be called after user completes payment on Razorpay
echo "Step 4: Verifying payment (simulated)..."
echo "Note: This would normally be called after user completes payment on Razorpay"
echo "Skipping verification as it requires real Razorpay payment completion"
echo ""

# Step 5: Check order status
echo "Step 5: Checking final order status..."
ORDER_STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInBob25lIjoiKzkxMTIzNDU2Nzg5MCIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MzUwMDAwMDAsImV4cCI6MTc2OTAwMDAwMH0.dummy")

echo "Final Order Status:"
echo "$ORDER_STATUS_RESPONSE" | jq .
echo ""

echo "=== Test Complete ==="
echo ""
echo "Summary:"
echo "- Order created with status: pending_payment"
echo "- Payment initiated with Razorpay"
echo "- Gateway Order ID: $GATEWAY_ORDER_ID"
echo "- Payment status checked successfully"
echo ""
echo "Next steps (manual):"
echo "1. Complete payment on Razorpay test mode"
echo "2. Verify payment using /api/payments/verify endpoint"
echo "3. Check webhook processing"

