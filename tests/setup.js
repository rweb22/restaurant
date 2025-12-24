/**
 * Jest Setup File
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.USE_MOCK_OTP = 'true';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only-do-not-use-in-production';
process.env.JWT_EXPIRES_IN = '30d';
process.env.OTP_SERVICE_URL = 'https://2factor.in/API/V1';
process.env.OTP_SERVICE_API_KEY = 'mock-api-key';
process.env.OTP_SERVICE_TIMEOUT = '10000';

// Database config for tests
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'restaurant_test';
process.env.DB_USER = 'restaurant_user';
process.env.DB_PASSWORD = 'restaurant_password';

// Suppress console logs during tests (optional)
// Uncomment to reduce noise in test output
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

console.log('🧪 Test environment initialized');
console.log('📝 Using mock OTP service');

