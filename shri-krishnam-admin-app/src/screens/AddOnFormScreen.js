import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Switch,
  ActivityIndicator,
  Card,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';

export default function AddOnFormScreen({ route, navigation }) {
  const queryClient = useQueryClient();
  const addOnId = route.params?.addOnId;
  const isEditing = !!addOnId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isAvailable: true,
  });

  // Fetch add-on if editing
  const { data: addOnData, isLoading } = useQuery({
    queryKey: ['addOn', addOnId],
    queryFn: () => menuService.getAddOnById(addOnId),
    enabled: isEditing,
  });

  // Populate form when editing
  useEffect(() => {
    if (addOnData?.addOn) {
      const addOn = addOnData.addOn;
      setFormData({
        name: addOn.name,
        description: addOn.description || '',
        price: addOn.price.toString(),
        isAvailable: addOn.isAvailable,
      });
    }
  }, [addOnData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: menuService.createAddOn,
    onSuccess: () => {
      queryClient.invalidateQueries(['addOns']);
      navigation.goBack();
    },
    onError: (error) => {
      alert('Failed to create add-on: ' + (error.response?.data?.message || error.message));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuService.updateAddOn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['addOns']);
      queryClient.invalidateQueries(['addOn', addOnId]);
      navigation.goBack();
    },
    onError: (error) => {
      alert('Failed to update add-on: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter add-on name');
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      alert('Please enter a valid price');
      return;
    }

    const addOnData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      isAvailable: formData.isAvailable,
    };

    if (isEditing) {
      updateMutation.mutate({ id: addOnId, data: addOnData });
    } else {
      createMutation.mutate(addOnData);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text variant="headlineSmall" style={styles.title}>
        {isEditing ? 'Edit Add-on' : 'Create Add-on'}
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

      <TextInput
        label="Price *"
        value={formData.price}
        onChangeText={(text) => setFormData({ ...formData, price: text })}
        keyboardType="decimal-pad"
        mode="outlined"
        style={styles.input}
        left={<TextInput.Affix text="₹" />}
      />

      <Card style={styles.switchCard}>
        <Card.Content>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text variant="titleMedium">Available</Text>
              <Text variant="bodySmall" style={styles.hint}>
                Make this add-on available for selection
              </Text>
            </View>
            <Switch
              value={formData.isAvailable}
              onValueChange={(value) => setFormData({ ...formData, isAvailable: value })}
            />
          </View>
        </Card.Content>
      </Card>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
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
  switchCard: {
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
  },
  hint: {
    color: '#78716c',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});