'use strict';

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Rate limiter for OTP send endpoint
 * Limits: 5 requests per 15 minutes per IP
 */
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per window
  message: 'Too many OTP requests from this IP. Please try again after 15 minutes.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for OTP send from IP: ${req.ip}`);
    return sendError(res, 429, 'Too many OTP requests. Please try again after 15 minutes.');
  },
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  }
});

/**
 * Rate limiter for OTP verify endpoint
 * Limits: 10 requests per 15 minutes per IP
 * More lenient than send because users might make mistakes
 */
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per window
  message: 'Too many OTP verification attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for OTP verify from IP: ${req.ip}`);
    return sendError(res, 429, 'Too many verification attempts. Please try again after 15 minutes.');
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`API rate limit exceeded from IP: ${req.ip}`);
    return sendError(res, 429, 'Too many requests. Please try again later.');
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

/**
 * Strict rate limiter for sensitive operations
 * Limits: 20 requests per 15 minutes per IP
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 requests per window
  message: 'Too many requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Strict rate limit exceeded from IP: ${req.ip}`);
    return sendError(res, 429, 'Too many requests. Please try again later.');
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

module.exports = {
  otpSendLimiter,
  otpVerifyLimiter,
  apiLimiter,
  strictLimiter
};

