import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Switch,
  ActivityIndicator,
  IconButton,
  Card,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import menuService from '../services/menuService';
import uploadService from '../services/uploadService';
import config from '../constants/config';

export default function CategoryFormScreen({ route, navigation }) {
  const queryClient = useQueryClient();
  const categoryId = route.params?.categoryId;
  const isEditing = !!categoryId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isAvailable: true,
    displayOrder: 0,
    gstRate: 5,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingPicture, setExistingPicture] = useState(null);

  // Fetch category if editing
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => menuService.getCategoryById(categoryId),
    enabled: isEditing,
  });

  // Populate form when editing
  useEffect(() => {
    if (categoryData?.category) {
      const cat = categoryData.category;
      setFormData({
        name: cat.name,
        description: cat.description || '',
        isAvailable: cat.isAvailable,
        displayOrder: cat.displayOrder || 0,
        gstRate: cat.gstRate || 5,
      });

      if (cat.pictures && cat.pictures.length > 0) {
        const primary = cat.pictures.find(p => p.isPrimary) || cat.pictures[0];
        setExistingPicture(`${config.apiUrl.replace('/api', '')}${primary.url}`);
      }
    }
  }, [categoryData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: menuService.createCategory,
    onSuccess: async (data) => {
      if (selectedImage) {
        await uploadService.uploadPicture(
          selectedImage,
          'category',
          data.category.id,
          formData.name,
          true
        );
      }
      queryClient.invalidateQueries(['categories']);
      navigation.goBack();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuService.updateCategory(id, data),
    onSuccess: async () => {
      if (selectedImage) {
        await uploadService.uploadPicture(
          selectedImage,
          'category',
          categoryId,
          formData.name,
          true
        );
      }
      queryClient.invalidateQueries(['categories']);
      queryClient.invalidateQueries(['category', categoryId]);
      navigation.goBack();
    },
  });

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setExistingPicture(null);
  };

  const handleSave = () => {
    if (isEditing) {
      updateMutation.mutate({ id: categoryId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const imageUri = selectedImage?.uri || existingPicture;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        {/* Image Section */}
        <Card style={styles.imageCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Category Image</Text>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                <IconButton
                  icon="close-circle"
                  size={32}
                  iconColor="#fff"
                  style={styles.removeButton}
                  onPress={handleRemoveImage}
                />
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickImage}>
                <IconButton icon="camera" size={48} />
                <Text>Tap to add image</Text>
              </TouchableOpacity>
            )}
            {imageUri && (
              <Button mode="outlined" onPress={handlePickImage} style={styles.changeButton}>
                Change Image
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Form Fields */}
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
          numberOfLines={4}
          style={styles.input}
        />

        <TextInput
          label="GST Rate (%)"
          value={String(formData.gstRate)}
          onChangeText={(text) => {
            const value = text === '' ? 0 : parseFloat(text);
            if (!isNaN(value)) {
              setFormData({ ...formData, gstRate: value });
            }
          }}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <TextInput
          label="Display Order"
          value={formData.displayOrder.toString()}
          onChangeText={(text) => setFormData({ ...formData, displayOrder: parseInt(text) || 0 })}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />

        <Card style={styles.switchCard}>
          <Card.Content>
            <View style={styles.switchRow}>
              <View>
                <Text variant="titleMedium">Available</Text>
                <Text variant="bodySmall" style={styles.switchHint}>
                  Make this category visible to customers
                </Text>
              </View>
              <Switch
                value={formData.isAvailable}
                onValueChange={(value) => setFormData({ ...formData, isAvailable: value })}
              />
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={!formData.name || isSaving}
          style={styles.saveButton}
        >
          {isEditing ? 'Update Category' : 'Create Category'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  imageCard: {
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  changeButton: {
    marginTop: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  switchCard: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchHint: {
    opacity: 0.6,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    paddingVertical: 6,
  },
});

