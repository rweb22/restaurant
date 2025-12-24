import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Appbar,
  Surface,
  ActivityIndicator,
  Menu,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import locationService from '../services/locationService';
import addressService from '../services/addressService';
import useDeliveryStore from '../store/deliveryStore';

const AddAddressScreen = ({ navigation, route }) => {
  const queryClient = useQueryClient();
  const { selectedAddress } = useDeliveryStore();
  const [label, setLabel] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);

  // Check if this is the first address (user must add one)
  const isFirstAddress = route.params?.isFirstAddress || false;

  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getLocations({ available: true }),
  });

  useEffect(() => {
    if (locationsData) {
      console.log('[AddAddress] Locations loaded:', locationsData.locations?.length || 0);
    }
  }, [locationsData]);

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
    // If this is the first address and user hasn't selected one yet, warn them
    if (isFirstAddress && !selectedAddress) {
      Alert.alert(
        'Address Required',
        'You need to add a delivery address to continue browsing. Are you sure you want to go back?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Go Back', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSave = () => {
    console.log('[AddAddress] Save button clicked');
    console.log('[AddAddress] Current state:', {
      label,
      addressLine1,
      addressLine2,
      landmark,
      selectedLocation,
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
    if (!selectedLocation) {
      console.log('[AddAddress] Validation failed: No location selected');
      Alert.alert('Error', 'Please select a location');
      return;
    }

    const addressData = {
      label: label.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || null,
      landmark: landmark.trim() || null,
      locationId: selectedLocation.id,
    };

    console.log('[AddAddress] Validation passed! Creating address with data:', addressData);
    createAddressMutation.mutate(addressData);
  };

  const locations = locationsData?.locations || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Add Address" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Surface style={styles.surface} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Address Details
          </Text>
          <Text variant="bodySmall" style={styles.helperText}>
            Fields marked with * are required
          </Text>

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

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Delivery Location *
          </Text>

          {locationsLoading ? (
            <ActivityIndicator style={styles.loader} />
          ) : (
            <Menu
              visible={locationMenuVisible}
              onDismiss={() => setLocationMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setLocationMenuVisible(true)}
                  icon="map-marker"
                  style={styles.locationButton}
                  contentStyle={styles.locationButtonContent}
                >
                  {selectedLocation
                    ? `${selectedLocation.area}, ${selectedLocation.city}`
                    : 'Select Location'}
                </Button>
              }
            >
              {locations.map((location) => (
                <View key={location.id}>
                  <Menu.Item
                    onPress={() => {
                      setSelectedLocation(location);
                      setLocationMenuVisible(false);
                    }}
                    title={`${location.area}, ${location.city}`}
                    leadingIcon={selectedLocation?.id === location.id ? 'check' : 'map-marker'}
                  />
                  <Divider />
                </View>
              ))}
            </Menu>
          )}

          {selectedLocation && (
            <Surface style={styles.locationInfo} elevation={0}>
              <Text variant="bodyMedium" style={styles.locationInfoText}>
                📍 {selectedLocation.name}
              </Text>
              <Text variant="bodySmall" style={styles.deliveryInfo}>
                🚚 Delivery: ₹{selectedLocation.deliveryCharge} • {selectedLocation.estimatedDeliveryTime} mins
              </Text>
            </Surface>
          )}
        </Surface>
      </ScrollView>

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


