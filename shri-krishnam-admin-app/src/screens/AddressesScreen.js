import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  Chip,
  IconButton,
  Searchbar,
  FAB,
  Portal,
  Dialog,
  Button,
  ActivityIndicator
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllAddresses, deleteAddress } from '../services/addressService';

const AddressesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const queryClient = useQueryClient();

  // Fetch addresses
  const { data, isLoading, error } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => getAllAddresses()
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      setDeleteDialogVisible(false);
      setSelectedAddress(null);
    }
  });

  const handleDelete = (address) => {
    setSelectedAddress(address);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    if (selectedAddress) {
      deleteMutation.mutate(selectedAddress.id);
    }
  };

  const filteredAddresses = data?.addresses?.filter(address => {
    const searchLower = searchQuery.toLowerCase();
    return (
      address.user?.name?.toLowerCase().includes(searchLower) ||
      address.user?.phone?.includes(searchQuery) ||
      address.addressLine1?.toLowerCase().includes(searchLower) ||
      address.city?.toLowerCase().includes(searchLower) ||
      address.location?.name?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const renderAddress = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('AddressForm', { addressId: item.id })}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium">{item.label || 'Address'}</Text>
            {item.isDefault && (
              <Chip icon="star" compact style={styles.defaultChip}>Default</Chip>
            )}
          </View>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDelete(item)}
          />
        </View>

        <View style={styles.userInfo}>
          <Text variant="bodyMedium" style={styles.userName}>
            {item.user?.name || 'Unknown User'}
          </Text>
          <Text variant="bodySmall" style={styles.phone}>
            {item.user?.phone}
          </Text>
        </View>

        <Text variant="bodyMedium" style={styles.address}>
          {item.addressLine1}
          {item.addressLine2 && `, ${item.addressLine2}`}
        </Text>

        {(item.city || item.state || item.pincode) && (
          <Text variant="bodySmall" style={styles.cityState}>
            {[item.city, item.state, item.pincode].filter(Boolean).join(', ')}
          </Text>
        )}

        {item.landmark && (
          <Text variant="bodySmall" style={styles.landmark}>
            Landmark: {item.landmark}
          </Text>
        )}

        {item.location && (
          <Chip icon="map-marker" compact style={styles.locationChip}>
            {item.location.name}
          </Chip>
        )}
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error loading addresses: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search addresses..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredAddresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No addresses found</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddressForm')}
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Address</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this address?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete} loading={deleteMutation.isPending}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchbar: {
    margin: 16,
    marginBottom: 8
  },
  list: {
    padding: 16,
    paddingTop: 8
  },
  card: {
    marginBottom: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  defaultChip: {
    height: 24
  },
  userInfo: {
    marginBottom: 8
  },
  userName: {
    fontWeight: 'bold'
  },
  phone: {
    color: '#666',
    marginTop: 2
  },
  address: {
    marginTop: 4
  },
  cityState: {
    color: '#666',
    marginTop: 2
  },
  landmark: {
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic'
  },
  locationChip: {
    alignSelf: 'flex-start',
    marginTop: 8
  },
  empty: {
    padding: 32,
    alignItems: 'center'
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16
  }
});

export default AddressesScreen;

