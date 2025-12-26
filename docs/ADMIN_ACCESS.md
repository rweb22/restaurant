# Admin Access Configuration

## Overview

The admin app requires users to have the `admin` role in the database. This document explains how admin users are created and how to configure admin access.

---

## How Admin Users Are Created

### Automatic Admin Creation (Recommended)

When a user logs in with OTP, the backend automatically checks if their phone number matches the `ADMIN_PHONE` environment variable. If it matches, they are created as an admin user.

**Configuration:**

1. **Backend Server** (`app/.env`):
   ```env
   ADMIN_PHONE=+911234567890
   ```

2. **Login Process:**
   - User enters phone number in admin app
   - If phone matches `ADMIN_PHONE`, user is created with `role='admin'`
   - If phone doesn't match, user is created with `role='client'`
   - Admin app checks user role and rejects non-admin users

**Code Location:** `app/src/services/authService.js` (lines 84-121)

---

### Manual Admin Creation (Alternative)

If you need to create admin users manually or seed the database:

#### Option 1: Run Database Seeder

The seeder creates an admin user using the `ADMIN_PHONE` from `.env`:

```bash
# Using Docker
docker compose exec app npm run db:seed

# Using native setup
cd app && npm run db:seed
```

**Seeder Location:** `app/src/seeders/20251223000001-initial-data.js`

#### Option 2: Direct Database Insert

Connect to PostgreSQL and run:

```sql
INSERT INTO users (phone, role, name, created_at, updated_at)
VALUES ('+911234567890', 'admin', 'Admin User', NOW(), NOW());
```

#### Option 3: Update Existing User

If a user already exists and you want to make them admin:

```sql
UPDATE users SET role = 'admin', name = 'Admin User' WHERE phone = '+911234567890';
```

---

## Testing Admin Access

### Local Development

1. **Start the backend:**
   ```bash
   docker compose up -d
   # OR
   cd app && npm run dev
   ```

2. **Start the admin app:**
   ```bash
   cd admin-app && npm start
   ```

3. **Login with admin phone:**
   - Open admin app (http://localhost:8081)
   - Enter phone: `1234567890` (or `+911234567890`)
   - Request OTP
   - Enter OTP (if using mock OTP, enter `123456`)
   - You should be logged in as admin

### Production/Remote Server

1. **Configure admin phone on server:**
   - SSH into server: `ssh user@206.189.141.60`
   - Edit `.env` file: `nano /path/to/app/.env`
   - Set `ADMIN_PHONE=+91XXXXXXXXXX`
   - Restart the application

2. **Login with admin phone:**
   - Open admin app
   - Enter the phone number configured in `ADMIN_PHONE`
   - Request OTP
   - Enter OTP from SMS
   - You should be logged in as admin

---

## Troubleshooting

### "Access denied. Only admin users can access this app."

**Cause:** The user exists in the database but has `role='client'` instead of `role='admin'`.

**Solutions:**

1. **Update the user's role in database:**
   ```sql
   UPDATE users SET role = 'admin' WHERE phone = '+91XXXXXXXXXX';
   ```

2. **Delete the user and login again:**
   ```sql
   DELETE FROM users WHERE phone = '+91XXXXXXXXXX';
   ```
   Then login again - the user will be created as admin if phone matches `ADMIN_PHONE`.

### Admin phone doesn't match

**Cause:** The phone number you're using doesn't match the `ADMIN_PHONE` in the backend `.env` file.

**Solution:**
- Check the backend `.env` file for the correct `ADMIN_PHONE` value
- Make sure to include the country code (e.g., `+91` for India)
- Update `ADMIN_PHONE` to your desired phone number and restart the backend

### Multiple admin users

You can have multiple admin users by manually updating their role in the database:

```sql
UPDATE users SET role = 'admin', name = 'Admin User 2' WHERE phone = '+91YYYYYYYYYY';
```

---

## Security Considerations

1. **Keep `ADMIN_PHONE` secret:** Don't commit the actual admin phone number to version control
2. **Use strong OTP service:** In production, use real OTP service (not mock OTP)
3. **Monitor admin access:** Log all admin logins and actions
4. **Limit admin users:** Only create admin accounts for trusted staff members

---

## Environment Variables

### Backend (`app/.env`)

```env
# Admin phone number (with country code)
ADMIN_PHONE=+911234567890
```

### Admin App (`admin-app/.env`)

```env
# API endpoint (must point to backend server)
API_BASE_URL=http://206.189.141.60:3000/api
```

---

## Related Files

- **Backend Auth Service:** `app/src/services/authService.js`
- **Admin App Verify OTP:** `admin-app/src/screens/VerifyOTPScreen.js`
- **Database Seeder:** `app/src/seeders/20251223000001-initial-data.js`
- **User Model:** `app/src/models/User.js`

