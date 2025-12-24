# Restaurant Management System - Test Suite

This directory contains all tests for the Restaurant Management System.

## Directory Structure

```
tests/
├── unit/               # Unit tests for individual functions/services
├── integration/        # Integration tests for API endpoints
├── mocks/             # Mock implementations (e.g., mock OTP service)
├── fixtures/          # Test data and fixtures
└── README.md          # This file
```

## Running Tests

### Prerequisites

1. Install test dependencies:
```bash
npm install --save-dev jest supertest
```

2. Set up test environment variables:
```bash
cp .env.example .env.test
```

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

## Test Configuration

- **Test Framework**: Jest
- **HTTP Testing**: Supertest
- **Mock OTP Service**: Custom mock (no real 2Factor.in credentials needed)

## Mock OTP Service

For testing without 2Factor.in credentials, we use a mock OTP service that:
- Always generates OTP: `123456`
- Always returns session ID: `mock-session-id`
- Accepts any OTP `123456` as valid
- Rejects any other OTP

To enable mock mode, set in `.env.test`:
```
USE_MOCK_OTP=true
```

## Writing Tests

### Unit Test Example
```javascript
const authService = require('../app/src/services/authService');

describe('AuthService', () => {
  test('should generate valid JWT token', () => {
    const user = { id: 1, phone: '+911234567890', role: 'client' };
    const token = authService.generateToken(user);
    expect(token).toBeDefined();
  });
});
```

### Integration Test Example
```javascript
const request = require('supertest');
const app = require('../app/src/index');

describe('POST /api/auth/send-otp', () => {
  test('should send OTP successfully', async () => {
    const response = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '+911234567890' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Notes

- Tests run in isolated environment
- Database is reset before each test suite
- All tests use mock OTP service by default
- Real 2Factor.in credentials can be added later for production testing

