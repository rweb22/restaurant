# API Endpoints Reference

**Base URL**: `http://localhost:3000/api`

This document lists all available API endpoints in the backend, organized by feature area.

---

## 1. Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/send-otp` | Public | Send OTP to phone number |
| POST | `/auth/verify-otp` | Public | Verify OTP and get access token |
| POST | `/auth/refresh` | Authenticated | Refresh access token (NOT IMPLEMENTED) |
| GET | `/auth/me` | Authenticated | Get current user info |
| PUT | `/auth/profile` | Authenticated | Update user profile (name) |

### Request/Response Examples

**Send OTP**
```json
POST /auth/send-otp
Body: { "phone": "+919999999999" }
Response: { "success": true, "secret": "abc123", "expiresIn": 300 }
```

**Verify OTP**
```json
POST /auth/verify-otp
Body: { "phone": "+919999999999", "otp": "123456", "secret": "abc123" }
Response: { 
  "success": true, 
  "accessToken": "jwt_token_here",
  "user": { "id": 1, "phone": "+919999999999", "role": "client", "name": null }
}
```

---

## 2. Category Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/categories` | Public | List all categories |
| GET | `/categories/:id` | Public | Get category with items |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

**Query Parameters (GET /categories)**:
- `available=true` - Filter only available categories

---

## 3. Item Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/items` | Public | List all items |
| GET | `/items/:id` | Public | Get item with sizes & add-ons |
| POST | `/items` | Admin | Create item |
| PUT | `/items/:id` | Admin | Update item |
| DELETE | `/items/:id` | Admin | Delete item |

**Query Parameters (GET /items)**:
- `categoryId=1` - Filter by category
- `available=true` - Filter only available items

---

## 4. Item Size Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/items/:itemId/sizes` | Admin | Add size to item |
| PUT | `/items/:itemId/sizes/:sizeId` | Admin | Update item size |
| DELETE | `/items/:itemId/sizes/:sizeId` | Admin | Delete item size |

**Note**: Item sizes are nested under items route (`/api/items/:itemId/sizes`)

---

## 5. Add-On Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/add-ons` | Public | List all add-ons |
| GET | `/add-ons/:id` | Public | Get add-on details |
| POST | `/add-ons` | Admin | Create add-on |
| PUT | `/add-ons/:id` | Admin | Update add-on |
| DELETE | `/add-ons/:id` | Admin | Delete add-on |

---

## 6. Category Add-On Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/category-add-ons` | Public | List all category-addon links |
| POST | `/categories/:categoryId/add-ons` | Admin | Link add-on to category |
| DELETE | `/categories/:categoryId/add-ons/:addonId` | Admin | Unlink add-on from category |

---

## 7. Item Add-On Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/item-add-ons` | Public | List all item-addon links |
| POST | `/items/:itemId/add-ons` | Admin | Link add-on to item |
| DELETE | `/items/:itemId/add-ons/:addonId` | Admin | Unlink add-on from item |

---

## 8. Address Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/addresses` | Authenticated | List user's addresses |
| GET | `/addresses/:id` | Authenticated | Get specific address |
| POST | `/addresses` | Authenticated | Create new address |
| PUT | `/addresses/:id` | Authenticated | Update address |
| DELETE | `/addresses/:id` | Authenticated | Delete address |
| PATCH | `/addresses/:id/default` | Authenticated | Set as default address |

---

## 9. Offer Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/offers` | Public | List all offers |
| GET | `/offers/:id` | Public | Get offer by ID |
| GET | `/offers/code/:code` | Public | Get offer by code |
| POST | `/offers/validate` | Authenticated | Validate offer code |
| GET | `/offers/usage/history` | Authenticated | Get user's offer usage |
| POST | `/offers` | Admin | Create offer |
| PUT | `/offers/:id` | Admin | Update offer |
| DELETE | `/offers/:id` | Admin | Delete offer |

---

## 10. Order Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/orders` | Authenticated | List orders (admin: all, client: own) |
| GET | `/orders/:id` | Authenticated | Get order details |
| POST | `/orders` | Authenticated | Create new order |
| PATCH | `/orders/:id/status` | Admin | Update order status |
| DELETE | `/orders/:id` | Authenticated | Cancel order |

**Query Parameters (GET /orders)**:
- `status=pending` - Filter by status

**Order Creation Body**:
```json
{
  "addressId": 1,
  "items": [
    {
      "itemSizeId": 1,
      "quantity": 2,
      "addOns": [
        { "addOnId": 1, "quantity": 1 }
      ]
    }
  ],
  "specialInstructions": "No onions",
  "deliveryCharge": 50,
  "offerCode": "SAVE10"
}
```

---

## 11. Payment Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/payments/initiate` | Authenticated | Initiate UPIGateway payment |
| POST | `/payments/check-status` | Authenticated | Check payment status (polling) |
| GET | `/payments/status/:orderId` | Authenticated | Get payment status |
| POST | `/payments/refund` | Admin | Process refund (manual) |

**Payment Initiate Body**:
```json
{ "orderId": 1 }
```

**Payment Initiate Response**:
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "transactionId": 123,
    "gatewayOrderId": "upi_order_xxx",
    "clientTxnId": "order_1_1234567890",
    "qrCode": "base64_encoded_qr_image",
    "qrString": "upi://pay?...",
    "paymentUrl": "https://upigateway.com/pay/...",
    "amount": 500,
    "currency": "INR"
  }
}
```

**Payment Check Status Body**:
```json
{ "orderId": 1 }
```

**Refund Body**:
```json
{
  "orderId": 1,
  "amount": 500.00,
  "reason": "Customer request"
}
```

---

## 12. Webhook Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/webhooks/upigateway` | Public (Signature Verified) | UPIGateway webhook handler |

**Webhook Payload**:
```json
{
  "client_txn_id": "order_1_1234567890",
  "status": "success",
  "txn_id": "UPI123456789",
  "upi_txn_id": "123456789012",
  "amount": "500.00",
  "customer_vpa": "customer@upi",
  "customer_name": "Customer Name",
  "customer_mobile": "9876543210"
}
```

**Status Values**:
- `success` - Payment completed successfully
- `failed` - Payment failed
- `pending` - Payment is still pending

---

## 13. Notification Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/notifications` | Authenticated | Get user's notifications |
| GET | `/notifications/unread-count` | Authenticated | Get unread count |
| PATCH | `/notifications/:id/read` | Authenticated | Mark as read |
| PATCH | `/notifications/read-all` | Authenticated | Mark all as read |
| DELETE | `/notifications/:id` | Authenticated | Delete notification |

**Query Parameters (GET /notifications)**:
- `page=1` - Page number (default: 1)
- `limit=20` - Items per page (default: 20, max: 100)
- `isRead=true/false/all` - Filter by read status (default: all)
- `orderId=1` - Filter by order ID

---

## 14. Health Check

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/health` | Public | Server health check |

---

## Authentication

All authenticated endpoints require the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

**Token Expiry**: 30 days

---

## Response Format

All API responses follow this format:

**Success Response**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Missing Endpoints (Not Yet Implemented)

1. **POST /auth/refresh** - Token refresh endpoint
2. **GET /transactions** - List all transactions (admin)
3. **GET /transactions/:id** - Get transaction details (admin)
4. **Pictures/Images** - No image upload/management endpoints yet

---

## Notes

1. **Nested Routes**: Item sizes and add-ons use nested routes under their parent resources
2. **Pagination**: Notifications endpoint supports pagination
3. **Filtering**: Most list endpoints support filtering via query parameters
4. **Role-Based Access**: Admin endpoints require `role: 'admin'` in JWT token
5. **Rate Limiting**: All endpoints have rate limiting applied

