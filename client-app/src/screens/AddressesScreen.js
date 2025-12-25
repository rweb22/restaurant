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
  Icon,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import addressService from '../services/addressService';
import useDeliveryStore from '../store/deliveryStore';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

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
    <Surface style={styles.addressCard} elevation={2}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTitleRow}>
          <Icon source="map-marker" size={20} color={colors.primary[500]} />
          <Text variant="titleMedium" style={styles.addressLabel}>
            {item.label || 'Address'}
          </Text>
          {item.isDefault ? (
            <Chip mode="flat" style={styles.defaultChip} textStyle={styles.defaultChipText}>
              Default
            </Chip>
          ) : null}
        </View>
        <View style={styles.addressActions}>
          <IconButton
            icon="pencil"
            size={20}
            iconColor={colors.primary[500]}
            onPress={() => handleEditPress(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            iconColor={colors.error}
            onPress={() => handleDeletePress(item)}
          />
        </View>
      </View>

      <View style={styles.addressContent}>
        <Text variant="bodyMedium" style={styles.addressText}>
          {item.addressLine1}
        </Text>
        {item.addressLine2 ? (
          <Text variant="bodyMedium" style={styles.addressText}>
            {item.addressLine2}
          </Text>
        ) : null}
        {item.landmark ? (
          <View style={styles.landmarkRow}>
            <Icon source="map-marker-radius" size={16} color={colors.text.secondary} />
            <Text variant="bodySmall" style={styles.landmark}>
              {item.landmark}
            </Text>
          </View>
        ) : null}
        {item.location ? (
          <Text variant="bodySmall" style={styles.location}>
            {item.location.area}, {item.location.city} - {item.location.pincode}
          </Text>
        ) : null}
      </View>

      {!item.isDefault ? (
        <Button
          mode="outlined"
          onPress={() => handleSetDefault(item)}
          style={styles.setDefaultButton}
          buttonColor={colors.white}
          textColor={colors.primary[500]}
          loading={setDefaultMutation.isPending}
          disabled={setDefaultMutation.isPending}
        >
          Set as Default
        </Button>
      ) : null}
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
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading addresses...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="My Addresses" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Icon source="alert-circle" size={64} color={colors.error} />
          <Text variant="titleLarge" style={styles.errorText}>
            Failed to load addresses
          </Text>
          <Button
            mode="contained"
            onPress={() => refetch()}
            style={styles.retryButton}
            buttonColor={colors.primary[500]}
          >
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Addresses" subtitle={`${addresses.length} saved`} />
        <Appbar.Action
          icon="plus"
          iconColor={colors.primary[500]}
          onPress={() => navigation.navigate('AddAddress')}
        />
      </Appbar.Header>

      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon source="map-marker-outline" size={80} color={colors.secondary[300]} />
          </View>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No Addresses Saved
          </Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Add a delivery address to place orders
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AddAddress')}
            style={styles.addButton}
            buttonColor={colors.primary[500]}
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
    backgroundColor: colors.background,
  },
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  emptyText: {
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  addButton: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
  },
  // List
  listContent: {
    padding: spacing.lg,
  },
  // Address Card
  addressCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  addressTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: spacing.xs,
    marginRight: spacing.sm,
  },
  defaultChip: {
    backgroundColor: colors.success + '20',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultChipText: {
    fontSize: fontSize.xs,
    color: colors.success,
    marginVertical: 0,
    textAlign: 'center',
  },
  addressActions: {
    flexDirection: 'row',
    marginRight: -spacing.md,
  },
  addressContent: {
    marginTop: spacing.xs,
  },
  addressText: {
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  landmark: {
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  location: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  setDefaultButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    borderColor: colors.primary[500],
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: colors.text.primary,
  },
  modalMessage: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addressPreview: {
    backgroundColor: colors.secondary[100],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  addressPreviewText: {
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  addressPreviewSubtext: {
    color: colors.text.secondary,
  },
  modalButtons: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
  },
});

export default AddressesScreen;

