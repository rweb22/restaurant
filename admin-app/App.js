import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { PaperProvider, IconButton } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { lightTheme } from './src/styles/theme';
import useAuthStore from './src/store/authStore';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import VerifyOTPScreen from './src/screens/VerifyOTPScreen';
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
        options={{
          title: 'Dashboard',
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
        options={{
          title: 'Add-ons',
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
        options={{
          title: 'Locations',
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
        options={{
          title: 'Users',
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
        name="UserForm"
        component={UserFormScreen}
        options={{
          title: 'Edit User',
        }}
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
        options={{
          title: 'Offers',
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
        name="OfferForm"
        component={OfferFormScreen}
        options={({ route }) => ({
          title: route.params?.offerId ? 'Edit Offer' : 'Create Offer',
        })}
      />
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Main"
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
        }}
      />
      <Drawer.Screen
        name="OrdersDrawer"
        component={OrdersScreen}
        options={{
          drawerLabel: 'Orders',
          headerShown: true,
          headerStyle: {
            backgroundColor: lightTheme.colors.primary,
          },
          headerTintColor: '#fff',
          headerTitle: 'Orders',
        }}
      />
      <Drawer.Screen
        name="CategoriesDrawer"
        component={CategoriesStack}
        options={{
          drawerLabel: 'Categories',
        }}
      />
      <Drawer.Screen
        name="ItemsDrawer"
        component={ItemsStack}
        options={{
          drawerLabel: 'Items',
        }}
      />
      <Drawer.Screen
        name="AddOnsDrawer"
        component={AddOnsStack}
        options={{
          drawerLabel: 'Add-ons',
        }}
      />
      <Drawer.Screen
        name="LocationsDrawer"
        component={LocationsStack}
        options={{
          drawerLabel: 'Locations',
        }}
      />
      <Drawer.Screen
        name="UsersDrawer"
        component={UsersStack}
        options={{
          drawerLabel: 'Users',
        }}
      />
      <Drawer.Screen
        name="OffersDrawer"
        component={OffersStack}
        options={{
          drawerLabel: 'Offers',
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

export default function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

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
          {isAuthenticated ? <DrawerNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </PaperProvider>
    </QueryClientProvider>
  );
}
