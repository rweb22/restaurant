# Checking Backend Environment Variables & Database

This guide explains how to check environment variables, database status, and other backend information on your remote server.

---

## 🔍 Quick Check Methods

### Method 1: Using Debug API Endpoints (Recommended)

The backend now has debug endpoints that provide comprehensive information about environment variables and database status.

**Prerequisites:**
- You must be logged in as an admin user
- You need a valid JWT token

---

### **Step 1: Login as Admin**

```bash
# Send OTP to admin phone
curl -X POST http://206.189.141.60:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+911234567890"}'

# Response will include a "secret" (session ID)
# {"success":true,"data":{"secret":"abc123...","expiresIn":300}}

# Verify OTP (use the secret from above)
curl -X POST http://206.189.141.60:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+911234567890", "otp": "123456", "secret": "abc123..."}'

# Response will include an "accessToken"
# {"success":true,"data":{"accessToken":"eyJhbGc...","user":{...}}}
```

**Save the `accessToken` for the next steps.**

---

### **Step 2: Check Environment Variables**

```bash
# Replace YOUR_TOKEN with the accessToken from Step 1
curl -X GET http://206.189.141.60:3000/api/debug/env \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "NODE_ENV": "development",
    "PORT": "3000",
    "DB_HOST": "localhost",
    "DB_PORT": "5432",
    "DB_NAME": "restaurant_db",
    "DB_USER": "restaurant_user",
    "DB_PASSWORD": "***HIDDEN***",
    "JWT_SECRET": "***HIDDEN***",
    "JWT_EXPIRES_IN": "30d",
    "USE_MOCK_OTP": "true",
    "OTP_SERVICE_URL": "https://2factor.in/API/V1",
    "OTP_SERVICE_API_KEY": "***HIDDEN***",
    "OTP_SERVICE_TIMEOUT": "10000",
    "OTP_SMS_TEMPLATE_NAME": "NOT SET",
    "ALLOWED_ORIGINS": "http://localhost:3000,...",
    "ADMIN_PHONE": "+911234567890",
    "UPIGATEWAY_MERCHANT_KEY": "***HIDDEN***",
    "UPIGATEWAY_WEBHOOK_SECRET": "***HIDDEN***",
    "UPIGATEWAY_CALLBACK_URL": "https://test1.com",
    "UPIGATEWAY_TEST_MODE": "false",
    "PAYMENT_ENABLED": "true",
    "PAYMENT_CURRENCY": "INR",
    "PAYMENT_ORDER_EXPIRY": "900"
  }
}
```

---

### **Step 3: Check Database Status**

```bash
# Replace YOUR_TOKEN with the accessToken from Step 1
curl -X GET http://206.189.141.60:3000/api/debug/db \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connection": {
      "status": "connected",
      "host": "localhost",
      "port": 5432,
      "database": "restaurant_db",
      "username": "restaurant_user",
      "dialect": "postgres"
    },
    "stats": {
      "totalUsers": 5,
      "adminUsers": 1,
      "categories": 3,
      "items": 12,
      "orders": 8,
      "addresses": 4
    },
    "migrations": {
      "total": 17,
      "latest": "20251226093500-seed-admin-user.js",
      "all": [
        "20251223000001-create-enums-and-users.js",
        "20251223000002-create-addresses.js",
        ...
        "20251226093500-seed-admin-user.js"
      ]
    }
  }
}
```

---

### **Step 4: List All Users**

```bash
# Replace YOUR_TOKEN with the accessToken from Step 1
curl -X GET http://206.189.141.60:3000/api/debug/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "users": [
      {
        "id": 1,
        "phone": "+911234567890",
        "role": "admin",
        "name": "Admin User",
        "created_at": "2024-12-26T10:30:00.000Z",
        "updated_at": "2024-12-26T10:30:00.000Z"
      },
      {
        "id": 2,
        "phone": "+919876543210",
        "role": "client",
        "name": "John Doe",
        "created_at": "2024-12-26T11:00:00.000Z",
        "updated_at": "2024-12-26T11:00:00.000Z"
      }
    ]
  }
}
```

---

## Method 2: Direct SSH Access

If you have SSH access to the server, you can check directly:

### **Check Environment Variables**

```bash
# SSH into server
ssh user@206.189.141.60

# Navigate to app directory
cd /path/to/your/app

# View .env file
cat .env

# Or check specific variable
grep ADMIN_PHONE .env
grep USE_MOCK_OTP .env
grep DB_NAME .env
```

---

### **Check Database**

```bash
# Connect to PostgreSQL
psql -U restaurant_user -d restaurant_db

# List all tables
\dt

# Count users
SELECT COUNT(*) FROM users;

# List admin users
SELECT id, phone, role, name FROM users WHERE role = 'admin';

# Check migrations
SELECT * FROM "SequelizeMeta" ORDER BY name;

# Exit
\q
```

---

## Method 3: Using Postman or Browser

You can also use Postman or your browser's developer tools to call these endpoints.

**In Postman:**
1. Create a new request
2. Set method to POST
3. URL: `http://206.189.141.60:3000/api/auth/send-otp`
4. Body (JSON): `{"phone": "+911234567890"}`
5. Send request
6. Copy the `secret` from response
7. Create another request for verify-otp
8. Copy the `accessToken` from response
9. Use the token in Authorization header for debug endpoints

---

## Available Debug Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/debug/env` | GET | Admin | Get all environment variables |
| `/api/debug/db` | GET | Admin | Get database connection info and stats |
| `/api/debug/users` | GET | Admin | List all users in database |

---

## Security Notes

⚠️ **Important:**
- Debug endpoints are **admin-only** for security
- Sensitive values (passwords, API keys) are hidden in responses
- Never share your JWT token publicly
- Consider disabling debug endpoints in production

---

## Troubleshooting

### "Authentication required" error
- Make sure you're logged in as admin
- Check that your JWT token is valid and not expired
- Include the token in the `Authorization: Bearer YOUR_TOKEN` header

### "Access denied" error
- Only admin users can access debug endpoints
- Make sure your user has `role='admin'` in the database
- Check: `SELECT role FROM users WHERE phone = '+911234567890';`

### Database connection error
- Check if PostgreSQL is running: `systemctl status postgresql`
- Verify database credentials in `.env` file
- Test connection: `psql -U restaurant_user -d restaurant_db`

---

## Related Files

- **Debug Routes:** `app/src/routes/debug.js`
- **Main App:** `app/src/index.js`
- **Environment File:** `app/.env`

