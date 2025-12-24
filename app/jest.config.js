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

  // Coverage thresholds (relaxed for now)
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30
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

