import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Surface, Appbar, Divider, ActivityIndicator, Button, IconButton, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../services/notificationService';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

const NotificationsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications({ limit: 50 }),
  });

  const notifications = notificationsData?.data?.notifications || [];

  // Debug: Log first notification to check what we're receiving
  React.useEffect(() => {
    if (notifications.length > 0) {
      console.log('🔍 DEBUG: First notification received:');
      console.log('   Raw data:', JSON.stringify(notifications[0], null, 2));
      console.log('   createdAt value:', notifications[0].createdAt);
      console.log('   createdAt type:', typeof notifications[0].createdAt);
    }
  }, [notifications]);

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
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid date';
    }

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours === 1) return '1 hr ago';
    if (diffHours < 24) return `${diffHours} hrs ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getNotificationIcon = (template) => {
    const icons = {
      ORDER_CREATED: 'receipt-text',
      PAYMENT_COMPLETED: 'check-circle',
      PAYMENT_FAILED: 'close-circle',
      ORDER_CONFIRMED: 'check-circle-outline',
      ORDER_PREPARING: 'chef-hat',
      ORDER_READY: 'bell-ring',
      ORDER_COMPLETED: 'party-popper',
      ORDER_CANCELLED: 'cancel',
      REFUND_PROCESSED: 'cash-refund',
    };
    return icons[template] || 'bell';
  };

  const getNotificationIconColor = (template) => {
    const iconColors = {
      ORDER_CREATED: colors.info,
      PAYMENT_COMPLETED: colors.success,
      PAYMENT_FAILED: colors.error,
      ORDER_CONFIRMED: colors.success,
      ORDER_PREPARING: colors.primary[600],
      ORDER_READY: colors.success,
      ORDER_COMPLETED: colors.success,
      ORDER_CANCELLED: colors.error,
      REFUND_PROCESSED: colors.success,
    };
    return iconColors[template] || colors.text.secondary;
  };

  const getNotificationIconBg = (template) => {
    const bgColors = {
      ORDER_CREATED: colors.info + '20',
      PAYMENT_COMPLETED: colors.success + '20',
      PAYMENT_FAILED: colors.error + '20',
      ORDER_CONFIRMED: colors.success + '20',
      ORDER_PREPARING: colors.primary[50],
      ORDER_READY: colors.success + '20',
      ORDER_COMPLETED: colors.success + '20',
      ORDER_CANCELLED: colors.error + '20',
      REFUND_PROCESSED: colors.success + '20',
    };
    return bgColors[template] || colors.secondary[100];
  };

  const renderNotificationItem = ({ item: notification }) => {
    return (
      <TouchableOpacity onPress={() => handleNotificationPress(notification)} activeOpacity={0.7}>
        <Surface
          style={[
            styles.notificationCard,
            !notification.isRead && styles.unreadCard
          ]}
          elevation={!notification.isRead ? 1 : 0}
        >
          <View style={styles.notificationContent}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: getNotificationIconBg(notification.template) }
            ]}>
              <Icon
                source={getNotificationIcon(notification.template)}
                size={24}
                color={getNotificationIconColor(notification.template)}
              />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.headerRow}>
                <Text
                  variant="titleMedium"
                  style={[styles.title, !notification.isRead && styles.unreadText]}
                  numberOfLines={1}
                >
                  {notification.title}
                </Text>
                {!notification.isRead ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text variant="bodyMedium" style={styles.message} numberOfLines={2}>
                {notification.message}
              </Text>
              <View style={styles.footer}>
                <Icon source="clock-outline" size={14} color={colors.text.secondary} />
                <Text variant="bodySmall" style={styles.time}>
                  {formatDate(notification.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Notifications
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading notifications...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Notifications
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon source="alert-circle" size={64} color={colors.error} />
          <Text variant="titleLarge" style={styles.errorText}>
            Failed to load notifications
          </Text>
          <Button
            mode="contained"
            onPress={refetch}
            style={styles.retryButton}
            buttonColor={colors.primary[500]}
          >
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Notifications
          </Text>
          {notifications.length > 0 ? (
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              {notifications.filter(n => !n.isRead).length} unread
            </Text>
          ) : null}
        </View>
        {notifications.some(n => !n.isRead) ? (
          <IconButton
            icon="check-all"
            iconColor={colors.primary[500]}
            size={24}
            onPress={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
          />
        ) : null}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon source="bell-outline" size={80} color={colors.secondary[300]} />
          </View>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No Notifications
          </Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            You don't have any notifications yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
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
    backgroundColor: colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[200],
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerSubtitle: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    color: colors.error,
  },
  retryButton: {
    borderRadius: borderRadius.md,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
  // List
  listContent: {
    paddingBottom: spacing.lg,
  },
  // Notification Card
  notificationCard: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[100],
  },
  unreadCard: {
    backgroundColor: colors.primary[50] + '40',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontWeight: '600',
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  unreadText: {
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  message: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
});

export default NotificationsScreen;

