require('dotenv').config();

module.exports = {
  // SMS Lab API configuration
  url: process.env.OTP_SERVICE_URL || 'http://sms.smslab.in/api/sendhttp.php',
  authKey: process.env.OTP_SERVICE_AUTH_KEY || '',
  sender: process.env.OTP_SERVICE_SENDER || 'ARVIPT',
  route: parseInt(process.env.OTP_SERVICE_ROUTE) || 4,
  country: parseInt(process.env.OTP_SERVICE_COUNTRY) || 91,
  dltTemplateId: process.env.OTP_SERVICE_DLT_TEMPLATE_ID || '',
  timeout: parseInt(process.env.OTP_SERVICE_TIMEOUT) || 10000,
  otpExpiry: 300 // 5 minutes
};

