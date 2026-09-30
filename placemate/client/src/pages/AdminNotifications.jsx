import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/notifications');

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('Fetch admin notifications error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to load notifications.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.put(
        `/notifications/${notificationId}/read`
      );

      const updatedNotification = response.data.notification;

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === updatedNotification._id
            ? updatedNotification
            : notification
        )
      );

      setUnreadCount((currentCount) =>
        currentCount > 0 ? currentCount - 1 : 0
      );
    } catch (err) {
      console.error(
        'Mark notification as read error:',
        err
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        'Mark all notifications as read error:',
        err
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return 'Unknown date';
    }

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';

      case 'warning':
        return '⚠';

      case 'error':
        return '✕';

      case 'application':
        return '📄';

      case 'job':
        return '💼';

      case 'user':
        return '👤';

      default:
        return '🔔';
    }
  };

  const getNotificationTypeClass = (type) => {
    switch (type) {
      case 'success':
        return 'success';

      case 'warning':
        return 'warning';

      case 'error':
        return 'error';

      case 'application':
        return 'application';

      case 'job':
        return 'job';

      case 'user':
        return 'user';

      default:
        return 'default';
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link
            to="/dashboard/admin"
            className="admin-back-link"
          >
            ← Back to Dashboard
          </Link>

          <h1>Notifications Center</h1>

          <p>
            Stay updated with important activity across
            the PlaceMate platform.
          </p>
        </div>

        <div className="admin-notification-header-actions">
          <div className="admin-notification-unread-badge">
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="admin-secondary-button"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="admin-empty-state">
          <div className="admin-loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      )}

      {!loading && error && (
        <div className="admin-error-state">
          <div className="admin-error-icon">!</div>

          <h3>Unable to load notifications</h3>

          <p>{error}</p>

          <button
            type="button"
            className="admin-primary-button"
            onClick={fetchNotifications}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="admin-notifications-panel">
          <div className="admin-notifications-panel-header">
            <div>
              <h2>All Notifications</h2>

              <p>
                {notifications.length === 0
                  ? 'No notifications yet.'
                  : `${notifications.length} notification${
                      notifications.length === 1 ? '' : 's'
                    }`}
              </p>
            </div>

            {unreadCount > 0 && (
              <span className="admin-notifications-live-badge">
                ● {unreadCount} unread
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="admin-notifications-empty">
              <div className="admin-notifications-empty-icon">
                🔔
              </div>

              <h3>You’re all caught up</h3>

              <p>
                New platform notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="admin-notifications-list">
              {notifications.map((notification) => {
                const typeClass =
                  getNotificationTypeClass(
                    notification.type
                  );

                return (
                  <div
                    key={notification._id}
                    className={`admin-notification-item ${
                      notification.read ? 'read' : 'unread'
                    }`}
                  >
                    <div
                      className={`admin-notification-icon ${typeClass}`}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    <div className="admin-notification-content">
                      <div className="admin-notification-top-row">
                        <h3>
                          {notification.title ||
                            'Notification'}
                        </h3>

                        {!notification.read && (
                          <span className="admin-notification-new">
                            NEW
                          </span>
                        )}
                      </div>

                      <p>
                        {notification.message ||
                          'You have a new notification.'}
                      </p>

                      <div className="admin-notification-meta">
                        <span>
                          {formatDate(
                            notification.createdAt
                          )}
                        </span>

                        {notification.type && (
                          <span className="admin-notification-type">
                            {notification.type}
                          </span>
                        )}
                      </div>
                    </div>

                    {!notification.read && (
                      <button
                        type="button"
                        className="admin-notification-read-button"
                        onClick={() =>
                          markAsRead(notification._id)
                        }
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;