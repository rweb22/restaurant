import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import useAuthStore from '../../store/authStore';
import restaurantService from '../../services/restaurantService';

export default function GeneralSettingsTab({ settings, onUpdate, showSnackbar }) {
  const { token } = useAuthStore();
  const [formData, setFormData] = useState({
    restaurantName: '',
    restaurantPhone: '',
    restaurantAddress: '',
    taxPercentage: '',
    minimumOrderValue: '',
    estimatedPrepTimeMinutes: '',
    deliveryFee: '',
    estimatedDeliveryTimeMinutes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        restaurantName: settings.restaurantName || '',
        restaurantPhone: settings.restaurantPhone || '',
        restaurantAddress: settings.restaurantAddress || '',
        taxPercentage: settings.taxPercentage?.toString() || '',
        minimumOrderValue: settings.minimumOrderValue?.toString() || '',
        estimatedPrepTimeMinutes: settings.estimatedPrepTimeMinutes?.toString() || '',
        deliveryFee: settings.deliveryFee?.toString() || '',
        estimatedDeliveryTimeMinutes: settings.estimatedDeliveryTimeMinutes?.toString() || ''
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await restaurantService.updateSettings({
        restaurantName: formData.restaurantName,
        restaurantPhone: formData.restaurantPhone,
        restaurantAddress: formData.restaurantAddress,
        taxPercentage: parseFloat(formData.taxPercentage) || 0,
        minimumOrderValue: parseFloat(formData.minimumOrderValue) || 0,
        estimatedPrepTimeMinutes: parseInt(formData.estimatedPrepTimeMinutes) || 30,
        deliveryFee: parseFloat(formData.deliveryFee) || 40,
        estimatedDeliveryTimeMinutes: parseInt(formData.estimatedDeliveryTimeMinutes) || 30
      });
      showSnackbar('Settings updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Error updating settings:', error);
      showSnackbar('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <TextInput
          label="Restaurant Name"
          value={formData.restaurantName}
          onChangeText={(text) => setFormData({ ...formData, restaurantName: text })}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Phone Number"
          value={formData.restaurantPhone}
          onChangeText={(text) => setFormData({ ...formData, restaurantPhone: text })}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TextInput
          label="Address"
          value={formData.restaurantAddress}
          onChangeText={(text) => setFormData({ ...formData, restaurantAddress: text })}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <TextInput
          label="Tax Percentage (%)"
          value={formData.taxPercentage}
          onChangeText={(text) => setFormData({ ...formData, taxPercentage: text })}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <TextInput
          label="Minimum Order Value (₹)"
          value={formData.minimumOrderValue}
          onChangeText={(text) => setFormData({ ...formData, minimumOrderValue: text })}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <TextInput
          label="Estimated Prep Time (minutes)"
          value={formData.estimatedPrepTimeMinutes}
          onChangeText={(text) => setFormData({ ...formData, estimatedPrepTimeMinutes: text })}
          mode="outlined"
          keyboardType="number-pad"
          style={styles.input}
        />

        <TextInput
          label="Delivery Fee (₹)"
          value={formData.deliveryFee}
          onChangeText={(text) => setFormData({ ...formData, deliveryFee: text })}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <TextInput
          label="Estimated Delivery Time (minutes)"
          value={formData.estimatedDeliveryTimeMinutes}
          onChangeText={(text) => setFormData({ ...formData, estimatedDeliveryTimeMinutes: text })}
          mode="outlined"
          keyboardType="number-pad"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        >
          Save Changes
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16
  },
  input: {
    marginBottom: 16
  },
  saveButton: {
    marginTop: 8
  }
});
