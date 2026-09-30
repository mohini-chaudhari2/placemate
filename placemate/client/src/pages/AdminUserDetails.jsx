import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

const AdminUserDetails = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/admin/users/${id}`);

      setUser(response.data);
    } catch (err) {
      console.error('Failed to load user:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load user details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'admin':
        return 'admin-role-badge admin';

      case 'recruiter':
        return 'admin-role-badge recruiter';

      default:
        return 'admin-role-badge student';
    }
  };

  const formatList = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return 'Not specified';
    }

    return items.join(', ');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="admin-users-loading">
          <div className="loading-spinner"></div>
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="admin-users-error">
          <div className="admin-error-icon">⚠️</div>

          <h2>Unable to load user</h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchUser}
          >
            Try Again
          </button>

          <Link
            to="/admin/users"
            className="btn btn-secondary"
          >
            ← Back to Users
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const profile = user.profile;

  return (
    <div className="page-container admin-user-details-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="admin-user-details-header">
        <div>
          <span className="section-eyebrow">
            ADMIN PORTAL
          </span>

          <h1>User Details</h1>

          <p>
            Review account and profile information.
          </p>
        </div>

        <Link
          to="/admin/users"
          className="btn btn-secondary"
        >
          ← Back to Users
        </Link>
      </div>


      {/* =========================================
          PROFILE HERO
      ========================================= */}

      <section className="admin-user-profile-card">

        <div className="admin-user-profile-top">

          <div className="admin-user-large-avatar">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="admin-user-profile-main">

            <div className="admin-user-name-row">
              <div>
                <h2>
                  {user.name || 'Unnamed User'}
                </h2>

                <p>
                  {user.email || 'Email not available'}
                </p>
              </div>

              <span className={getRoleClass(user.role)}>
                {user.role}
              </span>
            </div>

          </div>

        </div>


        {/* Account Information */}

        <div className="admin-user-section-title">
          <h3>Account Information</h3>
        </div>

        <div className="admin-user-details-grid">

          <div className="admin-user-detail-item">
            <span>Full Name</span>

            <strong>
              {user.name || 'N/A'}
            </strong>
          </div>

          <div className="admin-user-detail-item">
            <span>Email Address</span>

            <strong>
              {user.email || 'N/A'}
            </strong>
          </div>

          <div className="admin-user-detail-item">
            <span>Account Role</span>

            <strong>
              {user.role
                ? user.role.charAt(0).toUpperCase() +
                  user.role.slice(1)
                : 'N/A'}
            </strong>
          </div>

          <div className="admin-user-detail-item">
            <span>Registered On</span>

            <strong>
              {formatDate(user.createdAt)}
            </strong>
          </div>

          <div className="admin-user-detail-item">
            <span>Last Updated</span>

            <strong>
              {formatDate(user.updatedAt)}
            </strong>
          </div>

          <div className="admin-user-detail-item">
            <span>User ID</span>

            <strong className="admin-user-id">
              {user._id}
            </strong>
          </div>

        </div>

      </section>


      {/* =========================================
          PROFILE INFORMATION
      ========================================= */}

      {profile && (
        <section className="admin-profile-information">

          <div className="admin-profile-section-header">
            <div>
              <span className="section-eyebrow">
                PROFILE
              </span>

              <h2>
                {user.role === 'student'
                  ? 'Student Profile'
                  : user.role === 'recruiter'
                  ? 'Recruiter Profile'
                  : 'Profile Information'}
              </h2>
            </div>
          </div>


          {/* =====================================
              STUDENT PROFILE
          ===================================== */}

          {user.role === 'student' && (
            <>

              <div className="admin-profile-card">

                <div className="admin-profile-card-header">
                  <h3>Academic Information</h3>
                </div>

                <div className="admin-profile-grid">

                  <div className="admin-profile-item">
                    <span>College</span>

                    <strong>
                      {profile.college || 'Not specified'}
                    </strong>
                  </div>

                  <div className="admin-profile-item">
                    <span>Branch</span>

                    <strong>
                      {profile.branch || 'Not specified'}
                    </strong>
                  </div>

                  <div className="admin-profile-item">
                    <span>Graduation Year</span>

                    <strong>
                      {profile.graduationYear || 'Not specified'}
                    </strong>
                  </div>

                  <div className="admin-profile-item">
                    <span>CGPA</span>

                    <strong>
                      {profile.cgpa !== undefined &&
                      profile.cgpa !== null
                        ? profile.cgpa
                        : 'Not specified'}
                    </strong>
                  </div>

                </div>

              </div>


              <div className="admin-profile-card">

                <div className="admin-profile-card-header">
                  <h3>Contact Information</h3>
                </div>

                <div className="admin-profile-grid">

                  <div className="admin-profile-item">
                    <span>Phone</span>

                    <strong>
                      {profile.phone || 'Not specified'}
                    </strong>
                  </div>

                  <div className="admin-profile-item">
                    <span>Resume</span>

                    {profile.resumeUrl ? (
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-profile-link"
                      >
                        View Resume →
                      </a>
                    ) : (
                      <strong>
                        Not uploaded
                      </strong>
                    )}
                  </div>

                </div>

              </div>


              <div className="admin-profile-card">

                <div className="admin-profile-card-header">
                  <h3>Skills</h3>
                </div>

                {profile.skills?.length > 0 ? (
                  <div className="admin-profile-skills">

                    {profile.skills.map(
                      (skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="admin-profile-skill"
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>
                ) : (
                  <p className="admin-profile-empty">
                    No skills added.
                  </p>
                )}

              </div>


              <div className="admin-profile-card">

                <div className="admin-profile-card-header">
                  <h3>Job Preferences</h3>
                </div>

                <div className="admin-profile-grid">

                  <div className="admin-profile-item">
                    <span>
                      Preferred Locations
                    </span>

                    <strong>
                      {formatList(
                        profile.preferredLocations
                      )}
                    </strong>
                  </div>

                  <div className="admin-profile-item">
                    <span>
                      Preferred Job Types
                    </span>

                    <strong>
                      {formatList(
                        profile.preferredJobTypes
                      )}
                    </strong>
                  </div>

                </div>

              </div>


              <div className="admin-profile-card">

                <div className="admin-profile-card-header">
                  <h3>About Student</h3>
                </div>

                <div className="admin-profile-bio">
                  {profile.bio || (
                    <span>
                      No bio provided.
                    </span>
                  )}
                </div>

              </div>

            </>
          )}


          {/* =====================================
              RECRUITER PROFILE
          ===================================== */}

          {user.role === 'recruiter' && (
            <>

              <div className="admin-profile-card">

                <div className="admin-profile-card-header">
                  <h3>Recruiter Information</h3>
                </div>

                <div className="admin-profile-grid">

                  {Object.entries(profile)
                    .filter(
                      ([key]) =>
                        !['_id', 'userId', '__v'].includes(
                          key
                        )
                    )
                    .map(([key, value]) => (
                      <div
                        className="admin-profile-item"
                        key={key}
                      >
                        <span>
                          {key
                            .replace(
                              /([A-Z])/g,
                              ' $1'
                            )
                            .replace(/^./, (char) =>
                              char.toUpperCase()
                            )}
                        </span>

                        <strong>
                          {Array.isArray(value)
                            ? formatList(value)
                            : value || 'Not specified'}
                        </strong>
                      </div>
                    ))}

                </div>

              </div>

            </>
          )}

        </section>
      )}


      {/* =========================================
          NO PROFILE
      ========================================= */}

      {!profile && user.role !== 'admin' && (
        <section className="admin-profile-card admin-no-profile">

          <div className="admin-empty-icon">
            👤
          </div>

          <h3>
            Profile not completed
          </h3>

          <p>
            This user has not created their profile yet.
          </p>

        </section>
      )}

    </div>
  );
};

export default AdminUserDetails;