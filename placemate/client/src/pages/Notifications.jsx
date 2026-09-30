import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/notifications');

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('Fetch notifications error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load notifications. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (err) {
      console.error('Mark notification as read error:', err);
      toast.error('Unable to mark notification as read.');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch (err) {
      console.error('Mark all notifications as read error:', err);
      toast.error('Unable to mark all notifications as read.');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return '📋';
      case 'job':
        return '💼';
      case 'profile':
        return '👤';
      case 'system':
        return '🔔';
      default:
        return '🔔';
    }
  };

  const getNotificationLink = (type) => {
    switch (type) {
      case 'application':
        return user?.role === 'recruiter' ? '/recruiter/applications' : '/applications';
      case 'interview':
        return user?.role === 'recruiter' ? '/recruiter/interviews' : '/interviews';
      case 'job':
        return user?.role === 'recruiter' ? '/dashboard/recruiter' : '/jobs';
      default:
        return null;
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div>
            <Link to="/" className="notifications-back">
              ← Back to Home
            </Link>

            <h1>Notifications</h1>

            <p>
              Stay updated with your applications, jobs, and account activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              className="mark-all-button"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {unreadCount > 0 && (
          <div className="unread-summary">
            <span className="unread-dot"></span>
            {unreadCount} unread notification
            {unreadCount !== 1 ? 's' : ''}
          </div>
        )}

        {loading && (
          <div className="notifications-state">
            <div className="notifications-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        )}

        {!loading && error && (
          <div className="notifications-error">
            <div className="notification-error-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>

            <button
              className="retry-button"
              onClick={fetchNotifications}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="notifications-empty">
            <div className="empty-notification-icon">🔔</div>

            <h2>No notifications yet</h2>

            <p>
              When you apply for jobs or receive application updates,
              they'll appear here.
            </p>

            <Link to="/jobs" className="browse-jobs-button">
              Browse Jobs
            </Link>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${
                  notification.read ? 'read' : 'unread'
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification._id);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>{notification.title}</h3>

                    {!notification.read && (
                      <span className="new-badge">NEW</span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <span className="notification-date">
                    {formatDate(notification.createdAt)}
                  </span>
                  
                  {getNotificationLink(notification.type) && (
                    <div style={{ marginTop: '12px' }}>
                      <Link 
                        to={getNotificationLink(notification.type)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details
                      </Link>
                    </div>
                  )}
                </div>

                {!notification.read && (
                  <button
                    className="read-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      markAsRead(notification._id);
                    }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;