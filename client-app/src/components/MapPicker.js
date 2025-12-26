import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Modal, Portal, Text, Button, IconButton, ActivityIndicator, Searchbar } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

const MapPicker = ({ visible, onDismiss, onLocationSelect, initialLocation }) => {
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 28.6139, // Default to Delhi
    longitude: initialLocation?.longitude || 77.2090,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLocation?.latitude || 28.6139,
    longitude: initialLocation?.longitude || 77.2090,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      requestLocationPermission();
    }
  }, [visible]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to show your current location on the map.'
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setMarkerPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results && results.length > 0) {
        const address = results[0];
        return {
          addressLine1: `${address.name || ''} ${address.street || ''}`.trim(),
          city: address.city || address.subregion || '',
          state: address.region || '',
          postalCode: address.postalCode || '',
          country: address.country || 'India',
        };
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
  };

  const handleConfirm = async () => {
    setLoading(true);
    const addressDetails = await reverseGeocode(markerPosition.latitude, markerPosition.longitude);
    setLoading(false);

    if (addressDetails) {
      onLocationSelect({
        ...addressDetails,
        latitude: markerPosition.latitude,
        longitude: markerPosition.longitude,
      });
      onDismiss();
    } else {
      Alert.alert('Error', 'Failed to get address details for this location');
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              Pick Location
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
            />
          </View>

          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onPress={handleMapPress}
              onRegionChangeComplete={setRegion}
            >
              <Marker
                coordinate={markerPosition}
                draggable
                onDragEnd={(e) => setMarkerPosition(e.nativeEvent.coordinate)}
              />
            </MapView>

            {/* Current Location Button */}
            <IconButton
              icon="crosshairs-gps"
              mode="contained"
              containerColor={colors.white}
              iconColor={colors.primary}
              size={24}
              style={styles.gpsButton}
              onPress={getCurrentLocation}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.instruction}>
              Tap on the map or drag the marker to select your location
            </Text>
            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={loading}
              disabled={loading}
              style={styles.confirmButton}
            >
              Confirm Location
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    height: '90%',
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[100],
  },
  title: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  gpsButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    ...shadows.md,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary[100],
  },
  instruction: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
  confirmButton: {
    borderRadius: borderRadius.lg,
  },
});

export default MapPicker;

