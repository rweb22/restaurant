import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import {
  Text,
  Searchbar,
  FAB,
  Card,
  Chip,
  IconButton,
  Menu,
  ActivityIndicator,
  SegmentedButtons,
  Switch,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';

export default function ItemsScreen({ navigation }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(null);

  // Fetch items
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => menuService.getItems({ includeSizes: true, includeAddOns: true }),
  });

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: menuService.getCategories,
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: menuService.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
    },
  });

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ itemId, isAvailable }) =>
      menuService.updateItem(itemId, { isAvailable }),
    onMutate: async ({ itemId, isAvailable }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['items']);

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['items']);

      // Optimistically update
      queryClient.setQueryData(['items'], (old) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map(item =>
            item.id === itemId ? { ...item, isAvailable } : item
          )
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['items'], context.previousData);
      }
    },
    onSuccess: (data, variables) => {
      // Update cache with server response (no refetch needed)
      queryClient.setQueryData(['items'], (old) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map(item =>
            item.id === variables.itemId ? data.item : item
          )
        };
      });
    },
  });

  const items = itemsData?.items || [];
  const categories = categoriesData?.categories || [];

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.categoryId === parseInt(categoryFilter);

    return matchesSearch && matchesCategory;
  });

  // Category filter options
  const categoryOptions = [
    { value: 'all', label: 'All' },
    ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name })),
  ];

  const handleEdit = (item) => {
    setMenuVisible(null);
    navigation.navigate('ItemForm', { itemId: item.id });
  };

  const handleDelete = (itemId) => {
    setMenuVisible(null);
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(itemId);
    }
  };

  const handleToggleAvailability = (itemId, currentValue) => {
    toggleAvailabilityMutation.mutate({
      itemId,
      isAvailable: !currentValue
    });
  };

  const renderItem = ({ item }) => {
    const primaryPicture = item.pictures?.find((p) => p.isPrimary) || item.pictures?.[0];

    return (
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          {primaryPicture && (
            <Image source={{ uri: primaryPicture.url }} style={styles.image} />
          )}
          <View style={styles.details}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text variant="titleMedium" style={styles.title}>
                  {item.name}
                </Text>
                <Text variant="bodySmall" style={styles.category}>
                  {item.category?.name}
                </Text>
              </View>
              <Menu
                visible={menuVisible === item.id}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => setMenuVisible(item.id)}
                  />
                }
              >
                <Menu.Item onPress={() => handleEdit(item)} title="Edit" leadingIcon="pencil" />
                <Menu.Item
                  onPress={() => handleDelete(item.id)}
                  title="Delete"
                  leadingIcon="delete"
                />
              </Menu>
            </View>

            {item.description && (
              <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <View style={styles.sizes}>
              {item.sizes?.map((size) => (
                <Chip key={size.id} compact style={styles.sizeChip}>
                  {size.size}: ₹{size.price}
                </Chip>
              ))}
            </View>

            <View style={styles.footer}>
              <View style={styles.footerLeft}>
                <Chip
                  icon={item.isAvailable ? 'check-circle' : 'close-circle'}
                  textStyle={{ color: item.isAvailable ? '#16a34a' : '#dc2626' }}
                  style={styles.statusChip}
                >
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </Chip>
                {item.addOns && item.addOns.length > 0 && (
                  <Text variant="bodySmall" style={styles.addOnsCount}>
                    {item.addOns.length} add-ons
                  </Text>
                )}
              </View>
              <Switch
                value={item.isAvailable}
                onValueChange={() => handleToggleAvailability(item.id, item.isAvailable)}
                disabled={toggleAvailabilityMutation.isPending}
              />
            </View>
          </View>
        </View>
      </Card>
    );
  };

  if (itemsLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search items..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <SegmentedButtons
        value={categoryFilter}
        onValueChange={setCategoryFilter}
        buttons={categoryOptions}
        style={styles.segmentedButtons}
      />

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge">No items found</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('ItemForm')}
        label="Add Item"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  category: {
    color: '#666',
    marginTop: 2,
  },
  description: {
    color: '#666',
    marginBottom: 8,
  },
  sizes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  sizeChip: {
    height: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusChip: {
    height: 24,
  },
  addOnsCount: {
    color: '#666',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});