import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Switch,
  ActivityIndicator,
  Card,
  SegmentedButtons,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';

export default function OfferFormScreen({ route, navigation }) {
  const queryClient = useQueryClient();
  const offerId = route.params?.offerId;
  const isEditing = !!offerId;

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderValue: '',
    firstOrderOnly: false,
    maxUsesPerUser: '',
    validFrom: '',
    validTo: '',
    isActive: true,
  });

  // Fetch offer if editing
  const { data: offerData, isLoading } = useQuery({
    queryKey: ['offer', offerId],
    queryFn: () => menuService.getOfferById(offerId),
    enabled: isEditing,
  });

  // Populate form when editing
  useEffect(() => {
    if (offerData?.offer) {
      const offer = offerData.offer;
      setFormData({
        code: offer.code,
        title: offer.title,
        description: offer.description || '',
        discountType: offer.discountType,
        discountValue: offer.discountValue?.toString() || '',
        maxDiscountAmount: offer.maxDiscountAmount?.toString() || '',
        minOrderValue: offer.minOrderValue?.toString() || '',
        firstOrderOnly: offer.firstOrderOnly,
        maxUsesPerUser: offer.maxUsesPerUser?.toString() || '',
        validFrom: offer.validFrom ? offer.validFrom.split('T')[0] : '',
        validTo: offer.validTo ? offer.validTo.split('T')[0] : '',
        isActive: offer.isActive,
      });
    }
  }, [offerData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: menuService.createOffer,
    onSuccess: () => {
      queryClient.invalidateQueries(['offers']);
      navigation.goBack();
    },
    onError: (error) => {
      alert('Failed to create offer: ' + (error.response?.data?.message || error.message));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuService.updateOffer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['offers']);
      queryClient.invalidateQueries(['offer', offerId]);
      navigation.goBack();
    },
    onError: (error) => {
      alert('Failed to update offer: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleSubmit = () => {
    // Validation
    if (!formData.code.trim()) {
      alert('Please enter offer code');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter offer title');
      return;
    }

    if (
      formData.discountType !== 'free_delivery' &&
      (!formData.discountValue || parseFloat(formData.discountValue) <= 0)
    ) {
      alert('Please enter a valid discount value');
      return;
    }

    const offerData = {
      code: formData.code.toUpperCase(),
      title: formData.title,
      description: formData.description || null,
      discountType: formData.discountType,
      discountValue:
        formData.discountType !== 'free_delivery' ? parseFloat(formData.discountValue) : null,
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
      minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
      firstOrderOnly: formData.firstOrderOnly,
      maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser) : null,
      validFrom: formData.validFrom || null,
      validTo: formData.validTo || null,
      isActive: formData.isActive,
    };

    if (isEditing) {
      updateMutation.mutate({ id: offerId, data: offerData });
    } else {
      createMutation.mutate(offerData);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text variant="headlineSmall" style={styles.title}>
        {isEditing ? 'Edit Offer' : 'Create Offer'}
      </Text>

      <TextInput
        label="Offer Code *"
        value={formData.code}
        onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
        mode="outlined"
        style={styles.input}
        autoCapitalize="characters"
      />

      <TextInput
        label="Title *"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Description"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Text variant="labelLarge" style={styles.sectionLabel}>
        Discount Type *
      </Text>
      <SegmentedButtons
        value={formData.discountType}
        onValueChange={(value) => setFormData({ ...formData, discountType: value })}
        buttons={[
          { value: 'percentage', label: 'Percentage' },
          { value: 'flat', label: 'Flat' },
          { value: 'free_delivery', label: 'Free Delivery' },
        ]}
        style={styles.segmentedButtons}
      />

      {formData.discountType !== 'free_delivery' && (
        <TextInput
          label={`Discount Value * (${formData.discountType === 'percentage' ? '%' : '₹'})`}
          value={formData.discountValue}
          onChangeText={(text) => setFormData({ ...formData, discountValue: text })}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.input}
        />
      )}

      {formData.discountType === 'percentage' && (
        <TextInput
          label="Max Discount Amount (₹)"
          value={formData.maxDiscountAmount}
          onChangeText={(text) => setFormData({ ...formData, maxDiscountAmount: text })}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.input}
        />
      )}

      <TextInput
        label="Minimum Order Value (₹)"
        value={formData.minOrderValue}
        onChangeText={(text) => setFormData({ ...formData, minOrderValue: text })}
        keyboardType="decimal-pad"
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Max Uses Per User"
        value={formData.maxUsesPerUser}
        onChangeText={(text) => setFormData({ ...formData, maxUsesPerUser: text })}
        keyboardType="number-pad"
        mode="outlined"
        style={styles.input}
      />

      <Card style={styles.switchCard}>
        <Card.Content>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text variant="titleMedium">First Order Only</Text>
              <Text variant="bodySmall" style={styles.hint}>
                Offer valid only for first-time users
              </Text>
            </View>
            <Switch
              value={formData.firstOrderOnly}
              onValueChange={(value) => setFormData({ ...formData, firstOrderOnly: value })}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.switchCard}>
        <Card.Content>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text variant="titleMedium">Active</Text>
              <Text variant="bodySmall" style={styles.hint}>
                Make this offer available for use
              </Text>
            </View>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => setFormData({ ...formData, isActive: value })}
            />
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.actionButton}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={createMutation.isPending || updateMutation.isPending}
          style={styles.actionButton}
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginBottom: 8,
    color: '#44403c',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  switchCard: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
  },
  hint: {
    color: '#78716c',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});