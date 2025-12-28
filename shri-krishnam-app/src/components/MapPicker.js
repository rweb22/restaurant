import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform, Keyboard } from 'react-native';
import { Modal, Portal, Text, Button, IconButton, ActivityIndicator } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';
import { GOOGLE_MAPS_CONFIG } from '../constants/config';

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
  const [showSearch, setShowSearch] = useState(false);
  const googlePlacesRef = useRef(null);

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

  const handlePlaceSelect = (data, details = null) => {
    if (details) {
      const { lat, lng } = details.geometry.location;
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setMarkerPosition({ latitude: lat, longitude: lng });
      setShowSearch(false);
      Keyboard.dismiss();
    }
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
            <View style={styles.headerButtons}>
              <IconButton
                icon="magnify"
                size={24}
                onPress={() => setShowSearch(!showSearch)}
              />
              <IconButton
                icon="close"
                size={24}
                onPress={onDismiss}
              />
            </View>
          </View>

          {/* Search Bar */}
          {showSearch && (
            <View style={styles.searchContainer}>
              <GooglePlacesAutocomplete
                ref={googlePlacesRef}
                placeholder="Search for a place..."
                onPress={handlePlaceSelect}
                query={{
                  key: GOOGLE_MAPS_CONFIG.API_KEY,
                  language: 'en',
                  components: 'country:in', // Restrict to India
                }}
                fetchDetails={true}
                enablePoweredByContainer={false}
                styles={{
                  container: {
                    flex: 0,
                  },
                  textInputContainer: {
                    backgroundColor: colors.white,
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                  },
                  textInput: {
                    height: 44,
                    color: colors.text.primary,
                    fontSize: fontSize.md,
                    backgroundColor: colors.secondary[50],
                    borderRadius: borderRadius.md,
                  },
                  listView: {
                    backgroundColor: colors.white,
                  },
                  row: {
                    backgroundColor: colors.white,
                    padding: spacing.md,
                    height: 58,
                  },
                  separator: {
                    height: 1,
                    backgroundColor: colors.secondary[100],
                  },
                  description: {
                    fontSize: fontSize.sm,
                    color: colors.text.primary,
                  },
                  predefinedPlacesDescription: {
                    color: colors.primary,
                  },
                }}
                textInputProps={{
                  placeholderTextColor: colors.text.secondary,
                  returnKeyType: 'search',
                }}
              />
            </View>
          )}

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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[100],
    zIndex: 1,
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

