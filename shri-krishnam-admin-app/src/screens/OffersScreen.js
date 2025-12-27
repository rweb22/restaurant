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

export default function OffersScreen({ navigation }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [menuVisible, setMenuVisible] = useState({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['offers'],
    queryFn: menuService.getOffers,
  });

  const deleteMutation = useMutation({
    mutationFn: menuService.deleteOffer,
    onSuccess: () => {
      queryClient.invalidateQueries(['offers']);
    },
  });

  const handleDelete = (offerId) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      deleteMutation.mutate(offerId);
    }
  };

  const openMenu = (id) => setMenuVisible({ ...menuVisible, [id]: true });
  const closeMenu = (id) => setMenuVisible({ ...menuVisible, [id]: false });

  const formatDiscountType = (type) => {
    switch (type) {
      case 'percentage':
        return 'Percentage';
      case 'flat':
        return 'Flat';
      case 'free_delivery':
        return 'Free Delivery';
      default:
        return type;
    }
  };

  const formatDiscountValue = (offer) => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    } else if (offer.discountType === 'flat') {
      return `₹${offer.discountValue} OFF`;
    } else {
      return 'FREE DELIVERY';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const offers = data?.offers || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <Text variant="headlineSmall" style={styles.title}>
          Offers Management
        </Text>

        {offers.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No offers found. Click the + button to create one.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          offers.map((offer) => (
            <Card key={offer.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <View style={styles.titleRow}>
                      <Text variant="titleLarge" style={styles.offerTitle}>
                        {offer.title}
                      </Text>
                      <Chip
                        mode="flat"
                        compact
                        textStyle={styles.codeText}
                        style={styles.codeChip}
                      >
                        {offer.code}
                      </Chip>
                    </View>
                    {offer.description && (
                      <Text variant="bodyMedium" style={styles.description}>
                        {offer.description}
                      </Text>
                    )}
                  </View>
                  <Menu
                    visible={menuVisible[offer.id]}
                    onDismiss={() => closeMenu(offer.id)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        size={24}
                        onPress={() => openMenu(offer.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        closeMenu(offer.id);
                        navigation.navigate('OfferForm', { offerId: offer.id });
                      }}
                      title="Edit"
                      leadingIcon="pencil"
                    />
                    <Divider />
                    <Menu.Item
                      onPress={() => {
                        closeMenu(offer.id);
                        handleDelete(offer.id);
                      }}
                      title="Delete"
                      leadingIcon="delete"
                    />
                  </Menu>
                </View>

                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text variant="labelMedium" style={styles.label}>
                      Discount:
                    </Text>
                    <Text variant="bodyLarge" style={styles.discount}>
                      {formatDiscountValue(offer)}
                    </Text>
                  </View>


                  {offer.minOrderValue && (
                    <View style={styles.detailRow}>
                      <Text variant="labelMedium" style={styles.label}>
                        Min Order:
                      </Text>
                      <Text variant="bodyMedium">₹{offer.minOrderValue}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text variant="labelMedium" style={styles.label}>
                      Status:
                    </Text>
                    <Chip
                      mode="flat"
                      textStyle={{
                        color: offer.isActive ? theme.colors.tertiary : theme.colors.error,
                      }}
                      style={{
                        backgroundColor: offer.isActive
                          ? `${theme.colors.tertiary}20`
                          : `${theme.colors.error}20`,
                      }}
                    >
                      {offer.isActive ? 'Active' : 'Inactive'}
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
        onPress={() => navigation.navigate('OfferForm')}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  offerTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  codeChip: {
    backgroundColor: '#dbeafe',
  },
  codeText: {
    color: '#1e40af',
    fontWeight: '600',
    fontSize: 12,
  },
  description: {
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
    minWidth: 80,
  },
  discount: {
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

