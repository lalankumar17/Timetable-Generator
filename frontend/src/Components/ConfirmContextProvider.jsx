/* eslint-disable react-refresh/only-export-components */
// ConfirmContext.js
import { createContext, useState, useContext } from 'react';

const ConfirmContext = createContext({
    confirm: { message: '', type: 'warning', show: false, onApprove: () => { }, onDecline: () => { } },
    showConfirm: () => { },
    hideConfirm: () => { },
    showErrorConfirm: () => { },
});

export const useConfirm = () => {
    return useContext(ConfirmContext);
};

export const ConfirmProvider = ({ children }) => {
    const [confirm, setConfirm] = useState({
        message: '',
        title: '',
        type: '',
        theme: 'default',
        confirmText: 'Yes',
        cancelText: 'No',
        show: false,
        onApprove: () => { },
        onDecline: () => { }
    });

    const showConfirm = (message, options = {}, onApprove = () => { }, onDecline = () => { }) => {
        // Support old signature: (message, type, onApprove, onDecline)
        if (typeof options === 'string') {
            setConfirm({
                message,
                type: options,
                theme: 'default',
                confirmText: 'Yes',
                cancelText: 'No',
                show: true,
                onApprove,
                onDecline
            });
        } else {
            // New signature: (message, optionsObject)
            // options: { type, title, theme, confirmText, cancelText, onApprove, onDecline }
            setConfirm({
                message,
                type: options.type || 'info',
                title: options.title || '',
                theme: options.theme || 'default',
                confirmText: options.confirmText || 'Yes',
                cancelText: options.cancelText || 'No',
                show: true,
                onApprove: options.onApprove || onApprove,
                onDecline: options.onDecline || onDecline
            });
        }
    };

    const showErrorConfirm = (message, onApprove = () => { }, onDecline = () => { }) => {
        setConfirm({
            message,
            type: 'error',
            theme: 'default',
            confirmText: 'Yes',
            cancelText: 'No',
            show: true,
            onApprove,
            onDecline
        });
    };

    const hideConfirm = () => {
        setConfirm({ ...confirm, show: false });
    };

    return (
        <ConfirmContext.Provider value={{ confirm, showConfirm, hideConfirm, showErrorConfirm }}>
            {children}
        </ConfirmContext.Provider>
    );
};
ConfirmProvider.displayName = 'ConfirmProvider';
