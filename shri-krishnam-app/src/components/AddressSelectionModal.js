import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  IconButton,
  Surface,
  Divider,
  ActivityIndicator,
  Icon,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import addressService from '../services/addressService';
import useDeliveryStore from '../store/deliveryStore';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

const AddressSelectionModal = ({ visible, onDismiss, onAddAddress, onManageAddresses }) => {
  const { selectedAddress, setSelectedAddress } = useDeliveryStore();
  const [tempSelectedAddress, setTempSelectedAddress] = useState(null);

  const { data: addressesData, isLoading, error, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
    enabled: visible,
    retry: 1,
    onError: (error) => {
      console.error('[AddressSelectionModal] Error fetching addresses:', error);
      console.error('[AddressSelectionModal] Error response:', error.response?.data);
    },
  });

  const addresses = addressesData?.addresses || [];

  // Validate selected address when addresses are loaded
  useEffect(() => {
    if (visible && !isLoading && addresses.length > 0) {
      // Check if the currently selected address still exists
      if (selectedAddress) {
        const addressExists = addresses.some(addr => addr.id === selectedAddress.id);
        if (!addressExists) {
          // Selected address no longer exists, clear it
          console.log('[AddressSelectionModal] Selected address no longer exists, clearing...');
          setSelectedAddress(null);
          setTempSelectedAddress(null);
        } else {
          setTempSelectedAddress(selectedAddress);
        }
      }
    } else if (visible && !isLoading && addresses.length === 0) {
      // No addresses available, clear selection
      if (selectedAddress) {
        console.log('[AddressSelectionModal] No addresses available, clearing selection...');
        setSelectedAddress(null);
        setTempSelectedAddress(null);
      }
    } else if (visible) {
      setTempSelectedAddress(selectedAddress);
    }
  }, [visible, isLoading, addresses.length]);

  const handleConfirm = () => {
    console.log('[AddressSelectionModal] Confirm button pressed');
    console.log('[AddressSelectionModal] tempSelectedAddress:', tempSelectedAddress);
    if (tempSelectedAddress) {
      setSelectedAddress(tempSelectedAddress);
      onDismiss();
    }
  };

  const handleAddressSelect = (address) => {
    setTempSelectedAddress(address);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
        dismissable={true}
        dismissableBackButton={true}
      >
        <Surface style={styles.surface} elevation={4}>
            {/* Header with Gradient */}
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Icon source="map-marker" size={20} color={colors.white} />
                  <Text variant="titleLarge" style={styles.title}>
                    Delivery Address
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={20}
                  iconColor={colors.white}
                  onPress={onDismiss}
                />
              </View>
            </LinearGradient>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text variant="bodyMedium" style={styles.loadingText}>
                  Loading addresses...
                </Text>
              </View>
            ) : addresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Icon source="map-marker-off" size={64} color={colors.secondary[300]} />
                </View>
                <Text variant="titleLarge" style={styles.emptyText}>
                  No saved addresses
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Add a delivery address to get started
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {addresses.map((address, index) => (
                  <TouchableOpacity
                    key={address.id}
                    onPress={() => handleAddressSelect(address)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.addressCard,
                        tempSelectedAddress?.id === address.id && styles.selectedCard,
                      ]}
                    >
                      <View style={styles.addressHeader}>
                        <View style={styles.addressLabelContainer}>
                          <View style={[
                            styles.labelIcon,
                            tempSelectedAddress?.id === address.id && styles.selectedLabelIcon
                          ]}>
                            <Icon
                              source={address.label === 'Home' ? 'home' : address.label === 'Work' ? 'briefcase' : 'map-marker'}
                              size={20}
                              color={tempSelectedAddress?.id === address.id ? colors.white : colors.primary[500]}
                            />
                          </View>
                          <Text variant="titleMedium" style={[
                            styles.addressLabel,
                            tempSelectedAddress?.id === address.id && styles.selectedAddressLabel
                          ]}>
                            {address.label || 'Address'}
                          </Text>
                        </View>
                        {tempSelectedAddress?.id === address.id && (
                          <View style={styles.checkIconContainer}>
                            <Icon source="check-circle" size={24} color={colors.success} />
                          </View>
                        )}
                      </View>
                      <Text variant="bodyMedium" style={styles.addressText}>
                        {address.addressLine1}
                      </Text>
                      {address.addressLine2 && (
                        <Text variant="bodyMedium" style={styles.addressText}>
                          {address.addressLine2}
                        </Text>
                      )}
                      {address.landmark && (
                        <View style={styles.landmarkContainer}>
                          <Icon source="map-marker-radius" size={14} color={colors.secondary[400]} />
                          <Text variant="bodySmall" style={styles.landmark}>
                            {address.landmark}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Divider style={styles.divider} />

            <View style={styles.footer}>
              <View style={styles.footerRow}>
                <Button
                  mode="outlined"
                  onPress={onAddAddress}
                  icon="plus"
                  style={styles.addButton}
                  labelStyle={styles.addButtonLabel}
                  textColor={colors.primary[500]}
                >
                  Add New
                </Button>
                {onManageAddresses && addresses.length > 0 && (
                  <Button
                    mode="outlined"
                    onPress={onManageAddresses}
                    icon="cog"
                    style={styles.manageButton}
                    labelStyle={styles.manageButtonLabel}
                    textColor={colors.secondary[600]}
                  >
                    Manage
                  </Button>
                )}
              </View>
              {addresses.length > 0 && (
                <Button
                  mode="contained"
                  onPress={handleConfirm}
                  disabled={!tempSelectedAddress}
                  style={styles.confirmButton}
                  buttonColor={colors.primary[500]}
                  labelStyle={styles.confirmButtonLabel}
                >
                  {tempSelectedAddress ? 'Confirm Address' : 'Select an Address'}
                </Button>
              )}
            </View>
          </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  surface: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '95%',
    ...shadows.xl,
  },
  headerGradient: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    paddingTop: spacing.xs / 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: colors.white,
  },
  loadingContainer: {
    padding: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.secondary[600],
  },
  emptyContainer: {
    padding: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.secondary[700],
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.secondary[500],
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
    paddingVertical: spacing.sm,
  },
  addressCard: {
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.secondary[200],
    ...shadows.sm,
  },
  selectedCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
    ...shadows.md,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  labelIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLabelIcon: {
    backgroundColor: colors.primary[500],
  },
  checkIconContainer: {
    marginLeft: spacing.sm,
  },
  addressLabel: {
    fontWeight: '600',
    color: colors.secondary[900],
    fontSize: fontSize.md,
  },
  selectedAddressLabel: {
    color: colors.primary[700],
  },
  addressText: {
    color: colors.secondary[600],
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  landmarkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  landmark: {
    color: colors.secondary[500],
    flex: 1,
  },
  locationInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary[200],
    gap: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    color: colors.secondary[600],
    flex: 1,
  },
  deliveryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  deliveryInfo: {
    color: colors.success,
    fontWeight: '600',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  timeInfo: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  divider: {
    backgroundColor: colors.secondary[200],
  },
  footer: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.secondary[50],
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addButton: {
    flex: 1,
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  addButtonLabel: {
    fontWeight: '600',
  },
  manageButton: {
    flex: 1,
    borderColor: colors.secondary[300],
  },
  manageButtonLabel: {
    fontWeight: '600',
  },
  confirmButton: {
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  confirmButtonLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    paddingVertical: spacing.xs / 2,
  },
});

export default AddressSelectionModal;

