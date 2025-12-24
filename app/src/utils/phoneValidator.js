'use strict';

/**
 * Validate phone number format (international format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // International format: +[country code][number]
  // E.g., +911234567890, +11234567890
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Format phone number for 2Factor.in API
 * 2Factor.in expects: 91XXXXXXXXXX (without + for Indian numbers)
 * @param {string} phone - Phone number in international format
 * @returns {string} - Formatted phone number
 */
const formatPhoneFor2Factor = (phone) => {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  // Remove + if present
  let formatted = phone.replace(/^\+/, '');
  
  // Ensure it starts with country code
  if (!formatted.match(/^[1-9]/)) {
    throw new Error('Phone number must include country code');
  }

  return formatted;
};

/**
 * Normalize phone number to international format with +
 * @param {string} phone - Phone number
 * @returns {string} - Normalized phone number with +
 */
const normalizePhone = (phone) => {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  // If already has +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }

  // Add + prefix
  return `+${phone}`;
};

/**
 * Check if phone number is Indian
 * @param {string} phone - Phone number
 * @returns {boolean} - True if Indian number
 */
const isIndianNumber = (phone) => {
  if (!phone) {
    return false;
  }

  const normalized = phone.replace(/^\+/, '');
  return normalized.startsWith('91');
};

/**
 * Extract country code from phone number
 * @param {string} phone - Phone number
 * @returns {string|null} - Country code or null
 */
const getCountryCode = (phone) => {
  if (!phone) {
    return null;
  }

  const normalized = phone.replace(/^\+/, '');
  
  // Common country codes (1-3 digits)
  const match = normalized.match(/^(\d{1,3})/);
  return match ? match[1] : null;
};

module.exports = {
  isValidPhone,
  formatPhoneFor2Factor,
  normalizePhone,
  isIndianNumber,
  getCountryCode
};

