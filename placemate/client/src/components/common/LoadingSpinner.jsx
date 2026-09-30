import './components.css';

const LoadingSpinner = ({ size = 'medium', text = '' }) => {
  return (
    <div className={`spinner-wrapper spinner-wrapper--${size}`} role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      {text && <p className="spinner-text">{text}</p>}
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  );
};

export default LoadingSpinner;
