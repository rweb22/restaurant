import api from './api';

/**
 * Notification Service
 */
const notificationService = {
  /**
   * Get all notifications for current user
   * @param {Object} params - Query parameters (page, limit, isRead, orderId)
   * @returns {Promise} - Notifications list with pagination
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   * @returns {Promise} - Unread count
   */
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark notification as read
   * @param {number} id - Notification ID
   * @returns {Promise} - Updated notification
   */
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} - Updated count
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete notification
   * @param {number} id - Notification ID
   * @returns {Promise} - Success response
   */
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;

