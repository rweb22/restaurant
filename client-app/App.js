import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, ActivityIndicator, Badge } from 'react-native-paper';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-paper/src/components/Icon';
import ConfirmDialog from './src/components/ConfirmDialog';

// Stores
import useAuthStore from './src/store/authStore';
import useCartStore from './src/store/cartStore';
import useDeliveryStore from './src/store/deliveryStore';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import VerifyOTPScreen from './src/screens/VerifyOTPScreen';
import EnterNameScreen from './src/screens/EnterNameScreen';
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
const Tab = createBottomTabNavigator();
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

// Bottom Tab Navigator for main app screens
function MainTabs() {
  const { getItemCount, clearCart } = useCartStore();
  const { logout } = useAuthStore();
  const { clearDeliveryInfo } = useDeliveryStore();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  // You can add a query here to fetch unread notifications count
  // For now, we'll use a placeholder

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    clearCart();
    clearDeliveryInfo();
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'OrdersTab') {
            iconName = 'receipt-text';
          } else if (route.name === 'CartTab') {
            iconName = 'cart';
          } else if (route.name === 'NotificationsTab') {
            iconName = 'bell';
          } else if (route.name === 'AddressesTab') {
            iconName = 'map-marker';
          } else if (route.name === 'LogoutTab') {
            iconName = 'logout';
          }

          return <Icon source={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Menu',
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarBadge: getItemCount() > 0 ? getItemCount() : null,
          tabBarBadgeStyle: {
            backgroundColor: '#FF9800',
            color: '#fff',
            fontSize: 10,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            lineHeight: 18,
          },
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Notifications',
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null,
          tabBarBadgeStyle: {
            backgroundColor: '#FF9800',
            color: '#fff',
            fontSize: 10,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            lineHeight: 18,
          },
        }}
      />
      <Tab.Screen
        name="AddressesTab"
        component={AddressesScreen}
        options={{
          tabBarLabel: 'Addresses',
        }}
      />
      <Tab.Screen
        name="LogoutTab"
        component={View}
        options={({ route }) => ({
          tabBarLabel: 'Logout',
          tabBarButton: (props) => {
            const isFocused = props.accessibilityState?.selected;
            const color = isFocused ? '#FF9800' : '#9E9E9E';

            return (
              <TouchableOpacity
                {...props}
                style={[
                  props.style,
                  {
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
                ]}
                onPress={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogout();
                }}
              >
                <Icon source="logout" size={28} color={color} />
              </TouchableOpacity>
            );
          },
        })}
      />
      </Tab.Navigator>
      <ConfirmDialog
        visible={showLogoutDialog}
        onDismiss={cancelLogout}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout?"
      />
    </>
  );
}

export default function App() {
  const { isAuthenticated, isLoading, loadAuth, user } = useAuthStore();
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
            ) : !user?.name ? (
              // Show Enter Name screen if authenticated but name not set
              <Stack.Screen name="EnterName" component={EnterNameScreen} />
            ) : (
              <>
                {/* Main Tab Navigator */}
                <Stack.Screen name="Main" component={MainTabs} />

                {/* Modal/Detail Screens (outside tabs) */}
                <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
                <Stack.Screen name="AddAddress" component={AddAddressScreen} />
                <Stack.Screen name="EditAddress" component={EditAddressScreen} />
                <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
                <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
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

