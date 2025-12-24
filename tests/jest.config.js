module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Root directory for tests
  rootDir: '..',

  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js'
  ],

  // Coverage directory
  coverageDirectory: 'tests/coverage',

  // Files to collect coverage from
  collectCoverageFrom: [
    'app/src/**/*.js',
    '!app/src/index.js',
    '!app/src/migrations/**',
    '!app/src/seeders/**'
  ],

  // Coverage thresholds
  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Module paths
  modulePaths: ['<rootDir>'],

  // Verbose output
  verbose: true,

  // Timeout for tests (10 seconds)
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true
};

