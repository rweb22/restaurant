import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Card,
  SegmentedButtons,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';

export default function UserFormScreen({ route, navigation }) {
  const queryClient = useQueryClient();
  const userId = route.params?.userId;

  const [formData, setFormData] = useState({
    name: '',
    role: 'client',
  });

  // Fetch user
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => menuService.getUserById(userId),
    enabled: !!userId,
  });

  // Populate form
  useEffect(() => {
    if (userData?.user) {
      const user = userData.user;
      setFormData({
        name: user.name || '',
        role: user.role,
      });
    }
  }, [userData]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user', userId]);
      navigation.goBack();
    },
    onError: (error) => {
      alert('Failed to update user: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleSubmit = () => {
    const updateData = {
      name: formData.name || null,
      role: formData.role,
    };

    updateMutation.mutate({ id: userId, data: updateData });
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const user = userData?.user;

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
        Edit User
      </Text>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="labelMedium" style={styles.infoLabel}>
            Phone Number
          </Text>
          <Text variant="bodyLarge" style={styles.infoValue}>
            {user?.phone}
          </Text>
        </Card.Content>
      </Card>

      <TextInput
        label="Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        mode="outlined"
        style={styles.input}
      />

      <Text variant="labelLarge" style={styles.sectionLabel}>
        Role
      </Text>
      <SegmentedButtons
        value={formData.role}
        onValueChange={(value) => setFormData({ ...formData, role: value })}
        buttons={[
          {
            value: 'client',
            label: 'Client',
          },
          {
            value: 'admin',
            label: 'Admin',
          },
        ]}
        style={styles.segmentedButtons}
      />

      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.actionButton}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={updateMutation.isPending}
          disabled={updateMutation.isPending}
          style={styles.actionButton}
        >
          Update
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
  infoCard: {
    marginBottom: 24,
    backgroundColor: '#fafaf9',
  },
  infoLabel: {
    color: '#78716c',
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginBottom: 8,
    color: '#44403c',
  },
  segmentedButtons: {
    marginBottom: 24,
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

