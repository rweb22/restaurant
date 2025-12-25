import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { Text, Card, FAB, IconButton, useTheme, Chip, Switch } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';
import config from '../constants/config';

export default function CategoriesScreen({ navigation }) {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['categories'],
    queryFn: () => menuService.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: menuService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ categoryId, isAvailable }) =>
      menuService.updateCategory(categoryId, { isAvailable }),
    onMutate: async ({ categoryId, isAvailable }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['categories']);

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['categories']);

      // Optimistically update
      queryClient.setQueryData(['categories'], (old) => {
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
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['categories'], context.previousData);
      }
    },
    onSuccess: (data, variables) => {
      // Update cache with server response (no refetch needed)
      queryClient.setQueryData(['categories'], (old) => {
        if (!old?.categories) return old;
        return {
          ...old,
          categories: old.categories.map(cat =>
            cat.id === variables.categoryId ? data.category : cat
          )
        };
      });
    },
  });

  const categories = categoriesData?.categories || [];

  const handleDelete = (categoryId) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(categoryId);
    }
  };

  const handleToggleAvailability = (categoryId, currentValue) => {
    toggleAvailabilityMutation.mutate({
      categoryId,
      isAvailable: !currentValue
    });
  };

  const getPrimaryPictureUrl = (category) => {
    if (!category.pictures || category.pictures.length === 0) return null;
    const primary = category.pictures.find(p => p.isPrimary) || category.pictures[0];
    return `${config.apiUrl.replace('/api', '')}${primary.url}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {isLoading ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text>Loading categories...</Text>
            </Card.Content>
          </Card>
        ) : categories.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text>No categories yet. Create one to get started!</Text>
            </Card.Content>
          </Card>
        ) : (
          categories.map((category) => {
            const imageUrl = getPrimaryPictureUrl(category);
            return (
              <Card key={category.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      {imageUrl && (
                        <Image source={{ uri: imageUrl }} style={styles.categoryImage} />
                      )}
                      <View style={styles.categoryText}>
                        <Text variant="titleMedium">{category.name}</Text>
                        <Text variant="bodySmall" style={styles.description}>
                          {category.description}
                        </Text>
                        <Text variant="bodySmall" style={styles.meta}>
                          GST: {category.gstRate}% • Order: {category.displayOrder}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.actions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => navigation.navigate('CategoryForm', { categoryId: category.id })}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDelete(category.id)}
                      />
                    </View>
                  </View>
                  <View style={styles.availabilityRow}>
                    <Chip
                      mode="flat"
                      textStyle={{
                        color: category.isAvailable ? theme.colors.tertiary : theme.colors.error
                      }}
                      style={{
                        backgroundColor: category.isAvailable
                          ? `${theme.colors.tertiary}20`
                          : `${theme.colors.error}20`
                      }}
                    >
                      {category.isAvailable ? 'Available' : 'Unavailable'}
                    </Chip>
                    <Switch
                      value={category.isAvailable}
                      onValueChange={() => handleToggleAvailability(category.id, category.isAvailable)}
                      disabled={toggleAvailabilityMutation.isPending}
                    />
                  </View>
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  categoryText: {
    flex: 1,
  },
  description: {
    opacity: 0.6,
    marginTop: 4,
  },
  meta: {
    opacity: 0.5,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

