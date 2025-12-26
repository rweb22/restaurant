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
  Searchbar,
  FAB,
  Icon,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import menuService from '../services/menuService';
import notificationService from '../services/notificationService';
import restaurantService from '../services/restaurantService';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useDeliveryStore from '../store/deliveryStore';
import AddressSelectionModal from '../components/AddressSelectionModal';
import FoodCard from '../components/FoodCard';
import CategoryChip from '../components/CategoryChip';
import { API_CONFIG } from '../constants/config';
import { colors, spacing, fontSize } from '../styles/theme';

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getItemCount, clearCart } = useCartStore();
  const { logout, user } = useAuthStore();
  const { selectedAddress, loadDeliveryInfo, clearDeliveryInfo } = useDeliveryStore();

  const cartItemCount = getItemCount();

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[colors.primary[500], colors.primary[600]]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          {/* Greeting and Address Row */}
          <View style={styles.topRow}>
            <View style={styles.greetingSection}>
              <Text variant="bodySmall" style={styles.greetingLabel}>
                {user?.name ? `Hi, ${user.name}! 👋` : "Welcome! 👋"}
              </Text>
              {selectedAddress && (
                <TouchableOpacity
                  onPress={() => setAddressModalVisible(true)}
                  activeOpacity={0.7}
                  style={styles.addressButton}
                >
                  <Icon source="map-marker" size={16} color={colors.white} />
                  <Text variant="bodyMedium" style={styles.addressText} numberOfLines={1}>
                    {selectedAddress.label || 'Select Address'}
                  </Text>
                  <Icon source="chevron-down" size={16} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Bar */}
          <Searchbar
            placeholder="Search for dishes..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={colors.primary[500]}
            placeholderTextColor={colors.secondary[500]}
          />
        </View>
      </LinearGradient>

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          <CategoryChip
            label="All"
            icon="🍽️"
            selected={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
          />
          {categoriesLoading ? (
            <ActivityIndicator size="small" style={styles.categoryLoader} />
          ) : (
            categories?.categories?.map((category) => {
              // Map category names to emojis
              const categoryIcons = {
                'Pizza': '🍕',
                'Burgers': '🍔',
                'Noodles': '🍜',
                'Khichdi': '🍛',
                'Desserts': '🍰',
                'Beverages': '🥤',
              };

              return (
                <CategoryChip
                  key={category.id}
                  label={category.name}
                  icon={categoryIcons[category.name] || '🍴'}
                  selected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                />
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Items Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {itemsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : (
          <View style={styles.grid}>
            {items?.items
              ?.filter(item =>
                searchQuery === '' ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
              )
              ?.map((item) => {
                const isAvailable = item.isAvailable && restaurantStatus?.isOpen;
                const minPrice = item.sizes && item.sizes.length > 0
                  ? Math.min(...item.sizes.map(s => s.price))
                  : 0;

                return (
                  <FoodCard
                    key={item.id}
                    imageUrl={
                      item.imageUrl
                        ? `${API_CONFIG.BASE_URL.replace('/api', '')}${item.imageUrl}`
                        : 'https://via.placeholder.com/300x200'
                    }
                    name={item.name}
                    description={item.description}
                    price={minPrice}
                    badge={!isAvailable ? 'UNAVAILABLE' : null}
                    onPress={() => {
                      if (isAvailable) {
                        navigation.navigate('ItemDetail', { itemId: item.id });
                      }
                    }}
                    onAddPress={() => {
                      if (isAvailable) {
                        navigation.navigate('ItemDetail', { itemId: item.id });
                      }
                    }}
                    style={styles.foodCard}
                  />
                );
              })}
          </View>
        )}
      </ScrollView>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <FAB
          icon="cart"
          label={`${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`}
          style={styles.fab}
          color={colors.white}
          onPress={() => navigation.getParent()?.navigate('CartTab')}
        />
      )}

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
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    // No gap needed, marginBottom on children handles spacing
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  greetingSection: {
    flex: 1,
  },
  greetingLabel: {
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  addressText: {
    color: colors.white,
    fontWeight: '600',
    maxWidth: 150,
    marginHorizontal: spacing.xs,
  },
  searchBar: {
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: {
    fontSize: fontSize.sm,
  },
  statusBanner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[200],
  },
  statusContent: {
    alignItems: 'flex-start',
  },
  closedChip: {
    backgroundColor: colors.error,
    marginBottom: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedChipText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusReason: {
    color: colors.error,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  nextOpenTime: {
    color: colors.text.secondary,
  },
  categoriesContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[200],
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
  },
  categoryLoader: {
    marginLeft: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100, // Extra padding for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  foodCard: {
    width: '48%',
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 80, // Above bottom tab bar
    right: spacing.lg,
    backgroundColor: colors.primary[500],
    borderRadius: 28,
  },
});

export default HomeScreen;

