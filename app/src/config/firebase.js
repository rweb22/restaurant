'use strict';

// Load environment variables first
require('dotenv').config();

const admin = require('firebase-admin');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Initialize Firebase Admin SDK
 * 
 * This module initializes Firebase Admin SDK for sending push notifications
 * via Firebase Cloud Messaging (FCM).
 * 
 * Setup Instructions:
 * 1. Go to Firebase Console: https://console.firebase.google.com
 * 2. Select your project
 * 3. Go to Project Settings > Service Accounts
 * 4. Click "Generate New Private Key"
 * 5. Save the JSON file as: app/config/firebase-service-account.json
 * 6. Add to .env: FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
 * 7. Add to .gitignore: config/firebase-service-account.json
 */

let firebaseInitialized = false;

try {
  // Get service account path from environment variable
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath) {
    logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.warn('⚠️  FIREBASE NOT CONFIGURED');
    logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.warn('FIREBASE_SERVICE_ACCOUNT_PATH not set in .env');
    logger.warn('Push notifications will NOT work until Firebase is configured.');
    logger.warn('');
    logger.warn('Setup Instructions:');
    logger.warn('1. Create Firebase project at https://console.firebase.google.com');
    logger.warn('2. Download service account JSON');
    logger.warn('3. Save as: app/config/firebase-service-account.json');
    logger.warn('4. Add to .env: FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json');
    logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else {
    // Resolve absolute path
    const absolutePath = path.resolve(__dirname, '../../', serviceAccountPath);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(absolutePath)) {
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.error('❌ FIREBASE SERVICE ACCOUNT FILE NOT FOUND');
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.error(`Path: ${absolutePath}`);
      logger.error('Please download the service account JSON from Firebase Console');
      logger.error('and save it to the path specified in FIREBASE_SERVICE_ACCOUNT_PATH');
      logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      // Load service account
      const serviceAccount = require(absolutePath);

      // Initialize Firebase Admin
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      firebaseInitialized = true;

      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('🔥 FIREBASE ADMIN SDK INITIALIZED');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info(`Project ID: ${serviceAccount.project_id}`);
      logger.info(`Client Email: ${serviceAccount.client_email}`);
      logger.info('Push notifications via Firebase Cloud Messaging are ready!');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }
} catch (error) {
  logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.error('❌ FIREBASE INITIALIZATION ERROR');
  logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.error('Error:', error.message);
  logger.error('Stack:', error.stack);
  logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * Check if Firebase is initialized
 * @returns {boolean}
 */
const isInitialized = () => firebaseInitialized;

module.exports = {
  admin,
  isInitialized
};

