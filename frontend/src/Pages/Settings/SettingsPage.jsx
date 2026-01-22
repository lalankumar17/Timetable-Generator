/* eslint-disable react-refresh/only-export-components */
import { memo, useState, useEffect } from 'react';
import '../../Style/UnifiedPages.css';
import '../../Style/Pages/Settings.css';

// Function to handle global theme changes
export function changeTheme(theme) {
    if (theme === 'Dark') {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    } else if (theme === 'Light') {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    } else if (theme === 'System') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark');
            document.body.classList.remove('light');
        } else {
            document.body.classList.add('light');
            document.body.classList.remove('dark');
        }
    }
    localStorage.setItem('theme', theme);
}

// Function to handle global accent color changes
export function changeAccent(color) {
    document.documentElement.style.setProperty('--userAccentColor', color);
    localStorage.setItem('accentColor', color);
}

function SettingsPage() {
    const [manualTheme, setManualTheme] = useState('Light');
    const [useSystemTheme, setUseSystemTheme] = useState(false);
    const [currentAccent, setCurrentAccent] = useState('#2563eb');

    const accents = [
        { name: 'Blue', color: '#2563eb' },
        { name: 'Yellow', color: '#facc15' },
        { name: 'Pink', color: '#f3138a' },
        { name: 'Purple', color: '#6d4dff' },
        { name: 'Orange', color: '#ff8a00' },
        { name: 'Green', color: '#00c389' }
    ];

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'Light';
        const savedManualTheme = localStorage.getItem('manualTheme') || (savedTheme === 'Dark' ? 'Dark' : 'Light');
        const savedAccent = localStorage.getItem('accentColor') || '#2563eb';
        setManualTheme(savedManualTheme);
        setUseSystemTheme(savedTheme === 'System');
        setCurrentAccent(savedAccent);
        changeTheme(savedTheme);
        changeAccent(savedAccent);
    }, []);

    const handleThemeChange = (theme) => {
        changeTheme(theme);
    };

    const handleManualThemeChange = (theme) => {
        setUseSystemTheme(false);
        setManualTheme(theme);
        localStorage.setItem('manualTheme', theme);
        handleThemeChange(theme);
    };

    const handleSystemThemeToggle = () => {
        const nextUseSystemTheme = !useSystemTheme;
        setUseSystemTheme(nextUseSystemTheme);
        if (nextUseSystemTheme) {
            handleThemeChange('System');
            return;
        }
        handleThemeChange(manualTheme);
    };

    const effectiveTheme = useSystemTheme
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light')
        : manualTheme;

    const handleAccentChange = (color) => {
        setCurrentAccent(color);
        changeAccent(color);
    };

    return (
        <div className='page settings-page'>
            <div className='settings-container'>
                <div className='settings-card appearance-card'>
                    <h2 className='appearance-title'>Background</h2>
                    <div className='background-options'>
                        <button
                            className={`background-option ${effectiveTheme === 'Light' ? 'active' : ''}`}
                            onClick={() => handleManualThemeChange('Light')}
                            aria-label='Default background'
                        >
                            <span className={`background-radio ${effectiveTheme === 'Light' ? 'checked' : ''}`}>
                                {effectiveTheme === 'Light' && (
                                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                                        <polyline points='20 6 9 17 4 12' />
                                    </svg>
                                )}
                            </span>
                            <span className='background-label'>Default</span>
                            <span className='background-spacer' aria-hidden='true'></span>
                        </button>
                        <button
                            className={`background-option lights-out ${effectiveTheme === 'Dark' ? 'active' : ''}`}
                            onClick={() => handleManualThemeChange('Dark')}
                            aria-label='Lights out background'
                        >
                            <span className={`background-radio ${effectiveTheme === 'Dark' ? 'checked' : ''}`}>
                                {effectiveTheme === 'Dark' && (
                                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                                        <polyline points='20 6 9 17 4 12' />
                                    </svg>
                                )}
                            </span>
                            <span className='background-label'>Lights out</span>
                            <span className='background-spacer' aria-hidden='true'></span>
                        </button>
                    </div>
                    <div className='system-setting-row'>
                        <span className='system-setting-label'>Use system setting</span>
                        <button
                            type='button'
                            className={`system-setting-toggle ${useSystemTheme ? 'active' : ''}`}
                            onClick={handleSystemThemeToggle}
                            role='switch'
                            aria-checked={useSystemTheme}
                            aria-label='Use system setting'
                        >
                            <span className='system-setting-thumb' />
                        </button>
                    </div>
                    <p className='system-setting-desc'>Choose your preferred theme</p>
                </div>

                <div className='settings-card combined-card'>
                    <div className='settings-section'>
                        <h2 className='accent-title'>Color</h2>
                        <div className='accent-picker'>
                            {accents.map((accent) => (
                                <button
                                    key={accent.name}
                                    className={`accent-btn ${currentAccent === accent.color ? 'active' : ''}`}
                                    style={{ '--bg-accent': accent.color }}
                                    onClick={() => handleAccentChange(accent.color)}
                                    aria-label={accent.name}
                                >
                                    {currentAccent === accent.color && (
                                        <svg className='accent-check' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                                            <polyline points='20 6 9 17 4 12' />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}

export default memo(SettingsPage);
