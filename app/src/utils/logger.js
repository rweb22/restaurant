'use strict';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Get formatted timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Log info message
 * @param {string} message - Log message
 * @param {object} meta - Optional metadata
 */
const info = (message, meta = null) => {
  const timestamp = getTimestamp();
  console.log(
    `${colors.cyan}[INFO]${colors.reset} ${timestamp} - ${message}`,
    meta ? JSON.stringify(meta, null, 2) : ''
  );
};

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Error|object} error - Error object or metadata
 */
const error = (message, error = null) => {
  const timestamp = getTimestamp();
  console.error(
    `${colors.red}[ERROR]${colors.reset} ${timestamp} - ${message}`
  );
  
  if (error) {
    if (error instanceof Error) {
      console.error(`${colors.red}Stack:${colors.reset}`, error.stack);
    } else {
      console.error(JSON.stringify(error, null, 2));
    }
  }
};

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {object} meta - Optional metadata
 */
const warn = (message, meta = null) => {
  const timestamp = getTimestamp();
  console.warn(
    `${colors.yellow}[WARN]${colors.reset} ${timestamp} - ${message}`,
    meta ? JSON.stringify(meta, null, 2) : ''
  );
};

/**
 * Log debug message (only in development)
 * @param {string} message - Debug message
 * @param {object} meta - Optional metadata
 */
const debug = (message, meta = null) => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = getTimestamp();
    console.log(
      `${colors.magenta}[DEBUG]${colors.reset} ${timestamp} - ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ''
    );
  }
};

/**
 * Log success message
 * @param {string} message - Success message
 * @param {object} meta - Optional metadata
 */
const success = (message, meta = null) => {
  const timestamp = getTimestamp();
  console.log(
    `${colors.green}[SUCCESS]${colors.reset} ${timestamp} - ${message}`,
    meta ? JSON.stringify(meta, null, 2) : ''
  );
};

/**
 * Log HTTP request
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} statusCode - Response status code
 * @param {number} duration - Request duration in ms
 */
const http = (method, url, statusCode, duration) => {
  const timestamp = getTimestamp();
  const statusColor = statusCode >= 500 ? colors.red :
                      statusCode >= 400 ? colors.yellow :
                      statusCode >= 300 ? colors.cyan :
                      colors.green;
  
  console.log(
    `${colors.blue}[HTTP]${colors.reset} ${timestamp} - ${method} ${url} ${statusColor}${statusCode}${colors.reset} ${duration}ms`
  );
};

module.exports = {
  info,
  error,
  warn,
  debug,
  success,
  http
};

