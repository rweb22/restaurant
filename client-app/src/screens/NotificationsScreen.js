import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Surface, Appbar, Divider, ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../services/notificationService';

const NotificationsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications({ limit: 50 }),
  });

  const notifications = notificationsData?.data?.notifications || [];

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to order details if notification has orderId
    if (notification.orderId) {
      navigation.navigate('OrderDetails', { orderId: notification.orderId });
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getNotificationIcon = (template) => {
    const icons = {
      ORDER_CREATED: '📝',
      PAYMENT_COMPLETED: '✅',
      PAYMENT_FAILED: '❌',
      ORDER_CONFIRMED: '✔️',
      ORDER_PREPARING: '👨‍🍳',
      ORDER_READY: '🔔',
      ORDER_COMPLETED: '🎉',
      ORDER_CANCELLED: '🚫',
      REFUND_PROCESSED: '💰',
    };
    return icons[template] || '📬';
  };

  const renderNotificationItem = ({ item: notification }) => {
    return (
      <TouchableOpacity onPress={() => handleNotificationPress(notification)}>
        <Surface 
          style={[
            styles.notificationCard,
            !notification.isRead && styles.unreadCard
          ]} 
          elevation={0}
        >
          <View style={styles.notificationContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{getNotificationIcon(notification.template)}</Text>
            </View>
            <View style={styles.textContainer}>
              <View style={styles.headerRow}>
                <Text 
                  variant="titleSmall" 
                  style={[styles.title, !notification.isRead && styles.unreadText]}
                >
                  {notification.title}
                </Text>
                {!notification.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text variant="bodyMedium" style={styles.message}>
                {notification.message}
              </Text>
              <Text variant="bodySmall" style={styles.time}>
                {formatDate(notification.createdAt)}
              </Text>
            </View>
          </View>
        </Surface>
        <Divider />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.Content title="Notifications" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.Content title="Notifications" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            Failed to load notifications
          </Text>
          <Button mode="contained" onPress={refetch} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.Content title="Notifications" />
        {notifications.some(n => !n.isRead) && (
          <Appbar.Action
            icon="check-all"
            onPress={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
          />
        )}
      </Appbar.Header>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No Notifications
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            You don't have any notifications yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  retryButton: {
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  listContent: {
    paddingBottom: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  unreadCard: {
    backgroundColor: '#f0f9ff',
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
  unreadText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  message: {
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  time: {
    color: '#999',
  },
});

export default NotificationsScreen;

