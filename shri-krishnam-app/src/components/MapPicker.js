import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { Modal, Portal, Text, Button, IconButton, ActivityIndicator, TextInput, Divider } from 'react-native-paper';
import MapView, { Marker, UrlTile } from 'react-native-maps';
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
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimeoutRef = useRef(null);
  const geocodeCacheRef = useRef({});
  const lastGeocodeRequestRef = useRef(0);
  const GEOCODE_THROTTLE_MS = 1000; // Respect Nominatim's 1 request/second limit
  const MAX_CACHE_SIZE = 50; // Limit cache to 50 entries to prevent memory issues

  useEffect(() => {
    if (visible) {
      requestLocationPermission();
    }
  }, [visible]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
    // Check cache first
    const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    if (geocodeCacheRef.current[cacheKey]) {
      console.log('[MapPicker] Using cached geocoding result');
      return geocodeCacheRef.current[cacheKey];
    }

    // Throttle requests to respect Nominatim's rate limit (1 req/sec)
    const now = Date.now();
    const timeSinceLastRequest = now - lastGeocodeRequestRef.current;
    if (timeSinceLastRequest < GEOCODE_THROTTLE_MS) {
      const waitTime = GEOCODE_THROTTLE_MS - timeSinceLastRequest;
      console.log(`[MapPicker] Throttling geocoding request, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastGeocodeRequestRef.current = Date.now();

    try {
      // Use Nominatim (OpenStreetMap's free geocoding service)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ShriKrishnamApp/1.0', // Required by Nominatim
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Geocoding request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        const result = {
          addressLine1: [
            addr.house_number,
            addr.road || addr.street,
          ].filter(Boolean).join(' ').trim() || addr.neighbourhood || addr.suburb || 'Unknown',
          city: addr.city || addr.town || addr.village || addr.county || '',
          state: addr.state || '',
          postalCode: addr.postcode || '',
          country: addr.country || 'India',
        };

        // Cache the result (with size limit)
        const cacheKeys = Object.keys(geocodeCacheRef.current);
        if (cacheKeys.length >= MAX_CACHE_SIZE) {
          // Remove oldest entry (first key)
          delete geocodeCacheRef.current[cacheKeys[0]];
        }
        geocodeCacheRef.current[cacheKey] = result;
        return result;
      }
      return null;
    } catch (error) {
      const isAbortError = error.name === 'AbortError';
      console.error(`Error reverse geocoding${isAbortError ? ' (timeout)' : ''}:`, error.message);

      // Fallback to expo-location if Nominatim fails
      try {
        console.log('[MapPicker] Falling back to expo-location for geocoding');
        const results = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (results && results.length > 0) {
          const address = results[0];
          const result = {
            addressLine1: `${address.name || ''} ${address.street || ''}`.trim() || 'Unknown location',
            city: address.city || address.subregion || '',
            state: address.region || '',
            postalCode: address.postalCode || '',
            country: address.country || 'India',
          };

          // Cache the fallback result too (with size limit)
          const cacheKeys = Object.keys(geocodeCacheRef.current);
          if (cacheKeys.length >= MAX_CACHE_SIZE) {
            delete geocodeCacheRef.current[cacheKeys[0]];
          }
          geocodeCacheRef.current[cacheKey] = result;
          return result;
        }
      } catch (fallbackError) {
        console.error('Fallback geocoding also failed:', fallbackError);
      }

      // Return a basic result with coordinates if all geocoding fails
      return {
        addressLine1: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      };
    }
  };

  const searchPlaces = async (query) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);

      // Add timeout to search request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': 'ShriKrishnamApp/1.0',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Search request failed with status ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
      const isAbortError = error.name === 'AbortError';
      console.error(`Error searching places${isAbortError ? ' (timeout)' : ''}:`, error.message);

      if (!isAbortError) {
        Alert.alert('Search Error', 'Failed to search for places. Please try again.');
      }
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search - wait 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(text);
    }, 500);
  };

  const handleSearchResultSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    const newRegion = {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setRegion(newRegion);
    setMarkerPosition({ latitude: lat, longitude: lon });
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    Keyboard.dismiss();
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
              <TextInput
                mode="outlined"
                placeholder="Search for a place..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                style={styles.searchInput}
                left={<TextInput.Icon icon="magnify" />}
                right={
                  searchQuery ? (
                    <TextInput.Icon
                      icon="close"
                      onPress={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    />
                  ) : null
                }
              />

              {/* Search Results */}
              {searchLoading && (
                <View style={styles.searchLoadingContainer}>
                  <ActivityIndicator size="small" />
                  <Text variant="bodySmall" style={styles.searchLoadingText}>
                    Searching...
                  </Text>
                </View>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.place_id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.searchResultItem}
                        onPress={() => handleSearchResultSelect(item)}
                      >
                        <IconButton icon="map-marker" size={20} />
                        <View style={styles.searchResultText}>
                          <Text variant="bodyMedium" numberOfLines={1}>
                            {item.display_name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <Divider />}
                    style={styles.searchResultsList}
                  />
                </View>
              )}

              {!searchLoading && searchQuery.length >= 3 && searchResults.length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text variant="bodySmall" style={styles.noResultsText}>
                    No results found
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onPress={handleMapPress}
              onRegionChangeComplete={setRegion}
              mapType="none"
            >
              {/* OpenStreetMap Tiles */}
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
              />
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
            <Text variant="bodySmall" style={styles.instruction}>
              🗺️ Using OpenStreetMap (Free & Open Source)
            </Text>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[100],
    maxHeight: '50%',
  },
  searchInput: {
    backgroundColor: colors.white,
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchLoadingText: {
    color: colors.text.secondary,
  },
  searchResultsContainer: {
    marginTop: spacing.sm,
    maxHeight: 250,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.secondary[100],
  },
  searchResultsList: {
    flexGrow: 0,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  searchResultText: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  noResultsContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  noResultsText: {
    color: colors.text.secondary,
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

