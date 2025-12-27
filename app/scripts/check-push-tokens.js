#!/usr/bin/env node
'use strict';

/**
 * Script to check push tokens in the database
 * Usage: node app/scripts/check-push-tokens.js
 */

const { User } = require('../src/models');

async function checkPushTokens() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CHECKING PUSH TOKENS IN DATABASE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const users = await User.findAll({
      attributes: ['id', 'name', 'phone', 'role', 'pushToken', 'createdAt', 'updatedAt'],
      order: [['id', 'ASC']]
    });

    console.log(`\n📋 Total users: ${users.length}\n`);

    users.forEach(user => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`👤 User #${user.id}: ${user.name || 'No name'} (${user.phone})`);
      console.log(`📱 Role: ${user.role}`);
      console.log(`🎫 Push Token: ${user.pushToken ? '✅ ' + user.pushToken : '❌ Not registered'}`);
      console.log(`📅 Created: ${user.createdAt}`);
      console.log(`📅 Updated: ${user.updatedAt}`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 SUMMARY:');
    const withTokens = users.filter(u => u.pushToken).length;
    const withoutTokens = users.filter(u => !u.pushToken).length;
    console.log(`✅ Users with push tokens: ${withTokens}`);
    console.log(`❌ Users without push tokens: ${withoutTokens}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkPushTokens();

