import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { PaperProvider, IconButton, Icon, Badge } from 'react-native-paper';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { lightTheme } from './src/styles/theme';
import useAuthStore from './src/store/authStore';
import pushNotificationService from './src/services/pushNotificationService';
import notificationService from './src/services/notificationService';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import VerifyOTPScreen from './src/screens/VerifyOTPScreen';
import EnterNameScreen from './src/screens/EnterNameScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import CategoryFormScreen from './src/screens/CategoryFormScreen';
import ItemsScreen from './src/screens/ItemsScreen';
import ItemFormScreen from './src/screens/ItemFormScreen';
import AddOnsScreen from './src/screens/AddOnsScreen';
import AddOnFormScreen from './src/screens/AddOnFormScreen';
import UsersScreen from './src/screens/UsersScreen';
import UserFormScreen from './src/screens/UserFormScreen';
import OffersScreen from './src/screens/OffersScreen';
import OfferFormScreen from './src/screens/OfferFormScreen';
import ItemSizesScreen from './src/screens/ItemSizesScreen';
import ItemSizeFormScreen from './src/screens/ItemSizeFormScreen';
import CategoryAddOnsScreen from './src/screens/CategoryAddOnsScreen';
import CategoryAddOnFormScreen from './src/screens/CategoryAddOnFormScreen';
import ItemAddOnsScreen from './src/screens/ItemAddOnsScreen';
import ItemAddOnFormScreen from './src/screens/ItemAddOnFormScreen';
import MenuManagementScreen from './src/screens/MenuManagementScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import TransactionDetailsScreen from './src/screens/TransactionDetailsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Components
import CustomDrawerContent from './src/components/CustomDrawerContent';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Dashboard Header Right Component with Notification Badge
function DashboardHeaderRight({ navigation }) {
  const { clearAuth } = useAuthStore.getState();

  // Fetch unread notification count
  const { data: unreadCountData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = unreadCountData?.data?.count || 0;

  return (
    <View style={{ flexDirection: 'row', marginRight: 8 }}>
      <View style={{ position: 'relative' }}>
        <IconButton
          icon="bell"
          iconColor="#fff"
          onPress={() => navigation.navigate('Notifications')}
        />
        {unreadCount > 0 && (
          <Badge
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#FF9800',
            }}
            size={18}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </View>
      <IconButton
        icon="logout"
        iconColor="#fff"
        onPress={clearAuth}
      />
    </View>
  );
}

function MainStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={({ navigation: screenNavigation }) => ({
          title: 'Dashboard',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
          headerRight: () => <DashboardHeaderRight navigation={screenNavigation} />,
        })}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ title: 'Order Details' }}
      />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <Stack.Screen
        name="Items"
        component={ItemsScreen}
        options={{ title: 'Items' }}
      />
      <Stack.Screen
        name="ItemForm"
        component={ItemFormScreen}
        options={({ route }) => ({
          title: route.params?.itemId ? 'Edit Item' : 'Create Item',
        })}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}

function MenuManagementStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MenuManagementList"
        component={MenuManagementScreen}
        options={({ navigation: screenNavigation }) => ({
          title: 'Menu Management',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
          headerRight: () => {
            const { clearAuth } = useAuthStore.getState();
            return (
              <View style={{ flexDirection: 'row', marginRight: 8 }}>
                <IconButton
                  icon="bell"
                  iconColor="#fff"
                  onPress={() => {
                    const parent = screenNavigation.getParent();
                    if (parent) {
                      parent.navigate('Main', { screen: 'Notifications' });
                    }
                  }}
                />
                <IconButton
                  icon="logout"
                  iconColor="#fff"
                  onPress={clearAuth}
                />
              </View>
            );
          },
        })}
      />
      <Stack.Screen
        name="CategoryForm"
        component={CategoryFormScreen}
        options={({ route }) => ({
          title: route.params?.categoryId ? 'Edit Category' : 'Create Category',
        })}
      />
      <Stack.Screen
        name="ItemForm"
        component={ItemFormScreen}
        options={({ route }) => ({
          title: route.params?.itemId ? 'Edit Item' : 'Create Item',
        })}
      />
      <Stack.Screen
        name="ItemSizeForm"
        component={ItemSizeFormScreen}
        options={({ route }) => ({
          title: route.params?.sizeId ? 'Edit Size' : 'Create Size',
        })}
      />
      <Stack.Screen
        name="CategoryAddOnForm"
        component={CategoryAddOnFormScreen}
        options={{
          title: 'Manage Category Add-ons',
        }}
      />
      <Stack.Screen
        name="ItemAddOnForm"
        component={ItemAddOnFormScreen}
        options={{
          title: 'Manage Item Add-ons',
        }}
      />
    </Stack.Navigator>
  );
}

function CategoriesStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="CategoriesList"
        component={CategoriesScreen}
        options={{
          title: 'Categories',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="CategoryForm"
        component={CategoryFormScreen}
        options={({ route }) => ({
          title: route.params?.categoryId ? 'Edit Category' : 'Create Category',
        })}
      />
    </Stack.Navigator>
  );
}

function OrdersStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="OrdersList"
        component={OrdersScreen}
        options={({ navigation: screenNavigation }) => ({
          title: 'Orders',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
          headerRight: () => {
            const { clearAuth } = useAuthStore.getState();
            return (
              <View style={{ flexDirection: 'row', marginRight: 8 }}>
                <IconButton
                  icon="bell"
                  iconColor="#fff"
                  onPress={() => {
                    const parent = screenNavigation.getParent();
                    if (parent) {
                      parent.navigate('Main', { screen: 'Notifications' });
                    }
                  }}
                />
                <IconButton
                  icon="logout"
                  iconColor="#fff"
                  onPress={clearAuth}
                />
              </View>
            );
          },
        })}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ title: 'Order Details' }}
      />
    </Stack.Navigator>
  );
}

function ItemsStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ItemsList"
        component={ItemsScreen}
        options={{
          title: 'Items',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="ItemForm"
        component={ItemFormScreen}
        options={({ route }) => ({
          title: route.params?.itemId ? 'Edit Item' : 'Create Item',
        })}
      />
    </Stack.Navigator>
  );
}

function AddOnsStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AddOnsList"
        component={AddOnsScreen}
        options={({ navigation: screenNavigation }) => ({
          title: 'Add-ons',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
          headerRight: () => {
            const { clearAuth } = useAuthStore.getState();
            return (
              <View style={{ flexDirection: 'row', marginRight: 8 }}>
                <IconButton
                  icon="bell"
                  iconColor="#fff"
                  onPress={() => {
                    const parent = screenNavigation.getParent();
                    if (parent) {
                      parent.navigate('Main', { screen: 'Notifications' });
                    }
                  }}
                />
                <IconButton
                  icon="logout"
                  iconColor="#fff"
                  onPress={clearAuth}
                />
              </View>
            );
          },
        })}
      />
      <Stack.Screen
        name="AddOnForm"
        component={AddOnFormScreen}
        options={({ route }) => ({
          title: route.params?.addOnId ? 'Edit Add-on' : 'Create Add-on',
        })}
      />
    </Stack.Navigator>
  );
}

function UsersStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="UsersList"
        component={UsersScreen}
        options={({ navigation: screenNavigation }) => ({
          title: 'Users',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
          headerRight: () => {
            const { clearAuth } = useAuthStore.getState();
            return (
              <View style={{ flexDirection: 'row', marginRight: 8 }}>
                <IconButton
                  icon="bell"
                  iconColor="#fff"
                  onPress={() => {
                    const parent = screenNavigation.getParent();
                    if (parent) {
                      parent.navigate('Main', { screen: 'Notifications' });
                    }
                  }}
                />
                <IconButton
                  icon="logout"
                  iconColor="#fff"
                  onPress={clearAuth}
                />
              </View>
            );
          },
        })}
      />
      <Stack.Screen
        name="UserForm"
        component={UserFormScreen}
        options={{
          title: 'Edit User',
        }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
      />
    </Stack.Navigator>
  );
}

function OffersStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="OffersList"
        component={OffersScreen}
        options={({ navigation: screenNavigation }) => ({
          title: 'Offers',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
          headerRight: () => {
            const { clearAuth } = useAuthStore.getState();
            return (
              <View style={{ flexDirection: 'row', marginRight: 8 }}>
                <IconButton
                  icon="bell"
                  iconColor="#fff"
                  onPress={() => {
                    const parent = screenNavigation.getParent();
                    if (parent) {
                      parent.navigate('Main', { screen: 'Notifications' });
                    }
                  }}
                />
                <IconButton
                  icon="logout"
                  iconColor="#fff"
                  onPress={clearAuth}
                />
              </View>
            );
          },
        })}
      />
      <Stack.Screen
        name="OfferForm"
        component={OfferFormScreen}
        options={({ route }) => ({
          title: route.params?.offerId ? 'Edit Offer' : 'Create Offer',
        })}
      />
    </Stack.Navigator>
  );
}

function ItemSizesStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ItemSizesList"
        component={ItemSizesScreen}
        options={{
          title: 'Item Sizes',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="ItemSizeForm"
        component={ItemSizeFormScreen}
        options={({ route }) => ({
          title: route.params?.sizeId ? 'Edit Size' : 'Add Size',
        })}
      />
    </Stack.Navigator>
  );
}

function CategoryAddOnsStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="CategoryAddOnsList"
        component={CategoryAddOnsScreen}
        options={{
          title: 'Category Add-ons',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="CategoryAddOnForm"
        component={CategoryAddOnFormScreen}
        options={{ title: 'Link Add-on to Category' }}
      />
    </Stack.Navigator>
  );
}

function ItemAddOnsStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ItemAddOnsList"
        component={ItemAddOnsScreen}
        options={{
          title: 'Item Add-ons',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="ItemAddOnForm"
        component={ItemAddOnFormScreen}
        options={{ title: 'Link Add-on to Item' }}
      />
    </Stack.Navigator>
  );
}

function TransactionsStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: lightTheme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="TransactionsList"
        component={TransactionsScreen}
        options={({ navigation: screenNavigation }) => ({
          title: 'Transactions',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor="#fff"
              onPress={() => navigation.openDrawer()}
            />
          ),
          headerRight: () => {
            const { clearAuth } = useAuthStore.getState();
            return (
              <View style={{ flexDirection: 'row', marginRight: 8 }}>
                <IconButton
                  icon="bell"
                  iconColor="#fff"
                  onPress={() => {
                    const parent = screenNavigation.getParent();
                    if (parent) {
                      parent.navigate('Main', { screen: 'Notifications' });
                    }
                  }}
                />
                <IconButton
                  icon="logout"
                  iconColor="#fff"
                  onPress={clearAuth}
                />
              </View>
            );
          },
        })}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ title: 'Transaction Details' }}
      />
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Main"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: lightTheme.colors.primary,
      }}
    >
      <Drawer.Screen
        name="Main"
        component={MainStack}
        options={{
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Icon source="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="OrdersDrawer"
        component={OrdersStack}
        options={{
          drawerLabel: 'Orders',
          drawerIcon: ({ color, size }) => (
            <Icon source="receipt" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="MenuManagementDrawer"
        component={MenuManagementStack}
        options={{
          drawerLabel: 'Menu Management',
          drawerIcon: ({ color, size }) => (
            <Icon source="silverware-fork-knife" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="AddOnsDrawer"
        component={AddOnsStack}
        options={{
          drawerLabel: 'Add-ons',
          drawerIcon: ({ color, size }) => (
            <Icon source="puzzle" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="UsersDrawer"
        component={UsersStack}
        options={{
          drawerLabel: 'Users',
          drawerIcon: ({ color, size }) => (
            <Icon source="account-group" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="SettingsDrawer"
        component={SettingsStack}
        options={{
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Icon source="cog" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="OffersDrawer"
        component={OffersStack}
        options={{
          drawerLabel: 'Offers',
          drawerIcon: ({ color, size }) => (
            <Icon source="tag-multiple" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="TransactionsDrawer"
        component={TransactionsStack}
        options={{
          drawerLabel: 'Transactions',
          drawerIcon: ({ color, size }) => (
            <Icon source="cash-multiple" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
    </Stack.Navigator>
  );
}

// EnterName Navigator - shown when authenticated but name not set
function EnterNameNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="EnterName" component={EnterNameScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, isLoading, initialize, user } = useAuthStore();
  const navigationRef = useRef();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    initialize();
  }, []);

  // Register for push notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[App] User authenticated, registering for push notifications...');
      pushNotificationService.registerForPushNotifications(user.id);
    }
  }, [isAuthenticated, user]);

  // Setup push notification listeners
  useEffect(() => {
    // Listener for notifications received while app is in foreground
    notificationListener.current = pushNotificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('[App] Notification received:', notification);
      }
    );

    // Listener for when user taps on notification
    responseListener.current = pushNotificationService.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[App] Notification tapped:', response);
        const data = response.data;

        // Navigate based on notification data
        if (data?.orderId && navigationRef.current) {
          navigationRef.current.navigate('OrderDetails', { orderId: data.orderId });
        }
      }
    );

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current && typeof notificationListener.current === 'function') {
        notificationListener.current();
      }
      if (responseListener.current && typeof responseListener.current === 'function') {
        responseListener.current();
      }
    };
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={lightTheme}>
        <StatusBar style="auto" />
        <NavigationContainer ref={navigationRef}>
          {!isAuthenticated ? (
            <AuthNavigator />
          ) : !user?.name ? (
            <EnterNameNavigator />
          ) : (
            <DrawerNavigator />
          )}
        </NavigationContainer>
      </PaperProvider>
    </QueryClientProvider>
  );
}
