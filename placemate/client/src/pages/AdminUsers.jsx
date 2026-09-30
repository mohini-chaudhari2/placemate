import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (role) {
        params.role = role;
      }

      const response = await api.get('/admin/users', {
        params,
      });

      setUsers(response.data.users || []);
      setCount(response.data.count || 0);
    } catch (err) {
      console.error('Failed to load admin users:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load users.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchUsers();
  };

  const clearFilters = () => {
    setSearch('');
    setRole('');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRoleClass = (userRole) => {
    switch (userRole) {
      case 'admin':
        return 'admin-role-badge admin';

      case 'recruiter':
        return 'admin-role-badge recruiter';

      default:
        return 'admin-role-badge student';
    }
  };

  return (
    <div className="page-container admin-users-page">
      <div className="admin-users-header">
        <div>
          <span className="section-eyebrow">
            ADMIN PORTAL
          </span>

          <h1>User Management</h1>

          <p>
            Search and review registered PlaceMate users.
          </p>
        </div>

        <Link
          to="/dashboard/admin"
          className="btn btn-secondary"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <section className="admin-users-toolbar">
        <form
          className="admin-user-search-form"
          onSubmit={handleSearch}
        >
          <div className="admin-search-field">
            <span>🔍</span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name or email..."
            />
          </div>

          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value)
            }
            className="admin-role-filter"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Admins</option>
          </select>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Search
          </button>

          {(search || role) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
        </form>

        <div className="admin-users-count">
          <strong>{count}</strong>
          <span>
            {count === 1 ? 'user found' : 'users found'}
          </span>
        </div>
      </section>

      {loading ? (
        <div className="admin-users-loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <div className="admin-users-error">
          <div className="admin-error-icon">⚠️</div>

          <h2>Unable to load users</h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchUsers}
          >
            Try Again
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-users-empty">
          <div className="admin-empty-icon">👥</div>

          <h2>No users found</h2>

          <p>
            Try changing your search or role filter.
          </p>

          {(search || role) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <section className="admin-users-table-card">
          <div className="admin-users-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="admin-table-user">
                        <div className="admin-table-avatar">
                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase() || 'U'}
                        </div>

                        <div>
                          <strong>
                            {user.name || 'Unnamed User'}
                          </strong>

                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={getRoleClass(user.role)}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span className="admin-table-date">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="admin-view-user-btn"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminUsers;