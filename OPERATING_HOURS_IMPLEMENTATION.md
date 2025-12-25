# Operating Hours Implementation Plan

## ✅ COMPLETED

### Database
- ✅ Migration file created: `app/src/migrations/20251225000002-create-operating-hours.js`
- ✅ Tables: `restaurant_settings`, `operating_hours`, `holidays`
- ✅ Default data inserted (9am-10pm all days, Indian holidays 2025)
- ✅ Migration executed successfully

### Models
- ✅ `app/src/models/RestaurantSettings.js`
- ✅ `app/src/models/OperatingHours.js`
- ✅ `app/src/models/Holiday.js`

### Services
- ✅ `app/src/services/restaurantService.js`
  - `getSettings()` - Get restaurant settings
  - `updateSettings(data)` - Update settings
  - `isRestaurantOpen()` - Check if open now (Priority: Manual > Holiday > Hours)
  - `getNextOpenTime()` - Get next opening time
  - `manuallyClose(userId, reason)` - Manual close
  - `manuallyOpen()` - Manual open
  - `getAllOperatingHours()` - Get weekly schedule
  - `updateOperatingHours(day, slots)` - Update day schedule
  - `getAllHolidays()` - Get holidays
  - `createHoliday(data)` - Add holiday
  - `updateHoliday(id, data)` - Edit holiday
  - `deleteHoliday(id)` - Delete holiday

### Controller
- ✅ `app/src/controllers/restaurantController.js`
  - All public and admin endpoints implemented

### Routes
- ✅ `app/src/routes/restaurant.js`
  - Public routes: `/status`, `/info`, `/hours`
  - Admin routes: `/settings`, `/manual-close`, `/manual-open`, `/operating-hours/:day`, `/holidays`
- ✅ Registered in `app/src/index.js`

### Middleware
- ✅ Order creation check: `app/src/services/orderService.js` now checks `isRestaurantOpen()` before creating orders

### Testing
- ✅ API tested and working:
  - `GET /api/restaurant/status` - Returns closed (Christmas holiday detected)
  - `GET /api/restaurant/info` - Returns restaurant info
  - `GET /api/restaurant/hours` - Returns weekly schedule

---

## 📋 TODO: Backend (Optional)

### DTOs (Optional - for validation)
- UpdateSettingsDto
- ManualCloseDto
- UpdateOperatingHoursDto
- CreateHolidayDto
- UpdateHolidayDto

---

## ✅ COMPLETED: Admin App

### 1. Service Layer
- ✅ `admin-app/src/services/restaurantService.js` - All API methods implemented

### 2. Settings Screen Components
- ✅ `admin-app/src/screens/SettingsScreen.js` - Main screen with 4 tabs
- ✅ `admin-app/src/components/settings/GeneralSettingsTab.js` - Restaurant info editor
- ✅ `admin-app/src/components/settings/OperatingHoursTab.js` - Weekly schedule editor
- ✅ `admin-app/src/components/settings/HolidaysTab.js` - Holiday calendar with CRUD
- ✅ `admin-app/src/components/settings/ManualControlTab.js` - Status display + manual controls

### 3. Dashboard Updates
- ✅ Added restaurant status banner (green for open, red for closed)
- ✅ Added "Manage" button to navigate to settings
- ✅ Auto-refresh status every 5 minutes

### 4. Navigation
- ✅ Added "Settings" to drawer menu (gear icon, positioned after Users)

---

## ✅ COMPLETED: Client App

### 1. Service Layer
- ✅ `client-app/src/services/restaurantService.js` - Public API methods

### 2. HomeScreen Enhancement
- ✅ Added restaurant status query (refetch every 5 minutes)
- ✅ Added status banner (red background when closed)
- ✅ Shows closure reason and next opening time
- ✅ Disabled item cards when restaurant is closed
- ✅ Prevents navigation to ItemDetail when closed

### 3. CartScreen Enhancement
- ✅ Added restaurant status query (refetch every 5 minutes)
- ✅ Added status check in handleCheckout function
- ✅ Shows alert with closure reason and next opening time
- ✅ Disabled checkout button when restaurant is closed
- ✅ Button text changes to "Restaurant Closed"

---

## 🔄 IMPLEMENTATION ORDER

### Phase 1: Backend (2-3 hours)
1. ✅ Database migration
2. ✅ Models
3. ✅ Service layer
4. ⏳ Controller
5. ⏳ Routes
6. ⏳ DTOs
7. ⏳ Middleware (order validation)

### Phase 2: Admin App (3-4 hours)
1. ⏳ Settings Screen (all tabs)
2. ⏳ Dashboard status display
3. ⏳ Service layer
4. ⏳ Navigation update

### Phase 3: Client App (1-2 hours)
1. ⏳ Status banner on HomeScreen
2. ⏳ Order prevention when closed
3. ⏳ Service layer
4. ⏳ Restaurant info screen (optional)

### Phase 4: Testing (1 hour)
1. ⏳ Test manual open/close
2. ⏳ Test operating hours
3. ⏳ Test holidays
4. ⏳ Test order prevention
5. ⏳ Test next opening time calculation

---

## 📝 NEXT STEPS

Run migration:
```bash
docker-compose exec app npm run db:migrate
```

Then implement:
1. Controller + Routes + DTOs
2. Admin Settings Screen
3. Client Status Banner
4. Testing

---

## 🎯 EXPECTED BEHAVIOR

### Scenario 1: Within Operating Hours
- Client: Shows "🟢 OPEN - Closes at 10:00 PM"
- Client: Can place orders
- Admin: Shows "Open" status

### Scenario 2: Outside Operating Hours
- Client: Shows "🔴 CLOSED - Opens tomorrow at 9:00 AM"
- Client: Cannot place orders
- Admin: Shows "Closed" status

### Scenario 3: Manual Closure
- Admin: Clicks "Close Now" with reason "Staff shortage"
- Client: Shows "🔴 CLOSED - Staff shortage"
- Client: Cannot place orders
- Admin: Shows "Manually Closed" badge

### Scenario 4: Holiday
- Client: Shows "🔴 CLOSED - Closed for Christmas"
- Client: Cannot place orders
- Admin: Shows "Holiday: Christmas"

### Scenario 5: Multiple Time Slots
- Operating Hours: 11am-3pm, 6pm-10pm
- At 4pm: Shows "🔴 CLOSED - Opens at 6:00 PM"
- At 2pm: Shows "🟢 OPEN - Closes at 3:00 PM"

