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
    if (!selectedSize && item?.item?.sizes?.length > 0) {
      setError('Please select a size');
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
          <Text variant="headlineMedium" style={styles.title}>
            {item?.item?.name}
          </Text>
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
                    onPress={() => setSelectedSize(size)}
                    style={styles.sizeChip}
                  >
                    {size.size.charAt(0).toUpperCase() + size.size.slice(1)} - ₹{size.price}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {item?.item?.addOns?.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Add-ons
              </Text>
              <View style={styles.chipsContainer}>
                {item.item.addOns.map((addOn) => (
                  <Chip
                    key={addOn.id}
                    selected={selectedAddOns.find((a) => a.id === addOn.id)}
                    onPress={() => handleAddOnToggle(addOn)}
                    style={styles.addOnChip}
                  >
                    {addOn.name} +₹{addOn.price}
                  </Chip>
                ))}
              </View>
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
        <Button mode="contained" onPress={handleAddToCart} style={styles.addButton}>
          Add to Cart
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
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  addOnChip: {
    marginRight: 8,
    marginBottom: 8,
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
