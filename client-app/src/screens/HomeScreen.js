import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import {
  Text,
  Card,
  Chip,
  IconButton,
  Badge,
  Button,
  ActivityIndicator,
  Appbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import menuService from '../services/menuService';
import notificationService from '../services/notificationService';
import restaurantService from '../services/restaurantService';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useDeliveryStore from '../store/deliveryStore';
import AddressSelectionModal from '../components/AddressSelectionModal';
import { API_CONFIG } from '../constants/config';

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const { getItemCount, clearCart } = useCartStore();
  const { logout, user } = useAuthStore();
  const { selectedAddress, loadDeliveryInfo, clearDeliveryInfo } = useDeliveryStore();

  // Fetch unread notification count
  const { data: unreadCountData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = unreadCountData?.data?.count || 0;

  // Fetch restaurant status
  const { data: statusData } = useQuery({
    queryKey: ['restaurant', 'status'],
    queryFn: () => restaurantService.getStatus(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const restaurantStatus = statusData?.data;

  useEffect(() => {
    loadDeliveryInfo();
    // Show address modal if no address is selected
    if (!selectedAddress) {
      setAddressModalVisible(true);
    }
  }, []);

  useEffect(() => {
    // Show modal if address is cleared
    if (!selectedAddress) {
      setAddressModalVisible(true);
    }
  }, [selectedAddress]);

  // Listen for navigation focus to check if address is selected
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // When screen comes into focus, check if address is selected
      if (!selectedAddress) {
        setAddressModalVisible(true);
      }
    });

    return unsubscribe;
  }, [navigation, selectedAddress]);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', 'available'],
    queryFn: () => menuService.getCategories({ available: true }),
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['items', selectedCategory, 'available'],
    queryFn: () => menuService.getItems({
      categoryId: selectedCategory,
      available: true,
      includeSizes: true,
      includeAddOns: true,
    }),
  });

  const handleLogout = async () => {
    console.log('[HomeScreen] Logging out...');
    await logout();
    clearCart();
    clearDeliveryInfo();
    console.log('[HomeScreen] Logout complete');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header elevated>
        <Appbar.Content
          title="Menu"
          subtitle={user?.name ? `Hi, ${user.name}! 👋` : "Choose your favorite items"}
        />
        <View style={styles.iconContainer}>
          <IconButton
            icon="bell"
            size={24}
            onPress={() => navigation.navigate('Notifications')}
          />
          {unreadCount > 0 && (
            <Badge style={styles.notificationBadge}>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
          )}
        </View>
        <View style={styles.iconContainer}>
          <IconButton
            icon="receipt-text"
            size={24}
            onPress={() => navigation.navigate('Orders')}
          />
        </View>
        <View style={styles.iconContainer}>
          <IconButton
            icon="cart"
            size={24}
            onPress={() => navigation.navigate('Cart')}
          />
          {getItemCount() > 0 && (
            <Badge style={styles.cartBadge}>{getItemCount()}</Badge>
          )}
        </View>
        <IconButton
          icon="logout"
          size={24}
          onPress={handleLogout}
        />
      </Appbar.Header>

      {/* Delivery Address Bar */}
      {selectedAddress && (
        <TouchableOpacity
          onPress={() => setAddressModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.addressBar}>
            <View style={styles.addressContent}>
              <Text variant="labelSmall" style={styles.deliverTo}>
                DELIVER TO
              </Text>
              <Text variant="titleMedium" style={styles.addressLabel}>
                {selectedAddress.label || 'Address'}
              </Text>
              <Text variant="bodySmall" style={styles.addressText} numberOfLines={1}>
                {selectedAddress.addressLine1}
              </Text>
            </View>
            <IconButton icon="chevron-down" size={20} />
          </View>
        </TouchableOpacity>
      )}

      {/* Restaurant Status Banner */}
      {restaurantStatus && !restaurantStatus.isOpen && (
        <View style={[
          styles.statusBanner,
          { backgroundColor: '#ffebee' }
        ]}>
          <View style={styles.statusContent}>
            <Chip
              mode="flat"
              style={styles.closedChip}
              textStyle={styles.closedChipText}
            >
              🔴 CLOSED
            </Chip>
            <Text variant="bodyMedium" style={styles.statusReason}>
              {restaurantStatus.reason}
            </Text>
            {restaurantStatus.nextOpenTime && (
              <Text variant="bodySmall" style={styles.nextOpenTime}>
                Opens {new Date(restaurantStatus.nextOpenTime).toLocaleString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
            style={styles.chip}
          >
            All
          </Chip>
          {categoriesLoading ? (
            <ActivityIndicator size="small" style={styles.chip} />
          ) : (
            categories?.categories?.map((category) => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={styles.chip}
              >
                {category.name}
              </Chip>
            ))
          )}
        </ScrollView>
      </View>

      {/* Items Grid */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {itemsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <View style={styles.grid}>
            {items?.items?.map((item) => (
              <Card
                key={item.id}
                style={[
                  styles.card,
                  (!item.isAvailable || !restaurantStatus?.isOpen) && styles.unavailableCard
                ]}
                onPress={() => {
                  if (item.isAvailable && restaurantStatus?.isOpen) {
                    navigation.navigate('ItemDetail', { itemId: item.id });
                  }
                }}
              >
                <Card.Cover
                  source={{
                    uri: item.imageUrl
                      ? `${API_CONFIG.BASE_URL.replace('/api', '')}${item.imageUrl}`
                      : 'https://via.placeholder.com/150'
                  }}
                  style={[styles.cardImage, !item.isAvailable && styles.unavailableImage]}
                />
                {!item.isAvailable && (
                  <View style={styles.unavailableBadge}>
                    <Text variant="labelSmall" style={styles.unavailableText}>
                      UNAVAILABLE
                    </Text>
                  </View>
                )}
                <Card.Content style={styles.cardContent}>
                  <Text variant="titleMedium" numberOfLines={1} style={[styles.itemName, !item.isAvailable && styles.unavailableItemName]}>
                    {item.name}
                  </Text>
                  <Text variant="bodySmall" numberOfLines={2} style={[styles.itemDescription, !item.isAvailable && styles.unavailableItemDescription]}>
                    {item.description}
                  </Text>
                  {item.sizes && item.sizes.length > 0 && (
                    <Text variant="titleLarge" style={[styles.itemPrice, !item.isAvailable && styles.unavailableItemPrice]}>
                      ₹{Math.min(...item.sizes.map(s => s.price))}+
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Address Selection Modal */}
      <AddressSelectionModal
        visible={addressModalVisible}
        onDismiss={() => {
          // Only allow dismissing if an address is selected
          if (selectedAddress) {
            setAddressModalVisible(false);
          }
        }}
        onAddAddress={() => {
          setAddressModalVisible(false);
          navigation.navigate('AddAddress', { isFirstAddress: !selectedAddress });
        }}
        onManageAddresses={() => {
          setAddressModalVisible(false);
          navigation.navigate('Addresses');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
  },
  addressContent: {
    flex: 1,
  },
  deliverTo: {
    color: '#78716c',
    fontWeight: '600',
    marginBottom: 2,
  },
  addressLabel: {
    fontWeight: 'bold',
    color: '#292524',
    marginBottom: 2,
  },
  addressText: {
    color: '#57534e',
  },
  statusBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
  },
  statusContent: {
    alignItems: 'flex-start',
  },
  closedChip: {
    backgroundColor: '#f44336',
    marginBottom: 8,
  },
  closedChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusReason: {
    color: '#c62828',
    fontWeight: '600',
    marginBottom: 4,
  },
  nextOpenTime: {
    color: '#666',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
  },
  chip: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  card: {
    width: '48%',
    margin: '1%',
    marginBottom: 16,
    position: 'relative',
  },
  unavailableCard: {
    opacity: 0.6,
  },
  cardImage: {
    height: 120,
  },
  unavailableImage: {
    opacity: 0.5,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  unavailableText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  cardContent: {
    paddingTop: 12,
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  unavailableItemName: {
    color: '#a8a29e',
  },
  itemDescription: {
    color: '#78716c',
    marginBottom: 8,
  },
  unavailableItemDescription: {
    color: '#d6d3d1',
  },
  itemPrice: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  unavailableItemPrice: {
    color: '#a8a29e',
  },
  iconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 10,
    minWidth: 18,
    height: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 10,
    minWidth: 18,
    height: 18,
  },
});

export default HomeScreen;

