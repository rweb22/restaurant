import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, TouchableWithoutFeedback, Modal } from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Chip,
  FAB,
  Menu,
  ActivityIndicator,
  useTheme,
  Switch,
  SegmentedButtons,
  Divider,
  Badge,
  List,
  Surface,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';

export default function MenuManagementScreen({ navigation }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('categories'); // 'categories', 'items', 'sizes'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuVisible, setMenuVisible] = useState(null);
  const [menuType, setMenuType] = useState(null); // 'category', 'item', 'size'
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuOpenTimeRef = useRef(null);

  console.log('[MenuManagement] RENDER - menuVisible:', menuVisible, 'menuType:', menuType);

  // Close menu when navigating away
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.log('[MenuManagement] Screen blur - closing menu');
      setMenuVisible(null);
      setMenuType(null);
    });

    return unsubscribe;
  }, [navigation]);

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

  const [togglingCategoryId, setTogglingCategoryId] = React.useState(null);
  const [togglingItemId, setTogglingItemId] = React.useState(null);

  // Toggle availability mutations
  const toggleCategoryAvailabilityMutation = useMutation({
    mutationFn: ({ categoryId, isAvailable }) =>
      menuService.updateCategory(categoryId, { isAvailable }),
    onMutate: async ({ categoryId, isAvailable }) => {
      setTogglingCategoryId(categoryId);

      await queryClient.cancelQueries(['menu-management']);
      const previousData = queryClient.getQueryData(['menu-management']);

      queryClient.setQueryData(['menu-management'], (old) => {
        if (!old?.categories) return old;
        return {
          ...old,
          categories: old.categories.map(cat =>
            cat.id === categoryId ? { ...cat, isAvailable } : cat
          )
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['menu-management'], context.previousData);
      }
      setTogglingCategoryId(null);
    },
    onSettled: () => {
      setTogglingCategoryId(null);
    },
  });

  const toggleItemAvailabilityMutation = useMutation({
    mutationFn: ({ itemId, isAvailable }) =>
      menuService.updateItem(itemId, { isAvailable }),
    onMutate: async ({ itemId, isAvailable }) => {
      setTogglingItemId(itemId);

      await queryClient.cancelQueries(['menu-management']);
      const previousData = queryClient.getQueryData(['menu-management']);

      queryClient.setQueryData(['menu-management'], (old) => {
        if (!old?.itemsByCategory) return old;
        const newItemsByCategory = {};
        Object.keys(old.itemsByCategory).forEach(catId => {
          newItemsByCategory[catId] = old.itemsByCategory[catId].map(item =>
            item.id === itemId ? { ...item, isAvailable } : item
          );
        });
        return {
          ...old,
          itemsByCategory: newItemsByCategory
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['menu-management'], context.previousData);
      }
      setTogglingItemId(null);
    },
    onSettled: () => {
      setTogglingItemId(null);
    },
  });

  const categories = categoriesData?.categories || [];
  const itemsByCategory = categoriesData?.itemsByCategory || {};

  // Get all items (flattened)
  const allItems = Object.values(itemsByCategory).flat();

  // Get all sizes (flattened)
  const allSizes = allItems.flatMap(item =>
    (item.sizes || []).map(size => ({
      ...size,
      itemName: item.name,
      itemId: item.id,
      categoryName: categories.find(c => c.id === item.categoryId)?.name || 'Unknown'
    }))
  );

  // Filter items based on selected category
  const filteredItems = selectedCategory
    ? itemsByCategory[selectedCategory] || []
    : allItems;

  // Filter sizes based on selected item
  const filteredSizes = selectedItem
    ? allSizes.filter(size => size.itemId === selectedItem)
    : allSizes;

  const handleMenuOpen = (id, type, buttonRef) => {
    console.log('[MenuManagement] Opening menu:', id, type);

    // Measure the button position to attach menu to it
    if (buttonRef && buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setMenuPosition({
          x: pageX - 200, // Position menu to the left of the button (menu width is 200)
          y: pageY // Align top of menu with top of button
        });
        setMenuVisible(id);
        setMenuType(type);
      });
    } else {
      setMenuVisible(id);
      setMenuType(type);
    }

    menuOpenTimeRef.current = Date.now();
  };

  const handleMenuClose = () => {
    console.log('[MenuManagement] Closing menu');
    setMenuVisible(null);
    setMenuType(null);
    menuOpenTimeRef.current = null;
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

  const handleToggleCategoryAvailability = (categoryId, currentValue) => {
    toggleCategoryAvailabilityMutation.mutate({
      categoryId,
      isAvailable: !currentValue
    });
  };

  const handleToggleItemAvailability = (itemId, currentValue) => {
    toggleItemAvailabilityMutation.mutate({
      itemId,
      isAvailable: !currentValue
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render Categories View
  const renderCategoriesView = () => (
    <ScrollView
      style={styles.scrollContent}
      contentContainerStyle={styles.scrollContentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      scrollEnabled={menuVisible === null}
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

          return (
            <Card key={category.id} style={styles.categoryCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text variant="headlineSmall" style={styles.cardTitle}>
                      {category.name}
                    </Text>
                    <View style={styles.cardMeta}>
                      <Chip
                        compact
                        mode="flat"
                        icon={category.isAvailable ? 'check-circle' : 'close-circle'}
                        textStyle={{ fontSize: 12 }}
                        style={{
                          backgroundColor: category.isAvailable
                            ? `${theme.colors.tertiary}20`
                            : `${theme.colors.error}20`,
                        }}
                      >
                        {category.isAvailable ? 'Available' : 'Unavailable'}
                      </Chip>
                      <Chip compact icon="food" textStyle={{ fontSize: 12 }}>
                        {items.length} items
                      </Chip>
                      <Chip compact icon="percent" textStyle={{ fontSize: 12 }}>
                        GST {category.gstRate}%
                      </Chip>
                      {category.addOns && category.addOns.length > 0 && (
                        <Chip compact icon="puzzle" textStyle={{ fontSize: 12 }}>
                          {category.addOns.length} add-ons
                        </Chip>
                      )}
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <Switch
                      value={category.isAvailable}
                      onValueChange={() => handleToggleCategoryAvailability(category.id, category.isAvailable)}
                      disabled={togglingCategoryId === category.id}
                    />
                    <View ref={ref => { if (ref) category._menuButtonRef = { current: ref }; }}>
                      <IconButton
                        icon="dots-vertical"
                        size={24}
                        onPress={() => {
                          if (menuVisible === `cat-${category.id}`) {
                            handleMenuClose();
                          } else {
                            handleMenuOpen(`cat-${category.id}`, 'category', category._menuButtonRef);
                          }
                        }}
                      />
                    </View>

                    <Modal
                      visible={menuVisible === `cat-${category.id}`}
                      transparent={true}
                      animationType="none"
                      onRequestClose={handleMenuClose}
                    >
                      <TouchableWithoutFeedback onPress={handleMenuClose}>
                        <View style={styles.modalOverlay}>
                          <TouchableWithoutFeedback>
                            <Surface style={[styles.contextMenu, {
                              top: menuPosition.y,
                              left: menuPosition.x
                            }]} elevation={4}>
                              <List.Item
                                title="Edit Category"
                                left={props => <List.Icon {...props} icon="pencil" />}
                                onPress={() => handleEdit(category.id, 'category')}
                                style={styles.menuItem}
                              />
                              <Divider />
                              <List.Item
                                title="Add Item"
                                left={props => <List.Icon {...props} icon="plus" />}
                                onPress={() => handleAddItem(category.id)}
                                style={styles.menuItem}
                              />
                              <Divider />
                              <List.Item
                                title="Manage Add-ons"
                                left={props => <List.Icon {...props} icon="puzzle" />}
                                onPress={() => {
                                  handleMenuClose();
                                  navigation.navigate('CategoryAddOnForm', { categoryId: category.id });
                                }}
                                style={styles.menuItem}
                              />
                              <Divider />
                              <List.Item
                                title="Delete Category"
                                left={props => <List.Icon {...props} icon="delete" />}
                                onPress={() => handleDelete(category.id, 'category')}
                                style={styles.menuItem}
                              />
                            </Surface>
                          </TouchableWithoutFeedback>
                        </View>
                      </TouchableWithoutFeedback>
                    </Modal>
                  </View>
                </View>

                <Divider style={styles.divider} />

                <TouchableOpacity
                  style={styles.viewItemsButton}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setViewMode('items');
                  }}
                >
                  <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                    View {items.length} Items →
                  </Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );

  // Render Items View
  const renderItemsView = () => {
    const categoryName = selectedCategory
      ? categories.find(c => c.id === selectedCategory)?.name
      : 'All Categories';

    return (
      <>
        {selectedCategory && (
          <Card style={styles.breadcrumbCard}>
            <Card.Content style={styles.breadcrumb}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(null);
                  setViewMode('categories');
                }}
                style={styles.breadcrumbButton}
              >
                <IconButton icon="arrow-left" size={20} style={{ margin: 0 }} />
                <Text variant="labelLarge">Back to Categories</Text>
              </TouchableOpacity>
              <Text variant="titleMedium" style={styles.breadcrumbText}>
                {categoryName}
              </Text>
            </Card.Content>
          </Card>
        )}

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          scrollEnabled={menuVisible === null}
        >
          {filteredItems.length === 0 ? (
            <Card style={styles.card}>
              <Card.Content>
                <Text>No items yet. Create one to get started!</Text>
              </Card.Content>
            </Card>
          ) : (
            filteredItems.map((item) => {
              const sizes = item.sizes || [];
              const category = categories.find(c => c.id === item.categoryId);

              return (
                <Card key={item.id} style={styles.categoryCard}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Text variant="headlineSmall" style={styles.cardTitle}>
                          {item.name}
                        </Text>
                        <View style={styles.cardMeta}>
                          {!selectedCategory && (
                            <Chip compact icon="folder" textStyle={{ fontSize: 12 }}>
                              {category?.name || 'Unknown'}
                            </Chip>
                          )}
                          <Chip
                            compact
                            mode="flat"
                            icon={item.isAvailable ? 'check-circle' : 'close-circle'}
                            textStyle={{ fontSize: 12 }}
                            style={{
                              backgroundColor: item.isAvailable
                                ? `${theme.colors.tertiary}20`
                                : `${theme.colors.error}20`,
                            }}
                          >
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </Chip>
                          <Chip compact icon="resize" textStyle={{ fontSize: 12 }}>
                            {sizes.length} sizes
                          </Chip>
                          {item.addOns && item.addOns.length > 0 && (
                            <Chip compact icon="puzzle" textStyle={{ fontSize: 12 }}>
                              {item.addOns.length} add-ons
                            </Chip>
                          )}
                        </View>
                      </View>
                      <View style={styles.cardActions}>
                        <Switch
                          value={item.isAvailable}
                          onValueChange={() => handleToggleItemAvailability(item.id, item.isAvailable)}
                          disabled={togglingItemId === item.id}
                        />
                        <View ref={ref => { if (ref) item._menuButtonRef = { current: ref }; }}>
                          <IconButton
                            icon="dots-vertical"
                            size={24}
                            onPress={() => {
                              if (menuVisible === `item-${item.id}`) {
                                handleMenuClose();
                              } else {
                                handleMenuOpen(`item-${item.id}`, 'item', item._menuButtonRef);
                              }
                            }}
                          />
                        </View>

                        <Modal
                          visible={menuVisible === `item-${item.id}`}
                          transparent={true}
                          animationType="none"
                          onRequestClose={handleMenuClose}
                        >
                          <TouchableWithoutFeedback onPress={handleMenuClose}>
                            <View style={styles.modalOverlay}>
                              <TouchableWithoutFeedback>
                                <Surface style={[styles.contextMenu, {
                                  top: menuPosition.y,
                                  left: menuPosition.x
                                }]} elevation={4}>
                                  <List.Item
                                    title="Edit Item"
                                    left={props => <List.Icon {...props} icon="pencil" />}
                                    onPress={() => handleEdit(item.id, 'item')}
                                    style={styles.menuItem}
                                  />
                                  <Divider />
                                  <List.Item
                                    title="Add Size"
                                    left={props => <List.Icon {...props} icon="plus" />}
                                    onPress={() => handleAddSize(item.id)}
                                    style={styles.menuItem}
                                  />
                                  <Divider />
                                  <List.Item
                                    title="Manage Add-ons"
                                    left={props => <List.Icon {...props} icon="puzzle" />}
                                    onPress={() => {
                                      handleMenuClose();
                                      navigation.navigate('ItemAddOnForm', { itemId: item.id });
                                    }}
                                    style={styles.menuItem}
                                  />
                                  <Divider />
                                  <List.Item
                                    title="Delete Item"
                                    left={props => <List.Icon {...props} icon="delete" />}
                                    onPress={() => handleDelete(item.id, 'item')}
                                    style={styles.menuItem}
                                  />
                                </Surface>
                              </TouchableWithoutFeedback>
                            </View>
                          </TouchableWithoutFeedback>
                        </Modal>
                      </View>
                    </View>

                    <Divider style={styles.divider} />

                    <TouchableOpacity
                      style={styles.viewItemsButton}
                      onPress={() => {
                        setSelectedItem(item.id);
                        setViewMode('sizes');
                      }}
                    >
                      <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                        View {sizes.length} Sizes →
                      </Text>
                    </TouchableOpacity>
                  </Card.Content>
                </Card>
              );
            })
          )}
        </ScrollView>
      </>
    );
  };

  // Render Sizes View
  const renderSizesView = () => {
    const itemName = selectedItem
      ? allItems.find(i => i.id === selectedItem)?.name
      : 'All Items';

    return (
      <>
        {selectedItem && (
          <Card style={styles.breadcrumbCard}>
            <Card.Content style={styles.breadcrumb}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedItem(null);
                  setViewMode('items');
                }}
                style={styles.breadcrumbButton}
              >
                <IconButton icon="arrow-left" size={20} style={{ margin: 0 }} />
                <Text variant="labelLarge">Back to Items</Text>
              </TouchableOpacity>
              <Text variant="titleMedium" style={styles.breadcrumbText}>
                {itemName}
              </Text>
            </Card.Content>
          </Card>
        )}

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          scrollEnabled={menuVisible === null}
        >
          {filteredSizes.length === 0 ? (
            <Card style={styles.card}>
              <Card.Content>
                <Text>No sizes yet. Create one to get started!</Text>
              </Card.Content>
            </Card>
          ) : (
            filteredSizes.map((size) => (
              <Card key={size.id} style={styles.categoryCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Text variant="headlineSmall" style={styles.cardTitle}>
                        {size.size}
                      </Text>
                      <View style={styles.cardMeta}>
                        {!selectedItem && (
                          <>
                            <Chip compact icon="food" textStyle={{ fontSize: 12 }}>
                              {size.itemName}
                            </Chip>
                            <Chip compact icon="folder" textStyle={{ fontSize: 12 }}>
                              {size.categoryName}
                            </Chip>
                          </>
                        )}
                        <Chip
                          compact
                          mode="flat"
                          icon={size.isAvailable ? 'check-circle' : 'close-circle'}
                          textStyle={{ fontSize: 12 }}
                          style={{
                            backgroundColor: size.isAvailable
                              ? `${theme.colors.tertiary}20`
                              : `${theme.colors.error}20`,
                          }}
                        >
                          {size.isAvailable ? 'Available' : 'Unavailable'}
                        </Chip>
                        <Chip
                          compact
                          icon="currency-inr"
                          textStyle={{ fontSize: 12, fontWeight: 'bold' }}
                          style={{ backgroundColor: `${theme.colors.primary}20` }}
                        >
                          ₹{size.price}
                        </Chip>
                      </View>
                    </View>
                    <View style={styles.cardActions}>
                      <View ref={ref => { if (ref) size._menuButtonRef = { current: ref }; }}>
                        <IconButton
                          icon="dots-vertical"
                          size={24}
                          onPress={() => {
                            if (menuVisible === `size-${size.id}`) {
                              handleMenuClose();
                            } else {
                              handleMenuOpen(`size-${size.id}`, 'size', size._menuButtonRef);
                            }
                          }}
                        />
                      </View>

                      <Modal
                        visible={menuVisible === `size-${size.id}`}
                        transparent={true}
                        animationType="none"
                        onRequestClose={handleMenuClose}
                      >
                        <TouchableWithoutFeedback onPress={handleMenuClose}>
                          <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                              <Surface style={[styles.contextMenu, {
                                top: menuPosition.y,
                                left: menuPosition.x
                              }]} elevation={4}>
                                <List.Item
                                  title="Edit Size"
                                  left={props => <List.Icon {...props} icon="pencil" />}
                                  onPress={() => handleEdit(size.id, 'size')}
                                  style={styles.menuItem}
                                />
                                <Divider />
                                <List.Item
                                  title="Delete Size"
                                  left={props => <List.Icon {...props} icon="delete" />}
                                  onPress={() => handleDelete(size.id, 'size')}
                                  style={styles.menuItem}
                                />
                              </Surface>
                            </TouchableWithoutFeedback>
                          </View>
                        </TouchableWithoutFeedback>
                      </Modal>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            {
              value: 'categories',
              label: 'Categories',
              icon: 'folder',
              showSelectedCheck: true,
            },
            {
              value: 'items',
              label: 'Items',
              icon: 'food',
              showSelectedCheck: true,
            },
            {
              value: 'sizes',
              label: 'Sizes',
              icon: 'resize',
              showSelectedCheck: true,
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Content based on selected tab */}
      {viewMode === 'categories' && renderCategoriesView()}
      {viewMode === 'items' && renderItemsView()}
      {viewMode === 'sizes' && renderSizesView()}

      {/* FAB - changes based on view mode */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          if (viewMode === 'categories') {
            navigation.navigate('CategoryForm');
          } else if (viewMode === 'items') {
            navigation.navigate('ItemForm', selectedCategory ? { categoryId: selectedCategory } : {});
          } else if (viewMode === 'sizes') {
            navigation.navigate('ItemSizeForm', selectedItem ? { itemId: selectedItem } : {});
          }
        }}
        label={
          viewMode === 'categories' ? 'Add Category' :
          viewMode === 'items' ? 'Add Item' :
          'Add Size'
        }
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
  tabContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  segmentedButtons: {
    backgroundColor: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // Space for FAB
  },
  card: {
    marginBottom: 16,
  },
  categoryCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 12,
  },
  viewItemsButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  breadcrumbCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    elevation: 1,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breadcrumbButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contextMenu: {
    position: 'absolute',
    minWidth: 200,
    maxWidth: 250,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  menuItem: {
    paddingVertical: 4,
    minHeight: 48,
  },
});

