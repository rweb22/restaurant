import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  IconButton,
  Surface,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import addressService from '../services/addressService';
import useDeliveryStore from '../store/deliveryStore';

const AddressSelectionModal = ({ visible, onDismiss, onAddAddress, onManageAddresses }) => {
  const { selectedAddress, setSelectedAddress } = useDeliveryStore();
  const [tempSelectedAddress, setTempSelectedAddress] = useState(null);

  const { data: addressesData, isLoading, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
    enabled: visible,
  });

  const addresses = addressesData?.addresses || [];

  // Validate selected address when addresses are loaded
  useEffect(() => {
    if (visible && !isLoading && addresses.length > 0) {
      // Check if the currently selected address still exists
      if (selectedAddress) {
        const addressExists = addresses.some(addr => addr.id === selectedAddress.id);
        if (!addressExists) {
          // Selected address no longer exists, clear it
          console.log('[AddressSelectionModal] Selected address no longer exists, clearing...');
          setSelectedAddress(null);
          setTempSelectedAddress(null);
        } else {
          setTempSelectedAddress(selectedAddress);
        }
      }
    } else if (visible && !isLoading && addresses.length === 0) {
      // No addresses available, clear selection
      if (selectedAddress) {
        console.log('[AddressSelectionModal] No addresses available, clearing selection...');
        setSelectedAddress(null);
        setTempSelectedAddress(null);
      }
    } else if (visible) {
      setTempSelectedAddress(selectedAddress);
    }
  }, [visible, isLoading, addresses.length]);

  const handleConfirm = () => {
    if (tempSelectedAddress) {
      setSelectedAddress(tempSelectedAddress);
      onDismiss();
    }
  };

  const handleAddressSelect = (address) => {
    setTempSelectedAddress(address);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
        dismissable={!!selectedAddress}
      >
        <Surface style={styles.surface} elevation={4}>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              Select Delivery Address
            </Text>
            {selectedAddress && (
              <IconButton icon="close" size={24} onPress={onDismiss} />
            )}
          </View>

          <Divider />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No saved addresses found
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Add a delivery address to continue
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView}>
              {addresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  onPress={() => handleAddressSelect(address)}
                  activeOpacity={0.7}
                >
                  <Surface
                    style={[
                      styles.addressCard,
                      tempSelectedAddress?.id === address.id && styles.selectedCard,
                    ]}
                    elevation={tempSelectedAddress?.id === address.id ? 2 : 0}
                  >
                    <View style={styles.addressHeader}>
                      <Text variant="titleMedium" style={styles.addressLabel}>
                        {address.label || 'Address'}
                      </Text>
                      {tempSelectedAddress?.id === address.id && (
                        <IconButton icon="check-circle" iconColor="#16a34a" size={24} />
                      )}
                    </View>
                    <Text variant="bodyMedium" style={styles.addressText}>
                      {address.addressLine1}
                    </Text>
                    {address.addressLine2 && (
                      <Text variant="bodyMedium" style={styles.addressText}>
                        {address.addressLine2}
                      </Text>
                    )}
                    {address.landmark && (
                      <Text variant="bodySmall" style={styles.landmark}>
                        Landmark: {address.landmark}
                      </Text>
                    )}
                    {address.location && (
                      <View style={styles.locationInfo}>
                        <Text variant="bodySmall" style={styles.locationText}>
                          📍 {address.location.area}, {address.location.city}
                        </Text>
                        <Text variant="bodySmall" style={styles.deliveryInfo}>
                          🚚 ₹{address.location.deliveryCharge} • {address.location.estimatedDeliveryTime} mins
                        </Text>
                      </View>
                    )}
                  </Surface>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Divider />
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Button mode="outlined" onPress={onAddAddress} icon="plus" style={styles.addButton}>
                Add New
              </Button>
              {onManageAddresses && addresses.length > 0 && (
                <Button mode="outlined" onPress={onManageAddresses} icon="cog" style={styles.manageButton}>
                  Manage
                </Button>
              )}
            </View>
            {addresses.length > 0 && (
              <Button
                mode="contained"
                onPress={handleConfirm}
                disabled={!tempSelectedAddress}
                style={styles.confirmButton}
              >
                Confirm
              </Button>
            )}
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  surface: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#78716c',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#a8a29e',
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  addressCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fafaf9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  selectedCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
    borderWidth: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontWeight: 'bold',
    color: '#292524',
  },
  addressText: {
    color: '#57534e',
    marginBottom: 4,
  },
  landmark: {
    color: '#78716c',
    marginTop: 4,
  },
  locationInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
  },
  locationText: {
    color: '#78716c',
    marginBottom: 4,
  },
  deliveryInfo: {
    color: '#16a34a',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    gap: 8,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    flex: 1,
    borderColor: '#dc2626',
  },
  manageButton: {
    flex: 1,
    borderColor: '#78716c',
  },
  confirmButton: {
    paddingVertical: 4,
  },
});

export default AddressSelectionModal;

