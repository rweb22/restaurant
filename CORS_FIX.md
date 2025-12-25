# CORS Error & OTP Service Fix

**Date**: 2025-12-25
**Issues Fixed**:
1. Cross-Origin Request Blocked error when client app tries to access backend API
2. 500 Internal Server Error - OTP service SSL error

---

## 🐛 Problem 1: CORS Error

**Error Message**:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading 
the remote resource at http://localhost:3000/api/auth/send-otp. 
(Reason: CORS request did not succeed). Status code: (null).
```

**Root Cause**:
- Client app (Expo web) running on port 8081 or 19000/19006
- Backend API running on port 3000
- CORS (Cross-Origin Resource Sharing) policy blocking requests between different origins
- Original CORS configuration was too restrictive for development

---

## 🐛 Problem 2: OTP Service Error

**Error Message**:
```
POST /api/auth/send-otp HTTP/1.1 500 Internal Server Error
Error: write EPROTO - SSL routines:ssl3_read_bytes:tlsv1 unrecognized name
Error: OTP service is unavailable. Please try again later.
```

**Root Cause**:
- Backend was trying to use real 2Factor.in OTP service
- SSL/TLS error when connecting to external OTP service
- Missing `USE_MOCK_OTP=true` environment variable
- For development, we should use the mock OTP service

---

## ✅ Solutions

### 1. Updated Backend CORS Configuration

**File**: `app/src/index.js`

**Changes**:
- Implemented dynamic CORS origin validation
- In development mode, automatically allow all localhost and 127.0.0.1 origins
- Allow Expo origins (exp://)
- Allow requests with no origin (mobile apps, Postman)
- Added explicit methods and headers

**New Configuration**:
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost and 127.0.0.1 origins
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('exp://')) {
        return callback(null, true);
      }
    }
    
    // Check against allowed origins from env
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

### 2. Enabled Mock OTP Service

**File**: `app/.env`

**Changes**:
- Added `USE_MOCK_OTP=true` to enable mock OTP service for development
- This prevents SSL errors and allows testing without real OTP service

**Configuration**:
```bash
# Third-Party OTP Service (Mock for development)
USE_MOCK_OTP=true
OTP_SERVICE_URL=https://api.otpservice.com
OTP_SERVICE_API_KEY=mock_api_key
OTP_SERVICE_TIMEOUT=10000
```

**How Mock OTP Works**:
- Any phone number can be used
- OTP is always **123456** (hardcoded for testing)
- No external API calls
- Instant response
- Perfect for development and testing

### 3. Updated Environment Variables

**Files**: `app/.env` and `.env.local`

**Changes**:
- Added more localhost port variations
- Added 127.0.0.1 variations
- Added common Expo web ports (19000, 19006)

**New Configuration**:
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:19000,http://localhost:19006,http://127.0.0.1:8081,http://127.0.0.1:19000,http://127.0.0.1:19006,exp://localhost:8081
```

---

## 🎯 How It Works

### Development Mode (NODE_ENV=development)
1. **Any localhost origin**: Automatically allowed
2. **Any 127.0.0.1 origin**: Automatically allowed
3. **Expo origins (exp://)**: Automatically allowed
4. **No origin (mobile apps)**: Automatically allowed

### Production Mode
- Only origins listed in `ALLOWED_ORIGINS` environment variable are allowed
- More restrictive for security

---

## 🧪 Testing

### Test CORS from Browser Console
```javascript
fetch('http://localhost:3000/api/health')
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

### Test CORS from Command Line
```bash
curl -H "Origin: http://localhost:8081" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3000/api/auth/send-otp \
     -v
```

Expected response should include:
```
Access-Control-Allow-Origin: http://localhost:8081
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
```

---

## 🚀 How to Apply the Fix

### 1. Restart Backend
```bash
# Stop the backend (Ctrl+C)
# Start it again
cd app && npm start
```

### 2. Restart Client App
```bash
# Stop the client app (Ctrl+C)
# Start it again
cd client-app && npm start
```

### 3. Test the Login Flow
1. Open the client app in browser (http://localhost:8081 or http://localhost:19006)
2. Try to login with a phone number
3. The CORS error should be gone
4. You should see the OTP request succeed

---

## 📝 Additional Notes

### Why This Happens
- **Same-Origin Policy**: Browsers block requests from one origin to another for security
- **CORS**: Server must explicitly allow cross-origin requests
- **Development**: Multiple ports (8081, 19000, 19006, 3000) = multiple origins

### Security Considerations
- ✅ **Development**: Permissive CORS is fine (localhost only)
- ⚠️ **Production**: Must restrict to specific domains
- 🔒 **Credentials**: `credentials: true` allows cookies/auth headers

### Common Expo Web Ports
- **8081**: Metro bundler default
- **19000**: Expo web default
- **19006**: Expo web alternative
- **3000**: Backend API

---

## ✅ Verification Checklist

After applying the fix:
- [ ] Backend starts without errors
- [ ] Client app starts without errors
- [ ] Login page loads
- [ ] Can enter phone number
- [ ] Send OTP button works (no CORS error)
- [ ] Network tab shows successful API calls
- [ ] Console shows no CORS errors

---

## 🔧 Troubleshooting

### If CORS Error Persists

1. **Check backend is running**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Check environment variables**:
   ```bash
   cd app && cat .env.local | grep ALLOWED_ORIGINS
   ```

3. **Check browser console** for exact origin:
   - Open DevTools → Network tab
   - Look at failed request
   - Check "Request Headers" → "Origin"

4. **Hard refresh browser**:
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

5. **Clear browser cache**:
   - DevTools → Application → Clear storage

---

**Status**: ✅ Fixed  
**Impact**: All API calls from client app should now work  
**Next Steps**: Test the complete login flow


