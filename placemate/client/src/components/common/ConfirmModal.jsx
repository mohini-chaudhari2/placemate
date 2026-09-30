import { useState, useEffect } from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ options, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const {
        title = 'Confirm',
        message = 'Are you sure you want to proceed?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        danger = false,
        action,
    } = options;

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !loading) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [loading, onClose]);

    const handleConfirm = async () => {
        if (action) {
            try {
                setLoading(true);
                await action();
                onSuccess();
            } catch (error) {
                // Keep modal closed on error as per prompt requirement
                // "API fails -> toast.error -> modal closes appropriately"
                onClose();
            } finally {
                setLoading(false);
            }
        } else {
            onSuccess();
        }
    };

    return (
        <div className="confirm-modal-overlay" onClick={!loading ? onClose : undefined}>
            <div
                className="confirm-modal-container"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-desc"
            >
                <div className="confirm-modal-header">
                    <div className={`confirm-modal-icon ${danger ? 'danger' : 'neutral'}`}>
                        {danger ? '⚠️' : 'ℹ️'}
                    </div>
                    <h2 id="confirm-modal-title" className="confirm-modal-title">{title}</h2>
                </div>

                <div id="confirm-modal-desc" className="confirm-modal-body">
                    <p>{message}</p>
                </div>

                <div className="confirm-modal-actions">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`btn ${danger ? 'btn-danger' : 'btn-primary'} confirm-button`}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
