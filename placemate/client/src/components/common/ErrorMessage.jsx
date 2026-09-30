import './components.css';

const ErrorMessage = ({ message, onRetry = null }) => {
  if (!message) return null;

  return (
    <div className="error-message" role="alert">
      <div className="error-message__content">
        <span className="error-message__icon" aria-hidden="true">⚠</span>
        <p className="error-message__text">{message}</p>
      </div>
      {onRetry && (
        <button className="error-message__retry" onClick={onRetry} type="button">
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
