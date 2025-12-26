# Restaurant Management System - Theoretical Foundation

## 1. System Overview

### 1.1 Purpose
A monolithic web application to manage restaurant operations for a single restaurant, supporting menu management, order processing, and customer interactions.

### 1.2 Scale & Scope
- **Scale**: Modest - Single restaurant operation
- **Architecture**: Monolithic application
- **Deployment**: Docker-based containerization
- **User Base**: Single admin + multiple clients

### 1.3 Core Principles
- Simplicity over complexity (monolithic approach)
- Clear separation of concerns (admin vs client operations)
- Data integrity and consistency
- Scalable within single-restaurant context

### 1.4 Key Design Decisions
- **Categorization Model**: Categories represent food item types (e.g., Pizza, Noodles) with multiple item versions
- **Size Support**: Flexible sizing (Small, Medium, Large) with different prices per item
- **Add-Ons System**: Reusable add-ons that can be assigned at category or item level with inheritance
- **Authentication**: Phone number + OTP via third-party service, stateless JWT tokens (30-day expiry)
- **Delivery**: Support for multiple user addresses with default selection

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────────────────────────────────┐
│           Client (Browser)                  │
│     (React/Vue/Vanilla JS Frontend)         │
└──────────────────┬──────────────────────────┘
                   │ HTTP/HTTPS
                   │ REST API
┌──────────────────▼──────────────────────────┐
│         Node.js Application                 │
│  ┌─────────────────────────────────────┐   │
│  │  Express.js API Server              │   │
│  │  - Authentication & Authorization   │   │
│  │  - Business Logic Layer             │   │
│  │  - Data Access Layer (ORM)          │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ TCP/IP
                   │ PostgreSQL Protocol
┌──────────────────▼──────────────────────────┐
│         PostgreSQL Database                 │
│  - Relational data storage                  │
│  - ACID compliance                          │
│  - Constraints & validations                │
└─────────────────────────────────────────────┘
```

### 2.2 Technology Stack

**Backend:**
- **Runtime**: Node.js (LTS version)
- **Framework**: Express.js
- **Language**: JavaScript/TypeScript (recommended)
- **ORM**: Sequelize or TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi or express-validator

**Database:**
- **RDBMS**: PostgreSQL 15+
- **Migration Tool**: Sequelize migrations or TypeORM migrations

**DevOps:**
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Environment Management**: dotenv

**Additional Libraries:**
- bcrypt (password hashing)
- cors (Cross-Origin Resource Sharing)
- helmet (security headers)
- morgan (logging)

## 3. User Roles & Permissions

### 3.1 Admin Role
**Characteristics:**
- Single admin user (restaurant owner/manager)
- Pre-seeded in database with phone number
- Full system access
- Cannot be deleted or demoted

**Capabilities:**
- **Menu Management**
  - Create, read, update, delete categories (food item types)
  - Create, read, update, delete items (versions within categories)
  - Manage item sizes (Small, Medium, Large) and pricing
  - Update item/size availability (in-stock/out-of-stock)
  - Manage add-ons catalog
  - Assign add-ons to categories or specific items
- **Order Management**
  - View all orders (pending, confirmed, preparing, ready, completed, cancelled)
  - Update order status through lifecycle
  - Cancel orders at any status
  - View order history and details
- **User Management** (optional future feature)
  - View client accounts
  - Disable/enable client accounts

### 3.2 Client Role
**Characteristics:**
- Multiple client users (customers)
- Self-registration via phone + OTP
- Limited access to own data

**Capabilities:**
- **Account Management**
  - Register via phone number + OTP
  - Login/logout with phone + OTP
  - Update profile information (name)
  - Manage delivery addresses (add, edit, delete, set default)
  - View order history
- **Menu Browsing**
  - View available categories and items
  - View item versions with sizes and pricing
  - View available add-ons (inherited from category + item-specific)
  - Filter/search menu items
- **Order Management**
  - Create new orders with item selection, size, quantity, and add-ons
  - Select delivery address
  - View own orders
  - Cancel own pending orders only
  - Track order status

### 3.3 Public Access (Unauthenticated)
- View menu (categories, items, sizes, add-ons) - read-only
- Initiate registration (send OTP to phone)
- Login page

## 4. Core Features & Functionality

### 4.1 Authentication & Authorization

#### 4.1.1 Phone-OTP Authentication Flow
**Step 1: Send OTP**
- Client sends phone number to `/api/auth/send-otp`
- Server forwards phone to third-party OTP service
- Third-party sends OTP to client's phone via SMS
- Third-party returns secret verification string to server
- Server responds with secret string to client

**Step 2: Verify OTP**
- Client sends phone + OTP + secret to `/api/auth/verify-otp`
- Server forwards all three to third-party service
- Third-party validates and returns HTTP 200 if valid
- Server creates/retrieves user from database
- Server generates JWT token (30-day expiry) with user info
- Server returns access token to client

**Step 3: Token Refresh**
- Client sends current token to `/api/auth/refresh`
- Server validates token and extends expiry by 30 days
- Server returns new access token

#### 4.1.2 Token Management
- **Stateless JWT**: Tokens not stored in database
- **Payload**: userId, phone, role, iat, exp
- **Expiry**: 30 days from issue/refresh
- **Secret**: Strong 256-bit secret key
- **Validation**: Every protected route validates signature and expiry

#### 4.1.3 Role-Based Access Control (RBAC)
- Middleware checks JWT token and user role
- Admin-only routes: Menu management, order status updates
- Client routes: Own orders, own addresses, own profile
- Public routes: Menu browsing, OTP send/verify

### 4.2 Menu Management

#### 4.2.1 Categorization Model
- **Categories**: Food item types (e.g., Pizza, Noodles, Burgers)
  - Each category has name, description, image, availability
  - Categories contain multiple item versions

- **Items**: Specific versions within a category
  - Example: Pizza category → Margherita, Pepperoni, Veggie Supreme items
  - Each item has name, description, image, availability, dietary tags

- **Sizes**: Flexible size options per item
  - Small, Medium, Large (not all items need all sizes)
  - Each size has its own price
  - Size availability can be toggled independently

#### 4.2.2 Add-Ons System
- **Add-Ons Catalog**: Master list of all available add-ons
  - Name, description, price, availability
  - Examples: Extra Cheese, Jalapeños, Bacon, Extra Sauce
  - Single source of truth for add-on data

- **Category-Level Add-Ons**: Available for all items in category
  - Example: Extra Cheese available for all pizzas
  - Inherited by all items in that category

- **Item-Level Add-Ons**: Available for specific items only
  - Example: Extra Pepperoni only for Pepperoni Pizza
  - Supplements (not replaces) category-level add-ons

- **Add-On Pricing**: Same price regardless of item size
- **Add-On Quantities**: Customers can add multiple quantities of same add-on

### 4.3 Order Management

#### 4.3.1 Order Lifecycle
1. **Pending Payment**: Order created, awaiting payment completion
2. **Pending**: Order paid, awaiting admin confirmation
3. **Confirmed**: Admin accepted the order
4. **Preparing**: Food is being prepared
5. **Ready**: Order ready for pickup/delivery
6. **Completed**: Order fulfilled and delivered
7. **Cancelled**: Order cancelled (by admin or client)

#### 4.3.2 Order Details
- **Order Items**:
  - Item selection with specific size
  - Quantity per item
  - Selected add-ons with quantities
  - Snapshots of names and prices at order time
- **Delivery Address**: Selected from user's saved addresses
- **Total Price**: Calculated from base prices + add-ons × quantities
- **Special Instructions**: Optional text field for customer notes
- **Timestamps**: Created and updated times
- **User Information**: Linked to customer account

#### 4.3.3 Price Calculation
```
Order Item Total = (Base Price of Size + Sum of Add-On Prices × Add-On Quantities) × Item Quantity

Order Total = Sum of All Order Item Totals
```

Example:
- 1× Margherita Pizza (Medium: $12) + 2× Extra Cheese ($2 each) = ($12 + $4) × 1 = $16
- 2× Pepperoni Pizza (Large: $18) + 1× Extra Cheese ($2) = ($18 + $2) × 2 = $40
- **Order Total**: $56

### 4.4 Payment Management

#### 4.4.1 Payment Gateway
- **Provider**: Razorpay (RBI-authorized Payment Aggregator)
- **Supported Methods**:
  - UPI (Google Pay, PhonePe, Paytm, BHIM, etc.)
  - Credit/Debit Cards (Visa, Mastercard, RuPay, Amex)
  - Net Banking (all major Indian banks)
  - Wallets (Paytm, PhonePe, Mobikwik, etc.)
- **Currency**: INR (Indian Rupees)
- **Settlement**: T+1 to T+3 business days
- **Transaction Fees**:
  - UPI: 0% (first ₹50 lakh/month), then 2%
  - Cards/Net Banking/Wallets: 2%

#### 4.4.2 Payment Flow (Pay Before Order Confirmation)
```
1. Client creates order
   ↓
2. Order created with status "pending_payment"
   ↓
3. Backend creates Razorpay payment order
   ↓
4. Client receives payment details (order_id, amount, key)
   ↓
5. Client completes payment via Razorpay Checkout
   - UPI: Opens UPI app (GPay, PhonePe, etc.)
   - Card: Enter card details
   - Net Banking: Select bank and login
   - Wallet: Select wallet and authenticate
   ↓
6. Razorpay processes payment
   ↓
7. Client receives payment response (payment_id, signature)
   ↓
8. Client sends verification request to backend
   ↓
9. Backend verifies payment signature
   ↓
10. If valid:
    - Payment status: "completed"
    - Order status: "pending" (awaiting admin confirmation)
    - Transaction record created
    ↓
11. Admin confirms order
    ↓
12. Order status: "confirmed"
```

#### 4.4.3 Payment Status
- **pending**: Payment not initiated or in progress
- **processing**: Payment being processed by gateway
- **completed**: Payment successful and verified
- **failed**: Payment failed or declined
- **refunded**: Payment refunded to customer

#### 4.4.4 Transaction Records
- **Purpose**: Maintain complete audit trail of all payment attempts
- **Storage**: Dedicated `transactions` table
- **Data Captured**:
  - Razorpay order ID and payment ID
  - Payment amount and currency
  - Payment method used (UPI/Card/etc.)
  - Payment status and timestamps
  - Gateway response metadata (JSONB)
  - Error codes and descriptions (if failed)
  - Signature verification status

#### 4.4.5 Refund Management
- **Eligibility**: Orders cancelled before "preparing" status
- **Refund Types**:
  - Full refund: Complete order cancellation
  - Partial refund: Item-level cancellation (future enhancement)
- **Refund Process**:
  1. Admin initiates refund from order details
  2. Backend creates refund request via Razorpay API
  3. Razorpay processes refund
  4. Refund status updated via webhook
  5. Customer receives refund in 5-7 business days
- **Refund Tracking**: Stored in transactions table with status "refunded"

#### 4.4.6 Webhook Integration
- **Purpose**: Real-time payment status updates from Razorpay
- **Events Handled**:
  - `payment.authorized`: Payment authorized (for cards)
  - `payment.captured`: Payment captured successfully
  - `payment.failed`: Payment failed
  - `refund.created`: Refund initiated
  - `refund.processed`: Refund completed
- **Security**: Webhook signature verification using Razorpay secret
- **Idempotency**: Handle duplicate webhook deliveries gracefully

#### 4.4.7 Payment Security
- **PCI DSS Compliance**: Razorpay handles all card data (no PCI scope for us)
- **Signature Verification**: All payment responses verified using HMAC SHA256
- **Webhook Authentication**: Webhook signatures verified before processing
- **API Key Security**: Keys stored in environment variables, never in code
- **Test Mode**: Separate test keys for development/staging
- **Amount Validation**: Server-side price calculation, never trust client

### 4.5 Address Management
- **Multiple Addresses**: Users can save multiple delivery addresses
- **Address Fields**: Label, address lines, city, state, postal code, country, landmark
- **Default Address**: One address marked as default for quick ordering
- **Address Snapshot**: Full address saved with order for historical record

### 4.6 Business Rules

#### 4.6.1 Order Rules
- Clients can only cancel orders in "Pending Payment" or "Pending" status
- Admin can cancel orders at any status (except "Completed")
- Out-of-stock items/sizes cannot be ordered
- Unavailable add-ons cannot be selected
- Prices locked at order time (not affected by menu updates)
- Users can only access/modify their own orders and addresses
- At least one size must be available for an item to be orderable
- Add-ons inherit from category level and supplement with item level
- When setting an address as default, other addresses are automatically unmarked

#### 4.6.2 Payment Rules
- Payment must be completed before order moves to "Pending" status
- Orders in "Pending Payment" status expire after 15 minutes
- Failed payments can be retried up to 3 times
- Refunds only allowed for orders not yet in "Preparing" status
- Refund amount equals the total_price paid by customer
- Multiple payment attempts for same order create separate transaction records
- Payment verification must succeed before order confirmation
- Webhook updates are authoritative for payment status

### 4.7 Notification System

#### 4.7.1 Overview
The notification system provides in-app notifications to keep users informed about order and payment events. Notifications are event-driven, template-based, and support read/unread tracking.

**Key Features:**
- In-app notifications only (no SMS/Email)
- Event-driven automatic triggers
- Template-based for consistency
- 30-day retention policy
- Read/unread tracking
- Order-linked for context

#### 4.7.2 Notification Templates

**Client Notifications (8 templates):**

| Template Code | Title | Trigger Event |
|--------------|-------|---------------|
| `ORDER_CREATED` | "Order Placed Successfully" | After order creation |
| `PAYMENT_COMPLETED` | "Payment Successful" | After payment verification |
| `PAYMENT_FAILED` | "Payment Failed" | Payment webhook failure |
| `ORDER_CONFIRMED` | "Order Confirmed" | Admin confirms order |
| `ORDER_PREPARING` | "Order is Being Prepared" | Admin updates to preparing |
| `ORDER_READY` | "Order Ready for Pickup/Delivery" | Admin updates to ready |
| `ORDER_COMPLETED` | "Order Delivered" | Admin completes order |
| `ORDER_CANCELLED` | "Order Cancelled" | Order cancelled |
| `REFUND_PROCESSED` | "Refund Processed" | Refund completed |

**Admin Notifications (4 templates):**

| Template Code | Title | Trigger Event |
|--------------|-------|---------------|
| `NEW_ORDER` | "New Order Received" | Payment completed (order → pending) |
| `PAYMENT_RECEIVED` | "Payment Received" | Payment verification success |
| `ORDER_CANCELLED_BY_CLIENT` | "Order Cancelled" | Client cancels order |
| `REFUND_REQUESTED` | "Refund Processed" | Refund processed |

#### 4.7.3 Notification Flow Examples

**Example 1: Successful Order Flow**
```
1. Client creates order
   → Notification: ORDER_CREATED (to client)

2. Client completes payment
   → Notification: PAYMENT_COMPLETED (to client)
   → Notification: NEW_ORDER (to admin)

3. Admin confirms order
   → Notification: ORDER_CONFIRMED (to client)

4. Admin marks as preparing
   → Notification: ORDER_PREPARING (to client)

5. Admin marks as ready
   → Notification: ORDER_READY (to client)

6. Admin marks as completed
   → Notification: ORDER_COMPLETED (to client)
```

**Example 2: Payment Failure Flow**
```
1. Client creates order
   → Notification: ORDER_CREATED (to client)

2. Payment fails (webhook)
   → Notification: PAYMENT_FAILED (to client)
```

**Example 3: Order Cancellation Flow**
```
1. Client cancels order
   → Notification: ORDER_CANCELLED (to client)
   → Notification: ORDER_CANCELLED_BY_CLIENT (to admin)
```

#### 4.7.4 Notification Delivery

**Recipients:**
- **Client notifications**: Sent to the user who owns the order (`order.userId`)
- **Admin notifications**: Sent to the admin user account (where `role = 'admin'`)

**Delivery Method:**
- Polling-based: Clients poll `GET /api/notifications` endpoint
- No real-time push (WebSockets reserved for future enhancement)

#### 4.7.5 Notification Management

**Read Tracking:**
- Notifications start as unread (`is_read = false`)
- Users can mark individual notifications as read
- Users can mark all notifications as read
- `read_at` timestamp recorded when marked as read

**Retention Policy:**
- Notifications older than 30 days are automatically deleted
- Cleanup runs periodically (daily cron job or on-demand)
- Applies to both read and unread notifications

**Pagination:**
- Default: 20 notifications per page
- Maximum: 100 notifications per page
- Ordered by creation date (newest first)

#### 4.7.6 Notification Data Structure

Each notification contains:
- **Template**: Enum identifying the notification type
- **Title**: Pre-rendered notification title
- **Message**: Pre-rendered notification message with interpolated variables
- **Data**: JSONB object containing template variables and context
  - `orderId`: Associated order ID
  - `amount`: Payment/refund amount
  - `customerPhone`: Customer phone (for admin notifications)
  - `totalPrice`: Order total
  - Additional context as needed
- **Order Reference**: Optional foreign key to orders table
- **Read Status**: Boolean flag and timestamp

**Example Notification Data:**
```json
{
  "id": 123,
  "userId": 5,
  "template": "PAYMENT_COMPLETED",
  "title": "Payment Successful",
  "message": "Payment of ₹67.98 received for order #42",
  "data": {
    "orderId": 42,
    "amount": 67.98,
    "paymentMethod": "upi"
  },
  "orderId": 42,
  "isRead": false,
  "readAt": null,
  "createdAt": "2025-12-24T10:30:00Z"
}
```

#### 4.7.7 Integration Points

**Services Modified:**
1. **Order Service** (`orderService.js`)
   - `createOrder()` → Create ORDER_CREATED notification
   - `updateOrderStatus()` → Create status-specific notifications
   - `cancelOrder()` → Create ORDER_CANCELLED + ORDER_CANCELLED_BY_CLIENT

2. **Payment Service** (`paymentService.js`)
   - `verifyPayment()` → Create PAYMENT_COMPLETED + NEW_ORDER
   - `processRefund()` → Create REFUND_PROCESSED + REFUND_REQUESTED

3. **Webhook Controller** (`webhookController.js`)
   - `handlePaymentFailed()` → Create PAYMENT_FAILED
   - `handlePaymentCaptured()` → Create PAYMENT_COMPLETED + NEW_ORDER

#### 4.7.8 Notification Rules

**Business Rules:**
- Notifications are informational only (no critical business logic depends on them)
- Failed notification creation should not block the main operation
- Notifications are created asynchronously where possible
- Duplicate notifications for the same event are prevented
- Admin receives notifications for all orders
- Clients only receive notifications for their own orders

**Privacy Rules:**
- Users can only view their own notifications
- Admin can view admin-specific notifications
- Notification data does not expose sensitive payment details (card numbers, etc.)
- Phone numbers in admin notifications are masked for privacy

## 5. Data Models

### 5.1 Core Entities

#### **users**
- id (PK)
- phone (unique, not null)
- role (enum: 'admin', 'client')
- name
- created_at
- updated_at

**Relationships**:
- One user → Many addresses
- One user → Many orders

#### **addresses**
- id (PK)
- user_id (FK → users)
- label (e.g., "Home", "Work")
- address_line1 (not null)
- address_line2
- city (not null)
- state
- postal_code
- country (default: 'India')
- landmark
- is_default (boolean)
- created_at
- updated_at

**Relationships**:
- Many addresses → One user
- One address → Many orders (snapshot saved)

#### **categories**
- id (PK)
- name (not null)
- description
- image_url
- is_available (boolean)
- display_order (integer)
- created_at
- updated_at

**Relationships**:
- One category → Many items
- One category → Many add_ons (via category_add_ons)

#### **items**
- id (PK)
- category_id (FK → categories, CASCADE)
- name (not null)
- description
- image_url
- is_available (boolean)
- dietary_tags (JSONB array)
- display_order (integer)
- created_at
- updated_at

**Relationships**:
- Many items → One category
- One item → Many item_sizes
- One item → Many add_ons (via item_add_ons)

#### **item_sizes**
- id (PK)
- item_id (FK → items, CASCADE)
- size (not null: 'small', 'medium', 'large')
- price (decimal, not null)
- is_available (boolean)
- created_at
- updated_at
- UNIQUE(item_id, size)

**Relationships**:
- Many sizes → One item

#### **add_ons**
- id (PK)
- name (not null)
- description
- price (decimal, not null)
- is_available (boolean)
- created_at
- updated_at

**Purpose**: Master catalog of all add-ons. Single source of truth for add-on data (name, price, description).

**Relationships**:
- One add_on → Many categories (via category_add_ons)
- One add_on → Many items (via item_add_ons)

#### **category_add_ons** (Junction Table)
- id (PK)
- category_id (FK → categories, CASCADE)
- add_on_id (FK → add_ons, CASCADE)
- created_at
- UNIQUE(category_id, add_on_id)

**Purpose**: Links add-ons to categories. Add-ons linked here are inherited by all items in the category.

#### **item_add_ons** (Junction Table)
- id (PK)
- item_id (FK → items, CASCADE)
- add_on_id (FK → add_ons, CASCADE)
- created_at
- UNIQUE(item_id, add_on_id)

**Purpose**: Links add-ons to specific items. These supplement (not replace) category-level add-ons.

#### **orders**
- id (PK)
- user_id (FK → users, SET NULL)
- address_id (FK → addresses, SET NULL)
- status (enum: 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')
- total_price (decimal, not null)
- special_instructions (text)
- delivery_address (text) - snapshot of full address
- created_at
- updated_at

**Relationships**:
- Many orders → One user
- Many orders → One address (reference)
- One order → Many order_items

#### **order_items**
- id (PK)
- order_id (FK → orders, CASCADE)
- item_id (FK → items, SET NULL)
- item_size_id (FK → item_sizes, SET NULL)
- quantity (integer, not null)
- category_name (not null) - snapshot
- item_name (not null) - snapshot
- size (not null) - snapshot
- base_price (decimal, not null) - snapshot
- created_at

**Purpose**: Stores order items with snapshots of data at order time for historical accuracy.

**Relationships**:
- Many order_items → One order
- One order_item → Many order_item_add_ons

#### **order_item_add_ons**
- id (PK)
- order_item_id (FK → order_items, CASCADE)
- add_on_id (FK → add_ons, SET NULL)
- quantity (integer, not null, default: 1)
- add_on_name (not null) - snapshot
- add_on_price (decimal, not null) - snapshot
- created_at

**Purpose**: Stores add-ons selected for each order item with quantities and price snapshots.

**Relationships**:
- Many order_item_add_ons → One order_item

### 5.2 Entity Relationship Summary
```
users (1) ──→ (N) addresses
users (1) ──→ (N) orders

categories (1) ──→ (N) items
categories (N) ──→ (N) add_ons [via category_add_ons]

items (1) ──→ (N) item_sizes
items (N) ──→ (N) add_ons [via item_add_ons]

orders (1) ──→ (N) order_items
order_items (1) ──→ (N) order_item_add_ons
```

## 6. API Design (RESTful)

### 6.1 Authentication Endpoints
```
POST   /api/auth/send-otp          - Send OTP to phone via third-party service
                                     Body: { phone }
                                     Returns: { secret, expiresIn }

POST   /api/auth/verify-otp        - Verify OTP with third-party service
                                     Body: { phone, otp, secret }
                                     Returns: { accessToken, user }

POST   /api/auth/refresh           - Refresh access token (extend 30 days)
                                     Headers: Authorization: Bearer <token>
                                     Returns: { accessToken }

GET    /api/auth/me                - Get current user info
                                     Headers: Authorization: Bearer <token>
                                     Returns: { user }

PUT    /api/auth/profile           - Update profile (name only)
                                     Headers: Authorization: Bearer <token>
                                     Body: { name }
                                     Returns: { user }
```

### 6.2 Category Endpoints
```
GET    /api/categories             - List all categories (public)
                                     Query: ?available=true
                                     Returns: Array of categories

GET    /api/categories/:id         - Get category with items (public)
                                     Returns: Category with nested items

POST   /api/categories             - Create category (admin only)
                                     Body: { name, description, image_url, display_order }
                                     Returns: Created category

PUT    /api/categories/:id         - Update category (admin only)
                                     Body: Same as POST
                                     Returns: Updated category

DELETE /api/categories/:id         - Delete category (admin only)
                                     Returns: Success message
```

### 6.3 Item Endpoints
```
GET    /api/items                  - List items with filters (public)
                                     Query: ?category_id=1&available=true
                                     Returns: Array of items

GET    /api/items/:id              - Get item with sizes & add-ons (public)
                                     Returns: Item with sizes and available add-ons

POST   /api/items                  - Create item (admin only)
                                     Body: { category_id, name, description, image_url, dietary_tags }
                                     Returns: Created item

PUT    /api/items/:id              - Update item (admin only)
                                     Body: Same as POST
                                     Returns: Updated item

DELETE /api/items/:id              - Delete item (admin only)
                                     Returns: Success message
```

### 6.4 Item Size Endpoints
```
POST   /api/items/:id/sizes        - Add size to item (admin only)
                                     Body: { size, price }
                                     Returns: Created size

PUT    /api/items/:id/sizes/:sizeId - Update size (admin only)
                                      Body: { price, is_available }
                                      Returns: Updated size

DELETE /api/items/:id/sizes/:sizeId - Delete size (admin only)
                                      Returns: Success message
```

### 6.5 Add-On Endpoints
```
GET    /api/add-ons                - List all add-ons (public)
                                     Query: ?available=true
                                     Returns: Array of add-ons

POST   /api/add-ons                - Create add-on (admin only)
                                     Body: { name, description, price }
                                     Returns: Created add-on

PUT    /api/add-ons/:id            - Update add-on (admin only)
                                     Body: Same as POST
                                     Returns: Updated add-on

DELETE /api/add-ons/:id            - Delete add-on (admin only)
                                     Returns: Success message

POST   /api/categories/:id/add-ons - Link add-on to category (admin only)
                                     Body: { add_on_id }
                                     Returns: Success message

DELETE /api/categories/:id/add-ons/:addonId - Unlink add-on from category (admin only)
                                              Returns: Success message

POST   /api/items/:id/add-ons      - Link add-on to item (admin only)
                                     Body: { add_on_id }
                                     Returns: Success message

DELETE /api/items/:id/add-ons/:addonId - Unlink add-on from item (admin only)
                                         Returns: Success message
```

### 6.6 Address Endpoints
```
GET    /api/addresses              - List user's addresses (authenticated)
                                     Returns: Array of addresses

GET    /api/addresses/:id          - Get specific address (authenticated, own only)
                                     Returns: Address details

POST   /api/addresses              - Create new address (authenticated)
                                     Body: { label, address_line1, address_line2, city,
                                            state, postal_code, country, landmark, is_default }
                                     Returns: Created address

PUT    /api/addresses/:id          - Update address (authenticated, own only)
                                     Body: Same as POST
                                     Returns: Updated address

DELETE /api/addresses/:id          - Delete address (authenticated, own only)
                                     Returns: Success message

PATCH  /api/addresses/:id/default  - Set as default address (authenticated, own only)
                                     Returns: Updated address
```

### 6.7 Order Endpoints
```
GET    /api/orders                 - List orders (admin: all, client: own)
                                     Query: ?status=pending
                                     Returns: Array of orders

GET    /api/orders/:id             - Get order details (admin: any, client: own)
                                     Returns: Order with items and add-ons

POST   /api/orders                 - Create new order (authenticated)
                                     Body: { address_id, items: [{ item_size_id, quantity,
                                            add_ons: [{ add_on_id, quantity }] }],
                                            special_instructions }
                                     Returns: Created order with status "pending_payment"

PATCH  /api/orders/:id/status      - Update order status (admin only)
                                     Body: { status }
                                     Returns: Updated order

DELETE /api/orders/:id             - Cancel order (admin: any, client: own pending)
                                     Returns: Success message
```

### 6.8 Payment Endpoints
```
POST   /api/orders/:id/payment/initiate
                                   - Create Razorpay payment order (authenticated, order owner only)
                                     Prerequisites: Order must be in "pending_payment" status
                                     Returns: {
                                       orderId: "order_xxx",      // Razorpay order ID
                                       amount: 50000,             // Amount in paise (₹500.00)
                                       currency: "INR",
                                       key: "rzp_test_xxx"        // Razorpay key ID for frontend
                                     }

POST   /api/orders/:id/payment/verify
                                   - Verify payment signature (authenticated, order owner only)
                                     Body: {
                                       razorpay_order_id: "order_xxx",
                                       razorpay_payment_id: "pay_xxx",
                                       razorpay_signature: "signature_xxx"
                                     }
                                     Returns: {
                                       success: true,
                                       order: { ... },            // Updated order with status "pending"
                                       transaction: { ... }       // Transaction record
                                     }

GET    /api/orders/:id/payment/status
                                   - Get payment status (authenticated, order owner or admin)
                                     Returns: {
                                       paymentStatus: "completed",
                                       paymentMethod: "upi",
                                       transactionId: "pay_xxx",
                                       amount: 500.00,
                                       paidAt: "2024-12-24T10:30:00Z"
                                     }

POST   /api/orders/:id/payment/refund
                                   - Initiate refund (admin only)
                                     Prerequisites: Order must not be in "preparing", "ready", or "completed" status
                                     Body: {
                                       amount: 500.00,            // Optional, defaults to full refund
                                       reason: "Customer request" // Optional
                                     }
                                     Returns: {
                                       refundId: "rfnd_xxx",
                                       status: "processing",
                                       amount: 500.00,
                                       estimatedDays: 7
                                     }

GET    /api/transactions           - List all transactions (admin only)
                                     Query: ?status=completed&payment_method=upi
                                     Returns: Array of transactions

GET    /api/transactions/:id       - Get transaction details (admin only)
                                     Returns: Transaction with full metadata
```

### 6.9 Webhook Endpoints
```
POST   /api/webhooks/razorpay      - Razorpay webhook handler (public, signature verified)
                                     Headers: {
                                       "X-Razorpay-Signature": "signature_xxx"
                                     }
                                     Body: Razorpay webhook payload
                                     Events handled:
                                     - payment.authorized
                                     - payment.captured
                                     - payment.failed
                                     - refund.created
                                     - refund.processed
                                     Returns: { received: true }
```

### 6.10 Notification Endpoints
```
GET    /api/notifications          - Get user's notifications (authenticated)
                                     Query: {
                                       page: 1,           // Default: 1
                                       limit: 20,         // Default: 20, Max: 100
                                       isRead: "all",     // "true", "false", "all" (default)
                                       orderId: 42        // Optional: filter by order
                                     }
                                     Returns: {
                                       notifications: [...],
                                       pagination: {
                                         page: 1,
                                         limit: 20,
                                         total: 150,
                                         totalPages: 8
                                       }
                                     }

GET    /api/notifications/unread-count
                                   - Get count of unread notifications (authenticated)
                                     Returns: { count: 5 }

PATCH  /api/notifications/:id/read
                                   - Mark notification as read (authenticated, own only)
                                     Returns: Updated notification

PATCH  /api/notifications/read-all
                                   - Mark all notifications as read (authenticated)
                                     Returns: { updated: 5 }

DELETE /api/notifications/:id      - Delete notification (authenticated, own only)
                                     Returns: Success message
```

### 6.11 Response Format
**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### 6.12 HTTP Status Codes
- 200: Success (GET, PUT, PATCH)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (authenticated but not authorized)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 500: Internal Server Error

## 7. Database Schema Design

### 7.1 Schema Considerations
- **Normalization**: 3NF (Third Normal Form) for data integrity
- **Indexes**: On foreign keys, phone, frequently queried fields
- **Constraints**:
  - NOT NULL for required fields
  - UNIQUE for phone number
  - CHECK constraints for enums and positive values
  - Foreign key constraints with appropriate CASCADE/SET NULL rules
- **Timestamps**: Use PostgreSQL's `TIMESTAMP WITH TIME ZONE`
- **Snapshots**: Order-related tables store snapshots of data for historical accuracy

### 7.2 Complete SQL Schema
```sql
-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE order_status AS ENUM ('pending_payment', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE transaction_status AS ENUM ('created', 'authorized', 'captured', 'failed', 'refunded');
CREATE TYPE notification_template AS ENUM (
    'ORDER_CREATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED',
    'ORDER_CONFIRMED', 'ORDER_PREPARING', 'ORDER_READY',
    'ORDER_COMPLETED', 'ORDER_CANCELLED', 'REFUND_PROCESSED',
    'NEW_ORDER', 'PAYMENT_RECEIVED', 'ORDER_CANCELLED_BY_CLIENT',
    'REFUND_REQUESTED'
);

-- Users table (phone-based auth, no password)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Addresses table
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    landmark VARCHAR(255),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table (food item types: Pizza, Noodles, etc.)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Items table (versions within categories: Margherita, Pepperoni, etc.)
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true,
    dietary_tags JSONB DEFAULT '[]',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Item sizes table (Small, Medium, Large with different prices)
CREATE TABLE item_sizes (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, size)
);

-- Add-ons table (master catalog: Extra Cheese, Jalapeños, etc.)
CREATE TABLE add_ons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Category add-ons junction table (inherited by all items in category)
CREATE TABLE category_add_ons (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    add_on_id INTEGER REFERENCES add_ons(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, add_on_id)
);

-- Item add-ons junction table (supplements category-level add-ons)
CREATE TABLE item_add_ons (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    add_on_id INTEGER REFERENCES add_ons(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, add_on_id)
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
    status order_status NOT NULL DEFAULT 'pending_payment',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),  -- 'upi', 'card', 'netbanking', 'wallet'
    payment_gateway_order_id VARCHAR(255),  -- Razorpay order ID
    payment_gateway_payment_id VARCHAR(255),  -- Razorpay payment ID
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    special_instructions TEXT,
    delivery_address TEXT,  -- Snapshot of full address
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items table (with snapshots for historical accuracy)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    item_size_id INTEGER REFERENCES item_sizes(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    category_name VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    size VARCHAR(20) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order item add-ons table (with quantities and snapshots)
CREATE TABLE order_item_add_ons (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
    add_on_id INTEGER REFERENCES add_ons(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    add_on_name VARCHAR(100) NOT NULL,
    add_on_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table (payment audit trail)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    payment_gateway VARCHAR(50) NOT NULL DEFAULT 'razorpay',
    gateway_order_id VARCHAR(255) NOT NULL,  -- Razorpay order_xxx
    gateway_payment_id VARCHAR(255),  -- Razorpay pay_xxx (null until payment)
    gateway_signature VARCHAR(500),  -- HMAC signature for verification
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status transaction_status NOT NULL DEFAULT 'created',
    payment_method VARCHAR(50),  -- 'upi', 'card', 'netbanking', 'wallet'
    upi_vpa VARCHAR(100),  -- UPI Virtual Payment Address (if UPI)
    card_network VARCHAR(50),  -- 'Visa', 'Mastercard', 'RuPay' (if card)
    card_last4 VARCHAR(4),  -- Last 4 digits of card (if card)
    bank_name VARCHAR(100),  -- Bank name (if netbanking)
    wallet_name VARCHAR(50),  -- Wallet name (if wallet)
    error_code VARCHAR(100),  -- Error code if failed
    error_description TEXT,  -- Error description if failed
    metadata JSONB,  -- Full gateway response for debugging
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template notification_template NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,  -- Template variables and context (orderId, amount, etc.)
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_available ON items(is_available);
CREATE INDEX idx_item_sizes_item ON item_sizes(item_id);
CREATE INDEX idx_category_add_ons_category ON category_add_ons(category_id);
CREATE INDEX idx_category_add_ons_addon ON category_add_ons(add_on_id);
CREATE INDEX idx_item_add_ons_item ON item_add_ons(item_id);
CREATE INDEX idx_item_add_ons_addon ON item_add_ons(add_on_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_payment_gateway_order ON orders(payment_gateway_order_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_item_add_ons_order_item ON order_item_add_ons(order_item_id);
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_transactions_gateway_order ON transactions(gateway_order_id);
CREATE INDEX idx_transactions_gateway_payment ON transactions(gateway_payment_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_order ON notifications(order_id);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_cleanup ON notifications(created_at) WHERE created_at < NOW() - INTERVAL '30 days';
```

### 7.3 Key Design Decisions Explained

#### Why Separate `add_ons` Table?
The `add_ons` table serves as the **master catalog** of all add-ons:
- **Single Source of Truth**: Add-on data (name, price, description) stored once
- **Reusability**: Same add-on can be used across multiple categories and items
- **Centralized Management**: Update price once, applies everywhere
- **Data Integrity**: Prevents inconsistencies (e.g., "Extra Cheese" costing different amounts)

Without it, you'd duplicate add-on data in junction tables, leading to maintenance nightmares.

#### Why Snapshots in Order Tables?
Order-related tables store snapshots of data at order time:
- **Historical Accuracy**: If menu item price changes, old orders show original price
- **Data Integrity**: Orders remain valid even if items/add-ons are deleted
- **Audit Trail**: Complete record of what customer ordered and paid

#### Why Flexible Sizes?
Not all items need all sizes:
- Some items might only have Small and Large
- Others might have all three sizes
- `item_sizes` table allows flexible configuration per item

## 8. Security Considerations

### 8.1 Authentication Security
- **Phone-OTP Flow**:
  - Third-party OTP service handles OTP generation and delivery
  - Secret verification string prevents replay attacks
  - OTP expiry handled by third-party (typically 5-10 minutes)
  - Rate limiting on OTP requests per phone number
- **JWT Security**:
  - Sign with strong secret (256-bit minimum)
  - 30-day expiration (can be refreshed)
  - Include user role in payload for RBAC
  - Validate signature and expiry on every protected route
  - Stateless (not stored in database)
- **No Password Storage**: Phone-based auth eliminates password-related vulnerabilities

### 8.2 Authorization
- **Middleware Pattern**: Role-based middleware for route protection
- **Principle of Least Privilege**: Users only access what they need
- **Resource Ownership**:
  - Clients can only access their own orders and addresses
  - Admin can access all resources
- **Route Protection**:
  - Public: Menu browsing, OTP send/verify
  - Authenticated: Orders, addresses, profile
  - Admin-only: Menu management, order status updates

### 8.3 Input Validation
- **Server-side validation**: Never trust client input
- **Phone Number Validation**: Format validation before forwarding to OTP service
- **SQL Injection Prevention**: Use parameterized queries (ORM handles this)
- **XSS Prevention**: Sanitize user inputs, especially special instructions
- **Price Validation**: Verify prices match database values during order creation
- **Availability Checks**: Ensure items/sizes/add-ons are available before ordering

### 8.4 API Security
- **Rate Limiting**:
  - OTP requests: Max 3 per phone per hour
  - General API: 100 requests per 15 minutes per IP
- **CORS Configuration**: Whitelist allowed origins
- **Helmet.js**: Security headers (XSS, clickjacking, etc.)
- **HTTPS Only**: In production (TLS 1.2+)
- **Request Size Limits**: Prevent large payload attacks

### 8.5 Database Security
- **Least Privilege**: Database user with minimal required permissions
- **Connection Security**: Use environment variables for credentials
- **Backup Strategy**: Regular automated backups
- **Data Snapshots**: Order data preserved even if menu items deleted

### 8.6 Third-Party Service Security

#### 8.6.1 OTP Service (2Factor.in)
- API key stored in environment variables
- HTTPS communication only
- Timeout configuration for requests
- Error handling for service failures
- Phone number validation before API calls

#### 8.6.2 Payment Gateway (Razorpay)
- **API Key Security**:
  - Key ID and Secret stored in environment variables
  - Never expose keys in client-side code
  - Separate test and live keys for different environments
  - Webhook secret for signature verification
- **Payment Verification**:
  - Server-side signature verification using HMAC SHA256
  - Verify: `razorpay_order_id|razorpay_payment_id` with signature
  - Reject any payment without valid signature
- **Webhook Security**:
  - Verify X-Razorpay-Signature header on all webhooks
  - Use webhook secret for HMAC verification
  - Implement idempotency to handle duplicate webhooks
  - Log all webhook events for audit trail
- **Amount Validation**:
  - Always calculate order amount server-side
  - Never trust amount from client
  - Verify payment amount matches order total
- **PCI Compliance**:
  - Razorpay handles all card data (PCI DSS Level 1 compliant)
  - No card data stored or processed on our servers
  - No PCI compliance scope for our application
- **Test Mode**:
  - Use test keys (rzp_test_xxx) for development/staging
  - Use live keys (rzp_live_xxx) only in production
  - Test mode payments don't charge real money

## 9. Docker Architecture

### 9.1 Container Strategy
```
┌─────────────────────────────────────┐
│     Docker Compose Network          │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   app        │  │   db        │ │
│  │  (Node.js)   │──│ (PostgreSQL)│ │
│  │  Port: 3000  │  │ Port: 5432  │ │
│  └──────────────┘  └─────────────┘ │
│         │                           │
└─────────┼───────────────────────────┘
          │
    Host Port: 3000
```

### 9.2 Docker Compose Services
- **app**: Node.js application container
  - Build from Dockerfile
  - Depends on db service
  - Environment variables for configuration
  - Volume mount for development (hot reload)

- **db**: PostgreSQL container
  - Official PostgreSQL image
  - Persistent volume for data
  - Initialization scripts for schema
  - Health checks

### 9.3 Environment Variables
```
# Application
NODE_ENV=development|production
PORT=3000

# JWT Configuration
JWT_SECRET=<strong-random-secret-256-bits>
JWT_EXPIRES_IN=30d

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=restaurant_db
DB_USER=restaurant_user
DB_PASSWORD=<strong-password>

# Third-Party OTP Service (2Factor.in)
OTP_SERVICE_URL=https://2factor.in/API/V1
OTP_SERVICE_API_KEY=<your-2factor-api-key>
OTP_SERVICE_TIMEOUT=10000
USE_MOCK_OTP=false

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
PAYMENT_CURRENCY=INR
PAYMENT_ENABLED=true
PAYMENT_ORDER_EXPIRY=900  # 15 minutes in seconds

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Admin Configuration
ADMIN_PHONE=+1234567890
```

## 10. Development Workflow

### 10.1 Project Structure
```
restaurant/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── DESIGN.md
├── app/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── otpService.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Address.js
│   │   │   ├── Category.js
│   │   │   ├── Item.js
│   │   │   ├── ItemSize.js
│   │   │   ├── AddOn.js
│   │   │   ├── CategoryAddOn.js
│   │   │   ├── ItemAddOn.js
│   │   │   ├── Order.js
│   │   │   ├── OrderItem.js
│   │   │   └── OrderItemAddOn.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── addressController.js
│   │   │   ├── categoryController.js
│   │   │   ├── itemController.js
│   │   │   ├── addOnController.js
│   │   │   └── orderController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── roleCheck.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validation.js
│   │   │   └── rateLimiter.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── addresses.js
│   │   │   ├── categories.js
│   │   │   ├── items.js
│   │   │   ├── addOns.js
│   │   │   └── orders.js
│   │   ├── services/
│   │   │   ├── otpService.js
│   │   │   └── priceCalculator.js
│   │   └── utils/
│   │       ├── logger.js
│   │       ├── responseFormatter.js
│   │       └── phoneValidator.js
│   └── tests/
└── db/
    └── init/
        └── 01-schema.sql
```

### 10.2 Development Steps (Future Implementation)

#### Phase 1: Setup & Infrastructure
1. **Project Initialization**
   - Initialize Node.js project with npm/yarn
   - Setup TypeScript (optional but recommended)
   - Configure ESLint and Prettier
   - Create Docker and Docker Compose configuration

2. **Database Setup**
   - Create PostgreSQL initialization script (schema)
   - Setup ORM (Sequelize or TypeORM)
   - Create database models for all 11 tables
   - Setup migrations

3. **Environment Configuration**
   - Create .env.example template
   - Configure environment variables
   - Setup third-party OTP service credentials

#### Phase 2: Authentication & Authorization
1. **OTP Integration**
   - Integrate third-party OTP service
   - Implement send-otp endpoint
   - Implement verify-otp endpoint
   - Handle OTP service errors gracefully

2. **JWT Implementation**
   - Setup JWT signing and verification
   - Create auth middleware
   - Implement token refresh endpoint
   - Create role-based access control middleware

3. **User Management**
   - Seed admin user in database
   - Implement profile update endpoint

#### Phase 3: Menu Management (Admin Features)
1. **Categories**
   - CRUD endpoints for categories
   - Display order management
   - Availability toggle

2. **Items**
   - CRUD endpoints for items
   - Link items to categories
   - Dietary tags management

3. **Item Sizes**
   - Add/update/delete sizes for items
   - Price management per size
   - Availability toggle per size

4. **Add-Ons System**
   - CRUD endpoints for add-ons catalog
   - Link add-ons to categories
   - Link add-ons to items
   - Implement inheritance logic (category + item add-ons)

#### Phase 4: Customer Features
1. **Address Management**
   - CRUD endpoints for addresses
   - Default address logic
   - Address validation

2. **Menu Browsing**
   - Public endpoints for categories and items
   - Include sizes and available add-ons in responses
   - Filter by availability

3. **Order Creation**
   - Order creation with items, sizes, add-ons
   - Price calculation and validation
   - Address selection
   - Create order snapshots

4. **Order Management**
   - View own orders (clients)
   - View all orders (admin)
   - Order status updates (admin)
   - Order cancellation (with rules)

#### Phase 5: Testing & Validation
1. **Unit Tests**
   - Test business logic (price calculation, add-on inheritance)
   - Test utility functions
   - Test middleware

2. **Integration Tests**
   - Test API endpoints
   - Test authentication flow
   - Test authorization rules
   - Test order creation flow

3. **Manual Testing**
   - Postman/Insomnia collection
   - Test all user flows
   - Test edge cases

#### Phase 6: Production Readiness
1. **Security Hardening**
   - Implement rate limiting
   - Configure CORS properly
   - Add Helmet.js
   - Review all input validation

2. **Performance Optimization**
   - Add database indexes
   - Optimize queries
   - Add caching if needed

3. **Monitoring & Logging**
   - Setup structured logging
   - Error tracking
   - Performance monitoring

4. **Documentation**
   - API documentation (Swagger/OpenAPI)
   - Deployment guide
   - Environment setup guide

## 11. Success Criteria

### 11.1 Functional Requirements
- ✓ Admin can manage menu (categories, items, sizes, add-ons)
- ✓ Admin can assign add-ons to categories and items
- ✓ Admin can view and update all orders
- ✓ Admin can initiate refunds for cancelled orders
- ✓ Clients can register and login via phone + OTP
- ✓ Clients can manage multiple delivery addresses
- ✓ Clients can browse menu with sizes and add-ons
- ✓ Clients can place orders with size selection and add-ons
- ✓ Clients can complete payment via UPI/Cards/Net Banking/Wallets
- ✓ Clients can view their order history and payment status
- ✓ Proper role-based access control
- ✓ Add-ons inherit from category to items
- ✓ Order prices locked at order time (snapshots)
- ✓ Payment verification before order confirmation
- ✓ Complete payment audit trail in transactions table

### 11.2 Non-Functional Requirements
- **Performance**: API response time < 200ms for most operations
- **Security**:
  - No critical vulnerabilities (OWASP Top 10)
  - Secure phone-OTP authentication
  - Stateless JWT tokens
  - Rate limiting on sensitive endpoints
  - Payment signature verification (HMAC SHA256)
  - Webhook signature verification
  - PCI compliance via Razorpay (no card data on our servers)
- **Reliability**:
  - Database ACID compliance
  - Data snapshots for historical accuracy
  - Graceful handling of third-party service failures
  - Payment webhook idempotency
  - Complete transaction audit trail
- **Maintainability**:
  - Clean code with proper separation of concerns
  - Comprehensive documentation
  - Normalized database schema (3NF)
- **Scalability**: Handle 100+ concurrent users (modest scale)

## 12. Future Enhancements (Out of Scope)

### Phase 2 Features
- Real-time order updates (WebSockets)
- Push notifications for order status changes
- Order scheduling (pre-orders)
- Delivery time estimation
- Order rating and feedback
- Email notifications for order updates
- SMS notifications for order status changes

### Phase 3 Features
- Delivery tracking with GPS
- Customer reviews and ratings for items
- Loyalty program and rewards
- Discount codes and promotions (coupons)
- Partial refunds for item-level cancellations
- Saved payment methods (cards, UPI IDs)
- Auto-refund on order cancellation

### Advanced Features
- Analytics dashboard for admin
- Sales reports and insights
- Payment analytics (revenue, payment methods breakdown)
- Inventory management
- Multi-restaurant support
- Mobile app (iOS/Android)
- Multi-language support
- Dark mode
- Export orders and transactions to CSV/Excel

---

## Summary

This design document establishes a comprehensive theoretical foundation for a restaurant management system with:

### Key Design Decisions
1. **Categorization Model**: Categories as food types (Pizza, Noodles) with item versions (Margherita, Pepperoni)
2. **Flexible Sizing**: Items can have any combination of Small, Medium, Large sizes
3. **Add-Ons System**: Master catalog with category-level and item-level assignments with inheritance
4. **Phone-OTP Authentication**: 2Factor.in OTP service with stateless JWT tokens (30-day expiry)
5. **Payment Integration**: Razorpay with UPI/Cards/Net Banking/Wallets support
6. **Pay Before Confirmation**: Orders require payment before admin confirmation
7. **Address Management**: Multiple addresses per user with default selection
8. **Data Snapshots**: Order data preserved for historical accuracy
9. **Transaction Audit Trail**: Complete payment history in dedicated transactions table

### Architecture Highlights
- **Monolithic Application**: Simple, maintainable, suitable for modest scale
- **Docker-Based**: Two containers (Node.js app + PostgreSQL database)
- **RESTful API**: Clear, consistent endpoint design
- **12 Database Tables**: Normalized schema with proper relationships (including transactions)
- **Security First**: Phone-OTP, JWT, payment signature verification, webhook authentication
- **Third-Party Integrations**: 2Factor.in (OTP), Razorpay (Payments)

### What Makes This Design Robust
- **Single Source of Truth**: Add-ons catalog prevents data duplication
- **Historical Accuracy**: Order snapshots preserve data even if menu changes
- **Flexibility**: Sizes and add-ons configurable per item
- **Inheritance**: Add-ons flow from category to items
- **Scalability**: Clean architecture allows future enhancements

The system prioritizes **simplicity**, **maintainability**, and **data integrity** while providing all essential features for single-restaurant operations.


