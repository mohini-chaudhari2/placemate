import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Navbar.css';
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const isStudent = user?.role === 'student';
  const isRecruiter = user?.role === 'recruiter';
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchNotifications = async (showLoading = false) => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    try {
      if (showLoading) setNotificationLoading(true);

      const response = await api.get('/notifications');
      setUnreadCount(response.data?.unreadCount || 0);
      setNotifications(response.data?.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      if (showLoading) setNotificationLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((current) =>
        current.map((n) => (n._id === id ? { ...n, read: true, isRead: true } : n))
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((current) =>
        current.map((n) => ({ ...n, read: true, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return undefined;

    const interval = window.setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setNotificationOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const getNotificationIcon = (notification) => {
    const type = String(notification?.type || '').toLowerCase();

    if (type.includes('interview')) return '📅';
    if (type.includes('application')) return '📄';
    if (type.includes('job')) return '💼';
    if (type.includes('success')) return '✅';

    return '🔔';
  };

  const formatNotificationDate = (date) => {
    if (!date) return '';

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return '';

    return parsedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleNotificationToggle = () => {
    const nextOpen = !notificationOpen;
    setNotificationOpen(nextOpen);

    if (nextOpen) fetchNotifications(true);
  };

  const NotificationCenter = () => (
    <div className="navbar-notification-center" ref={notificationRef}>
      <button
        type="button"
        className={`navbar-notification-trigger ${notificationOpen ? 'is-open' : ''}`}
        onClick={handleNotificationToggle}
        aria-expanded={notificationOpen}
        aria-haspopup="true"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <span className="navbar-notification-bell">🔔</span>
        <span className="navbar-notification-label">Notifications</span>

        {unreadCount > 0 && (
          <span className="navbar-notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div className="navbar-notification-panel">
          <div className="navbar-notification-panel-header">
            <div>
              <span className="navbar-notification-eyebrow">Updates</span>
              <h3>Notifications</h3>
            </div>

            {unreadCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="navbar-notification-unread">
                  {unreadCount} unread
                </span>
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    padding: '0'
                  }}
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          <div className="navbar-notification-list">
            {notificationLoading ? (
              <div className="navbar-notification-state">
                <span className="navbar-notification-spinner" />
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <div
                  className={`navbar-notification-item ${notification.isRead === false || notification.read === false ? 'is-unread' : ''
                    }`}
                  key={notification._id}
                  onClick={() => {
                      if (notification.read === false || notification.isRead === false) {
                          markAsRead(notification._id);
                      }
                  }}
                  style={{ cursor: (notification.read === false || notification.isRead === false) ? 'pointer' : 'default' }}
                >
                  <div className="navbar-notification-item-icon">
                    {getNotificationIcon(notification)}
                  </div>

                  <div className="navbar-notification-item-content">
                    <div className="navbar-notification-item-heading">
                      <h4>{notification.title || 'PlaceMate Update'}</h4>
                      {notification.createdAt && (
                        <span>{formatNotificationDate(notification.createdAt)}</span>
                      )}
                    </div>

                    <p>
                      {notification.message || 'You have a new PlaceMate update.'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="navbar-notification-state">
                <div className="navbar-notification-empty-icon">🔔</div>
                <h4>You&apos;re all caught up</h4>
                <p>No new notifications right now.</p>
              </div>
            )}
          </div>

          <div className="navbar-notification-panel-footer">
            <Link
              to="/notifications"
              className="navbar-notification-view-all"
              onClick={() => setNotificationOpen(false)}
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          PlaceMate
        </Link>

        <div className="navbar-links">
          <Link to="/">Home</Link>

          {isStudent && (
            <>
              <Link to="/jobs">Jobs</Link>
              <Link to="/applications">My Applications</Link>
              <NotificationCenter />
              <Link to="/about">About</Link>
            </>
          )}

          {isRecruiter && (
            <>
              <Link to="/recruiter/jobs/new">Post Job</Link>
              <Link to="/recruiter/applications">Applications</Link>
              <NotificationCenter />
              <Link to="/about">About</Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link to="/dashboard/admin">Admin Dashboard</Link>
              <NotificationCenter />
              <Link to="/about">About</Link>
            </>
          )}

          {!user && (
            <>
              <Link to="/jobs">Jobs</Link>
              <Link to="/about">About</Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link
                to={
                  isRecruiter
                    ? '/dashboard/recruiter'
                    : isAdmin
                      ? '/dashboard/admin'
                      : '/dashboard/student'
                }
                className="navbar-dashboard"
              >
                Dashboard
              </Link>

              <span className="navbar-user-name">{user.name}</span>

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-login">Login</Link>
              <Link to="/register" className="navbar-register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
