# Deploy Admin User Migration

This guide explains how to deploy the admin user migration to your remote server.

---

## What This Does

The migration `20251226093500-seed-admin-user.js` will:
- ✅ Check if an admin user already exists
- ✅ Create admin user with phone from `ADMIN_PHONE` environment variable
- ✅ Skip if admin already exists (safe to run multiple times)

---

## Deployment Steps

### Option 1: Using Git (Recommended)

**On your local machine:**

```bash
# Commit the migration
git add app/src/migrations/20251226093500-seed-admin-user.js
git commit -m "Add migration to seed admin user"
git push origin main
```

**On remote server (206.189.141.60):**

```bash
# SSH into server
ssh user@206.189.141.60

# Navigate to app directory
cd /path/to/your/app

# Pull latest changes
git pull origin main

# Run migrations
npm run db:migrate

# Restart the application
pm2 restart app  # or your restart command
```

---

### Option 2: Manual File Upload

**Upload the migration file:**

```bash
# From your local machine
scp app/src/migrations/20251226093500-seed-admin-user.js \
  user@206.189.141.60:/path/to/your/app/src/migrations/
```

**On remote server:**

```bash
# SSH into server
ssh user@206.189.141.60

# Navigate to app directory
cd /path/to/your/app

# Run migrations
npm run db:migrate

# Restart the application
pm2 restart app  # or your restart command
```

---

### Option 3: Direct Database Insert (Quick Fix)

If you just want to quickly create the admin user without deploying code:

```bash
# SSH into server
ssh user@206.189.141.60

# Connect to PostgreSQL
psql -U restaurant_user -d restaurant_db

# Insert admin user (change phone number if needed)
INSERT INTO users (phone, role, name, created_at, updated_at)
VALUES ('+911234567890', 'admin', 'Admin User', NOW(), NOW())
ON CONFLICT (phone) DO UPDATE SET role = 'admin', name = 'Admin User';

# Verify
SELECT id, phone, role, name FROM users WHERE role = 'admin';

# Exit
\q
```

---

## Verify Admin User

After running the migration, verify the admin user was created:

**Check database:**

```bash
# On remote server
psql -U restaurant_user -d restaurant_db -c "SELECT id, phone, role, name FROM users WHERE role = 'admin';"
```

**Expected output:**

```
 id |     phone      | role  |    name    
----+----------------+-------+------------
  1 | +911234567890  | admin | Admin User
```

---

## Test Admin Login

1. **Open admin app** (http://localhost:8081 or your deployed URL)
2. **Enter phone:** `1234567890` (or with country code: `+911234567890`)
3. **Request OTP**
4. **Enter OTP** (from SMS or `123456` if using mock OTP)
5. **✅ Should login successfully as admin!**

---

## Troubleshooting

### Migration already ran but no admin user

**Check if migration was recorded:**

```bash
psql -U restaurant_user -d restaurant_db -c "SELECT * FROM \"SequelizeMeta\" WHERE name = '20251226093500-seed-admin-user.js';"
```

**If it shows the migration ran but no user exists:**

```bash
# Undo the migration
npm run db:migrate:undo

# Run it again
npm run db:migrate
```

### Wrong phone number

**Update the admin phone in `.env`:**

```bash
# Edit .env file
nano .env

# Change ADMIN_PHONE to your desired number
ADMIN_PHONE=+91XXXXXXXXXX

# Undo the migration
npm run db:migrate:undo

# Run it again with new phone
npm run db:migrate
```

### User exists but not admin

**Update existing user to admin:**

```bash
psql -U restaurant_user -d restaurant_db -c "UPDATE users SET role = 'admin', name = 'Admin User' WHERE phone = '+911234567890';"
```

---

## Environment Variables

Make sure your remote server's `.env` file has:

```env
ADMIN_PHONE=+911234567890
```

Change this to your actual admin phone number before running the migration.

---

## Related Files

- **Migration:** `app/src/migrations/20251226093500-seed-admin-user.js`
- **Backend Auth:** `app/src/services/authService.js`
- **Admin Verify OTP:** `admin-app/src/screens/VerifyOTPScreen.js`
- **Documentation:** `docs/ADMIN_ACCESS.md`

