import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
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

const EditAddressScreen = ({ navigation, route }) => {
  const queryClient = useQueryClient();
  const { addressId } = route.params;
  
  const [label, setLabel] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Fetch address details
  const { data: addressData, isLoading: addressLoading } = useQuery({
    queryKey: ['address', addressId],
    queryFn: () => addressService.getAddressById(addressId),
  });

  // Fetch locations
  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getLocations({ available: true }),
  });

  // Populate form when address data is loaded
  useEffect(() => {
    if (addressData?.address) {
      const address = addressData.address;
      setLabel(address.label || '');
      setAddressLine1(address.addressLine1 || '');
      setAddressLine2(address.addressLine2 || '');
      setLandmark(address.landmark || '');
      if (address.location) {
        setSelectedLocation(address.location);
      }
    }
  }, [addressData]);

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }) => addressService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      queryClient.invalidateQueries(['address', addressId]);
      setSuccessModalVisible(true);
    },
    onError: (error) => {
      console.error('[EditAddress] Error updating address:', error);
      let errorMessage = error.response?.data?.message || 'Failed to update address';
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

  const handleSave = () => {
    if (!label.trim()) {
      Alert.alert('Error', 'Please enter an address label');
      return;
    }

    if (!addressLine1.trim()) {
      Alert.alert('Error', 'Please enter address line 1');
      return;
    }

    if (!selectedLocation) {
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

    updateAddressMutation.mutate({ id: addressId, data: addressData });
  };

  if (addressLoading || locationsLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Edit Address" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      </SafeAreaView>
    );
  }

  const locations = locationsData?.locations || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Edit Address" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.formContainer} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Address Details
          </Text>

          <TextInput
            label="Label (e.g., Home, Office)"
            value={label}
            onChangeText={setLabel}
            mode="outlined"
            style={styles.input}
            placeholder="Home"
          />

          <TextInput
            label="Address Line 1 *"
            value={addressLine1}
            onChangeText={setAddressLine1}
            mode="outlined"
            style={styles.input}
            placeholder="House/Flat No., Building Name"
            multiline
          />

          <TextInput
            label="Address Line 2"
            value={addressLine2}
            onChangeText={setAddressLine2}
            mode="outlined"
            style={styles.input}
            placeholder="Street, Area"
            multiline
          />

          <TextInput
            label="Landmark"
            value={landmark}
            onChangeText={setLandmark}
            mode="outlined"
            style={styles.input}
            placeholder="Nearby landmark (optional)"
          />

          <Menu
            visible={locationMenuVisible}
            onDismiss={() => setLocationMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setLocationMenuVisible(true)}
                style={styles.locationButton}
                contentStyle={styles.locationButtonContent}
                icon="map-marker"
              >
                {selectedLocation ? selectedLocation.name : 'Select Location *'}
              </Button>
            }
          >
            {locations.map((location) => (
              <Menu.Item
                key={location.id}
                onPress={() => {
                  setSelectedLocation(location);
                  setLocationMenuVisible(false);
                }}
                title={location.name}
                leadingIcon={selectedLocation?.id === location.id ? 'check' : undefined}
              />
            ))}
          </Menu>

          {selectedLocation && (
            <Surface style={styles.locationInfo} elevation={0}>
              <Text variant="bodySmall" style={styles.locationInfoText}>
                📍 {selectedLocation.area}, {selectedLocation.city} - {selectedLocation.pincode}
              </Text>
              <Text variant="bodySmall" style={styles.locationInfoText}>
                🚚 Delivery Charge: ₹{selectedLocation.deliveryCharge}
              </Text>
              <Text variant="bodySmall" style={styles.locationInfoText}>
                ⏱️ Estimated Time: {selectedLocation.estimatedDeliveryTime}
              </Text>
            </Surface>
          )}

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            loading={updateAddressMutation.isPending}
            disabled={updateAddressMutation.isPending}
          >
            Save Changes
          </Button>
        </Surface>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setSuccessModalVisible(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              ✅ Address Updated
            </Text>

            <Text variant="bodyMedium" style={styles.modalMessage}>
              Your address has been updated successfully.
            </Text>

            <Button
              mode="contained"
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.goBack();
              }}
              style={styles.modalButton}
            >
              Done
            </Button>
          </Surface>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 16,
  },
  formContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#292524',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  locationButton: {
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  locationButtonContent: {
    justifyContent: 'flex-start',
  },
  locationInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  locationInfoText: {
    color: '#0c4a6e',
    marginBottom: 4,
  },
  saveButton: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#292524',
  },
  modalMessage: {
    color: '#78716c',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    marginTop: 8,
  },
});

export default EditAddressScreen;

