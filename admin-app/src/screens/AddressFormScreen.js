import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Switch,
  Text,
  ActivityIndicator,
  HelperText
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddressById, createAddress, updateAddress } from '../services/addressService';
import { getAllUsers } from '../services/userService';

const AddressFormScreen = ({ route, navigation }) => {
  const { addressId } = route.params || {};
  const isEdit = !!addressId;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    userId: '',
    label: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    landmark: '',
    isDefault: false
  });

  const [errors, setErrors] = useState({});

  // Fetch address if editing
  const { data: addressData, isLoading: loadingAddress } = useQuery({
    queryKey: ['address', addressId],
    queryFn: () => getAddressById(addressId),
    enabled: isEdit
  });

  // Fetch users
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => getAllUsers()
  });

  useEffect(() => {
    if (addressData?.data) {
      setFormData({
        userId: addressData.data.userId?.toString() || '',
        label: addressData.data.label || '',
        addressLine1: addressData.data.addressLine1 || '',
        addressLine2: addressData.data.addressLine2 || '',
        city: addressData.data.city || '',
        state: addressData.data.state || '',
        pincode: addressData.data.pincode || '',
        country: addressData.data.country || 'India',
        landmark: addressData.data.landmark || '',
        isDefault: addressData.data.isDefault || false
      });
    }
  }, [addressData]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return updateAddress(addressId, data);
      }
      return createAddress(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      queryClient.invalidateQueries(['address', addressId]);
      navigation.goBack();
    },
    onError: (error) => {
      console.error('Error saving address:', error);
    }
  });

  const handleSave = () => {
    const newErrors = {};

    if (!formData.userId) newErrors.userId = 'User is required';
    if (!formData.addressLine1) newErrors.addressLine1 = 'Address line 1 is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSave = {
      ...formData,
      userId: parseInt(formData.userId)
    };

    saveMutation.mutate(dataToSave);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  if (loadingAddress) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isEdit ? 'Edit Address' : 'New Address'} />
        <Appbar.Action icon="check" onPress={handleSave} disabled={saveMutation.isPending} />
      </Appbar.Header>

      <ScrollView style={styles.form}>
        <Text variant="titleMedium" style={styles.sectionTitle}>User Information</Text>

        <TextInput
          label="User ID *"
          value={formData.userId}
          onChangeText={(value) => updateField('userId', value)}
          keyboardType="numeric"
          error={!!errors.userId}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.userId}>
          {errors.userId}
        </HelperText>

        <Text variant="titleMedium" style={styles.sectionTitle}>Address Details</Text>

        <TextInput
          label="Label (e.g., Home, Work)"
          value={formData.label}
          onChangeText={(value) => updateField('label', value)}
          style={styles.input}
        />

        <TextInput
          label="Address Line 1 *"
          value={formData.addressLine1}
          onChangeText={(value) => updateField('addressLine1', value)}
          error={!!errors.addressLine1}
          style={styles.input}
          multiline
        />
        <HelperText type="error" visible={!!errors.addressLine1}>
          {errors.addressLine1}
        </HelperText>

        <TextInput
          label="Address Line 2"
          value={formData.addressLine2}
          onChangeText={(value) => updateField('addressLine2', value)}
          style={styles.input}
          multiline
        />

        <TextInput
          label="City"
          value={formData.city}
          onChangeText={(value) => updateField('city', value)}
          style={styles.input}
        />

        <TextInput
          label="State"
          value={formData.state}
          onChangeText={(value) => updateField('state', value)}
          style={styles.input}
        />

        <TextInput
          label="Pincode"
          value={formData.pincode}
          onChangeText={(value) => updateField('pincode', value)}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          label="Country"
          value={formData.country}
          onChangeText={(value) => updateField('country', value)}
          style={styles.input}
        />

        <TextInput
          label="Landmark"
          value={formData.landmark}
          onChangeText={(value) => updateField('landmark', value)}
          style={styles.input}
        />

        <View style={styles.switchRow}>
          <Text>Set as default address</Text>
          <Switch
            value={formData.isDefault}
            onValueChange={(value) => updateField('isDefault', value)}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saveMutation.isPending}
          style={styles.saveButton}
        >
          {isEdit ? 'Update Address' : 'Create Address'}
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  form: {
    flex: 1,
    padding: 16
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold'
  },
  input: {
    marginBottom: 4
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32
  }
});

export default AddressFormScreen;

