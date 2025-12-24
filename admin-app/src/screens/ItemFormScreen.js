import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Switch,
  Chip,
  ActivityIndicator,
  SegmentedButtons,
  IconButton,
  Card,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import menuService from '../services/menuService';
import uploadService from '../services/uploadService';

export default function ItemFormScreen({ route, navigation }) {
  const queryClient = useQueryClient();
  const itemId = route.params?.itemId;
  const isEditing = !!itemId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: null,
    isAvailable: true,
  });

  const [sizes, setSizes] = useState([]);

  const [selectedAddOnIds, setSelectedAddOnIds] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingPictures, setExistingPictures] = useState([]);

  // Fetch item if editing
  const { data: itemData, isLoading: itemLoading } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => menuService.getItemById(itemId),
    enabled: isEditing,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: menuService.getCategories,
  });

  // Fetch add-ons
  const { data: addOnsData } = useQuery({
    queryKey: ['addOns'],
    queryFn: menuService.getAddOns,
  });

  // Populate form when editing
  useEffect(() => {
    if (itemData?.item) {
      const item = itemData.item;
      setFormData({
        name: item.name,
        description: item.description || '',
        categoryId: item.categoryId,
        isAvailable: item.isAvailable,
      });

      // Set sizes - keep existing sizes with their IDs
      if (item.sizes && item.sizes.length > 0) {
        setSizes(
          item.sizes.map((s) => ({
            id: s.id,
            size: s.size,
            price: s.price.toString(),
            isAvailable: s.isAvailable,
          }))
        );
      }

      // Set add-ons
      if (item.addOns) {
        setSelectedAddOnIds(item.addOns.map((a) => a.id));
      }

      // Set pictures
      if (item.pictures) {
        setExistingPictures(item.pictures);
      }
    }
  }, [itemData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: menuService.createItem,
    onSuccess: async (data) => {
      try {
        const newItemId = data.item.id;

        // Upload pictures
        for (let i = 0; i < selectedImages.length; i++) {
          await uploadService.uploadPicture(
            selectedImages[i],
            'item',
            newItemId,
            formData.name,
            i === 0 // First image is primary
          );
        }

        // Add sizes
        const validSizes = sizes.filter((s) => s.size.trim() && s.price && parseFloat(s.price) > 0);
        for (const sizeData of validSizes) {
          await menuService.addSizeToItem(newItemId, {
            size: sizeData.size,
            price: parseFloat(sizeData.price),
          });
        }

        queryClient.invalidateQueries(['items']);
        navigation.goBack();
      } catch (error) {
        console.error('Error creating item:', error);
        alert('Failed to create item: ' + (error.response?.data?.message || error.message));
      }
    },
    onError: (error) => {
      console.error('Create mutation error:', error);
      alert('Failed to create item: ' + (error.response?.data?.message || error.message));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuService.updateItem(id, data),
    onSuccess: async () => {
      try {
        // Upload new pictures if any
        if (selectedImages.length > 0) {
          for (let i = 0; i < selectedImages.length; i++) {
            await uploadService.uploadPicture(
              selectedImages[i],
              'item',
              itemId,
              formData.name,
              existingPictures.length === 0 && i === 0 // Primary if no existing pictures
            );
          }
        }

        // Update sizes - update existing, create new
        for (const sizeData of sizes) {
          if (!sizeData.size.trim() || !sizeData.price || parseFloat(sizeData.price) <= 0) continue;

          if (sizeData.id) {
            // Update existing size
            await menuService.updateItemSize(sizeData.id, {
              size: sizeData.size,
              price: parseFloat(sizeData.price),
              isAvailable: sizeData.isAvailable ?? true,
            });
          } else {
            // Create new size
            await menuService.addSizeToItem(itemId, {
              size: sizeData.size,
              price: parseFloat(sizeData.price),
              isAvailable: sizeData.isAvailable ?? true,
            });
          }
        }

        queryClient.invalidateQueries(['items']);
        queryClient.invalidateQueries(['item', itemId]);
        navigation.goBack();
      } catch (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item: ' + (error.response?.data?.message || error.message));
      }
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      alert('Failed to update item: ' + (error.response?.data?.message || error.message));
    },
  });

  const categories = categoriesData?.categories || [];
  const addOns = addOnsData?.addOns || [];

  const handlePickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, ...result.assets]);
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleToggleAddOn = (addOnId) => {
    if (selectedAddOnIds.includes(addOnId)) {
      setSelectedAddOnIds(selectedAddOnIds.filter((id) => id !== addOnId));
    } else {
      setSelectedAddOnIds([...selectedAddOnIds, addOnId]);
    }
  };

  const handleAddSize = () => {
    setSizes([
      ...sizes,
      {
        size: '',
        price: '',
        isAvailable: true,
      },
    ]);
  };

  const handleRemoveSize = async (index) => {
    const sizeToRemove = sizes[index];

    // If it's an existing size (has ID), delete it from backend
    if (sizeToRemove.id && isEditing) {
      if (confirm('Are you sure you want to delete this size?')) {
        try {
          await menuService.deleteItemSize(sizeToRemove.id);
          setSizes(sizes.filter((_, i) => i !== index));
          queryClient.invalidateQueries(['item', itemId]);
        } catch (error) {
          alert('Failed to delete size');
        }
      }
    } else {
      // Just remove from local state
      setSizes(sizes.filter((_, i) => i !== index));
    }
  };

  const handleUpdateSize = (index, field, value) => {
    const newSizes = [...sizes];
    newSizes[index] = {
      ...newSizes[index],
      [field]: value,
    };
    setSizes(newSizes);
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter item name');
      return;
    }

    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    const validSizes = sizes.filter((s) => s.size.trim() && s.price && parseFloat(s.price) > 0);
    if (validSizes.length === 0) {
      alert('Please add at least one size with name and price');
      return;
    }

    // Check for duplicate size names
    const sizeNames = validSizes.map(s => s.size.toLowerCase().trim());
    const duplicates = sizeNames.filter((name, index) => sizeNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      alert(`Duplicate size names found: ${duplicates.join(', ')}. Each size must have a unique name.`);
      return;
    }

    const itemData = {
      ...formData,
      addOnIds: selectedAddOnIds,
    };

    if (isEditing) {
      updateMutation.mutate({ id: itemId, data: itemData });
    } else {
      createMutation.mutate(itemData);
    }
  };

  if (itemLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const categoryButtons = categories.map((cat) => ({
    value: cat.id.toString(),
    label: cat.name,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        {isEditing ? 'Edit Item' : 'Create Item'}
      </Text>

      <TextInput
        label="Name *"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Description"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Text variant="titleSmall" style={styles.sectionTitle}>
        Category *
      </Text>
      <SegmentedButtons
        value={formData.categoryId?.toString() || ''}
        onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
        buttons={categoryButtons}
        style={styles.segmentedButtons}
      />

      <View style={styles.sectionHeader}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          Sizes & Prices *
        </Text>
        <Button mode="outlined" onPress={handleAddSize} icon="plus" compact>
          Add Size
        </Button>
      </View>

      {sizes.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.emptyText}>
              No sizes added yet. Click "Add Size" to add pricing options.
            </Text>
            <Text variant="bodySmall" style={styles.emptyHint}>
              Examples: Small, Medium, Large, Regular, Family Pack, 6", 9", 12", etc.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.sizesCard}>
          <Card.Content>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text variant="labelLarge" style={styles.headerSize}>Size Name</Text>
              <Text variant="labelLarge" style={styles.headerPrice}>Price (₹)</Text>
              <View style={styles.headerAction} />
            </View>

            {/* Size Rows */}
            {sizes.map((sizeData, index) => (
              <View key={index} style={styles.tableRow}>
                <TextInput
                  placeholder="e.g. Small, 9 inch"
                  value={sizeData.size}
                  onChangeText={(text) => handleUpdateSize(index, 'size', text)}
                  mode="outlined"
                  dense
                  style={styles.sizeNameInput}
                />
                <TextInput
                  placeholder="0.00"
                  value={sizeData.price}
                  onChangeText={(text) => handleUpdateSize(index, 'price', text)}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  dense
                  style={styles.sizePriceInput}
                  left={<TextInput.Affix text="₹" />}
                />
                <IconButton
                  icon="delete"
                  iconColor="#dc2626"
                  size={20}
                  onPress={() => handleRemoveSize(index)}
                  style={styles.deleteButton}
                />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <Text variant="titleSmall" style={styles.sectionTitle}>
        Add-ons
      </Text>
      <View style={styles.addOnsContainer}>
        {addOns.map((addOn) => (
          <Chip
            key={addOn.id}
            selected={selectedAddOnIds.includes(addOn.id)}
            onPress={() => handleToggleAddOn(addOn.id)}
            style={styles.addOnChip}
          >
            {addOn.name} (₹{addOn.price})
          </Chip>
        ))}
      </View>

      <Text variant="titleSmall" style={styles.sectionTitle}>
        Pictures
      </Text>

      {existingPictures.length > 0 && (
        <View style={styles.picturesContainer}>
          {existingPictures.map((pic) => (
            <Image key={pic.id} source={{ uri: pic.url }} style={styles.picturePreview} />
          ))}
        </View>
      )}

      {selectedImages.length > 0 && (
        <View style={styles.picturesContainer}>
          {selectedImages.map((img, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.picturePreview} />
              <Button
                mode="text"
                onPress={() => handleRemoveImage(index)}
                compact
                textColor="#dc2626"
              >
                Remove
              </Button>
            </View>
          ))}
        </View>
      )}

      <Button mode="outlined" onPress={handlePickImages} icon="image-plus" style={styles.button}>
        Add Pictures
      </Button>

      <View style={styles.switchRow}>
        <Text variant="bodyLarge">Available</Text>
        <Switch
          value={formData.isAvailable}
          onValueChange={(value) => setFormData({ ...formData, isAvailable: value })}
        />
      </View>

      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.actionButton}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={createMutation.isPending || updateMutation.isPending}
          style={styles.actionButton}
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  emptyCard: {
    marginBottom: 16,
    backgroundColor: '#fafaf9',
  },
  emptyText: {
    textAlign: 'center',
    color: '#78716c',
    marginBottom: 8,
  },
  emptyHint: {
    textAlign: 'center',
    color: '#a8a29e',
    fontStyle: 'italic',
  },
  sizesCard: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e7e5e4',
    marginBottom: 12,
  },
  headerSize: {
    flex: 2,
    fontWeight: 'bold',
  },
  headerPrice: {
    flex: 1.5,
    fontWeight: 'bold',
  },
  headerAction: {
    width: 48,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sizeNameInput: {
    flex: 2,
    backgroundColor: '#fff',
  },
  sizePriceInput: {
    flex: 1.5,
    backgroundColor: '#fff',
  },
  deleteButton: {
    margin: 0,
  },
  addOnsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  addOnChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  picturesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  imageWrapper: {
    alignItems: 'center',
  },
  picturePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  button: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
});

