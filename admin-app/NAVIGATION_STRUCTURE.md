# Admin App Navigation Structure

## Navigation Hierarchy

```
Root (NavigationContainer)
├── AuthNavigator (when !isAuthenticated)
│   ├── Login
│   └── VerifyOTP
│
├── EnterNameNavigator (when authenticated but !user.name)
│   └── EnterName
│
└── DrawerNavigator (when fully authenticated)
    ├── Main (Drawer) → MainStack
    │   ├── Dashboard
    │   ├── Orders
    │   ├── OrderDetails ✅
    │   ├── Categories
    │   ├── Items
    │   ├── ItemForm
    │   └── Notifications ✅
    │
    ├── OrdersDrawer → OrdersStack ✅ NEW
    │   ├── OrdersList
    │   └── OrderDetails ✅
    │
    ├── CategoriesDrawer → CategoriesStack
    │   ├── CategoriesList
    │   └── CategoryForm
    │
    ├── ItemsDrawer → ItemsStack
    │   ├── ItemsList
    │   └── ItemForm
    │
    ├── MenuManagementDrawer → MenuManagementStack
    │   ├── MenuManagementList
    │   ├── ItemSizes
    │   └── ItemSizeForm
    │
    ├── AddOnsDrawer → AddOnsStack
    │   ├── AddOnsList
    │   └── AddOnForm
    │
    ├── CategoryAddOnsDrawer → CategoryAddOnsStack
    │   ├── CategoryAddOnsList
    │   └── CategoryAddOnForm
    │
    ├── ItemAddOnsDrawer → ItemAddOnsStack
    │   ├── ItemAddOnsList
    │   └── ItemAddOnForm
    │
    ├── LocationsDrawer → LocationsStack
    │   ├── LocationsList
    │   └── LocationForm
    │
    ├── UsersDrawer → UsersStack
    │   ├── UsersList
    │   └── UserForm
    │
    ├── OffersDrawer → OffersStack
    │   ├── OffersList
    │   └── OfferForm
    │
    ├── TransactionsDrawer → TransactionsStack
    │   ├── TransactionsList
    │   └── TransactionDetails ✅
    │
    └── SettingsDrawer → SettingsStack
        └── SettingsMain
```

## Navigation Rules

### Same Stack Navigation
✅ **Works:** `navigation.navigate('ScreenName')`
- Example: From `Dashboard` to `OrderDetails` (both in MainStack)
- Example: From `Orders` to `OrderDetails` (both in MainStack)
- Example: From `TransactionsList` to `TransactionDetails` (both in TransactionsStack)

### Cross-Stack Navigation (Nested Navigators)
❌ **Doesn't Work:** `navigation.navigate('OrderDetails')`
✅ **Works:** `navigation.navigate('Main', { screen: 'OrderDetails' })`

### Accessing Parent Navigator
```javascript
const parent = navigation.getParent();
if (parent) {
  parent.navigate('Main', { screen: 'Notifications' });
}
```

## Fixed Navigation Issues

### 1. NotificationsScreen → OrderDetails ✅ FIXED
**File:** `admin-app/src/screens/NotificationsScreen.js`
**Issue:** Clicking on order notification only marked as read, didn't navigate
**Fix:** Added `handleNotificationPress` function that:
1. Marks notification as read
2. Navigates to OrderDetails if orderId exists
3. Uses `navigation.navigate('OrderDetails', { orderId })` (same stack)

### 2. OrdersDrawer → OrderDetails ✅ FIXED
**File:** `admin-app/App.js`
**Issue:** OrdersDrawer was pointing directly to OrdersScreen component, not a stack navigator
- When accessing Orders via drawer, OrderDetails screen didn't exist in navigation context
- Error: "The action 'NAVIGATE' with payload {"name":"OrderDetails"} was not handled by any navigator"
**Fix:** Created OrdersStack navigator with:
1. OrdersList screen (the main orders list)
2. OrderDetails screen (order details view)
3. Updated DrawerNavigator to use OrdersStack instead of OrdersScreen directly
4. Now OrderDetails is accessible from both MainStack AND OrdersStack

## All Navigation Calls Verified

### ✅ DashboardScreen (MainStack)
- Line 111: `navigation.navigate('SettingsDrawer')` - Drawer navigation ✅
- Line 167: `navigation.navigate('Orders')` - Same stack (MainStack) ✅
- Line 188: `navigation.navigate('OrderDetails', { orderId })` - Same stack (MainStack) ✅

### ✅ OrdersScreen (Can be in MainStack OR OrdersStack)
- Line 111: `navigation.navigate('OrderDetails', { orderId })` - Same stack ✅
- Works in both contexts:
  - When accessed from Dashboard (MainStack → Orders → OrderDetails)
  - When accessed from Drawer (OrdersStack → OrdersList → OrderDetails)

### ✅ NotificationsScreen (MainStack)
- Line 111: `handleNotificationPress(item)` → navigates to OrderDetails - Same stack ✅ FIXED

### ✅ TransactionsScreen (TransactionsStack)
- Line 70: `navigation.navigate('TransactionDetails', { transactionId })` - Same stack ✅

## No Cross-Stack Navigation Issues Found! 🎉

