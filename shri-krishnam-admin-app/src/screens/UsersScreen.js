import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  IconButton,
  useTheme,
  Chip,
  ActivityIndicator,
  Menu,
  Divider,
  Searchbar,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '../services/menuService';

export default function UsersScreen({ navigation }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [menuVisible, setMenuVisible] = useState({});
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () => menuService.getUsers({ role: roleFilter || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: menuService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleDelete = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId);
    }
  };

  const openMenu = (id) => setMenuVisible({ ...menuVisible, [id]: true });
  const closeMenu = (id) => setMenuVisible({ ...menuVisible, [id]: false });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const users = data?.users || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <Text variant="headlineSmall" style={styles.title}>
          Users Management
        </Text>

        <View style={styles.filters}>
          <Chip
            selected={roleFilter === ''}
            onPress={() => setRoleFilter('')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={roleFilter === 'admin'}
            onPress={() => setRoleFilter('admin')}
            style={styles.filterChip}
          >
            Admins
          </Chip>
          <Chip
            selected={roleFilter === 'client'}
            onPress={() => setRoleFilter('client')}
            style={styles.filterChip}
          >
            Clients
          </Chip>
        </View>

        {users.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No users found.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text variant="titleLarge" style={styles.userName}>
                      {user.name || 'Unnamed User'}
                    </Text>
                    <Text variant="bodyMedium" style={styles.phone}>
                      {user.phone}
                    </Text>
                  </View>
                  <Menu
                    visible={menuVisible[user.id]}
                    onDismiss={() => closeMenu(user.id)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        size={24}
                        onPress={() => openMenu(user.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        closeMenu(user.id);
                        navigation.navigate('UserForm', { userId: user.id });
                      }}
                      title="Edit"
                      leadingIcon="pencil"
                    />
                    <Divider />
                    <Menu.Item
                      onPress={() => {
                        closeMenu(user.id);
                        handleDelete(user.id);
                      }}
                      title="Delete"
                      leadingIcon="delete"
                    />
                  </Menu>
                </View>

                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text variant="labelMedium" style={styles.label}>
                      Role:
                    </Text>
                    <Chip
                      mode="flat"
                      textStyle={{
                        color: user.role === 'admin' ? theme.colors.primary : theme.colors.tertiary,
                      }}
                      style={{
                        backgroundColor:
                          user.role === 'admin'
                            ? `${theme.colors.primary}20`
                            : `${theme.colors.tertiary}20`,
                      }}
                    >
                      {user.role.toUpperCase()}
                    </Chip>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
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
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 4,
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
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phone: {
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
    minWidth: 60,
  },
});

