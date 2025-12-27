import api from './api';

/**
 * Notification Service
 * Handles all notification-related API calls for admin app
 */

/**
 * Get all notifications (Admin only)
 */
export const getAllNotifications = async (params = {}) => {
  const response = await api.get('/notifications/all', { params });
  return response.data;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Delete notification
 */
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export default {
  getAllNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
};
