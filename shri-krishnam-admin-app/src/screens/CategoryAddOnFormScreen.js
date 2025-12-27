import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  Button,
  ActivityIndicator,
  List,
  IconButton,
  Chip,
  Divider,
  Dialog,
  Portal,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';

export default function CategoryAddOnFormScreen({ navigation, route }) {
  const queryClient = useQueryClient();
  const { categoryId } = route.params || {};
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedAddOnId, setSelectedAddOnId] = useState(null);

  // Fetch category with add-ons
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => menuService.getCategory(categoryId, { includeAddOns: true }),
    enabled: !!categoryId,
  });

  // Fetch all add-ons
  const { data: addOnsData, isLoading: addOnsLoading } = useQuery({
    queryKey: ['addOns'],
    queryFn: menuService.getAddOns,
  });

  // Fetch category add-on associations
  const { data: categoryAddOnsData } = useQuery({
    queryKey: ['categoryAddOns', categoryId],
    queryFn: () => menuService.getCategoryAddOns({ categoryId }),
    enabled: !!categoryId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: menuService.createCategoryAddOn,
    onSuccess: () => {
      queryClient.invalidateQueries(['category', categoryId]);
      queryClient.invalidateQueries(['categoryAddOns', categoryId]);
      queryClient.invalidateQueries(['menu-management']);
      setShowAddDialog(false);
      setSelectedAddOnId(null);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to add add-on');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: menuService.deleteCategoryAddOn,
    onSuccess: () => {
      queryClient.invalidateQueries(['category', categoryId]);
      queryClient.invalidateQueries(['categoryAddOns', categoryId]);
      queryClient.invalidateQueries(['menu-management']);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to remove add-on');
    },
  });

  const handleAddAddOn = () => {
    if (!selectedAddOnId) {
      alert('Please select an add-on');
      return;
    }

    createMutation.mutate({
      categoryId,
      addOnId: selectedAddOnId,
    });
  };

  const handleRemoveAddOn = (associationId) => {
    if (confirm('Are you sure you want to remove this add-on from the category?')) {
      deleteMutation.mutate(associationId);
    }
  };

  if (categoryLoading || addOnsLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const category = categoryData?.category;
  const allAddOns = addOnsData?.addOns || [];
  const categoryAddOns = categoryAddOnsData?.categoryAddOns || [];

  // Get IDs of add-ons already linked to this category
  const linkedAddOnIds = new Set(categoryAddOns.map(ca => ca.addOnId));

  // Filter available add-ons (not already linked)
  const availableAddOns = allAddOns.filter(addOn => !linkedAddOnIds.has(addOn.id));

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <Text variant="headlineSmall" style={styles.title}>
          Manage Add-ons for "{category?.name}"
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">Current Add-ons</Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => setShowAddDialog(true)}
              disabled={availableAddOns.length === 0}
            >
              Add
            </Button>
          </View>

          {categoryAddOns.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyMedium" style={styles.emptyText}>
                No add-ons linked to this category yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={categoryAddOns}
              scrollEnabled={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <List.Item
                  title={item.addOn.name}
                  description={`₹${item.addOn.price}`}
                  left={(props) => <List.Icon {...props} icon="puzzle" />}
                  right={(props) => (
                    <View style={styles.itemRight}>
                      <Chip
                        compact
                        mode="flat"
                        style={{
                          backgroundColor: item.addOn.isAvailable ? '#e8f5e9' : '#ffebee',
                        }}
                      >
                        {item.addOn.isAvailable ? 'Available' : 'Unavailable'}
                      </Chip>
                      <IconButton
                        {...props}
                        icon="delete"
                        iconColor="#d32f2f"
                        onPress={() => handleRemoveAddOn(item.id)}
                      />
                    </View>
                  )}
                />
              )}
              ItemSeparatorComponent={() => <Divider />}
            />
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Add-on Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
          <Dialog.Title>Add Add-on</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.dialogContent}>
              {availableAddOns.map((addOn) => (
                <List.Item
                  key={addOn.id}
                  title={addOn.name}
                  description={`₹${addOn.price}`}
                  left={(props) => <List.Icon {...props} icon="puzzle" />}
                  right={(props) => (
                    <Chip
                      compact
                      mode="flat"
                      style={{
                        backgroundColor: addOn.isAvailable ? '#e8f5e9' : '#ffebee',
                      }}
                    >
                      {addOn.isAvailable ? 'Available' : 'Unavailable'}
                    </Chip>
                  )}
                  onPress={() => setSelectedAddOnId(addOn.id)}
                  style={selectedAddOnId === addOn.id ? styles.selectedItem : null}
                />
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              onPress={handleAddAddOn}
              loading={createMutation.isPending}
              disabled={!selectedAddOnId || createMutation.isPending}
            >
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dialogContent: {
    maxHeight: 400,
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
});

