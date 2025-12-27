import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  FAB,
  IconButton,
  useTheme,
  ActivityIndicator,
  Menu,
  Divider,
  Searchbar,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';

export default function ItemAddOnsScreen({ navigation }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [menuVisible, setMenuVisible] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['itemAddOns'],
    queryFn: menuService.getItemAddOns,
  });

  const deleteMutation = useMutation({
    mutationFn: menuService.deleteItemAddOn,
    onSuccess: () => {
      queryClient.invalidateQueries(['itemAddOns']);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete association');
    },
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this add-on from the item?')) {
      deleteMutation.mutate(id);
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

  const itemAddOns = data?.itemAddOns || [];

  const filteredItemAddOns = itemAddOns.filter(ia =>
    ia.item?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ia.addOn?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <Text variant="headlineSmall" style={styles.title}>
          Item Add-ons Management
        </Text>

        <Searchbar
          placeholder="Search by item or add-on name"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {filteredItemAddOns.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No item add-ons found. Click the + button to link add-ons to items.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredItemAddOns.map((ia) => (
            <Card key={ia.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text variant="titleLarge" style={styles.itemName}>
                      {ia.item?.name || 'Unknown Item'}
                    </Text>
                    <Text variant="bodyMedium" style={styles.addOnName}>
                      Add-on: {ia.addOn?.name || 'Unknown Add-on'}
                    </Text>
                    <Text variant="bodyLarge" style={styles.price}>
                      ₹{parseFloat(ia.addOn?.price || 0).toFixed(2)}
                    </Text>
                  </View>
                  <Menu
                    visible={menuVisible[ia.id]}
                    onDismiss={() => closeMenu(ia.id)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        size={24}
                        onPress={() => openMenu(ia.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        closeMenu(ia.id);
                        handleDelete(ia.id);
                      }}
                      title="Remove"
                      leadingIcon="delete"
                    />
                  </Menu>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('ItemAddOnForm')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  searchbar: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addOnName: {
    color: '#666',
    marginBottom: 8,
  },
  price: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  emptyCard: {
    marginTop: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

