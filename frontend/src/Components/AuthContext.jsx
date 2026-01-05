/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const clearPersonalEmailNoticeCounters = () => {
        Object.keys(sessionStorage)
            .filter((key) => key.startsWith('personal-email-notice-count:'))
            .forEach((key) => sessionStorage.removeItem(key));
    };

    useEffect(() => {
        // Check if user is logged in from sessionStorage
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        clearPersonalEmailNoticeCounters();
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        clearPersonalEmailNoticeCounters();
        setUser(null);
        sessionStorage.removeItem('user');
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        sessionStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
