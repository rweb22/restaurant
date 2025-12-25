import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import {
  Text,
  Button,
  Chip,
  ActivityIndicator,
  Appbar,
  Surface,
  Snackbar,
  Dialog,
  Portal,
  IconButton,
  Icon,
  Checkbox,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import menuService from '../services/menuService';
import useCartStore from '../store/cartStore';
import QuantitySelector from '../components/QuantitySelector';
import { API_CONFIG } from '../constants/config';
import { colors, spacing, fontSize } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ItemDetailScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [error, setError] = useState('');
  const addToCart = useCartStore((state) => state.addItem);

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => menuService.getItemById(itemId, {
      includeSizes: true,
      includeAddOns: true,
    }),
  });

  // Fetch category add-ons
  const { data: categoryData } = useQuery({
    queryKey: ['category', item?.item?.categoryId],
    queryFn: () => menuService.getCategoryById(item.item.categoryId, {
      includeAddOns: true,
    }),
    enabled: !!item?.item?.categoryId,
  });

  const handleAddOnToggle = (addOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.find((a) => a.id === addOn.id);
      if (exists) {
        return prev.filter((a) => a.id !== addOn.id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const handleAddToCart = () => {
    // Check if item is available
    if (!item?.item?.isAvailable) {
      setError('This item is currently unavailable');
      return;
    }

    if (!selectedSize && item?.item?.sizes?.length > 0) {
      setError('Please select a size');
      return;
    }

    // Check if selected size is available
    if (selectedSize && !selectedSize.isAvailable) {
      setError('This size is currently unavailable');
      return;
    }

    // Check if any selected add-ons are unavailable
    const unavailableAddOn = selectedAddOns.find(addOn => !addOn.isAvailable);
    if (unavailableAddOn) {
      setError(`Add-on "${unavailableAddOn.name}" is currently unavailable`);
      return;
    }

    const cartItem = {
      id: item.item.id,
      name: item.item.name,
      imageUrl: item.item.imageUrl,
      sizeId: selectedSize?.id, // Add sizeId for backend
      sizeName: selectedSize?.size,
      sizePrice: selectedSize?.price || 0,
      addOns: selectedAddOns,
      quantity: quantity,
      category: item.item.category, // Include category for GST calculation
    };

    addToCart(cartItem);
    setDialogVisible(true);

    // Reset selections after adding to cart
    setQuantity(1);
  };

  const getTotal = () => {
    const sizePrice = selectedSize?.price || 0;
    const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + parseFloat(addOn.price), 0);
    return ((parseFloat(sizePrice) + addOnsTotal) * quantity).toFixed(2);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image with Gradient Overlay */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: item?.item?.imageUrl
                ? `${API_CONFIG.BASE_URL.replace('/api', '')}${item.item.imageUrl}`
                : 'https://via.placeholder.com/400'
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />

          {/* Circular Back Button */}
          <IconButton
            icon="arrow-left"
            iconColor={colors.white}
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />

          {/* Unavailable Badge */}
          {!item?.item?.isAvailable && (
            <View style={styles.unavailableBadge}>
              <Icon source="close-circle" size={16} color={colors.white} />
              <Text style={styles.unavailableBadgeText}>Unavailable</Text>
            </View>
          )}
        </View>

        {/* Floating Details Card */}
        <Surface style={styles.detailsCard} elevation={4}>
          <View style={styles.titleSection}>
            <Text variant="headlineMedium" style={styles.title}>
              {item?.item?.name}
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {item?.item?.description}
            </Text>
          </View>

          {/* Size Selection */}
          {item?.item?.sizes?.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Select Size
              </Text>
              <View style={styles.sizesGrid}>
                {item.item.sizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  const isAvailable = size.isAvailable && item.item.isAvailable;

                  return (
                    <TouchableOpacity
                      key={size.id}
                      style={[
                        styles.sizeCard,
                        isSelected && styles.sizeCardSelected,
                        !isAvailable && styles.sizeCardDisabled,
                      ]}
                      onPress={() => {
                        if (isAvailable) {
                          setSelectedSize(size);
                        }
                      }}
                      disabled={!isAvailable}
                      activeOpacity={0.7}
                    >
                      <View style={styles.sizeCardContent}>
                        <Text style={[
                          styles.sizeName,
                          isSelected && styles.sizeNameSelected,
                          !isAvailable && styles.sizeNameDisabled,
                        ]}>
                          {size.size.charAt(0).toUpperCase() + size.size.slice(1)}
                        </Text>
                        <Text style={[
                          styles.sizePrice,
                          isSelected && styles.sizePriceSelected,
                          !isAvailable && styles.sizePriceDisabled,
                        ]}>
                          ₹{size.price}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Icon source="check" size={16} color={colors.white} />
                        </View>
                      )}
                      {!isAvailable && (
                        <View style={styles.unavailableOverlay}>
                          <Text style={styles.unavailableOverlayText}>N/A</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Add-ons Section */}
          {((item?.item?.addOns?.length > 0) || (categoryData?.category?.addOns?.length > 0)) && (
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Add-ons (Optional)
              </Text>

              {/* Item-specific add-ons */}
              {item?.item?.addOns?.length > 0 && (
                <View style={styles.addOnSubsection}>
                  {item.item.addOns.map((addOn) => {
                    const isSelected = !!selectedAddOns.find((a) => a.id === addOn.id);
                    const isAvailable = addOn.isAvailable && item.item.isAvailable;

                    return (
                      <TouchableOpacity
                        key={`item-${addOn.id}`}
                        style={[
                          styles.addOnCard,
                          isSelected && styles.addOnCardSelected,
                          !isAvailable && styles.addOnCardDisabled,
                        ]}
                        onPress={() => {
                          if (isAvailable) {
                            handleAddOnToggle(addOn);
                          }
                        }}
                        disabled={!isAvailable}
                        activeOpacity={0.7}
                      >
                        <View style={styles.addOnCardLeft}>
                          <Checkbox
                            status={isSelected ? 'checked' : 'unchecked'}
                            color={colors.primary[500]}
                            disabled={!isAvailable}
                          />
                          <View style={styles.addOnInfo}>
                            <Text style={[
                              styles.addOnName,
                              !isAvailable && styles.addOnNameDisabled,
                            ]}>
                              {addOn.name}
                            </Text>
                            {!isAvailable && (
                              <Text style={styles.addOnUnavailable}>Unavailable</Text>
                            )}
                          </View>
                        </View>
                        <Text style={[
                          styles.addOnPrice,
                          !isAvailable && styles.addOnPriceDisabled,
                        ]}>
                          +₹{addOn.price}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Category add-ons */}
              {categoryData?.category?.addOns?.length > 0 && (
                <View style={styles.addOnSubsection}>
                  <Text variant="bodyMedium" style={styles.categoryAddOnTitle}>
                    {item?.item?.category?.name || 'Category'} Add-ons
                  </Text>
                  {categoryData.category.addOns.map((addOn) => {
                    const isSelected = !!selectedAddOns.find((a) => a.id === addOn.id);
                    const isAvailable = addOn.isAvailable && item.item.isAvailable;

                    return (
                      <TouchableOpacity
                        key={`category-${addOn.id}`}
                        style={[
                          styles.addOnCard,
                          isSelected && styles.addOnCardSelected,
                          !isAvailable && styles.addOnCardDisabled,
                        ]}
                        onPress={() => {
                          if (isAvailable) {
                            handleAddOnToggle(addOn);
                          }
                        }}
                        disabled={!isAvailable}
                        activeOpacity={0.7}
                      >
                        <View style={styles.addOnCardLeft}>
                          <Checkbox
                            status={isSelected ? 'checked' : 'unchecked'}
                            color={colors.primary[500]}
                            disabled={!isAvailable}
                          />
                          <View style={styles.addOnInfo}>
                            <Text style={[
                              styles.addOnName,
                              !isAvailable && styles.addOnNameDisabled,
                            ]}>
                              {addOn.name}
                            </Text>
                            {!isAvailable && (
                              <Text style={styles.addOnUnavailable}>Unavailable</Text>
                            )}
                          </View>
                        </View>
                        <Text style={[
                          styles.addOnPrice,
                          !isAvailable && styles.addOnPriceDisabled,
                        ]}>
                          +₹{addOn.price}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Quantity
            </Text>
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity(q => q + 1)}
              onDecrement={() => setQuantity(q => Math.max(1, q - 1))}
              min={1}
              max={99}
              size="lg"
            />
          </View>
        </Surface>
      </ScrollView>

      {/* Sticky Add to Cart Button */}
      <LinearGradient
        colors={[colors.primary[500], colors.primary[600]]}
        style={styles.bottomBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.bottomBarContent}>
          <View style={styles.totalSection}>
            <Text variant="bodySmall" style={styles.totalLabel}>
              Total Amount
            </Text>
            <Text variant="headlineSmall" style={styles.totalAmount}>
              ₹{getTotal()}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleAddToCart}
            style={styles.addButton}
            contentStyle={styles.addButtonContent}
            labelStyle={styles.addButtonLabel}
            buttonColor={colors.white}
            textColor={colors.primary[500]}
            disabled={!item?.item?.isAvailable}
          >
            {item?.item?.isAvailable ? 'Add to Cart' : 'Unavailable'}
          </Button>
        </View>
      </LinearGradient>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Icon icon="check-circle" />
          <Dialog.Title style={styles.dialogTitle}>Added to Cart!</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Item has been added to your cart</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Continue Shopping</Button>
            <Button
              mode="contained"
              onPress={() => {
                setDialogVisible(false);
                navigation.navigate('Main', { screen: 'CartTab' });
              }}
            >
              View Cart
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setError(''),
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    position: 'relative',
    height: SCREEN_WIDTH * 0.75, // 75% of screen width for 4:3 aspect ratio
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  unavailableBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  unavailableBadgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Extra padding for sticky button
  },
  titleSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.text.secondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  // Size Selection Styles
  sizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  sizeCard: {
    position: 'relative',
    width: '30%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.secondary[300],
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  sizeCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  sizeCardDisabled: {
    opacity: 0.5,
  },
  sizeCardContent: {
    alignItems: 'center',
  },
  sizeName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sizeNameSelected: {
    color: colors.primary[700],
  },
  sizeNameDisabled: {
    color: colors.text.disabled,
  },
  sizePrice: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  sizePriceSelected: {
    color: colors.primary[600],
  },
  sizePriceDisabled: {
    color: colors.text.disabled,
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  unavailableOverlayText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: colors.text.disabled,
  },
  // Add-ons Styles
  addOnSubsection: {
    gap: spacing.sm,
  },
  categoryAddOnTitle: {
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  addOnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.secondary[300],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  addOnCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  addOnCardDisabled: {
    opacity: 0.5,
  },
  addOnCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addOnInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  addOnName: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text.primary,
  },
  addOnNameDisabled: {
    color: colors.text.disabled,
  },
  addOnUnavailable: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  addOnPrice: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  addOnPriceDisabled: {
    color: colors.text.disabled,
  },
  // Bottom Bar Styles
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  totalAmount: {
    color: colors.white,
    fontWeight: 'bold',
  },
  addButton: {
    borderRadius: 12,
  },
  addButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
  },
  addButtonLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  dialogTitle: {
    textAlign: 'center',
  },
});

export default ItemDetailScreen;
