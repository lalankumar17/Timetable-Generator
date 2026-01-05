/* eslint-disable react-refresh/only-export-components */
// AlertContext.js
import { createContext, useState, useContext, useCallback, useMemo } from 'react';

const AlertContext = createContext({
    alert: { message: '', type: 'warning', show: false },
    showAlert: () => { },
    hideAlert: () => { },
    showWarning: () => { },
    showSuccess: () => { },
    showError: () => { }
});

export const useAlert = () => {
    return useContext(AlertContext);
};

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({ message: '', type: '', show: false });

    const hideAlert = useCallback(() => {
        setAlert((prev) => ({ ...prev, show: false }));
    }, []);

    const autoCloseAlert = useMemo(() => {
        return () => {
            setTimeout(hideAlert, 2000);
        };
    }, [hideAlert]);

    const showWarning = (message) => {
        setAlert({ message, type: 'warning', show: true });
        autoCloseAlert();
    };

    const showSuccess = (message) => {
        setAlert({ message, type: 'success', show: true });
        autoCloseAlert();
    }

    const showError = (message) => {
        setAlert({ message, type: 'error', show: true });
        autoCloseAlert();
    }

    const showAlert = (message, type) => {
        setAlert({ message, type, show: true });
        autoCloseAlert();
    };

    return (
        <AlertContext.Provider value={{ alert, showAlert, hideAlert, showWarning, showSuccess, showError }}>
            {children}
        </AlertContext.Provider>
    );
};
AlertProvider.displayName = 'AlertProvider';
