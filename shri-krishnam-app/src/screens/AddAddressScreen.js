import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Appbar,
  Surface,
  ActivityIndicator,
  Menu,
  Divider,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import addressService from '../services/addressService';
import MapPicker from '../components/MapPicker';

const AddAddressScreen = ({ navigation, route }) => {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);

  // Check if navigated from modal
  const fromModal = route.params?.fromModal || false;

  const createAddressMutation = useMutation({
    mutationFn: addressService.createAddress,
    onSuccess: () => {
      console.log('[AddAddress] Address created successfully');
      queryClient.invalidateQueries(['addresses']);
      Alert.alert('Success', 'Address added successfully');
      navigation.goBack();
    },
    onError: (error) => {
      console.error('[AddAddress] Error creating address:', error);
      console.error('[AddAddress] Error response:', error.response?.data);
      console.error('[AddAddress] Validation errors:', error.response?.data?.errors);

      // Show detailed error message
      let errorMessage = error.response?.data?.message || 'Failed to add address';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorDetails = Object.entries(errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        errorMessage = `${errorMessage}\n\n${errorDetails}`;
      }

      Alert.alert('Error', errorMessage);
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLocationSelect = (locationData) => {
    console.log('[AddAddress] Location selected from map:', locationData);
    setAddressLine1(locationData.addressLine1 || '');
    setCity(locationData.city || '');
    setState(locationData.state || '');
    setPostalCode(locationData.postalCode || '');
    setSelectedCoordinates({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    });
  };

  const handleSave = () => {
    console.log('[AddAddress] Save button clicked');
    console.log('[AddAddress] Current state:', {
      label,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
    });

    if (!label.trim()) {
      console.log('[AddAddress] Validation failed: No label');
      Alert.alert('Error', 'Please enter an address label');
      return;
    }
    if (!addressLine1.trim()) {
      console.log('[AddAddress] Validation failed: No address line 1');
      Alert.alert('Error', 'Please enter address line 1');
      return;
    }
    if (!city.trim()) {
      console.log('[AddAddress] Validation failed: No city');
      Alert.alert('Error', 'Please enter city');
      return;
    }

    const addressData = {
      label: label.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || null,
      city: city.trim(),
      state: state.trim() || null,
      postalCode: postalCode.trim() || null,
      country: 'India',
      landmark: landmark.trim() || null,
      // Include coordinates if selected from map
      ...(selectedCoordinates && {
        latitude: selectedCoordinates.latitude,
        longitude: selectedCoordinates.longitude,
      }),
    };

    console.log('[AddAddress] Validation passed! Creating address with data:', addressData);
    createAddressMutation.mutate(addressData);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Add Address" />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <Surface style={styles.surface} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Address Details
          </Text>
          <Text variant="bodySmall" style={styles.helperText}>
            Fields marked with * are required
          </Text>

          {/* Pick on Map Button */}
          <Button
            mode="outlined"
            icon="map-marker"
            onPress={() => setMapPickerVisible(true)}
            style={styles.mapButton}
          >
            Pick Location on Map
          </Button>

          <TextInput
            label="Label *"
            placeholder="e.g., Home, Office, Work"
            value={label}
            onChangeText={setLabel}
            mode="outlined"
            style={styles.input}
            error={!label.trim() && label !== ''}
          />

          <TextInput
            label="Address Line 1 *"
            placeholder="House/Flat No., Building Name, Street"
            value={addressLine1}
            onChangeText={setAddressLine1}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
            error={!addressLine1.trim() && addressLine1 !== ''}
          />

          <TextInput
            label="Address Line 2"
            placeholder="Area, Sector (Optional)"
            value={addressLine2}
            onChangeText={setAddressLine2}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
          />

          <TextInput
            label="Landmark"
            placeholder="Nearby landmark (Optional)"
            value={landmark}
            onChangeText={setLandmark}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="City *"
            placeholder="Enter city"
            value={city}
            onChangeText={setCity}
            mode="outlined"
            style={styles.input}
            error={!city.trim() && city !== ''}
          />

          <TextInput
            label="State"
            placeholder="Enter state (Optional)"
            value={state}
            onChangeText={setState}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Postal Code"
            placeholder="Enter postal code (Optional)"
            value={postalCode}
            onChangeText={setPostalCode}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
          />
        </Surface>
      </ScrollView>
      </KeyboardAvoidingView>

      <Surface style={styles.bottomBar} elevation={4}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={createAddressMutation.isPending}
          disabled={createAddressMutation.isPending}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          Save Address
        </Button>
      </Surface>

      {/* Map Picker Modal */}
      <MapPicker
        visible={mapPickerVisible}
        onDismiss={() => setMapPickerVisible(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={selectedCoordinates}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
  scrollView: {
    flex: 1,
  },
  surface: {
    padding: 16,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
  },
  helperText: {
    color: '#78716c',
    marginBottom: 12,
  },
  mapButton: {
    marginBottom: 16,
    borderColor: '#FF9800',
  },
  input: {
    marginBottom: 16,
  },
  locationButton: {
    marginBottom: 16,
  },
  locationButtonContent: {
    justifyContent: 'flex-start',
  },
  loader: {
    marginVertical: 20,
  },
  locationInfo: {
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginTop: 8,
  },
  locationInfoText: {
    color: '#292524',
    marginBottom: 4,
  },
  deliveryInfo: {
    color: '#16a34a',
    fontWeight: '500',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
  },
  saveButton: {
    paddingVertical: 4,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});

export default AddAddressScreen;


