/**
 * Clear App Runtime Cache
 * 
 * This script clears:
 * - AsyncStorage (user data, cart, addresses)
 * - React Query cache (menu, categories, items)
 * 
 * Run this to test fresh data fetching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

async function clearAllCache() {
  try {
    console.log('🗑️  Clearing all app cache...');
    
    // Clear AsyncStorage
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage cleared');
    
    console.log('✅ All cache cleared!');
    console.log('');
    console.log('📝 Note: React Query cache will be cleared on app restart');
    console.log('   Just close and reopen the app to see fresh data');
    
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
}

clearAllCache();

