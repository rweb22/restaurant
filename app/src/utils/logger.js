'use strict';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] [${level.toUpperCase()}] ${message}\n${stack}`
      : `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  })
);

// Console format with colors (for DEBUG logs only)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

// Create Winston logger
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Daily rotating file for all logs
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
      level: 'info'
    }),
    // Separate file for errors
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d', // Keep error logs for 30 days
      level: 'error'
    })
  ]
});

// Add console transport only for DEBUG logs in development
if (process.env.NODE_ENV === 'development') {
  winstonLogger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

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
  const fullMessage = meta ? `${message} ${JSON.stringify(meta)}` : message;
  winstonLogger.info(fullMessage);
};

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Error|object} error - Error object or metadata
 */
const error = (message, error = null) => {
  if (error instanceof Error) {
    winstonLogger.error(message, { stack: error.stack });
  } else if (error) {
    winstonLogger.error(`${message} ${JSON.stringify(error)}`);
  } else {
    winstonLogger.error(message);
  }
};

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {object} meta - Optional metadata
 */
const warn = (message, meta = null) => {
  const fullMessage = meta ? `${message} ${JSON.stringify(meta)}` : message;
  winstonLogger.warn(fullMessage);
};

/**
 * Log debug message (only shown in console during development)
 * @param {string} message - Debug message
 * @param {object} meta - Optional metadata
 */
const debug = (message, meta = null) => {
  const timestamp = getTimestamp();
  const fullMessage = meta ? `${message} ${JSON.stringify(meta, null, 2)}` : message;

  // Debug logs ONLY go to console in development, not to files
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `${colors.magenta}[DEBUG]${colors.reset} ${timestamp} - ${fullMessage}`
    );
  }
};

/**
 * Log success message
 * @param {string} message - Success message
 * @param {object} meta - Optional metadata
 */
const success = (message, meta = null) => {
  const fullMessage = meta ? `${message} ${JSON.stringify(meta)}` : message;
  winstonLogger.info(`✅ ${fullMessage}`);
};

/**
 * Log HTTP request
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} statusCode - Response status code
 * @param {number} duration - Request duration in ms
 */
const http = (method, url, statusCode, duration) => {
  winstonLogger.info(`HTTP ${method} ${url} ${statusCode} ${duration}ms`);
};

module.exports = {
  info,
  error,
  warn,
  debug,
  success,
  http
};

