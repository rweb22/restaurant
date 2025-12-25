import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';

export default function ItemSizeFormScreen({ route, navigation }) {
  const queryClient = useQueryClient();
  const sizeId = route.params?.sizeId;
  const itemIdParam = route.params?.itemId;
  const isEditing = !!sizeId;

  const [formData, setFormData] = useState({
    itemId: itemIdParam || null,
    size: '',
    price: '',
    isAvailable: true,
  });

  // Fetch items for dropdown
  const { data: itemsData } = useQuery({
    queryKey: ['items'],
    queryFn: menuService.getItems,
  });

  // Fetch size if editing
  const { data: sizeData, isLoading } = useQuery({
    queryKey: ['itemSize', sizeId],
    queryFn: async () => {
      // Get all items and find the size
      const items = await menuService.getItems();
      for (const item of items.items) {
        const size = item.sizes?.find(s => s.id === sizeId);
        if (size) {
          return { size, itemId: item.id };
        }
      }
      return null;
    },
    enabled: isEditing,
  });

  // Populate form when editing
  useEffect(() => {
    if (sizeData?.size) {
      setFormData({
        itemId: sizeData.itemId,
        size: sizeData.size.size,
        price: sizeData.size.price.toString(),
        isAvailable: sizeData.size.isAvailable,
      });
    }
  }, [sizeData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: ({ itemId, data }) => menuService.addSizeToItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
      navigation.goBack();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuService.updateItemSize(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
      navigation.goBack();
    },
  });

  const handleSubmit = () => {
    if (!formData.itemId) {
      alert('Please select an item');
      return;
    }
    if (!formData.size.trim()) {
      alert('Please enter size name');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const sizeData = {
      size: formData.size,
      price: parseFloat(formData.price),
      isAvailable: formData.isAvailable,
    };

    if (isEditing) {
      updateMutation.mutate({ id: sizeId, data: sizeData });
    } else {
      createMutation.mutate({ itemId: formData.itemId, data: sizeData });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const items = itemsData?.items || [];
  const itemButtons = items.map((item) => ({
    value: item.id.toString(),
    label: item.name,
  }));

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        {isEditing ? 'Edit Item Size' : 'Add Item Size'}
      </Text>

      <Text variant="titleSmall" style={styles.label}>
        Select Item *
      </Text>
      <SegmentedButtons
        value={formData.itemId?.toString() || ''}
        onValueChange={(value) => setFormData({ ...formData, itemId: parseInt(value) })}
        buttons={itemButtons}
        style={styles.segmentedButtons}
        disabled={isEditing}
      />

      <TextInput
        label="Size Name *"
        value={formData.size}
        onChangeText={(text) => setFormData({ ...formData, size: text })}
        mode="outlined"
        style={styles.input}
        placeholder="e.g. Small, Medium, Large, 9 inch"
      />

      <TextInput
        label="Price *"
        value={formData.price}
        onChangeText={(text) => setFormData({ ...formData, price: text })}
        mode="outlined"
        keyboardType="decimal-pad"
        style={styles.input}
        left={<TextInput.Affix text="₹" />}
      />

      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSaving}
          disabled={isSaving}
          style={styles.button}
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
  label: {
    marginTop: 8,
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});

