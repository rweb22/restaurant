import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Chip,
  FAB,
  Menu,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';

export default function MenuManagementScreen({ navigation }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [menuVisible, setMenuVisible] = useState(null);
  const [menuType, setMenuType] = useState(null); // 'category', 'item', 'size'

  // Fetch categories with items and sizes
  const { data: categoriesData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['menu-management'],
    queryFn: async () => {
      const categoriesRes = await menuService.getCategories({ includeAddOns: true });
      const itemsRes = await menuService.getItems({ includeSizes: true, includeAddOns: true });

      // Group items by category
      const itemsByCategory = {};
      itemsRes.items.forEach(item => {
        if (!itemsByCategory[item.categoryId]) {
          itemsByCategory[item.categoryId] = [];
        }
        itemsByCategory[item.categoryId].push(item);
      });

      return {
        categories: categoriesRes.categories,
        itemsByCategory,
      };
    },
  });

  // Delete mutations
  const deleteCategoryMutation = useMutation({
    mutationFn: menuService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-management']);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: menuService.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-management']);
    },
  });

  const deleteItemSizeMutation = useMutation({
    mutationFn: menuService.deleteItemSize,
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-management']);
    },
  });

  const deleteCategoryAddOnMutation = useMutation({
    mutationFn: menuService.deleteCategoryAddOn,
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-management']);
    },
  });

  const deleteItemAddOnMutation = useMutation({
    mutationFn: menuService.deleteItemAddOn,
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-management']);
    },
  });

  const categories = categoriesData?.categories || [];
  const itemsByCategory = categoriesData?.itemsByCategory || {};

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleMenuOpen = (id, type) => {
    setMenuVisible(id);
    setMenuType(type);
  };

  const handleMenuClose = () => {
    setMenuVisible(null);
    setMenuType(null);
  };

  const handleEdit = (id, type) => {
    handleMenuClose();
    if (type === 'category') {
      navigation.navigate('CategoryForm', { categoryId: id });
    } else if (type === 'item') {
      navigation.navigate('ItemForm', { itemId: id });
    } else if (type === 'size') {
      navigation.navigate('ItemSizeForm', { sizeId: id });
    }
  };

  const handleDelete = (id, type) => {
    handleMenuClose();
    const confirmMessage = `Are you sure you want to delete this ${type}?`;
    if (confirm(confirmMessage)) {
      if (type === 'category') {
        deleteCategoryMutation.mutate(id);
      } else if (type === 'item') {
        deleteItemMutation.mutate(id);
      } else if (type === 'size') {
        deleteItemSizeMutation.mutate(id);
      }
    }
  };

  const handleAddItem = (categoryId) => {
    handleMenuClose();
    navigation.navigate('ItemForm', { categoryId });
  };

  const handleAddSize = (itemId) => {
    handleMenuClose();
    navigation.navigate('ItemSizeForm', { itemId });
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {categories.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text>No categories yet. Create one to get started!</Text>
            </Card.Content>
          </Card>
        ) : (
          categories.map((category) => {
            const items = itemsByCategory[category.id] || [];
            const isExpanded = expandedCategories[category.id];

            return (
              <Card key={category.id} style={styles.categoryCard}>
                <Card.Content>
                  {/* Category Header */}
                  <View style={styles.categoryHeader}>
                    <IconButton
                      icon={isExpanded ? 'chevron-down' : 'chevron-right'}
                      size={24}
                      onPress={() => toggleCategory(category.id)}
                      style={styles.expandIcon}
                    />
                    <View style={styles.categoryInfo}>
                      <Text variant="titleLarge" style={styles.categoryName}>
                        📁 {category.name}
                      </Text>
                      <View style={styles.categoryMeta}>
                        <Chip
                          compact
                          mode="flat"
                          textStyle={{
                            color: category.isAvailable ? theme.colors.tertiary : theme.colors.error,
                            fontSize: 11,
                            lineHeight: 14,
                          }}
                          style={{
                            backgroundColor: category.isAvailable
                              ? `${theme.colors.tertiary}20`
                              : `${theme.colors.error}20`,
                            height: 24,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          {category.isAvailable ? 'Available' : 'Unavailable'}
                        </Chip>
                        <Text variant="bodySmall" style={styles.metaText}>
                          GST: {category.gstRate}%
                        </Text>
                        <Text variant="bodySmall" style={styles.metaText}>
                          {items.length} items
                        </Text>
                        {category.addOns && category.addOns.length > 0 && (
                          <Text variant="bodySmall" style={styles.metaText}>
                            🧩 {category.addOns.length} add-ons
                          </Text>
                        )}
                      </View>
                    </View>
                    <Menu
                      visible={menuVisible === `cat-${category.id}` && menuType === 'category'}
                      onDismiss={handleMenuClose}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          size={20}
                          onPress={() => handleMenuOpen(`cat-${category.id}`, 'category')}
                        />
                      }
                    >
                      <Menu.Item
                        onPress={() => handleEdit(category.id, 'category')}
                        title="Edit Category"
                        leadingIcon="pencil"
                      />
                      <Menu.Item
                        onPress={() => handleAddItem(category.id)}
                        title="Add Item"
                        leadingIcon="plus"
                      />
                      <Menu.Item
                        onPress={() => {
                          handleMenuClose();
                          navigation.navigate('CategoryAddOnForm', { categoryId: category.id });
                        }}
                        title="Manage Add-ons"
                        leadingIcon="puzzle"
                      />
                      <Menu.Item
                        onPress={() => handleDelete(category.id, 'category')}
                        title="Delete Category"
                        leadingIcon="delete"
                      />
                    </Menu>
                  </View>

                  {/* Items List (shown when expanded) */}
                  {isExpanded && (
                    <View style={styles.itemsContainer}>
                      {items.length === 0 ? (
                        <View style={styles.emptyItems}>
                          <Text variant="bodySmall" style={styles.emptyText}>
                            No items in this category
                          </Text>
                          <IconButton
                            icon="plus-circle"
                            size={20}
                            onPress={() => handleAddItem(category.id)}
                          />
                        </View>
                      ) : (
                        items.map((item) => {
                          const sizes = item.sizes || [];
                          const isItemExpanded = expandedItems[item.id];

                          return (
                            <View key={item.id} style={styles.itemCard}>
                              {/* Item Header */}
                              <View style={styles.itemHeader}>
                                <IconButton
                                  icon={isItemExpanded ? 'chevron-down' : 'chevron-right'}
                                  size={20}
                                  onPress={() => toggleItem(item.id)}
                                  style={styles.expandIcon}
                                />
                                <View style={styles.itemInfo}>
                                  <Text variant="titleMedium" style={styles.itemName}>
                                    📦 {item.name}
                                  </Text>
                                  <View style={styles.itemMeta}>
                                    <Chip
                                      compact
                                      mode="flat"
                                      textStyle={{
                                        color: item.isAvailable ? theme.colors.tertiary : theme.colors.error,
                                        fontSize: 10,
                                        lineHeight: 12,
                                      }}
                                      style={{
                                        backgroundColor: item.isAvailable
                                          ? `${theme.colors.tertiary}20`
                                          : `${theme.colors.error}20`,
                                        height: 20,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </Chip>
                                    <Text variant="bodySmall" style={styles.metaText}>
                                      {sizes.length} sizes
                                    </Text>
                                    {item.addOns && item.addOns.length > 0 && (
                                      <Text variant="bodySmall" style={styles.metaText}>
                                        🧩 {item.addOns.length} add-ons
                                      </Text>
                                    )}
                                  </View>
                                </View>
                                <Menu
                                  visible={menuVisible === `item-${item.id}` && menuType === 'item'}
                                  onDismiss={handleMenuClose}
                                  anchor={
                                    <IconButton
                                      icon="dots-vertical"
                                      size={18}
                                      onPress={() => handleMenuOpen(`item-${item.id}`, 'item')}
                                    />
                                  }
                                >
                                  <Menu.Item
                                    onPress={() => handleEdit(item.id, 'item')}
                                    title="Edit Item"
                                    leadingIcon="pencil"
                                  />
                                  <Menu.Item
                                    onPress={() => handleAddSize(item.id)}
                                    title="Add Size"
                                    leadingIcon="plus"
                                  />
                                  <Menu.Item
                                    onPress={() => {
                                      handleMenuClose();
                                      navigation.navigate('ItemAddOnForm', { itemId: item.id });
                                    }}
                                    title="Manage Add-ons"
                                    leadingIcon="puzzle"
                                  />
                                  <Menu.Item
                                    onPress={() => handleDelete(item.id, 'item')}
                                    title="Delete Item"
                                    leadingIcon="delete"
                                  />
                                </Menu>
                              </View>

                              {/* Sizes List (shown when item is expanded) */}
                              {isItemExpanded && (
                                <View style={styles.sizesContainer}>
                                  {sizes.length === 0 ? (
                                    <View style={styles.emptySizes}>
                                      <Text variant="bodySmall" style={styles.emptyText}>
                                        No sizes for this item
                                      </Text>
                                      <IconButton
                                        icon="plus-circle"
                                        size={16}
                                        onPress={() => handleAddSize(item.id)}
                                      />
                                    </View>
                                  ) : (
                                    sizes.map((size) => (
                                      <View key={size.id} style={styles.sizeRow}>
                                        <Text variant="bodyMedium" style={styles.sizeName}>
                                          📏 {size.size}
                                        </Text>
                                        <Text variant="bodyMedium" style={styles.sizePrice}>
                                          ₹{size.price}
                                        </Text>
                                        <Chip
                                          compact
                                          mode="flat"
                                          textStyle={{
                                            color: size.isAvailable ? theme.colors.tertiary : theme.colors.error,
                                            fontSize: 9,
                                            lineHeight: 11,
                                          }}
                                          style={{
                                            backgroundColor: size.isAvailable
                                              ? `${theme.colors.tertiary}20`
                                              : `${theme.colors.error}20`,
                                            height: 18,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                          }}
                                        >
                                          {size.isAvailable ? 'Available' : 'Unavailable'}
                                        </Chip>
                                        <Menu
                                          visible={menuVisible === `size-${size.id}` && menuType === 'size'}
                                          onDismiss={handleMenuClose}
                                          anchor={
                                            <IconButton
                                              icon="dots-vertical"
                                              size={16}
                                              onPress={() => handleMenuOpen(`size-${size.id}`, 'size')}
                                            />
                                          }
                                        >
                                          <Menu.Item
                                            onPress={() => handleEdit(size.id, 'size')}
                                            title="Edit Size"
                                            leadingIcon="pencil"
                                          />
                                          <Menu.Item
                                            onPress={() => handleDelete(size.id, 'size')}
                                            title="Delete Size"
                                            leadingIcon="delete"
                                          />
                                        </Menu>
                                      </View>
                                    ))
                                  )}
                                </View>
                              )}
                            </View>
                          );
                        })
                      )}
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CategoryForm')}
        label="Add Category"
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
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  categoryCard: {
    marginBottom: 16,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    margin: 0,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaText: {
    color: '#666',
    fontSize: 12,
  },
  itemsContainer: {
    marginLeft: 32,
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
  },
  emptyItems: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
  itemCard: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sizesContainer: {
    marginLeft: 28,
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#d0d0d0',
  },
  emptySizes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 4,
  },
  sizeName: {
    flex: 1,
    fontWeight: '500',
  },
  sizePrice: {
    fontWeight: 'bold',
    color: '#d32f2f',
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

