import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useDeliveryStore from '../store/deliveryStore';
import { colors, spacing } from '../styles/theme';

const DevUtilsScreen = ({ navigation }) => {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();
  const { clearDeliveryInfo } = useDeliveryStore();

  const clearAllCache = async () => {
    try {
      // Clear React Query cache
      queryClient.clear();
      
      // Clear AsyncStorage
      await AsyncStorage.clear();
      
      // Clear Zustand stores
      clearCart();
      clearDeliveryInfo();
      
      Alert.alert(
        '✅ Cache Cleared',
        'All app cache has been cleared!\n\n' +
        'React Query cache, AsyncStorage, and stores have been reset.\n\n' +
        'The app will now fetch fresh data from the API.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('❌ Error', `Failed to clear cache: ${error.message}`);
    }
  };

  const clearReactQueryCache = () => {
    queryClient.clear();
    Alert.alert('✅ Done', 'React Query cache cleared!\n\nMenu data will be refetched.');
  };

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('✅ Done', 'AsyncStorage cleared!\n\nUser data, cart, and addresses removed.');
    } catch (error) {
      Alert.alert('❌ Error', `Failed to clear AsyncStorage: ${error.message}`);
    }
  };

  const clearStores = () => {
    clearCart();
    clearDeliveryInfo();
    Alert.alert('✅ Done', 'Zustand stores cleared!\n\nCart and delivery info reset.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🛠️ Developer Utils</Text>
        <Text style={styles.subtitle}>Clear app cache for testing</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🗑️ Clear All Cache</Text>
            <Text style={styles.cardDescription}>
              Clears React Query cache, AsyncStorage, and Zustand stores.
              Use this to test fresh data fetching.
            </Text>
            <Button
              mode="contained"
              onPress={clearAllCache}
              style={styles.button}
              buttonColor={colors.error[500]}
            >
              Clear All Cache
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📡 Clear React Query Cache</Text>
            <Text style={styles.cardDescription}>
              Clears menu, categories, items, and other API cache.
            </Text>
            <Button
              mode="outlined"
              onPress={clearReactQueryCache}
              style={styles.button}
            >
              Clear Query Cache
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>💾 Clear AsyncStorage</Text>
            <Text style={styles.cardDescription}>
              Clears user data, cart, addresses, and auth tokens.
            </Text>
            <Button
              mode="outlined"
              onPress={clearAsyncStorage}
              style={styles.button}
            >
              Clear AsyncStorage
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🏪 Clear Stores</Text>
            <Text style={styles.cardDescription}>
              Clears cart and delivery info from Zustand stores.
            </Text>
            <Button
              mode="outlined"
              onPress={clearStores}
              style={styles.button}
            >
              Clear Stores
            </Button>
          </Card.Content>
        </Card>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          ← Back to Home
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
  backButton: {
    marginTop: spacing.lg,
  },
});

export default DevUtilsScreen;

