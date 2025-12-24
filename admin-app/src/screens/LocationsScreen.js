import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  FAB,
  IconButton,
  useTheme,
  Chip,
  ActivityIndicator,
  Menu,
  Divider,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';

export default function LocationsScreen({ navigation }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [menuVisible, setMenuVisible] = useState({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['locations'],
    queryFn: menuService.getLocations,
  });

  const deleteMutation = useMutation({
    mutationFn: menuService.deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries(['locations']);
    },
  });

  const handleDelete = (locationId) => {
    if (confirm('Are you sure you want to delete this location?')) {
      deleteMutation.mutate(locationId);
    }
  };

  const openMenu = (id) => setMenuVisible({ ...menuVisible, [id]: true });
  const closeMenu = (id) => setMenuVisible({ ...menuVisible, [id]: false });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const locations = data?.locations || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <Text variant="headlineSmall" style={styles.title}>
          Locations Management
        </Text>

        {locations.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No locations found. Click the + button to create one.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          locations.map((location) => (
            <Card key={location.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text variant="titleLarge" style={styles.locationName}>
                      {location.name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.address}>
                      {location.city}, {location.state} - {location.pincode}
                    </Text>
                  </View>
                  <Menu
                    visible={menuVisible[location.id]}
                    onDismiss={() => closeMenu(location.id)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        size={24}
                        onPress={() => openMenu(location.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        closeMenu(location.id);
                        navigation.navigate('LocationForm', { locationId: location.id });
                      }}
                      title="Edit"
                      leadingIcon="pencil"
                    />
                    <Divider />
                    <Menu.Item
                      onPress={() => {
                        closeMenu(location.id);
                        handleDelete(location.id);
                      }}
                      title="Delete"
                      leadingIcon="delete"
                    />
                  </Menu>
                </View>

                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text variant="labelMedium" style={styles.label}>
                      Delivery Charge:
                    </Text>
                    <Text variant="bodyLarge" style={styles.price}>
                      ₹{parseFloat(location.deliveryCharge).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text variant="labelMedium" style={styles.label}>
                      Status:
                    </Text>
                    <Chip
                      mode="flat"
                      textStyle={{
                        color: location.isAvailable ? theme.colors.tertiary : theme.colors.error,
                      }}
                      style={{
                        backgroundColor: location.isAvailable
                          ? `${theme.colors.tertiary}20`
                          : `${theme.colors.error}20`,
                      }}
                    >
                      {location.isAvailable ? 'Available' : 'Unavailable'}
                    </Chip>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('LocationForm')}
      />
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  emptyCard: {
    marginTop: 20,
    backgroundColor: '#fafaf9',
  },
  emptyText: {
    textAlign: 'center',
    color: '#78716c',
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  locationName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    color: '#78716c',
    marginBottom: 8,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#78716c',
    minWidth: 100,
  },
  price: {
    fontWeight: '600',
    color: '#16a34a',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});