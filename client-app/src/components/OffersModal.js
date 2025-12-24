import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Surface,
  Divider,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import offerService from '../services/offerService';

const OffersModal = ({ visible, onDismiss, onSelectOffer, subtotal, categoryIds, itemIds }) => {
  const [validatingOffer, setValidatingOffer] = useState(null);

  // Fetch all active offers
  const { data: offersData, isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: offerService.getAllOffers,
    enabled: visible,
  });

  const handleSelectOffer = async (offer) => {
    setValidatingOffer(offer.code);

    try {
      const result = await offerService.validateOffer(
        offer.code,
        subtotal,
        categoryIds,
        itemIds
      );

      if (result.success) {
        onSelectOffer({
          code: offer.code,
          offerId: result.offerId,
          discountAmount: result.discountAmount,
          freeDelivery: result.freeDelivery,
          title: offer.title,
          description: offer.description,
        });
        onDismiss();
      } else {
        // Show error but don't close modal
        alert(result.message || 'This offer is not applicable');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to apply offer';
      alert(errorMessage);
    } finally {
      setValidatingOffer(null);
    }
  };

  const getOfferBadgeColor = (discountType) => {
    switch (discountType) {
      case 'percentage':
        return '#3b82f6';
      case 'flat':
        return '#10b981';
      case 'free_delivery':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getOfferBadgeText = (offer) => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    } else if (offer.discountType === 'flat') {
      return `₹${offer.discountValue} OFF`;
    } else if (offer.discountType === 'free_delivery') {
      return 'FREE DELIVERY';
    }
    return 'OFFER';
  };

  const offers = offersData?.offers || [];

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Available Offers
          </Text>
          <IconButton icon="close" size={24} onPress={onDismiss} />
        </View>

        <Divider />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading offers...</Text>
          </View>
        ) : offers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="titleLarge" style={styles.emptyEmoji}>
              🎁
            </Text>
            <Text variant="titleMedium" style={styles.emptyText}>
              No offers available
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Check back later for exciting deals!
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {offers.map((offer) => (
              <TouchableOpacity
                key={offer.id}
                onPress={() => handleSelectOffer(offer)}
                disabled={validatingOffer === offer.code}
                activeOpacity={0.7}
              >
                <Surface style={styles.offerCard} elevation={1}>
                  <View style={styles.offerHeader}>
                    <View
                      style={[
                        styles.offerBadge,
                        { backgroundColor: getOfferBadgeColor(offer.discountType) },
                      ]}
                    >
                      <Text variant="labelSmall" style={styles.offerBadgeText}>
                        {getOfferBadgeText(offer)}
                      </Text>
                    </View>
                    {validatingOffer === offer.code && (
                      <ActivityIndicator size="small" />
                    )}
                  </View>

                  <Text variant="titleMedium" style={styles.offerTitle}>
                    {offer.title}
                  </Text>

                  {offer.description && (
                    <Text variant="bodySmall" style={styles.offerDescription}>
                      {offer.description}
                    </Text>
                  )}

                  <View style={styles.offerFooter}>
                    <Text variant="labelMedium" style={styles.offerCode}>
                      Code: {offer.code}
                    </Text>
                    {offer.minOrderValue && (
                      <Text variant="bodySmall" style={styles.offerCondition}>
                        Min order: ₹{offer.minOrderValue}
                      </Text>
                    )}
                  </View>
                </Surface>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 12,
  },
  title: {
    fontWeight: 'bold',
    color: '#292524',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#78716c',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    color: '#292524',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#78716c',
  },
  scrollView: {
    maxHeight: 500,
  },
  offerCard: {
    margin: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  offerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  offerBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  offerTitle: {
    fontWeight: 'bold',
    color: '#292524',
    marginBottom: 8,
  },
  offerDescription: {
    color: '#57534e',
    marginBottom: 12,
    lineHeight: 20,
  },
  offerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f4',
  },
  offerCode: {
    color: '#292524',
    fontWeight: '600',
    backgroundColor: '#fafaf9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offerCondition: {
    color: '#78716c',
  },
});

export default OffersModal;


