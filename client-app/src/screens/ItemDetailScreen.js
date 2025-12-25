import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
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
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import menuService from '../services/menuService';
import useCartStore from '../store/cartStore';

const ItemDetailScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
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
      quantity: 1,
      category: item.item.category, // Include category for GST calculation
    };

    addToCart(cartItem);
    setDialogVisible(true);
  };

  const getTotal = () => {
    const sizePrice = selectedSize?.price || 0;
    const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + parseFloat(addOn.price), 0);
    return (parseFloat(sizePrice) + addOnsTotal).toFixed(2);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={item?.item?.name} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Image
          source={{ uri: item?.item?.imageUrl || 'https://via.placeholder.com/400' }}
          style={styles.image}
          resizeMode="cover"
        />

        <Surface style={styles.content} elevation={0}>
          <View style={styles.titleContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              {item?.item?.name}
            </Text>
            {!item?.item?.isAvailable && (
              <Chip icon="close-circle" style={styles.unavailableChip} textStyle={styles.unavailableChipText}>
                Unavailable
              </Chip>
            )}
          </View>
          <Text variant="bodyLarge" style={styles.description}>
            {item?.item?.description}
          </Text>

          {item?.item?.sizes?.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Select Size
              </Text>
              <View style={styles.chipsContainer}>
                {item.item.sizes.map((size) => (
                  <Chip
                    key={size.id}
                    selected={selectedSize?.id === size.id}
                    onPress={() => {
                      if (size.isAvailable && item.item.isAvailable) {
                        setSelectedSize(size);
                      }
                    }}
                    style={[
                      styles.sizeChip,
                      !size.isAvailable && styles.unavailableSizeChip
                    ]}
                    disabled={!size.isAvailable || !item.item.isAvailable}
                  >
                    {size.size.charAt(0).toUpperCase() + size.size.slice(1)} - ₹{size.price}
                    {!size.isAvailable && ' (Unavailable)'}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* Combine item add-ons and category add-ons */}
          {((item?.item?.addOns?.length > 0) || (categoryData?.category?.addOns?.length > 0)) && (
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Add-ons
              </Text>

              {/* Item-specific add-ons */}
              {item?.item?.addOns?.length > 0 && (
                <View style={styles.addOnSubsection}>
                  <Text variant="bodyMedium" style={styles.addOnSubtitle}>
                    Item Add-ons
                  </Text>
                  <View style={styles.chipsContainer}>
                    {item.item.addOns.map((addOn) => (
                      <Chip
                        key={`item-${addOn.id}`}
                        selected={selectedAddOns.find((a) => a.id === addOn.id)}
                        onPress={() => {
                          if (addOn.isAvailable && item.item.isAvailable) {
                            handleAddOnToggle(addOn);
                          }
                        }}
                        style={[
                          styles.addOnChip,
                          !addOn.isAvailable && styles.unavailableAddOnChip
                        ]}
                        disabled={!addOn.isAvailable || !item.item.isAvailable}
                      >
                        {addOn.name} +₹{addOn.price}
                        {!addOn.isAvailable && ' (Unavailable)'}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              {/* Category add-ons */}
              {categoryData?.category?.addOns?.length > 0 && (
                <View style={styles.addOnSubsection}>
                  <Text variant="bodyMedium" style={styles.addOnSubtitle}>
                    {item?.item?.category?.name || 'Category'} Add-ons
                  </Text>
                  <View style={styles.chipsContainer}>
                    {categoryData.category.addOns.map((addOn) => (
                      <Chip
                        key={`category-${addOn.id}`}
                        selected={selectedAddOns.find((a) => a.id === addOn.id)}
                        onPress={() => {
                          if (addOn.isAvailable && item.item.isAvailable) {
                            handleAddOnToggle(addOn);
                          }
                        }}
                        style={[
                          styles.addOnChip,
                          !addOn.isAvailable && styles.unavailableAddOnChip
                        ]}
                        disabled={!addOn.isAvailable || !item.item.isAvailable}
                      >
                        {addOn.name} +₹{addOn.price}
                        {!addOn.isAvailable && ' (Unavailable)'}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </Surface>
      </ScrollView>

      <Surface style={styles.bottomBar} elevation={4}>
        <View style={styles.totalContainer}>
          <Text variant="titleMedium">Total</Text>
          <Text variant="headlineSmall" style={styles.total}>
            ₹{getTotal()}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleAddToCart}
          style={styles.addButton}
          disabled={!item?.item?.isAvailable}
        >
          {item?.item?.isAvailable ? 'Add to Cart' : 'Unavailable'}
        </Button>
      </Surface>

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
                navigation.navigate('Cart');
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
    backgroundColor: '#fafaf9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  unavailableChip: {
    backgroundColor: '#dc2626',
    marginLeft: 8,
  },
  unavailableChipText: {
    color: '#ffffff',
  },
  description: {
    color: '#78716c',
    marginBottom: 16,
  },
  basePrice: {
    color: '#dc2626',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  addOnSubsection: {
    marginBottom: 16,
  },
  addOnSubtitle: {
    fontWeight: '600',
    color: '#57534e',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  unavailableSizeChip: {
    opacity: 0.5,
  },
  addOnChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  unavailableAddOnChip: {
    opacity: 0.5,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  total: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  addButton: {
    paddingVertical: 4,
  },
  dialogTitle: {
    textAlign: 'center',
  },
});

export default ItemDetailScreen;
