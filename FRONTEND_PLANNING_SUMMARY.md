# Frontend Planning Summary

**Date**: 2025-12-24  
**Status**: Planning Complete - Ready for Implementation

---

## 📋 Planning Documents Created

1. **API_ENDPOINTS.md** - Complete reference of all backend API endpoints
2. **PICTURES_TABLE_DESIGN.md** - Design for missing pictures/images feature
3. **FRONTEND_DESIGN.md** - Comprehensive frontend architecture and design

---

## 🎯 Key Decisions Made

### Technology Stack
- **Framework**: React Native + Expo SDK 52
- **Language**: JavaScript (not TypeScript)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand (global state) + TanStack Query (server state)
- **API Client**: Axios
- **Target Platforms**: Android, iOS, Web (test on Web first)

### Architecture
- **Two Separate Apps**: Client App + Admin App
- **Shared Components**: Common UI components in shared folder
- **Mobile-First**: Optimized for mobile phones
- **Guest Browsing**: Users can browse menu without login

### Design
- **Color Palette**: Orange (primary) + Green (secondary)
- **Design Inspiration**: Modern food delivery apps (Figma template provided)
- **Navigation**: Bottom tabs (client), Drawer (admin)
- **Onboarding**: Welcome screen included

---

## 📊 Backend Status

### ✅ Completed Features
- Authentication (Phone-OTP with 2Factor.in)
- Menu Management (Categories, Items, ItemSizes, AddOns)
- Address Management
- Offer System
- Order Management
- Payment Integration (Razorpay)
- Webhook Integration
- Notification System (12 templates)

### ❌ Missing Backend Feature
- **Pictures Table** - Need to implement image storage for items/categories
  - Design document created: `PICTURES_TABLE_DESIGN.md`
  - Polymorphic table supporting multiple entities
  - API endpoints defined
  - Migration and model designed

### 📝 Available API Endpoints (Summary)

**Public Endpoints** (18):
- Categories: GET /categories, GET /categories/:id
- Items: GET /items, GET /items/:id
- Add-Ons: GET /add-ons, GET /add-ons/:id
- Offers: GET /offers, GET /offers/:id, GET /offers/code/:code
- Health: GET /health

**Authenticated Endpoints** (25):
- Auth: POST /auth/send-otp, POST /auth/verify-otp, GET /auth/me, PUT /auth/profile
- Addresses: CRUD + set default
- Orders: GET /orders, GET /orders/:id, POST /orders, DELETE /orders/:id
- Payments: POST /payments/initiate, POST /payments/verify, GET /payments/status/:orderId
- Notifications: GET /notifications, PATCH /notifications/:id/read, DELETE /notifications/:id
- Offers: POST /offers/validate, GET /offers/usage/history

**Admin Endpoints** (20):
- Categories: POST, PUT, DELETE
- Items: POST, PUT, DELETE
- Item Sizes: POST, PUT, DELETE (nested under items)
- Add-Ons: POST, PUT, DELETE + category/item linking
- Offers: POST, PUT, DELETE
- Orders: PATCH /orders/:id/status
- Payments: POST /payments/refund

**Total**: 63 endpoints

---

## 🎨 Frontend Apps Overview

### Client App (Customer-Facing)

**Screens** (20):
1. Welcome (onboarding)
2. Login (phone + OTP)
3. Home (tab)
4. Menu (tab)
5. Cart (tab)
6. Orders (tab)
7. Profile (tab)
8. Category Detail
9. Item Detail
10. Checkout
11. Order Detail
12. Addresses List
13. Add Address
14. Edit Address
15. Notifications
16. Payment Success
17. Payment Failed
18. 404 Not Found

**Key Features**:
- Browse menu by category
- Search items
- Customize items (sizes, add-ons)
- Add to cart
- Apply offer codes
- Place orders
- Razorpay payment integration
- Track order status
- Manage delivery addresses
- View notifications
- Order history

**Navigation**: Bottom tabs (Home, Menu, Cart, Orders, Profile)

---

### Admin App (Restaurant Staff)

**Screens** (18):
1. Admin Login
2. Dashboard
3. Orders List
4. Order Detail
5. Categories Management
6. Items Management
7. Sizes Management
8. Add-Ons Management
9. Offers Management
10. Transactions (future)
11. Notifications
12. Add/Edit Category
13. Add/Edit Item
14. Add/Edit Add-On
15. Add/Edit Offer
16. 404 Not Found

**Key Features**:
- Dashboard with stats
- View all orders
- Update order status (pending → confirmed → preparing → ready → completed)
- Cancel orders
- Process refunds
- Manage menu (categories, items, sizes, add-ons)
- Manage offers
- View transactions
- View notifications

**Navigation**: Drawer navigation (sidebar menu)

---

## 🧩 Shared Components (30+)

### UI Components
- Button (variants: primary, secondary, outline, ghost, danger)
- Input (with validation states)
- Card
- Badge (status badges)
- Avatar
- Spinner (loading indicator)
- Modal (bottom sheet)
- EmptyState
- ErrorBoundary

### Client Components
- ItemCard
- CategoryCard
- SizeSelector
- AddOnSelector
- CartItem
- CartSummary
- OrderCard
- OrderStatusBadge
- OrderTimeline

### Admin Components
- StatsCard
- OrderManagementCard
- MenuItemRow
- FormField

---

## 📦 State Management Strategy

### Zustand Stores (Global State)
1. **authStore** - User, token, authentication status
2. **cartStore** - Cart items, add/remove/update, total calculation
3. **appStore** - Theme, notification count, app settings

### TanStack Query (Server State)
- Categories, items, orders, addresses, notifications
- Automatic caching, refetching, optimistic updates
- Query keys defined for all entities

### React Context (Component State)
- Form state (React Hook Form)
- Local UI state

---

## 🎨 Design System

### Color Palette
- **Primary**: Orange (#FF8840) - Appetite-stimulating
- **Secondary**: Green (#22C55E) - Fresh, healthy
- **Neutral**: Grays (#171717 to #FAFAFA)
- **Status**: Success, Warning, Error, Info

### Typography
- System fonts (for now)
- Font sizes: xs (12px) to 4xl (36px)
- Line heights: tight, normal, relaxed

### Spacing
- Tailwind spacing scale (0, 4px, 8px, 12px, 16px, 20px, 24px, 32px, ...)

### Icons
- @expo/vector-icons (Ionicons, MaterialIcons, FontAwesome)

---

## 📅 Implementation Plan (3-4 Weeks)

### Week 1: Setup & Authentication
- **Phase 1**: Project setup, dependencies, folder structure (2-3 days)
- **Phase 2**: Client app authentication (1-2 days)

### Week 2: Menu & Cart
- **Phase 3**: Menu browsing (categories, items, detail screens) (3-4 days)
- **Phase 4**: Cart & checkout (cart, addresses, payment) (3-4 days)

### Week 3: Orders & Admin
- **Phase 5**: Orders & profile (order history, notifications) (2-3 days)
- **Phase 6**: Admin app (dashboard, orders, menu management) (5-7 days)

### Week 4: Polish & Deploy
- **Phase 7**: Polish & testing (loading states, errors, optimization) (3-4 days)
- **Phase 8**: Deployment (web, Android, iOS builds) (2-3 days)

---

## ✅ Next Steps (In Order)

### Step 1: Complete Pictures Table (Backend)
**Priority**: High  
**Estimated Time**: 2-3 hours

**Tasks**:
1. Create migration for pictures table
2. Create Picture model
3. Update Item and Category models with associations
4. Create picture routes and controller
5. Test picture CRUD operations

**Why First**: Frontend will need image URLs for items and categories

---

### Step 2: Review & Approve Design
**Priority**: High  
**Estimated Time**: 30 minutes

**Questions to Answer**:
1. Approve color palette (Orange/Green)?
2. Restaurant name for placeholder?
3. Confirm guest browsing enabled?
4. Confirm onboarding screen?
5. Use placeholder image URLs or set up Cloudinary?
6. Razorpay test mode or live mode?
7. Add push notifications later?
8. Add analytics/crash reporting?
9. Support multiple languages (i18n)?

---

### Step 3: Set Up Development Environment
**Priority**: High  
**Estimated Time**: 1-2 hours

**Tasks**:
1. Install Expo CLI globally: `npm install -g expo-cli`
2. Create client-app: `npx create-expo-app client-app`
3. Create admin-app: `npx create-expo-app admin-app`
4. Install dependencies (NativeWind, Zustand, React Query, etc.)
5. Configure Tailwind CSS
6. Set up folder structure
7. Configure Expo Router
8. Test on web: `npx expo start --web`

---

### Step 4: Build Shared Component Library
**Priority**: High  
**Estimated Time**: 1 day

**Tasks**:
1. Create base UI components (Button, Input, Card, Badge, etc.)
2. Set up color system
3. Test components in Storybook or example screens
4. Document component usage

---

### Step 5: Start Client App Implementation
**Priority**: High  
**Estimated Time**: 2-3 weeks

**Follow Phase 2-5 from Implementation Plan**

---

### Step 6: Start Admin App Implementation
**Priority**: Medium  
**Estimated Time**: 1 week

**Follow Phase 6 from Implementation Plan**

---

### Step 7: Polish & Deploy
**Priority**: Medium  
**Estimated Time**: 1 week

**Follow Phase 7-8 from Implementation Plan**

---

## 📝 Open Questions for User

Before starting implementation, please confirm:

1. **Pictures Table**: Should we implement this now or use placeholder URLs?
2. **Color Palette**: Approve Orange/Green or suggest alternatives?
3. **Restaurant Name**: What should we use for branding? (Placeholder: "Foodie")
4. **Image Strategy**: Placeholder URLs (Unsplash) or Cloudinary setup?
5. **Payment Mode**: Razorpay test mode or live mode for development?
6. **Additional Features**: Push notifications, analytics, crash reporting?
7. **Internationalization**: English only or multiple languages?
8. **Priority**: Should we start with Client App or Admin App first?

---

## 📚 Reference Documents

- **DESIGN.md** - Original backend design specification
- **API_ENDPOINTS.md** - Complete API reference (63 endpoints)
- **PICTURES_TABLE_DESIGN.md** - Pictures table design (backend)
- **FRONTEND_DESIGN.md** - Complete frontend architecture (1600+ lines)

---

**Status**: ✅ Planning Complete - Awaiting User Approval to Start Implementation

