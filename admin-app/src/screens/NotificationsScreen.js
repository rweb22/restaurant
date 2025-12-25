import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  Chip,
  IconButton,
  Searchbar,
  SegmentedButtons,
  Portal,
  Dialog,
  Button,
  ActivityIndicator
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllNotifications, markAsRead, deleteNotification } from '../services/notificationService';

const NotificationsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState('all');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', readFilter],
    queryFn: () => getAllNotifications({
      isRead: readFilter !== 'all' ? (readFilter === 'read') : undefined
    })
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      setDeleteDialogVisible(false);
      setSelectedNotification(null);
    }
  });

  const handleDelete = (notification) => {
    setSelectedNotification(notification);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    if (selectedNotification) {
      deleteMutation.mutate(selectedNotification.id);
    }
  };

  const handleMarkAsRead = (notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      order_status: 'receipt',
      payment: 'cash',
      offer: 'tag',
      general: 'bell'
    };
    return icons[type] || 'bell';
  };

  const getTypeColor = (type) => {
    const colors = {
      order_status: '#2196F3',
      payment: '#4CAF50',
      offer: '#FF9800',
      general: '#9E9E9E'
    };
    return colors[type] || '#9E9E9E';
  };

  const filteredNotifications = data?.data?.notifications?.filter(notification => {
    const searchLower = searchQuery.toLowerCase();
    return (
      notification.title?.toLowerCase().includes(searchLower) ||
      notification.message?.toLowerCase().includes(searchLower) ||
      notification.user?.name?.toLowerCase().includes(searchLower) ||
      notification.user?.phone?.includes(searchQuery)
    );
  }) || [];

  const renderNotification = ({ item }) => (
    <Card
      style={[styles.card, !item.isRead && styles.unreadCard]}
      onPress={() => handleMarkAsRead(item)}
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Chip
              icon={getTypeIcon(item.type)}
              style={[styles.typeChip, { backgroundColor: getTypeColor(item.type) }]}
              textStyle={styles.typeChipText}
              compact
            >
              {item.type}
            </Chip>
            {!item.isRead && (
              <Chip
                icon="circle"
                compact
                style={styles.unreadChip}
                textStyle={styles.unreadChipText}
              >
                Unread
              </Chip>
            )}
          </View>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDelete(item)}
          />
        </View>

        <Text variant="titleMedium" style={styles.title}>
          {item.title}
        </Text>

        <Text variant="bodyMedium" style={styles.message}>
          {item.message}
        </Text>

        {item.user && (
          <View style={styles.userInfo}>
            <Text variant="bodySmall" style={styles.label}>User:</Text>
            <Text variant="bodySmall">
              {item.user.name} ({item.user.phone})
            </Text>
          </View>
        )}

        {item.order && (
          <View style={styles.orderInfo}>
            <Text variant="bodySmall" style={styles.label}>Order:</Text>
            <Text variant="bodySmall">
              #{item.order.id} - {item.order.status} - ₹{parseFloat(item.order.totalPrice).toFixed(2)}
            </Text>
          </View>
        )}

        <Text variant="bodySmall" style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>

        {item.readAt && (
          <Text variant="bodySmall" style={styles.readAt}>
            Read at: {new Date(item.readAt).toLocaleString()}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error loading notifications: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search notifications..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <SegmentedButtons
        value={readFilter}
        onValueChange={setReadFilter}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread' },
          { value: 'read', label: 'Read' }
        ]}
        style={styles.segmentedButtons}
      />

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No notifications found</Text>
          </View>
        }
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Notification</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this notification?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete} loading={deleteMutation.isPending}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchbar: {
    margin: 16,
    marginBottom: 8
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 8
  },
  list: {
    padding: 16,
    paddingTop: 8
  },
  card: {
    marginBottom: 12
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  typeChip: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  typeChipText: {
    color: '#fff',
    lineHeight: 24,
    marginVertical: 0
  },
  unreadChip: {
    height: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center'
  },
  unreadChipText: {
    color: '#fff',
    lineHeight: 24,
    marginVertical: 0
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  message: {
    marginBottom: 8
  },
  userInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  orderInfo: {
    marginTop: 4
  },
  label: {
    color: '#666',
    fontWeight: 'bold'
  },
  timestamp: {
    color: '#999',
    marginTop: 8
  },
  readAt: {
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic'
  },
  empty: {
    padding: 32,
    alignItems: 'center'
  }
});

export default NotificationsScreen;

