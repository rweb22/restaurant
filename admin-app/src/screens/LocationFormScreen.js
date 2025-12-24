import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

export default function LocationFormScreen({ route, navigation }) {
  const queryClient = useQueryClient();
  const locationId = route.params?.locationId;
  const isEditing = !!locationId;

  const [formData, setFormData] = useState({
    name: '',
    area: '',
    city: 'Chandigarh',
    state: 'Chandigarh',
    pincode: '',
    deliveryCharge: '',
    estimatedDeliveryTime: '',
    isAvailable: true,
  });

  // Fetch location if editing
  const { data: locationData, isLoading } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => menuService.getLocationById(locationId),
    enabled: isEditing,
  });

  // Populate form when editing
  useEffect(() => {
    if (locationData?.location) {
      const location = locationData.location;
      setFormData({
        name: location.name,
        area: location.area || '',
        city: location.city || 'Chandigarh',
        state: location.state || 'Chandigarh',
        pincode: location.pincode || '',
        deliveryCharge: location.deliveryCharge.toString(),
        estimatedDeliveryTime: location.estimatedDeliveryTime?.toString() || '',
        isAvailable: location.isAvailable,
      });
    }
  }, [locationData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: menuService.createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries(['locations']);
      navigation.goBack();
    },
    onError: (error) => {
      alert('Failed to create location: ' + (error.response?.data?.message || error.message));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuService.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['locations']);
      queryClient.invalidateQueries(['location', locationId]);
      navigation.goBack();
    },
    onError: (error) => {
      alert('Failed to update location: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter location name');
      return;
    }

    if (!formData.deliveryCharge || parseFloat(formData.deliveryCharge) < 0) {
      alert('Please enter a valid delivery charge');
      return;
    }

    const locationData = {
      name: formData.name,
      area: formData.area || null,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode || null,
      deliveryCharge: parseFloat(formData.deliveryCharge),
      estimatedDeliveryTime: formData.estimatedDeliveryTime
        ? parseInt(formData.estimatedDeliveryTime)
        : null,
      isAvailable: formData.isAvailable,
    };

    if (isEditing) {
      updateMutation.mutate({ id: locationId, data: locationData });
    } else {
      createMutation.mutate(locationData);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        {isEditing ? 'Edit Location' : 'Create Location'}
      </Text>

      <TextInput
        label="Name *"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Area"
        value={formData.area}
        onChangeText={(text) => setFormData({ ...formData, area: text })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="City"
        value={formData.city}
        onChangeText={(text) => setFormData({ ...formData, city: text })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="State"
        value={formData.state}
        onChangeText={(text) => setFormData({ ...formData, state: text })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Pincode"
        value={formData.pincode}
        onChangeText={(text) => setFormData({ ...formData, pincode: text })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Delivery Charge *"
        value={formData.deliveryCharge}
        onChangeText={(text) => setFormData({ ...formData, deliveryCharge: text })}
        keyboardType="decimal-pad"
        mode="outlined"
        style={styles.input}
        left={<TextInput.Affix text="₹" />}
      />

      <TextInput
        label="Estimated Delivery Time (minutes)"
        value={formData.estimatedDeliveryTime}
        onChangeText={(text) => setFormData({ ...formData, estimatedDeliveryTime: text })}
        keyboardType="number-pad"
        mode="outlined"
        style={styles.input}
      />

      <Card style={styles.switchCard}>
        <Card.Content>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text variant="titleMedium">Available</Text>
              <Text variant="bodySmall" style={styles.hint}>
                Make this location available for delivery
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

