'use strict';

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { otpSendLimiter, otpVerifyLimiter } = require('../middleware/rateLimiter');
const {
  SendOtpDto,
  VerifyOtpDto,
  UpdateProfileDto
} = require('../dtos/auth.dto');

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to phone number
 * @access  Public
 * @limit   5 requests per 15 minutes
 */
router.post(
  '/send-otp',
  otpSendLimiter,
  validateBody(SendOtpDto),
  authController.sendOtp
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and get JWT token
 * @access  Public
 * @limit   10 requests per 15 minutes
 */
router.post(
  '/verify-otp',
  otpVerifyLimiter,
  validateBody(VerifyOtpDto),
  authController.verifyOtp
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token (extend expiry)
 * @access  Private (requires valid token)
 */
router.post(
  '/refresh',
  authenticate,
  authController.refresh
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private (requires authentication)
 */
router.get(
  '/me',
  authenticate,
  authController.getMe
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (name)
 * @access  Private (requires authentication)
 */
router.put(
  '/profile',
  authenticate,
  validateBody(UpdateProfileDto),
  authController.updateProfile
);

module.exports = router;

