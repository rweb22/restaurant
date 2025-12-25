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
import config from '../constants/config';

export default function ItemFormScreen({ route, navigation }) {
  const queryClient = useQueryClient();
  const itemId = route.params?.itemId;
  const categoryIdParam = route.params?.categoryId; // Category ID from hierarchical navigation
  const isEditing = !!itemId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: categoryIdParam || null,
    isAvailable: true,
  });

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

  const handlePickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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

  const handleDeleteExistingPicture = async (pictureId) => {
    try {
      await uploadService.deletePicture(pictureId);
      setExistingPictures(existingPictures.filter(pic => pic.id !== pictureId));
      queryClient.invalidateQueries(['item', itemId]);
    } catch (error) {
      console.error('Error deleting picture:', error);
      alert('Failed to delete picture');
    }
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

    if (isEditing) {
      updateMutation.mutate({ id: itemId, data: formData });
    } else {
      createMutation.mutate(formData);
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
      {categoryIdParam || isEditing ? (
        // Show read-only category when navigated from hierarchical view or editing
        <View style={styles.readOnlyContainer}>
          <TextInput
            value={categories.find(c => c.id === formData.categoryId)?.name || ''}
            mode="outlined"
            editable={false}
            style={[styles.input, styles.readOnlyInput]}
            right={<TextInput.Icon icon="lock" />}
          />
          <View style={styles.blurOverlay} />
        </View>
      ) : (
        // Show category selector when navigated from standalone items list
        <SegmentedButtons
          value={formData.categoryId?.toString() || ''}
          onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
          buttons={categoryButtons}
          style={styles.segmentedButtons}
        />
      )}

      <Text variant="titleSmall" style={styles.sectionTitle}>
        Pictures
      </Text>

      {existingPictures.length > 0 && (
        <View style={styles.picturesContainer}>
          {existingPictures.map((pic) => (
            <View key={pic.id} style={styles.imageWrapper}>
              <Image
                source={{ uri: `${config.apiUrl.replace('/api', '')}${pic.url}` }}
                style={styles.picturePreview}
              />
              <Button
                mode="text"
                onPress={() => handleDeleteExistingPicture(pic.id)}
                compact
                textColor="#dc2626"
              >
                Remove
              </Button>
            </View>
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
  readOnlyContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    pointerEvents: 'none',
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

