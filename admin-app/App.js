import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { PaperProvider, IconButton, Icon } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { lightTheme } from './src/styles/theme';
import useAuthStore from './src/store/authStore';

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
import LocationsScreen from './src/screens/LocationsScreen';
import LocationFormScreen from './src/screens/LocationFormScreen';
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
          headerRight: () => {
            const { clearAuth } = useAuthStore.getState();
            return (
              <View style={{ flexDirection: 'row', marginRight: 8 }}>
                <IconButton
                  icon="bell"
                  iconColor="#fff"
                  onPress={() => screenNavigation.navigate('Notifications')}
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

function LocationsStack({ navigation }) {
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
        name="LocationsList"
        component={LocationsScreen}
        options={({ navigation: screenNavigation }) => ({
          title: 'Locations',
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
        name="LocationForm"
        component={LocationFormScreen}
        options={({ route }) => ({
          title: route.params?.locationId ? 'Edit Location' : 'Create Location',
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
        component={OrdersScreen}
        options={({ navigation }) => ({
          drawerLabel: 'Orders',
          drawerIcon: ({ color, size }) => (
            <Icon source="receipt" color={color} size={size} />
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: lightTheme.colors.primary,
          },
          headerTintColor: '#fff',
          headerTitle: 'Orders',
          headerRight: () => {
            const { clearAuth } = useAuthStore.getState();
            return (
              <View style={{ flexDirection: 'row', marginRight: 8 }}>
                <IconButton
                  icon="bell"
                  iconColor="#fff"
                  onPress={() => navigation.navigate('Main', { screen: 'Notifications' })}
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
        name="LocationsDrawer"
        component={LocationsStack}
        options={{
          drawerLabel: 'Locations',
          drawerIcon: ({ color, size }) => (
            <Icon source="map-marker" color={color} size={size} />
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

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={lightTheme}>
        <StatusBar style="auto" />
        <NavigationContainer>
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
