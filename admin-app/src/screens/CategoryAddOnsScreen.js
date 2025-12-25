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

export default function CategoryAddOnsScreen({ navigation }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [menuVisible, setMenuVisible] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['categoryAddOns'],
    queryFn: menuService.getCategoryAddOns,
  });

  const deleteMutation = useMutation({
    mutationFn: menuService.deleteCategoryAddOn,
    onSuccess: () => {
      queryClient.invalidateQueries(['categoryAddOns']);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete association');
    },
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this add-on from the category?')) {
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

  const categoryAddOns = data?.categoryAddOns || [];

  const filteredCategoryAddOns = categoryAddOns.filter(ca =>
    ca.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ca.addOn?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <Text variant="headlineSmall" style={styles.title}>
          Category Add-ons Management
        </Text>

        <Searchbar
          placeholder="Search by category or add-on name"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {filteredCategoryAddOns.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No category add-ons found. Click the + button to link add-ons to categories.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredCategoryAddOns.map((ca) => (
            <Card key={ca.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text variant="titleLarge" style={styles.categoryName}>
                      {ca.category?.name || 'Unknown Category'}
                    </Text>
                    <Text variant="bodyMedium" style={styles.addOnName}>
                      Add-on: {ca.addOn?.name || 'Unknown Add-on'}
                    </Text>
                    <Text variant="bodyLarge" style={styles.price}>
                      ₹{parseFloat(ca.addOn?.price || 0).toFixed(2)}
                    </Text>
                  </View>
                  <Menu
                    visible={menuVisible[ca.id]}
                    onDismiss={() => closeMenu(ca.id)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        size={24}
                        onPress={() => openMenu(ca.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        closeMenu(ca.id);
                        handleDelete(ca.id);
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
        onPress={() => navigation.navigate('CategoryAddOnForm')}
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
  categoryName: {
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

