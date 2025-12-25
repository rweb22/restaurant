import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Modal } from 'react-native';
import {
  Text,
  Button,
  IconButton,
  Appbar,
  Surface,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import addressService from '../services/addressService';
import useDeliveryStore from '../store/deliveryStore';

const AddressesScreen = ({ navigation }) => {
  const queryClient = useQueryClient();
  const { setSelectedAddress, setSelectedLocation } = useDeliveryStore();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Fetch addresses
  const { data: addressesData, isLoading, error, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getAddresses(),
  });

  const addresses = addressesData?.addresses || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      setDeleteModalVisible(false);
      setAddressToDelete(null);
    },
  });

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id) => addressService.setDefaultAddress(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['addresses']);
      // Update delivery store with new default address
      const updatedAddress = response.address;
      setSelectedAddress(updatedAddress);
      setSelectedLocation(updatedAddress.location);
    },
  });

  const handleDeletePress = (address) => {
    setAddressToDelete(address);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (addressToDelete) {
      deleteMutation.mutate(addressToDelete.id);
    }
  };

  const handleSetDefault = (address) => {
    setDefaultMutation.mutate(address.id);
  };

  const handleEditPress = (address) => {
    navigation.navigate('EditAddress', { addressId: address.id });
  };

  const renderAddressItem = ({ item }) => (
    <Surface style={styles.addressCard} elevation={1}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTitleRow}>
          <Text variant="titleMedium" style={styles.addressLabel}>
            {item.label || 'Address'}
          </Text>
          {item.isDefault && (
            <Chip mode="flat" style={styles.defaultChip} textStyle={styles.defaultChipText}>
              Default
            </Chip>
          )}
        </View>
        <View style={styles.addressActions}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => handleEditPress(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            iconColor="#dc2626"
            onPress={() => handleDeletePress(item)}
          />
        </View>
      </View>

      <Text variant="bodyMedium" style={styles.addressText}>
        {item.addressLine1}
      </Text>
      {item.addressLine2 && (
        <Text variant="bodyMedium" style={styles.addressText}>
          {item.addressLine2}
        </Text>
      )}
      {item.landmark && (
        <Text variant="bodySmall" style={styles.landmark}>
          Landmark: {item.landmark}
        </Text>
      )}
      {item.location && (
        <Text variant="bodySmall" style={styles.location}>
          {item.location.area}, {item.location.city} - {item.location.pincode}
        </Text>
      )}

      {!item.isDefault && (
        <Button
          mode="outlined"
          onPress={() => handleSetDefault(item)}
          style={styles.setDefaultButton}
          loading={setDefaultMutation.isPending}
          disabled={setDefaultMutation.isPending}
        >
          Set as Default
        </Button>
      )}
    </Surface>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="My Addresses" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.Content title="My Addresses" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="headlineMedium" style={styles.errorEmoji}>
            ⚠️
          </Text>
          <Text variant="titleMedium" style={styles.errorText}>
            Failed to load addresses
          </Text>
          <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.Content title="My Addresses" subtitle={`${addresses.length} saved`} />
        <Appbar.Action
          icon="plus"
          onPress={() => navigation.navigate('AddAddress')}
        />
      </Appbar.Header>

      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineMedium" style={styles.emptyEmoji}>
            📍
          </Text>
          <Text variant="titleLarge" style={styles.emptyTitle}>
            No Addresses Saved
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Add a delivery address to place orders
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AddAddress')}
            style={styles.addButton}
          >
            Add Address
          </Button>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              🗑️ Delete Address
            </Text>

            <Text variant="bodyMedium" style={styles.modalMessage}>
              Are you sure you want to delete this address?
            </Text>

            {addressToDelete && (
              <View style={styles.addressPreview}>
                <Text variant="bodyMedium" style={styles.addressPreviewText}>
                  {addressToDelete.label || 'Address'}
                </Text>
                <Text variant="bodySmall" style={styles.addressPreviewSubtext}>
                  {addressToDelete.addressLine1}
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setDeleteModalVisible(false)}
                style={styles.modalButton}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                buttonColor="#dc2626"
                onPress={confirmDelete}
                style={styles.modalButton}
                loading={deleteMutation.isPending}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    color: '#78716c',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#292524',
  },
  emptyText: {
    color: '#78716c',
    marginBottom: 24,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  addressCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressLabel: {
    fontWeight: 'bold',
    color: '#292524',
  },
  defaultChip: {
    backgroundColor: '#dcfce7',
    height: 24,
  },
  defaultChipText: {
    fontSize: 11,
    color: '#16a34a',
    marginVertical: 0,
  },
  addressActions: {
    flexDirection: 'row',
    marginRight: -12,
  },
  addressText: {
    color: '#57534e',
    marginBottom: 4,
  },
  landmark: {
    color: '#78716c',
    marginTop: 4,
  },
  location: {
    color: '#78716c',
    marginTop: 2,
  },
  setDefaultButton: {
    marginTop: 12,
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
    marginBottom: 16,
  },
  addressPreview: {
    backgroundColor: '#f5f5f4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  addressPreviewText: {
    fontWeight: 'bold',
    color: '#292524',
    marginBottom: 4,
  },
  addressPreviewSubtext: {
    color: '#78716c',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default AddressesScreen;

