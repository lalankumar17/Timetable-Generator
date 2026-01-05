import { memo, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { canScheduleTimetable } from '../Script/Constants';

import '../Style/Menubar.css';
import logo from '../../images/logo.png';


const menuData = [
    {
        name: "Home",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
        link: "/"
    },
    {
        name: "Exam Timetable",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
        link: "/ExamTimetable"
    },
    {
        name: "View Timetable",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
        link: "/ViewTimetable"
    },
    {
        name: "Profile",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></svg>,
        link: "/Profile"
    },
    {
        name: "Docs",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>,
        link: "/Docs"
    }
]

import { useConfirm } from './ConfirmContextProvider';

const Menubar = ({ onMenuToggleClick = () => { } }) => {
    const route = useLocation()
    const { user, logout } = useAuth()
    const { showConfirm } = useConfirm();


    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showFooterLogout, setShowFooterLogout] = useState(false);
    const accountBlockRef = useRef(null);
    const accountName = user?.name || user?.email?.split('@')[0] || 'User';
    const accountHandle = user?.email || accountName;
    const accountAvatarUrl = user?.profilePicture ? user.profilePicture.split('#meta=')[0].split('|meta=')[0] : '';
    const isInstitutionalAccount = canScheduleTimetable(user?.email);
    const accountInitials = accountName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'U';

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!showFooterLogout) return;
            if (accountBlockRef.current && !accountBlockRef.current.contains(event.target)) {
                setShowFooterLogout(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [showFooterLogout]);

    useEffect(() => {
        if (window.innerWidth > 800) return;

        const app = document.querySelector('.app');
        if (app && !app.classList.contains('active')) {
            app.classList.add('active');
            setSidebarOpen(false);
            setShowFooterLogout(false);
        }
    }, [route.pathname]);

    function toggleMenubar() {
        let activeApp = document.querySelector(".app.active");
        let app = document.querySelector(".app")
        if (app) app.classList.toggle("active")
        if (activeApp) activeApp.classList.remove("active")
        setSidebarOpen(prev => !prev);
        setShowFooterLogout(false);
        onMenuToggleClick()
    }

    const handleLinkClick = () => {
        if (window.innerWidth <= 800) {
            let app = document.querySelector(".app")
            if (app) {
                app.classList.add("active")
            }
            setSidebarOpen(false);
            setShowFooterLogout(false);
            onMenuToggleClick();
        }
    };

    const handleLogout = () => {
        setShowFooterLogout(false);
        // Close sidebar on mobile before showing confirmation
        handleLinkClick();

        showConfirm(
            `Sign out of '${user?.name || user?.email?.split('@')[0] || 'User'}'?`,
            {
                // theme: 'dark', // Removed to use standard VS Code style
                confirmText: 'Sign Out',
                cancelText: 'Cancel',
                onApprove: logout
            }
        );
    };

    const handleSettingsClick = () => {
        setShowFooterLogout(false);
        handleLinkClick();
    };

    const handleLogoClick = (e) => {
        if (route.pathname === '/') {
            e.preventDefault();
            window.location.reload();
            return;
        }
        handleLinkClick();
    };

    const handleProfileClick = () => {
        setShowFooterLogout(false);
        handleLinkClick();
    };

    return (
        <nav className='menubar-container'>
            <div className='menu-header'>
                <div className='title'>
                    <Link to="/" onClick={handleLogoClick}>
                        <img src={logo} alt="AEMS" className="logo-img" />
                    </Link>
                </div>
                <div className='toggle-menu'>
                    <span className="toggle-icon-wrapper" onClick={toggleMenubar} data-tooltip={sidebarOpen ? 'Close menu' : 'Open menu'}>
                        <svg className='icon' xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </span>
                </div>
            </div>

            <div className='menu-list'>

                {menuData.filter(menu => {
                    const isCoordinator = canScheduleTimetable(user?.email);
                    if (menu.name === "Exam Timetable" && !isCoordinator) return false;
                    return true;
                }).map((menu, index) => {
                    const isActive = route.pathname === menu.link

                    return (
                        <Link to={menu.link} onClick={handleLinkClick} className={`menu-container ${isActive ? "active" : ""}`} key={index} data-tooltip={menu.name}>
                            <div className='icon-container'>
                                <div className='icon'>{menu.icon}</div>
                            </div>
                            <li className='hide-able'>{menu.name}</li>
                        </Link>
                    )
                })}

                <div className="menubar-footer">
                    <div className="footer-account-block" ref={accountBlockRef}>
                        {showFooterLogout && (
                            <div className="account-popover" role="menu" aria-label="Account menu">
                                <div className="account-popover-header">
                                    <div className="account-avatar account-popover-avatar" aria-hidden="true">
                                        {accountAvatarUrl ? <img src={accountAvatarUrl} alt="" /> : accountInitials}
                                    </div>
                                    <div className="account-popover-identity">
                                        <div className="account-popover-name">{accountName}</div>
                                        <div className="account-popover-email">{accountHandle}</div>
                                    </div>
                                </div>
                                <div className="account-popover-divider" aria-hidden="true"></div>

                                <Link to="/AboutUs" className="account-popover-item" role="menuitem" onClick={handleProfileClick}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    <span>About</span>
                                </Link>

                                <div className="account-popover-divider" aria-hidden="true"></div>

                                <Link to="/Settings" className="account-popover-item" role="menuitem" onClick={handleSettingsClick}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                    <span>Settings</span>
                                </Link>

                                {isInstitutionalAccount && (
                                    <>
                                        <div className="account-popover-divider" aria-hidden="true"></div>
                                        <a
                                            href="https://mail.google.com/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="account-popover-item"
                                            role="menuitem"
                                            onClick={() => setShowFooterLogout(false)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>
                                            <span>Gmail</span>
                                        </a>
                                    </>
                                )}

                                <div className="account-popover-divider" aria-hidden="true"></div>

                                <button type="button" className="account-popover-item logout-action" onClick={handleLogout}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                    <span>Sign out</span>
                                </button>
                            </div>
                        )}

                        <div
                            className="footer-account-card"
                            role="button"
                            tabIndex={0}
                            aria-expanded={showFooterLogout}
                            onClick={() => setShowFooterLogout(prev => !prev)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setShowFooterLogout(prev => !prev);
                                }
                            }}
                        >
                            <div className="account-avatar" aria-hidden="true">
                                {accountAvatarUrl ? <img src={accountAvatarUrl} alt="" /> : accountInitials}
                            </div>
                            <div className="account-meta">
                                <div className="account-name">{accountName}</div>
                                <div className="account-handle">{accountHandle}</div>
                            </div>
                        </div>
                    </div>

                    <button
                        className="compact-profile"
                        type="button"
                        aria-label="Account"
                        data-tooltip={accountName}
                        aria-expanded={showFooterLogout}
                        onClick={() => setShowFooterLogout(prev => !prev)}
                    >
                        <div className="account-avatar" aria-hidden="true">
                            {accountAvatarUrl ? <img src={accountAvatarUrl} alt="" /> : accountInitials}
                        </div>
                    </button>
                </div>
            </div>
        </nav >
    )
}

export default memo(Menubar);
