import { Link } from 'react-router-dom';
import Button from '../common/Button';
import '../common/components.css';

const formatDeadline = (deadline) => {
  if (!deadline) return null;
  const date = new Date(deadline);
  const now = new Date();
  const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const isUrgent = diff >= 0 && diff <= 3;
  return { label, isUrgent };
};

const JobCard = ({
  _id,
  company,
  title,
  location,
  jobType,
  requiredSkills = [],
  applicationDeadline,
}) => {
  const deadline = formatDeadline(applicationDeadline);
  const visibleSkills = requiredSkills.slice(0, 4);
  const extraCount = requiredSkills.length - visibleSkills.length;

  return (
    <article className="job-card">
      <div className="job-card__header">
        <div className="job-card__company-info">
          <span className="job-card__company">{company || 'Company'}</span>
          <h3 className="job-card__title">{title}</h3>
        </div>
        {jobType && <span className="job-card__badge">{jobType}</span>}
      </div>

      <div className="job-card__meta">
        {location && (
          <span className="job-card__meta-item">
            <span aria-hidden="true">📍</span> {location}
          </span>
        )}
      </div>

      {visibleSkills.length > 0 && (
        <div className="job-card__skills">
          {visibleSkills.map((skill, i) => (
            <span key={i} className="skill-tag">{skill}</span>
          ))}
          {extraCount > 0 && (
            <span className="skill-tag skill-tag--more">+{extraCount} more</span>
          )}
        </div>
      )}

      <div className="job-card__footer">
        {deadline ? (
          <span className={`job-card__deadline${deadline.isUrgent ? ' job-card__deadline--urgent' : ''}`}>
            {deadline.isUrgent ? '⚡ ' : ''}Deadline: {deadline.label}
          </span>
        ) : (
          <span className="job-card__deadline">Open deadline</span>
        )}
        <Link to={`/jobs/${_id}`}>
          <Button variant="outline" className="btn--sm">View Job</Button>
        </Link>
      </div>
    </article>
  );
};

export default JobCard;
