import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, ActivityIndicator } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

// Stores
import useAuthStore from './src/store/authStore';
import useCartStore from './src/store/cartStore';
import useDeliveryStore from './src/store/deliveryStore';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import VerifyOTPScreen from './src/screens/VerifyOTPScreen';
import HomeScreen from './src/screens/HomeScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import CartScreen from './src/screens/CartScreen';
import AddAddressScreen from './src/screens/AddAddressScreen';
import AddressesScreen from './src/screens/AddressesScreen';
import EditAddressScreen from './src/screens/EditAddressScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

// Custom theme based on our design
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#dc2626',
    primaryContainer: '#fee2e2',
    secondary: '#57534e',
    secondaryContainer: '#f5f5f4',
    background: '#fafaf9',
    surface: '#ffffff',
    error: '#ef4444',
  },
};

export default function App() {
  const { isAuthenticated, isLoading, loadAuth } = useAuthStore();
  const loadCart = useCartStore((state) => state.loadCart);
  const loadDeliveryInfo = useDeliveryStore((state) => state.loadDeliveryInfo);

  useEffect(() => {
    console.log('[App] Initializing app...');
    loadAuth();
    loadCart();
    loadDeliveryInfo();
  }, []);

  if (isLoading) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
                <Stack.Screen name="Cart" component={CartScreen} />
                <Stack.Screen name="AddAddress" component={AddAddressScreen} />
                <Stack.Screen name="Addresses" component={AddressesScreen} />
                <Stack.Screen name="EditAddress" component={EditAddressScreen} />
                <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
                <Stack.Screen name="Orders" component={OrdersScreen} />
                <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

