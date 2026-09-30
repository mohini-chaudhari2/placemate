import { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};

export const ConfirmProvider = ({ children }) => {
    const [confirmOptions, setConfirmOptions] = useState(null);
    const [resolveRef, setResolveRef] = useState(null);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfirmOptions(options);
            setResolveRef(() => resolve);
        });
    }, []);

    const handleClose = useCallback(() => {
        setConfirmOptions(null);
        if (resolveRef) resolveRef(false);
    }, [resolveRef]);

    const handleSuccess = useCallback(() => {
        setConfirmOptions(null);
        if (resolveRef) resolveRef(true);
    }, [resolveRef]);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {confirmOptions && (
                <ConfirmModal
                    options={confirmOptions}
                    onClose={handleClose}
                    onSuccess={handleSuccess}
                />
            )}
        </ConfirmContext.Provider>
    );
};
