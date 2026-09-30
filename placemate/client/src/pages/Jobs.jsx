import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import JobCard from '../components/jobs/JobCard';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

import './Jobs.css';

const DEFAULT_FILTERS = {
  search: '',
  location: '',
  jobType: '',
  experience: '',
  skills: '',
  salary: '',
  sort: 'newest',
};

const PAGE_SIZE = 12;

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [savedJobIds, setSavedJobIds] = useState([]);
  const [savingJobId, setSavingJobId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState(false);

  const [activeFilterCount, setActiveFilterCount] =
    useState(0);

  const fetchJobs = async (
    requestedPage = page,
    requestedFilters = filters
  ) => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: requestedPage,
        limit: PAGE_SIZE,
        sort: requestedFilters.sort || 'newest',
      };

      if (requestedFilters.search.trim()) {
        params.search =
          requestedFilters.search.trim();
      }

      if (requestedFilters.location.trim()) {
        params.location =
          requestedFilters.location.trim();
      }

      if (requestedFilters.jobType) {
        params.jobType =
          requestedFilters.jobType;
      }

      if (requestedFilters.experience) {
        params.experience =
          requestedFilters.experience;
      }

      if (requestedFilters.skills.trim()) {
        params.skills =
          requestedFilters.skills.trim();
      }

      if (requestedFilters.salary.trim()) {
        params.salary =
          requestedFilters.salary.trim();
      }

      const response = await api.get('/jobs', {
        params,
      });

      setJobs(response.data?.jobs || []);
      setTotalJobs(
        response.data?.totalJobs || 0
      );
      setTotalPages(
        response.data?.totalPages || 0
      );
      setPage(
        response.data?.page || requestedPage
      );
    } catch (err) {
      console.error(
        'Failed to load jobs:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Unable to load jobs. Please try again.'
      );

      setJobs([]);
      setTotalJobs(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobIds = async () => {
    try {
      const response =
        await api.get('/saved-jobs/ids');

      setSavedJobIds(
        response.data?.jobIds || []
      );
    } catch (err) {
      /*
       * Guests are allowed to browse jobs.
       * If saved jobs cannot be loaded,
       * keep the list empty.
       */
      console.error(
        'Failed to load saved jobs:',
        err
      );

      setSavedJobIds([]);
    }
  };

  useEffect(() => {
    fetchJobs(1, DEFAULT_FILTERS);
    fetchSavedJobIds();
  }, []);

  useEffect(() => {
    let count = 0;

    if (filters.search.trim()) count += 1;
    if (filters.location.trim()) count += 1;
    if (filters.jobType) count += 1;
    if (filters.experience) count += 1;
    if (filters.skills.trim()) count += 1;
    if (filters.salary.trim()) count += 1;

    setActiveFilterCount(count);
  }, [filters]);

  const updateFilter = (
    field,
    value
  ) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    fetchJobs(1, filters);
  };

  const handleSortChange = (
    event
  ) => {
    const nextFilters = {
      ...filters,
      sort: event.target.value,
    };

    setFilters(nextFilters);

    fetchJobs(1, nextFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      ...DEFAULT_FILTERS,
    };

    setFilters(clearedFilters);
    setPage(1);

    fetchJobs(
      1,
      clearedFilters
    );
  };

  const removeFilter = (field) => {
    const nextFilters = {
      ...filters,
      [field]:
        field === 'sort'
          ? 'newest'
          : '',
    };

    setFilters(nextFilters);
    fetchJobs(1, nextFilters);
  };

  const handlePageChange = (
    nextPage
  ) => {
    if (
      nextPage < 1 ||
      (totalPages > 0 &&
        nextPage > totalPages) ||
      loading
    ) {
      return;
    }

    fetchJobs(
      nextPage,
      filters
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSaveJob = async (
    jobId
  ) => {
    try {
      setSavingJobId(jobId);

      const isSaved =
        savedJobIds.includes(jobId);

      if (isSaved) {
        await api.delete(
          `/saved-jobs/${jobId}`
        );

        setSavedJobIds(
          (current) =>
            current.filter(
              (id) => id !== jobId
            )
        );
        toast.success('Job removed from saved list.');
      } else {
        await api.post(
          '/saved-jobs',
          {
            jobId,
          }
        );

        setSavedJobIds(
          (current) => [
            ...current,
            jobId,
          ]
        );
        toast.success('Job saved successfully!');
      }
    } catch (err) {
      console.error(
        'Failed to update saved job:',
        err
      );

      /*
       * If the API says the job is already
       * saved, synchronise local state.
       */
      if (
        err.response?.status === 409 &&
        err.response?.data?.saved
      ) {
        setSavedJobIds(
          (current) =>
            current.includes(jobId)
              ? current
              : [
                ...current,
                jobId,
              ]
        );

        return;
      }

      const msg = err.response?.data?.message || 'Unable to update saved job. Please try again.';
      toast.error(msg);
    } finally {
      setSavingJobId(null);
    }
  };

  const hasActiveFilters =
    activeFilterCount > 0;

  return (
    <div className="page-content">
      {/* Hero */}
      <div className="jobs-hero">
        <div className="container">
          <div className="jobs-hero__content">
            <div>
              <span className="jobs-hero__eyebrow">
                ✦ PLACE MATE CAREER DISCOVERY
              </span>

              <h1 className="jobs-hero__title">
                Find Your Next
                <span className="jobs-hero__highlight">
                  {' '}
                  Opportunity
                </span>
              </h1>

              <p className="jobs-hero__subtitle">
                Discover live placement
                opportunities that match your
                skills, location and career goals.
              </p>
            </div>

            <div className="jobs-hero__stats">
              <div className="jobs-hero-stat">
                <strong>
                  {totalJobs}
                </strong>
                <span>
                  Open Opportunities
                </span>
              </div>

              <div className="jobs-hero-stat">
                <strong>
                  {savedJobIds.length}
                </strong>
                <span>
                  Saved Jobs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container jobs-page">
        {/* Search and Filters */}
        <section className="jobs-filters card">
          <div className="jobs-filter-heading">
            <div>
              <span className="jobs-section-kicker">
                JOB DISCOVERY
              </span>

              <h2>
                Search opportunities
              </h2>

              <p>
                Use filters to narrow down
                openings that fit your goals.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline jobs-advanced-toggle"
              onClick={() =>
                setShowAdvancedFilters(
                  (current) => !current
                )
              }
            >
              ⚙️{' '}
              {showAdvancedFilters
                ? 'Hide Filters'
                : 'Advanced Filters'}

              {activeFilterCount > 0 && (
                <span className="jobs-filter-count">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <form
            className="jobs-filter-form"
            onSubmit={handleSearch}
          >
            {/* Search */}
            <div className="jobs-filter-field jobs-search-field">
              <label htmlFor="job-search">
                Search
              </label>

              <div className="jobs-input-wrapper">
                <span className="jobs-input-icon">
                  🔎
                </span>

                <input
                  id="job-search"
                  type="text"
                  placeholder="Job title, company or skill..."
                  value={filters.search}
                  onChange={(event) =>
                    updateFilter(
                      'search',
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* Location */}
            <div className="jobs-filter-field">
              <label htmlFor="job-location">
                Location
              </label>

              <div className="jobs-input-wrapper">
                <span className="jobs-input-icon">
                  📍
                </span>

                <input
                  id="job-location"
                  type="text"
                  placeholder="e.g. Pune"
                  value={filters.location}
                  onChange={(event) =>
                    updateFilter(
                      'location',
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* Job Type */}
            <div className="jobs-filter-field">
              <label htmlFor="job-type">
                Job Type
              </label>

              <select
                id="job-type"
                value={filters.jobType}
                onChange={(event) =>
                  updateFilter(
                    'jobType',
                    event.target.value
                  )
                }
              >
                <option value="">
                  All Types
                </option>

                <option value="Full Time">
                  Full Time
                </option>

                <option value="Part Time">
                  Part Time
                </option>

                <option value="Internship">
                  Internship
                </option>

                <option value="Contract">
                  Contract
                </option>
              </select>
            </div>

            {/* Actions */}
            <div className="jobs-filter-actions">
              <button
                type="submit"
                className="btn btn-primary"
              >
                🔎 Search Jobs
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={clearFilters}
              >
                🧹 Clear
              </button>
            </div>
          </form>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="jobs-advanced-panel">
              <div className="jobs-advanced-grid">
                {/* Experience */}
                <div className="jobs-filter-field">
                  <label htmlFor="job-experience">
                    Experience
                  </label>

                  <select
                    id="job-experience"
                    value={
                      filters.experience
                    }
                    onChange={(event) =>
                      updateFilter(
                        'experience',
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Any Experience
                    </option>

                    <option value="Fresher">
                      Fresher
                    </option>

                    <option value="0-1">
                      0–1 Years
                    </option>

                    <option value="1-2">
                      1–2 Years
                    </option>

                    <option value="2-3">
                      2–3 Years
                    </option>

                    <option value="3+">
                      3+ Years
                    </option>
                  </select>
                </div>

                {/* Skills */}
                <div className="jobs-filter-field">
                  <label htmlFor="job-skills">
                    Skills
                  </label>

                  <div className="jobs-input-wrapper">
                    <span className="jobs-input-icon">
                      🛠️
                    </span>

                    <input
                      id="job-skills"
                      type="text"
                      placeholder="React, Node.js..."
                      value={filters.skills}
                      onChange={(event) =>
                        updateFilter(
                          'skills',
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <small>
                    Separate multiple skills
                    with commas.
                  </small>
                </div>

                {/* Salary */}
                <div className="jobs-filter-field">
                  <label htmlFor="job-salary">
                    Salary
                  </label>

                  <div className="jobs-input-wrapper">
                    <span className="jobs-input-icon">
                      💰
                    </span>

                    <input
                      id="job-salary"
                      type="text"
                      placeholder="e.g. 5 LPA"
                      value={filters.salary}
                      onChange={(event) =>
                        updateFilter(
                          'salary',
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <small>
                    Searches the salary text
                    published by recruiters.
                  </small>
                </div>

                {/* Sort */}
                <div className="jobs-filter-field">
                  <label htmlFor="job-sort">
                    Sort By
                  </label>

                  <select
                    id="job-sort"
                    value={filters.sort}
                    onChange={
                      handleSortChange
                    }
                  >
                    <option value="newest">
                      Newest First
                    </option>

                    <option value="oldest">
                      Oldest First
                    </option>

                    <option value="deadline">
                      Closing Soon
                    </option>

                    <option value="title">
                      Job Title
                    </option>

                    <option value="company">
                      Company
                    </option>
                  </select>
                </div>
              </div>

              <div className="jobs-advanced-footer">
                <span>
                  {hasActiveFilters
                    ? `${activeFilterCount} filter${activeFilterCount === 1
                      ? ''
                      : 's'
                    } active`
                    : 'No advanced filters applied'}
                </span>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="jobs-text-button"
                    onClick={clearFilters}
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="jobs-active-filters">
              <span className="jobs-active-label">
                Active:
              </span>

              {filters.search.trim() && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter('search')
                  }
                >
                  Search: {filters.search}
                  <span>×</span>
                </button>
              )}

              {filters.location.trim() && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter('location')
                  }
                >
                  📍 {filters.location}
                  <span>×</span>
                </button>
              )}

              {filters.jobType && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter('jobType')
                  }
                >
                  {filters.jobType}
                  <span>×</span>
                </button>
              )}

              {filters.experience && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter('experience')
                  }
                >
                  {filters.experience}
                  <span>×</span>
                </button>
              )}

              {filters.skills.trim() && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter('skills')
                  }
                >
                  🛠️ {filters.skills}
                  <span>×</span>
                </button>
              )}

              {filters.salary.trim() && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter('salary')
                  }
                >
                  💰 {filters.salary}
                  <span>×</span>
                </button>
              )}
            </div>
          )}
        </section>

        {/* Results Header */}
        {!loading && !error && (
          <div className="jobs-results-header">
            <div>
              <span className="jobs-section-kicker">
                LIVE RESULTS
              </span>

              <h2>
                {totalJobs}{' '}
                {totalJobs === 1
                  ? 'Opportunity'
                  : 'Opportunities'}
              </h2>

              <p>
                Showing{' '}
                {jobs.length > 0
                  ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                    page * PAGE_SIZE,
                    totalJobs
                  )}`
                  : '0'}{' '}
                of {totalJobs} matching
                opportunities.
              </p>
            </div>

            <div className="jobs-results-actions">
              <Link
                to="/saved-jobs"
                className="btn btn-outline"
              >
                🔖 Saved Jobs
                {savedJobIds.length > 0
                  ? ` (${savedJobIds.length})`
                  : ''}
              </Link>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() =>
                  fetchJobs(
                    page,
                    filters
                  )
                }
              >
                ↻ Refresh
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card jobs-state">
            <div className="loading-spinner" />

            <h3>
              Finding opportunities...
            </h3>

            <p>
              Searching the latest openings
              from PlaceMate.
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="card jobs-state jobs-error-state">
            <div className="jobs-state-icon">
              ⚠️
            </div>

            <h3>
              Unable to load jobs
            </h3>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                fetchJobs(
                  page,
                  filters
                )
              }
            >
              Try Again
            </button>
          </div>
        )}

        {/* Jobs */}
        {!loading &&
          !error &&
          jobs.length > 0 && (
            <>
              <div className="jobs-grid">
                {jobs.map((job) => {
                  const isSaved =
                    savedJobIds.includes(
                      job._id
                    );

                  const isSaving =
                    savingJobId ===
                    job._id;

                  return (
                    <div
                      key={job._id}
                      className="jobs-card-wrapper"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleSaveJob(
                            job._id
                          )
                        }
                        disabled={isSaving}
                        title={
                          isSaved
                            ? 'Remove from saved jobs'
                            : 'Save job'
                        }
                        aria-label={
                          isSaved
                            ? `Remove ${job.title} from saved jobs`
                            : `Save ${job.title}`
                        }
                        className={`jobs-save-button ${isSaved
                            ? 'is-saved'
                            : ''
                          }`}
                      >
                        {isSaving
                          ? '...'
                          : '🔖'}
                      </button>

                      <JobCard
                        {...job}
                        company={
                          job.companyName ||
                          job.company ||
                          'Company'
                        }
                      />
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="jobs-pagination">
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={
                      page <= 1 ||
                      loading
                    }
                    onClick={() =>
                      handlePageChange(
                        page - 1
                      )
                    }
                  >
                    ← Previous
                  </button>

                  <div className="jobs-pagination-info">
                    <span>
                      Page
                    </span>

                    <strong>
                      {page}
                    </strong>

                    <span>
                      of {totalPages}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={
                      page >=
                      totalPages ||
                      loading
                    }
                    onClick={() =>
                      handlePageChange(
                        page + 1
                      )
                    }
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

        {/* Empty State */}
        {!loading &&
          !error &&
          jobs.length === 0 && (
            <div className="jobs-empty-cta">
              <EmptyState
                icon="🔍"
                title={
                  hasActiveFilters
                    ? 'No matching opportunities'
                    : 'No live opportunities found'
                }
                description={
                  hasActiveFilters
                    ? 'Try removing a filter or changing your search to discover more placement opportunities.'
                    : 'There are currently no open jobs. Check back soon for new placement opportunities.'
                }
                action={
                  hasActiveFilters ? (
                    <Button
                      variant="primary"
                      onClick={
                        clearFilters
                      }
                    >
                      Clear All Filters
                    </Button>
                  ) : (
                    <Link to="/profile">
                      <Button variant="primary">
                        Improve Your Profile
                      </Button>
                    </Link>
                  )
                }
              />
            </div>
          )}
      </div>
    </div>
  );
};

export default Jobs;