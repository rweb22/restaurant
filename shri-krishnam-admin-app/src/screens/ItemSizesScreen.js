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

export default function ItemSizesScreen({ navigation }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [menuVisible, setMenuVisible] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all items with their sizes
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['items', 'withSizes'],
    queryFn: () => menuService.getItems({ includeSizes: true }),
  });

  const deleteMutation = useMutation({
    mutationFn: menuService.deleteItemSize,
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete size');
    },
  });

  const handleDelete = (sizeId) => {
    if (confirm('Are you sure you want to delete this size?')) {
      deleteMutation.mutate(sizeId);
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

  const items = data?.items || [];

  // Filter items by search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get all sizes from all items
  const allSizes = filteredItems.flatMap(item =>
    (item.sizes || []).map(size => ({
      ...size,
      itemName: item.name,
      itemId: item.id,
    }))
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <Text variant="headlineSmall" style={styles.title}>
          Item Sizes Management
        </Text>

        <Searchbar
          placeholder="Search by item name"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {allSizes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No item sizes found. Click the + button to add sizes to items.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          allSizes.map((size) => (
            <Card key={size.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text variant="titleLarge" style={styles.sizeName}>
                      {size.size}
                    </Text>
                    <Text variant="bodyMedium" style={styles.itemName}>
                      Item: {size.itemName}
                    </Text>
                    <Text variant="bodyLarge" style={styles.price}>
                      ₹{parseFloat(size.price).toFixed(2)}
                    </Text>
                  </View>
                  <Menu
                    visible={menuVisible[size.id]}
                    onDismiss={() => closeMenu(size.id)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        size={24}
                        onPress={() => openMenu(size.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        closeMenu(size.id);
                        navigation.navigate('ItemSizeForm', {
                          sizeId: size.id,
                          itemId: size.itemId
                        });
                      }}
                      title="Edit"
                      leadingIcon="pencil"
                    />
                    <Divider />
                    <Menu.Item
                      onPress={() => {
                        closeMenu(size.id);
                        handleDelete(size.id);
                      }}
                      title="Delete"
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
        onPress={() => navigation.navigate('ItemSizeForm')}
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
  sizeName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemName: {
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

