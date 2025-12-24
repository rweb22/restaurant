# Quick Start Guide - Running Tests

This guide will help you run the authentication tests without needing 2Factor.in credentials.

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd app
npm install
```

### Step 2: Run Tests
```bash
# From the app directory
npm test

# OR use the test runner script from project root
cd ..
./tests/run-tests.sh
```

### Step 3: View Results
Tests will run and show results in the terminal with coverage report.

---

## 📋 Test Commands

### Run All Tests
```bash
cd app
npm test
```

### Run Only Unit Tests
```bash
npm run test:unit
```

### Run Only Integration Tests
```bash
npm run test:integration
```

### Run Tests in Watch Mode (auto-rerun on file changes)
```bash
npm run test:watch
```

---

## 🎭 Mock OTP Service

**The tests use a MOCK OTP service** - no real 2Factor.in credentials needed!

### How it works:
- **Mock OTP**: Always `123456`
- **Mock Session**: Auto-generated unique session IDs
- **Verification**: Accepts `123456` as valid, rejects anything else

### Test Flow Example:
```javascript
// 1. Send OTP (mock)
POST /api/auth/send-otp
{ "phone": "+911234567890" }

// Response:
{ 
  "secret": "mock-session-abc123",
  "expiresIn": 300 
}

// 2. Verify OTP (use 123456)
POST /api/auth/verify-otp
{
  "phone": "+911234567890",
  "otp": "123456",
  "secret": "mock-session-abc123"
}

// Response:
{
  "accessToken": "eyJhbGc...",
  "user": { ... }
}
```

---

## 📊 Expected Test Results

### Unit Tests (2 files)
- ✅ `authService.test.js` - JWT generation, verification, token management
- ✅ `mockOtpService.test.js` - Mock OTP service functionality

### Integration Tests (1 file)
- ✅ `authEndpoints.test.js` - Complete auth flow (send OTP → verify → get user)

### Total Tests: ~30 tests

---

## 🔧 Adding Real 2Factor.in Credentials (Later)

When you're ready to test with real 2Factor.in:

1. Get API key from https://2factor.in
2. Update `.env`:
   ```bash
   OTP_SERVICE_API_KEY=your_real_api_key_here
   USE_MOCK_OTP=false
   ```
3. Run tests - they'll use real OTP service

---

## 🐛 Troubleshooting

### Tests fail with "Cannot find module"
```bash
cd app
npm install
```

### Tests timeout
Increase timeout in `tests/jest.config.js`:
```javascript
testTimeout: 30000  // 30 seconds
```

### Want to see detailed logs
Edit `tests/setup.js` and comment out the console suppression

---

## 📁 Test File Structure

```
tests/
├── unit/
│   ├── authService.test.js       # JWT & auth logic tests
│   └── mockOtpService.test.js    # Mock OTP tests
├── integration/
│   └── authEndpoints.test.js     # API endpoint tests
├── mocks/
│   └── mockOtpService.js         # Mock OTP implementation
├── fixtures/
│   └── testHelpers.js            # Test utilities
├── jest.config.js                # Jest configuration
├── setup.js                      # Test environment setup
└── QUICKSTART.md                 # This file
```

---

## ✅ Next Steps After Tests Pass

1. ✅ Tests pass → Authentication system works!
2. 🚀 Start the app: `docker-compose up`
3. 🗄️ Run migrations: `docker-compose exec app npm run db:migrate`
4. 🧪 Test manually with Postman/curl
5. 📝 Move to next table (Category or AddOn)

---

**Happy Testing! 🎉**

