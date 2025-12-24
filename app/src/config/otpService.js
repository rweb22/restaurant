require('dotenv').config();

module.exports = {
  // 2Factor.in API configuration
  url: process.env.OTP_SERVICE_URL || 'https://2factor.in/API/V1',
  apiKey: process.env.OTP_SERVICE_API_KEY || '',
  timeout: parseInt(process.env.OTP_SERVICE_TIMEOUT) || 10000,
  otpExpiry: 300 // 5 minutes (2Factor.in default)
};

