# Frontend Design Document

**Project**: Restaurant Management System - Mobile & Web Apps  
**Framework**: React Native + Expo  
**Target Platforms**: Android, iOS, Web  
**Last Updated**: 2025-12-24

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [App Structure](#4-app-structure)
5. [Client App Design](#5-client-app-design)
6. [Admin App Design](#6-admin-app-design)
7. [Shared Components](#7-shared-components)
8. [State Management](#8-state-management)
9. [API Integration](#9-api-integration)
10. [Design System](#10-design-system)
11. [Implementation Plan](#11-implementation-plan)

---

## 1. Overview

### 1.1 Purpose

Build **two separate mobile/web applications**:
1. **Client App** - For customers to browse menu, place orders, track orders
2. **Admin App** - For restaurant staff to manage menu, orders, and operations

### 1.2 Key Requirements

- **Cross-platform**: Single codebase for Android, iOS, and Web
- **Mobile-first**: Optimized for mobile phones
- **Offline-capable**: Basic browsing without internet
- **Real-time updates**: Order status updates via polling
- **Responsive**: Works on different screen sizes
- **Accessible**: WCAG 2.1 AA compliance

### 1.3 Design Inspiration

Based on modern food delivery apps with:
- Clean, minimal interface
- Card-based layouts
- Bottom tab navigation
- Smooth animations
- Appetizing color palette

---

## 2. Architecture

### 2.1 Project Structure

```
restaurant-frontend/
├── client-app/              # Client mobile/web app
│   ├── app/                # Expo Router (file-based routing)
│   ├── components/         # Reusable components
│   ├── services/           # API integration
│   ├── store/              # State management
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utilities
│   ├── config/             # Configuration
│   └── assets/             # Images, fonts
│
├── admin-app/              # Admin mobile/web app
│   ├── app/                # Expo Router
│   ├── components/         # Admin-specific components
│   ├── services/           # API integration
│   ├── store/              # State management
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utilities
│   ├── config/             # Configuration
│   └── assets/             # Images, fonts
│
└── shared/                 # Shared code between apps (optional)
    ├── components/         # Shared UI components
    ├── utils/              # Shared utilities
    └── types/              # Shared TypeScript types (if using TS)
```

### 2.2 Why Two Separate Apps?

**Advantages**:
- ✅ **Clear separation of concerns** - Different user flows
- ✅ **Smaller bundle size** - Each app only includes what it needs
- ✅ **Independent deployment** - Update client/admin separately
- ✅ **Different navigation patterns** - Client uses tabs, Admin uses drawer
- ✅ **Security** - Admin features not exposed in client app
- ✅ **App store optimization** - Different keywords, descriptions

**Disadvantages**:
- ⚠️ **Code duplication** - Some components/logic duplicated
- ⚠️ **Maintenance overhead** - Two codebases to maintain

**Mitigation**: Use a `shared/` folder for common components and utilities

---

## 3. Tech Stack

### 3.1 Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.76.x | Cross-platform mobile framework |
| Expo | ~52.0.0 | Development platform & tooling |
| Expo Router | ~4.0.0 | File-based navigation |
| JavaScript | ES2022 | Programming language |

### 3.2 UI & Styling

| Technology | Purpose |
|------------|---------|
| NativeWind | Tailwind CSS for React Native |
| Tailwind CSS | Utility-first CSS framework |
| React Native SVG | SVG support |
| Expo Vector Icons | Icon library (@expo/vector-icons) |

### 3.3 State Management

| Technology | Purpose |
|------------|---------|
| Zustand | Lightweight global state (auth, cart) |
| TanStack Query (React Query) | Server state management & caching |
| React Context | Component-level state |

### 3.4 API & Data

| Technology | Purpose |
|------------|---------|
| Axios | HTTP client |
| TanStack Query | API caching, refetching, optimistic updates |
| AsyncStorage | Local storage |
| Expo SecureStore | Secure token storage |

### 3.5 Forms & Validation

| Technology | Purpose |
|------------|---------|
| React Hook Form | Form state management |
| Zod | Schema validation |

### 3.6 Additional Libraries

| Technology | Purpose |
|------------|---------|
| date-fns | Date formatting |
| react-native-safe-area-context | Safe area handling |
| react-native-screens | Native screen optimization |
| expo-image | Optimized image component |
| expo-constants | App constants |

---

## 4. App Structure

### 4.1 Client App Structure

```
client-app/
├── app/
│   ├── (auth)/                    # Auth group (no tabs)
│   │   ├── _layout.js            # Auth layout
│   │   ├── welcome.js            # Welcome/onboarding
│   │   └── login.js              # Phone + OTP login
│   │
│   ├── (tabs)/                    # Main app (bottom tabs)
│   │   ├── _layout.js            # Tab layout with bottom navigation
│   │   ├── index.js              # Home tab
│   │   ├── menu.js               # Menu tab
│   │   ├── cart.js               # Cart tab
│   │   ├── orders.js             # Orders tab
│   │   └── profile.js            # Profile tab
│   │
│   ├── category/[id].js          # Category detail screen
│   ├── item/[id].js              # Item detail screen
│   ├── checkout.js               # Checkout screen
│   ├── order/[id].js             # Order detail screen
│   ├── addresses/
│   │   ├── index.js              # Address list
│   │   ├── add.js                # Add address
│   │   └── edit/[id].js          # Edit address
│   ├── notifications.js          # Notifications screen
│   ├── payment-success.js        # Payment success
│   ├── payment-failed.js         # Payment failed
│   │
│   ├── _layout.js                # Root layout
│   └── +not-found.js             # 404 screen
│
├── components/
│   ├── ui/                       # Base UI components
│   ├── menu/                     # Menu-specific components
│   ├── cart/                     # Cart components
│   ├── order/                    # Order components
│   └── common/                   # Common components
│
├── services/
│   ├── api.js                    # Axios instance
│   ├── auth.js                   # Auth API
│   ├── menu.js                   # Menu API
│   ├── cart.js                   # Cart logic
│   ├── orders.js                 # Orders API
│   ├── payments.js               # Payments API
│   ├── addresses.js              # Addresses API
│   └── notifications.js          # Notifications API
│
├── store/
│   ├── authStore.js              # Auth state
│   ├── cartStore.js              # Cart state
│   └── appStore.js               # App state
│
├── hooks/
│   ├── useAuth.js                # Auth hook
│   ├── useCart.js                # Cart hook
│   ├── useMenu.js                # Menu data (React Query)
│   ├── useOrders.js              # Orders (React Query)
│   └── useDebounce.js            # Debounce hook
│
├── utils/
│   ├── formatters.js             # Price, date formatters
│   ├── validators.js             # Input validation
│   ├── storage.js                # AsyncStorage wrapper
│   └── constants.js              # App constants
│
├── config/
│   ├── colors.js                 # Color palette
│   ├── api.config.js             # API endpoints
│   └── razorpay.config.js        # Razorpay config
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── tailwind.config.js
├── app.json
├── package.json
└── babel.config.js
```

### 4.2 Admin App Structure

```
admin-app/
├── app/
│   ├── (auth)/                    # Auth group
│   │   ├── _layout.js            # Auth layout
│   │   └── login.js              # Admin login
│   │
│   ├── (drawer)/                  # Main app (drawer navigation)
│   │   ├── _layout.js            # Drawer layout
│   │   ├── index.js              # Dashboard
│   │   ├── orders/
│   │   │   ├── index.js          # Orders list
│   │   │   └── [id].js           # Order detail
│   │   ├── menu/
│   │   │   ├── categories.js    # Categories management
│   │   │   ├── items.js         # Items management
│   │   │   ├── sizes.js         # Sizes management
│   │   │   └── addons.js        # Add-ons management
│   │   ├── offers.js             # Offers management
│   │   ├── transactions.js       # Transactions list
│   │   └── notifications.js      # Notifications
│   │
│   ├── category/
│   │   ├── add.js                # Add category
│   │   └── edit/[id].js          # Edit category
│   ├── item/
│   │   ├── add.js                # Add item
│   │   └── edit/[id].js          # Edit item
│   ├── addon/
│   │   ├── add.js                # Add add-on
│   │   └── edit/[id].js          # Edit add-on
│   ├── offer/
│   │   ├── add.js                # Add offer
│   │   └── edit/[id].js          # Edit offer
│   │
│   ├── _layout.js                # Root layout
│   └── +not-found.js             # 404 screen
│
├── components/
│   ├── ui/                       # Base UI components
│   ├── dashboard/                # Dashboard widgets
│   ├── orders/                   # Order management components
│   ├── menu/                     # Menu management components
│   └── common/                   # Common components
│
├── services/                     # Same as client app
├── store/                        # Admin-specific stores
├── hooks/                        # Admin-specific hooks
├── utils/                        # Shared utilities
├── config/                       # Configuration
└── assets/                       # Images, fonts
```

---

## 5. Client App Design

### 5.1 Screen Breakdown

#### **Authentication Flow (2 screens)**

**1. Welcome Screen** (`app/(auth)/welcome.js`)
- App logo and tagline
- "Get Started" button
- "Skip" option (if guest browsing enabled)
- Onboarding slides (optional)

**2. Login Screen** (`app/(auth)/login.js`)
- Phone number input (+91 prefix for India)
- "Send OTP" button
- OTP input (6 digits)
- "Verify OTP" button
- Auto-navigation on successful login

---

#### **Main App - Bottom Tabs (5 tabs)**

**Tab 1: Home** (`app/(tabs)/index.js`)

**Purpose**: Quick access to featured items and categories

**Components**:
- Header with app logo and notification bell
- Search bar (navigates to menu tab with search active)
- Category chips (horizontal scroll)
- Featured items section
- Popular items section
- Special offers banner (if available)

**API Calls**:
- `GET /api/categories?available=true`
- `GET /api/items?available=true` (featured/popular)
- `GET /api/offers` (active offers)

**State**:
- Categories list
- Featured items
- Loading states

---

**Tab 2: Menu** (`app/(tabs)/menu.js`)

**Purpose**: Browse all menu items by category

**Components**:
- Search bar (with debounce)
- Category filter tabs/chips
- Item grid/list
- Filter/sort options (price, popularity)
- Empty state (no items found)

**API Calls**:
- `GET /api/categories`
- `GET /api/items?categoryId=X&available=true`

**Navigation**:
- Tap item → Navigate to Item Detail screen
- Tap category → Filter items by category

---

**Tab 3: Cart** (`app/(tabs)/cart.js`)

**Purpose**: Review and modify cart before checkout

**Components**:
- Cart items list (editable quantities)
- Item customization summary (size, add-ons)
- Remove item button
- Delivery charge display
- Offer code input (optional)
- Price breakdown (subtotal, delivery, discount, total)
- "Proceed to Checkout" button (sticky bottom)
- Empty cart state

**State** (Zustand):
- Cart items array
- Total price calculation
- Applied offer

**Navigation**:
- "Proceed to Checkout" → Navigate to Checkout screen

---

**Tab 4: Orders** (`app/(tabs)/orders.js`)

**Purpose**: View order history and track current orders

**Components**:
- Filter chips (All, Pending, Completed, Cancelled)
- Order cards (status, date, total, items preview)
- Pull to refresh
- Empty state (no orders)

**API Calls**:
- `GET /api/orders?status=X`

**Navigation**:
- Tap order → Navigate to Order Detail screen

---

**Tab 5: Profile** (`app/(tabs)/profile.js`)

**Purpose**: User account and settings

**Components**:
- User info (phone, name)
- Edit profile button
- Menu items:
  - Manage Addresses
  - Notifications
  - Order History
  - Help & Support
  - About
  - Logout
- App version

**API Calls**:
- `GET /api/auth/me`

**Navigation**:
- Manage Addresses → Navigate to Addresses screen
- Notifications → Navigate to Notifications screen
- Logout → Clear auth state, navigate to Login

---

#### **Additional Screens**

**Category Detail** (`app/category/[id].js`)

**Purpose**: View all items in a category

**Components**:
- Category header (image, name, description)
- Items grid
- Back button

**API Calls**:
- `GET /api/categories/:id`

---

**Item Detail** (`app/item/[id].js`)

**Purpose**: View item details and customize order

**Components**:
- Item image gallery (if multiple images)
- Item name and description
- Dietary tags (veg/non-veg icons)
- Size selector (radio buttons)
- Add-ons selector (checkboxes with quantity)
- Price calculation (live update)
- Quantity selector (+/- buttons)
- Special instructions input (optional)
- "Add to Cart" button (sticky bottom)

**API Calls**:
- `GET /api/items/:id` (includes sizes and add-ons)

**State**:
- Selected size
- Selected add-ons with quantities
- Item quantity
- Calculated price

**Logic**:
```javascript
totalPrice = (sizePrice + sum(addonPrice * addonQty)) * itemQty
```

---

**Checkout** (`app/checkout.js`)

**Purpose**: Finalize order and initiate payment

**Components**:
- Delivery address selector
- "Add New Address" button
- Order summary (collapsed/expandable)
- Special instructions input
- Price breakdown
- "Place Order & Pay" button

**API Calls**:
- `GET /api/addresses`
- `POST /api/orders` (creates order with status "pending_payment")
- `POST /api/payments/initiate` (creates Razorpay order)

**Flow**:
1. User selects address
2. User taps "Place Order & Pay"
3. Create order → Get order ID
4. Initiate payment → Get Razorpay order ID
5. Open Razorpay checkout (WebView or SDK)
6. User completes payment
7. Verify payment → Navigate to success/failure screen

---

**Order Detail** (`app/order/[id].js`)

**Purpose**: View order details and track status

**Components**:
- Order status timeline (visual progress)
- Order items list (with customizations)
- Delivery address
- Payment details (method, amount, status)
- Order total breakdown
- Special instructions
- "Reorder" button (for completed orders)
- "Cancel Order" button (if eligible)
- "Get Help" button

**API Calls**:
- `GET /api/orders/:id`
- `DELETE /api/orders/:id` (cancel order)

**Status Timeline**:
```
Pending Payment → Pending → Confirmed → Preparing → Ready → Completed
                                                    ↓
                                                Cancelled
```

---

**Addresses Management** (`app/addresses/index.js`)

**Purpose**: Manage delivery addresses

**Components**:
- Address cards (with default badge)
- "Add New Address" button
- Edit/Delete buttons per address
- Set as default option

**API Calls**:
- `GET /api/addresses`
- `DELETE /api/addresses/:id`
- `PATCH /api/addresses/:id/default`

---

**Add/Edit Address** (`app/addresses/add.js`, `app/addresses/edit/[id].js`)

**Purpose**: Add or edit delivery address

**Components**:
- Form fields:
  - Label (Home, Work, Other)
  - Address Line 1
  - Address Line 2 (optional)
  - City
  - State
  - Postal Code
  - Country (default: India)
  - Landmark (optional)
  - Set as default (checkbox)
- "Save Address" button

**API Calls**:
- `POST /api/addresses` (add)
- `PUT /api/addresses/:id` (edit)

**Validation** (Zod):
- All required fields present
- Postal code format (6 digits for India)
- Phone number format (if added later)

---

**Notifications** (`app/notifications.js`)

**Purpose**: View in-app notifications

**Components**:
- Notification list (grouped by date)
- Unread badge
- Mark as read (tap notification)
- Delete notification (swipe)
- Empty state

**API Calls**:
- `GET /api/notifications?page=1&limit=20`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/:id/read`
- `DELETE /api/notifications/:id`

**Polling**:
- Poll unread count every 30 seconds when app is active
- Refresh list on pull-to-refresh

---

**Payment Success** (`app/payment-success.js`)

**Purpose**: Confirm successful payment

**Components**:
- Success icon/animation
- Order number
- "View Order" button
- "Continue Shopping" button

---

**Payment Failed** (`app/payment-failed.js`)

**Purpose**: Handle payment failure

**Components**:
- Error icon
- Error message
- "Retry Payment" button
- "Cancel Order" button

---

### 5.2 Client App Navigation Flow

```
Welcome → Login → Home (Tab Navigator)
                    ├── Home Tab
                    │   ├── Category Detail
                    │   └── Item Detail → Cart Tab
                    ├── Menu Tab
                    │   └── Item Detail → Cart Tab
                    ├── Cart Tab
                    │   └── Checkout → Payment → Success/Failed
                    │       └── Order Detail
                    ├── Orders Tab
                    │   └── Order Detail
                    └── Profile Tab
                        ├── Addresses → Add/Edit Address
                        └── Notifications
```

---

## 6. Admin App Design

### 6.1 Screen Breakdown

#### **Authentication**

**Admin Login** (`app/(auth)/login.js`)
- Same as client login (phone + OTP)
- Only admin phone number can access
- Redirect to dashboard on success

---

#### **Main App - Drawer Navigation**

**Dashboard** (`app/(drawer)/index.js`)

**Purpose**: Overview of restaurant operations

**Components**:
- Stats cards:
  - Today's Orders (count)
  - Pending Orders (count)
  - Today's Revenue (₹)
  - Total Items (count)
- Recent orders list (last 10)
- Quick actions:
  - View All Orders
  - Manage Menu
  - View Transactions

**API Calls**:
- `GET /api/orders?status=pending`
- `GET /api/orders` (today's orders)
- Custom endpoint for stats (or calculate client-side)

---

**Orders Management** (`app/(drawer)/orders/index.js`)

**Purpose**: View and manage all orders

**Components**:
- Filter tabs (All, Pending, Confirmed, Preparing, Ready, Completed, Cancelled)
- Order cards with:
  - Order ID
  - Customer phone
  - Items summary
  - Total amount
  - Status badge
  - Time since order
- Tap to view details

**API Calls**:
- `GET /api/orders?status=X`

**Navigation**:
- Tap order → Order Detail

---

**Order Detail** (`app/(drawer)/orders/[id].js`)

**Purpose**: View order details and update status

**Components**:
- Customer info (phone)
- Order items list (with customizations)
- Delivery address
- Payment status
- Order total
- Status update buttons:
  - Confirm Order (pending → confirmed)
  - Start Preparing (confirmed → preparing)
  - Mark Ready (preparing → ready)
  - Mark Completed (ready → completed)
  - Cancel Order (any → cancelled)
- Refund button (if payment completed and order cancelled)

**API Calls**:
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `POST /api/payments/refund`

**Status Transitions**:
```
pending → confirmed → preparing → ready → completed
   ↓          ↓           ↓         ↓
cancelled  cancelled  cancelled  cancelled
```

---

**Menu Management**

**Categories** (`app/(drawer)/menu/categories.js`)

**Purpose**: Manage food categories

**Components**:
- Category list (with image, name, item count)
- "Add Category" button
- Edit/Delete buttons per category
- Toggle availability switch

**API Calls**:
- `GET /api/categories`
- `DELETE /api/categories/:id`

**Navigation**:
- Add → Category Add screen
- Edit → Category Edit screen

---

**Items** (`app/(drawer)/menu/items.js`)

**Purpose**: Manage menu items

**Components**:
- Category filter
- Item list (with image, name, category, sizes)
- "Add Item" button
- Edit/Delete buttons per item
- Toggle availability switch

**API Calls**:
- `GET /api/items`
- `DELETE /api/items/:id`

**Navigation**:
- Add → Item Add screen
- Edit → Item Edit screen

---

**Sizes** (`app/(drawer)/menu/sizes.js`)

**Purpose**: Manage item sizes

**Components**:
- Item selector
- Size list for selected item
- "Add Size" button
- Edit/Delete buttons per size
- Toggle availability switch

**API Calls**:
- `GET /api/items/:id` (to get sizes)
- `POST /api/items/:id/sizes`
- `PUT /api/items/:id/sizes/:sizeId`
- `DELETE /api/items/:id/sizes/:sizeId`

---

**Add-Ons** (`app/(drawer)/menu/addons.js`)

**Purpose**: Manage add-ons and their associations

**Components**:
- Add-ons list (with name, price)
- "Add Add-On" button
- Edit/Delete buttons per add-on
- Category associations (which categories use this add-on)
- Item associations (which items use this add-on)

**API Calls**:
- `GET /api/add-ons`
- `POST /api/add-ons`
- `PUT /api/add-ons/:id`
- `DELETE /api/add-ons/:id`
- `POST /api/categories/:id/add-ons`
- `POST /api/items/:id/add-ons`

---

**Offers Management** (`app/(drawer)/offers.js`)

**Purpose**: Manage discount offers

**Components**:
- Offers list (with code, discount, validity)
- "Add Offer" button
- Edit/Delete buttons per offer
- Toggle active status

**API Calls**:
- `GET /api/offers`
- `POST /api/offers`
- `PUT /api/offers/:id`
- `DELETE /api/offers/:id`

---

**Transactions** (`app/(drawer)/transactions.js`)

**Purpose**: View payment transactions (when implemented)

**Components**:
- Transaction list (date, order ID, amount, status, method)
- Filter by status/method
- Export to CSV (future)

**API Calls**:
- `GET /api/transactions` (NOT YET IMPLEMENTED)

---

**Notifications** (`app/(drawer)/notifications.js`)

**Purpose**: View admin notifications

**Components**:
- Same as client notifications
- Admin-specific notifications (new orders, cancellations, refunds)

**API Calls**:
- `GET /api/notifications`

---

#### **CRUD Screens**

**Add/Edit Category** (`app/category/add.js`, `app/category/edit/[id].js`)

**Form Fields**:
- Name
- Description
- Image URL (text input for now, file upload later)
- Display Order
- Is Available (toggle)

**API Calls**:
- `POST /api/categories`
- `PUT /api/categories/:id`

---

**Add/Edit Item** (`app/item/add.js`, `app/item/edit/[id].js`)

**Form Fields**:
- Category (dropdown)
- Name
- Description
- Image URL
- Dietary Tags (veg/non-veg/vegan checkboxes)
- Is Available (toggle)

**API Calls**:
- `POST /api/items`
- `PUT /api/items/:id`

---

**Add/Edit Add-On** (`app/addon/add.js`, `app/addon/edit/[id].js`)

**Form Fields**:
- Name
- Description
- Price
- Is Available (toggle)

**API Calls**:
- `POST /api/add-ons`
- `PUT /api/add-ons/:id`

---

**Add/Edit Offer** (`app/offer/add.js`, `app/offer/edit/[id].js`)

**Form Fields**:
- Code
- Description
- Discount Type (percentage/fixed)
- Discount Value
- Min Order Value
- Max Discount (for percentage)
- Valid From
- Valid Until
- Usage Limit
- Is Active (toggle)

**API Calls**:
- `POST /api/offers`
- `PUT /api/offers/:id`

---

### 6.2 Admin App Navigation Flow

```
Admin Login → Dashboard (Drawer Navigator)
                ├── Dashboard
                ├── Orders → Order Detail
                ├── Menu
                │   ├── Categories → Add/Edit Category
                │   ├── Items → Add/Edit Item
                │   ├── Sizes
                │   └── Add-Ons → Add/Edit Add-On
                ├── Offers → Add/Edit Offer
                ├── Transactions
                └── Notifications
```

---

## 7. Shared Components

### 7.1 UI Components (Both Apps)

**Button** (`components/ui/Button.js`)
- Variants: primary, secondary, outline, ghost, danger
- Sizes: sm, md, lg
- Loading state
- Disabled state

**Input** (`components/ui/Input.js`)
- Text input with label
- Error message display
- Prefix/suffix icons
- Validation states

**Card** (`components/ui/Card.js`)
- Container with shadow
- Header, body, footer sections

**Badge** (`components/ui/Badge.js`)
- Status badges (pending, confirmed, completed, etc.)
- Color variants

**Avatar** (`components/ui/Avatar.js`)
- User avatar (placeholder for now)

**Spinner** (`components/ui/Spinner.js`)
- Loading indicator
- Sizes: sm, md, lg

**Modal** (`components/ui/Modal.js`)
- Bottom sheet modal
- Confirmation dialogs

**EmptyState** (`components/ui/EmptyState.js`)
- Icon, title, description
- Call-to-action button

**ErrorBoundary** (`components/common/ErrorBoundary.js`)
- Catch React errors
- Display fallback UI

---

### 7.2 Client-Specific Components

**ItemCard** (`components/menu/ItemCard.js`)
- Item image, name, description, price
- Quick add to cart button
- Tap to view details

**CategoryCard** (`components/menu/CategoryCard.js`)
- Category image, name
- Item count

**SizeSelector** (`components/menu/SizeSelector.js`)
- Radio button group for sizes
- Price display per size

**AddOnSelector** (`components/menu/AddOnSelector.js`)
- Checkbox list with quantity selectors
- Price calculation

**CartItem** (`components/cart/CartItem.js`)
- Item with customizations
- Quantity selector
- Remove button

**CartSummary** (`components/cart/CartSummary.js`)
- Price breakdown
- Subtotal, delivery, discount, total

**OrderCard** (`components/order/OrderCard.js`)
- Order summary card
- Status badge, date, total

**OrderStatusBadge** (`components/order/OrderStatusBadge.js`)
- Colored badge based on status

**OrderTimeline** (`components/order/OrderTimeline.js`)
- Visual progress indicator

---

### 7.3 Admin-Specific Components

**StatsCard** (`components/dashboard/StatsCard.js`)
- Icon, label, value
- Trend indicator (optional)

**OrderManagementCard** (`components/orders/OrderManagementCard.js`)
- Order card with admin actions
- Status update buttons

**MenuItemRow** (`components/menu/MenuItemRow.js`)
- Item row with edit/delete actions
- Toggle availability

**FormField** (`components/common/FormField.js`)
- Reusable form field wrapper
- Label, input, error message

---

## 8. State Management

### 8.1 Zustand Stores

**Auth Store** (`store/authStore.js`)
```javascript
{
  user: null,              // User object
  token: null,             // JWT token
  isAuthenticated: false,  // Boolean
  login: (user, token) => {},
  logout: () => {},
  updateProfile: (data) => {}
}
```

**Cart Store** (`store/cartStore.js`)
```javascript
{
  items: [],               // Cart items
  addItem: (item) => {},
  removeItem: (itemId) => {},
  updateQuantity: (itemId, quantity) => {},
  clearCart: () => {},
  getTotal: () => {},
  getItemCount: () => {}
}
```

**App Store** (`store/appStore.js`)
```javascript
{
  theme: 'light',          // Theme preference
  notificationCount: 0,    // Unread notifications
  setTheme: (theme) => {},
  setNotificationCount: (count) => {}
}
```

---

### 8.2 React Query (TanStack Query)

**Query Keys**:
```javascript
// Menu
['categories']
['categories', categoryId]
['items']
['items', itemId]
['items', { categoryId }]

// Orders
['orders']
['orders', orderId]
['orders', { status }]

// Addresses
['addresses']
['addresses', addressId]

// Notifications
['notifications', { page, limit }]
['notifications', 'unread-count']

// Offers
['offers']
['offers', offerId]
```

**Mutations**:
- Create order
- Update order status
- Add to cart (local state, no mutation)
- Create address
- Update address
- Delete address

---

## 9. API Integration

### 9.1 Axios Instance (`services/api.js`)

```javascript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

### 9.2 API Service Examples

**Auth Service** (`services/auth.js`)
```javascript
import api from './api';

export const authService = {
  sendOtp: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, otp, secret) => api.post('/auth/verify-otp', { phone, otp, secret }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};
```

**Menu Service** (`services/menu.js`)
```javascript
import api from './api';

export const menuService = {
  getCategories: (params) => api.get('/categories', { params }),
  getCategory: (id) => api.get(`/categories/${id}`),
  getItems: (params) => api.get('/items', { params }),
  getItem: (id) => api.get(`/items/${id}`)
};
```

**Orders Service** (`services/orders.js`)
```javascript
import api from './api';

export const ordersService = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancelOrder: (id) => api.delete(`/orders/${id}`)
};
```

---

### 9.3 React Query Hooks

**useMenu Hook** (`hooks/useMenu.js`)
```javascript
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services/menu';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => menuService.getCategories({ available: true })
  });
};

export const useItems = (categoryId) => {
  return useQuery({
    queryKey: ['items', { categoryId }],
    queryFn: () => menuService.getItems({ categoryId, available: true }),
    enabled: !!categoryId
  });
};

export const useItem = (itemId) => {
  return useQuery({
    queryKey: ['items', itemId],
    queryFn: () => menuService.getItem(itemId),
    enabled: !!itemId
  });
};
```

---

## 10. Design System

### 10.1 Color Palette

```javascript
// config/colors.js
export const colors = {
  // Primary - Vibrant Orange (appetite-stimulating)
  primary: {
    50: '#FFF5F0',
    100: '#FFE8D9',
    200: '#FFD0B3',
    300: '#FFB88C',
    400: '#FFA066',
    500: '#FF8840',  // Main primary color
    600: '#E67A39',
    700: '#CC6C33',
    800: '#B35E2C',
    900: '#995026'
  },

  // Secondary - Fresh Green (healthy, fresh)
  secondary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',  // Main secondary color
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D'
  },

  // Neutral - Grays
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717'
  },

  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',

  // Text
  textPrimary: '#171717',
  textSecondary: '#525252',
  textTertiary: '#A3A3A3',

  // Border
  border: '#E5E5E5',
  borderFocus: '#FF8840'
};
```

---

### 10.2 Typography

```javascript
// config/typography.js
export const typography = {
  fontFamily: {
    regular: 'System',  // Use system font for now
    medium: 'System',
    semibold: 'System',
    bold: 'System'
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
};
```

---

### 10.3 Spacing

```javascript
// Tailwind spacing (already configured in NativeWind)
// 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64
// Corresponds to: 0, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, ...
```

---

### 10.4 Component Styles

**Button Variants**:
```javascript
// Primary button
className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold"

// Secondary button
className="bg-secondary-500 text-white px-6 py-3 rounded-lg font-semibold"

// Outline button
className="border-2 border-primary-500 text-primary-500 px-6 py-3 rounded-lg font-semibold"

// Ghost button
className="text-primary-500 px-6 py-3 rounded-lg font-semibold"
```

**Card**:
```javascript
className="bg-white rounded-xl shadow-md p-4"
```

**Input**:
```javascript
className="border border-neutral-300 rounded-lg px-4 py-3 text-base focus:border-primary-500"
```

---

### 10.5 Icons

Use **@expo/vector-icons** (includes Ionicons, MaterialIcons, FontAwesome, etc.)

**Common Icons**:
- Home: `Ionicons/home`
- Menu: `Ionicons/restaurant`
- Cart: `Ionicons/cart`
- Orders: `Ionicons/receipt`
- Profile: `Ionicons/person`
- Search: `Ionicons/search`
- Add: `Ionicons/add`
- Edit: `Ionicons/pencil`
- Delete: `Ionicons/trash`
- Notification: `Ionicons/notifications`
- Back: `Ionicons/arrow-back`
- Close: `Ionicons/close`

---

## 11. Implementation Plan

### 11.1 Phase 1: Project Setup (Week 1)

**Tasks**:
1. ✅ Create Expo projects (client-app, admin-app)
2. ✅ Install dependencies (NativeWind, Zustand, React Query, etc.)
3. ✅ Configure Tailwind CSS
4. ✅ Set up folder structure
5. ✅ Configure Expo Router
6. ✅ Set up API client (Axios)
7. ✅ Create base UI components (Button, Input, Card, etc.)
8. ✅ Set up Zustand stores
9. ✅ Configure React Query

---

### 11.2 Phase 2: Client App - Authentication (Week 1)

**Tasks**:
10. ✅ Create Welcome screen
11. ✅ Create Login screen (phone + OTP)
12. ✅ Implement auth service
13. ✅ Implement auth store
14. ✅ Test authentication flow

---

### 11.3 Phase 3: Client App - Menu Browsing (Week 2)

**Tasks**:
15. ✅ Create Home tab
16. ✅ Create Menu tab
17. ✅ Create Category Detail screen
18. ✅ Create Item Detail screen
19. ✅ Implement menu service
20. ✅ Implement menu hooks (React Query)
21. ✅ Create ItemCard component
22. ✅ Create CategoryCard component
23. ✅ Create SizeSelector component
24. ✅ Create AddOnSelector component
25. ✅ Test menu browsing

---

### 11.4 Phase 4: Client App - Cart & Checkout (Week 2)

**Tasks**:
26. ✅ Create Cart tab
27. ✅ Implement cart store
28. ✅ Create CartItem component
29. ✅ Create CartSummary component
30. ✅ Create Checkout screen
31. ✅ Create Address management screens
32. ✅ Implement address service
33. ✅ Integrate Razorpay payment
34. ✅ Create Payment Success/Failed screens
35. ✅ Test cart and checkout flow

---

### 11.5 Phase 5: Client App - Orders & Profile (Week 3)

**Tasks**:
36. ✅ Create Orders tab
37. ✅ Create Order Detail screen
38. ✅ Create OrderCard component
39. ✅ Create OrderTimeline component
40. ✅ Implement orders service
41. ✅ Implement orders hooks
42. ✅ Create Profile tab
43. ✅ Create Notifications screen
44. ✅ Implement notification polling
45. ✅ Test orders and profile

---

### 11.6 Phase 6: Admin App - Core Features (Week 3-4)

**Tasks**:
46. ✅ Create Admin Login screen
47. ✅ Create Dashboard screen
48. ✅ Create Orders Management screen
49. ✅ Create Order Detail screen (admin)
50. ✅ Implement order status updates
51. ✅ Create Menu Management screens (Categories, Items, Sizes, Add-Ons)
52. ✅ Create CRUD forms for menu entities
53. ✅ Create Offers Management screen
54. ✅ Test admin features

---

### 11.7 Phase 7: Polish & Testing (Week 4)

**Tasks**:
55. ✅ Add loading states
56. ✅ Add error handling
57. ✅ Add empty states
58. ✅ Optimize images (use Expo Image)
59. ✅ Test on Web
60. ✅ Test on Android (Expo Go)
61. ✅ Test on iOS (Expo Go)
62. ✅ Fix bugs and polish UI
63. ✅ Add animations (optional)
64. ✅ Performance optimization

---

### 11.8 Phase 8: Deployment (Week 5)

**Tasks**:
65. ✅ Build web version (Expo export)
66. ✅ Deploy web to Vercel/Netlify
67. ✅ Build Android APK (EAS Build)
68. ✅ Build iOS IPA (EAS Build)
69. ✅ Test production builds
70. ✅ Submit to app stores (optional)

---

## 12. Next Steps

Before starting implementation, we need to:

1. **✅ Complete Pictures Table** - Implement backend support for images
2. **✅ Review and Approve Design** - Get user confirmation on design decisions
3. **✅ Set Up Development Environment** - Install Expo CLI, create projects
4. **✅ Create Shared Component Library** - Build base UI components first
5. **✅ Start with Client App** - Implement client app first, then admin app

---

## 13. Open Questions

1. **Restaurant Name & Branding**: What should we call the restaurant? (Placeholder: "Foodie")
2. **Color Preference**: Approve the Orange/Green palette or suggest alternatives?
3. **Guest Browsing**: Confirm that users can browse menu without login?
4. **Onboarding**: How many onboarding slides? (Suggested: 3 slides)
5. **Payment Gateway**: Razorpay test mode or live mode for development?
6. **Image Storage**: Use placeholder URLs for now or set up Cloudinary immediately?
7. **Push Notifications**: Should we add push notifications later? (Requires Expo Notifications + backend)
8. **Analytics**: Should we add analytics (Expo Analytics or Google Analytics)?
9. **Crash Reporting**: Should we add Sentry for error tracking?
10. **Internationalization**: Support multiple languages? (English only for MVP?)

---

## 14. Estimated Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Setup | 2-3 days | Project structure, base components |
| Phase 2: Auth | 1-2 days | Login flow working |
| Phase 3: Menu | 3-4 days | Browse menu, view items |
| Phase 4: Cart | 3-4 days | Add to cart, checkout, payment |
| Phase 5: Orders | 2-3 days | View orders, track status |
| Phase 6: Admin | 5-7 days | Full admin functionality |
| Phase 7: Polish | 3-4 days | Bug fixes, optimization |
| Phase 8: Deploy | 2-3 days | Production builds |
| **Total** | **3-4 weeks** | **Two production-ready apps** |

---

## 15. Success Criteria

**Client App**:
- ✅ User can browse menu without login
- ✅ User can login with phone + OTP
- ✅ User can add items to cart with customizations
- ✅ User can place order and complete payment
- ✅ User can view order history and track status
- ✅ User can manage delivery addresses
- ✅ User can view notifications
- ✅ App works on Android, iOS, and Web

**Admin App**:
- ✅ Admin can login with phone + OTP
- ✅ Admin can view dashboard with stats
- ✅ Admin can manage orders (view, update status)
- ✅ Admin can manage menu (categories, items, sizes, add-ons)
- ✅ Admin can manage offers
- ✅ Admin can process refunds
- ✅ Admin can view notifications
- ✅ App works on Android, iOS, and Web

---

**End of Frontend Design Document**

