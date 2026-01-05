import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom';

// Components (Pages)
import DashboardPage from './Pages/Dashboard/DashboardPage'

import Menubar from './Components/Menubar';
import Alert from './Components/Alert';
import Confirm from './Components/Confirm';
import NotFound from './Pages/NotFound/NotFound';
import SettingsPage, { changeTheme, changeAccent } from './Pages/Settings/SettingsPage';
import ExamTimetablePage from './Pages/ExamTimetable/ExamTimetablePage';
import PublishedTimetablePage from './Pages/ExamTimetable/PublishedTimetablePage';
import AboutUsPage from './Pages/AboutUs/AboutUsPage';
import LoginPage from './Pages/Login/LoginPage';
import ForgotPasswordPage from './Pages/Login/ForgotPasswordPage';
import RegisterPage from './Pages/Login/RegisterPage';

import ProfilePage from './Pages/Profile/ProfilePage';
import DocsPage from './Pages/Docs/DocsPage';

// Styles
import './App.css'
import "./Style/BasicComponents.css"
import "./Style/UnifiedPages.css"



// Contexts
import { AlertProvider } from './Components/AlertContextProvider';
import { ConfirmProvider } from './Components/ConfirmContextProvider';
import { AuthProvider, useAuth } from './Components/AuthContext';
import { NotificationProvider, useNotifications } from './Components/NotificationContext';
import { getHealthStatus } from './Script/HealthFetcher';
import { canScheduleTimetable } from './Script/Constants';

function ProtectedRoute({ children, requireCoordinator }) {
	const { user, loading } = useAuth();

	if (loading) return null; // Wait for auth check

	if (!user) {
		return <Navigate to="/login" replace />;
	}
	
	if (requireCoordinator && !canScheduleTimetable(user?.email)) {
		return <Navigate to="/" replace />;
	}
	
	return children;
}

function GlobalHealthCheck() {
	const { addNotification, removeNotificationByMessage } = useNotifications();
	const [isDisconnected, setIsDisconnected] = useState(false);

	useEffect(() => {
		const checkHealth = async () => {
			const healthStatus = await getHealthStatus();
			if (healthStatus.backend === 'Disconnected') {
				addNotification('Backend system is disconnected', 'error', 0);
				setIsDisconnected(true);
			} else if (healthStatus.backend === 'OK') {
				removeNotificationByMessage('Backend system is disconnected');
				setIsDisconnected(false);
			}
		};

		checkHealth();
		const interval = setInterval(checkHealth, isDisconnected ? 3000 : 30000);
		return () => clearInterval(interval);
	}, [addNotification, removeNotificationByMessage, isDisconnected]);

	return null;
}

function App() {
	return (
		<AlertProvider>
			<ConfirmProvider>
				<AuthProvider>
					<NotificationProvider>
						<GlobalHealthCheck />
						<BrowserRouter>
							<MainApp />
						</BrowserRouter>
					</NotificationProvider>
				</AuthProvider>
			</ConfirmProvider>
		</AlertProvider>
	)
}

function MainApp() {
	const app = useRef(null)
	const location = useLocation();
	const { user, loading } = useAuth();
	const { addNotification, removeNotificationByMessage } = useNotifications();

	const isPublicPage = location.pathname === '/login' || location.pathname === '/forgot-password' || location.pathname === '/register';
	const isSettingsPage = location.pathname === '/Settings';
	const isDocsPage = location.pathname === '/Docs';
	const isProfilePage = location.pathname === '/Profile';
	const isDashboardPage = location.pathname === '/';
	const shouldShowLayout = user && !isPublicPage;


	useEffect(() => {
		function autoToggleInResize() {
			if (window.innerWidth <= 1250) {
				if (app.current)
					app.current.classList.add("active");
			} else {
				if (app.current)
					app.current.classList.remove("active");
			}
		}

		if (shouldShowLayout) {
			autoToggleInResize();
			window.addEventListener("resize", () => {
				autoToggleInResize()
			})
		}

		// Initialize Theme from LocalStorage
		const savedTheme = localStorage.getItem('theme') || 'Light';
		changeTheme(savedTheme);

		// Initialize Accent Color from LocalStorage
		const savedAccent = localStorage.getItem('accentColor') || '#2563eb';
		changeAccent(savedAccent);

		return () => {
			if (shouldShowLayout) {
				window.removeEventListener("resize", () => {
					autoToggleInResize()
				})
			}
		}
	}, [shouldShowLayout]);

	useEffect(() => {
		if (!user?.email || canScheduleTimetable(user.email)) {
			return;
		}

		const eligiblePaths = ['/', '/ViewTimetable'];
		if (!eligiblePaths.includes(location.pathname)) {
			return;
		}

		const normalizedEmail = String(user.email).toLowerCase().trim();
		const countKey = `personal-email-notice-count:${normalizedEmail}`;
		const nextAtKey = `personal-email-notice-next-at:${normalizedEmail}`;
		const shownCount = Number.parseInt(sessionStorage.getItem(countKey) || '0', 10);
		const safeCount = Number.isNaN(shownCount) ? 0 : shownCount;
		if (safeCount >= 2) {
			return;
		}

		const message = 'Use a registered institutional email to schedule the exam timetable.';

		if (safeCount === 0) {
			removeNotificationByMessage(message);
			addNotification(message, 'warning', 6000);
			sessionStorage.setItem(countKey, '1');
			sessionStorage.setItem(nextAtKey, String(Date.now() + 15000));
			return;
		}

		if (safeCount === 1) {
			const storedNextAt = Number.parseInt(sessionStorage.getItem(nextAtKey) || '0', 10);
			const nextAt = Number.isNaN(storedNextAt) || storedNextAt <= 0 ? Date.now() + 15000 : storedNextAt;
			const remaining = Math.max(0, nextAt - Date.now());

			const timerId = setTimeout(() => {
				const currentPath = window.location.pathname;
				const latestCount = Number.parseInt(sessionStorage.getItem(countKey) || '0', 10);
				const isEligiblePath = currentPath === '/' || currentPath === '/ViewTimetable';

				if (isEligiblePath && latestCount === 1) {
					removeNotificationByMessage(message);
					addNotification(message, 'warning', 6000);
					sessionStorage.setItem(countKey, '2');
					sessionStorage.removeItem(nextAtKey);
				}
			}, remaining);

			return () => clearTimeout(timerId);
		}
	}, [user, location.pathname, addNotification, removeNotificationByMessage]);

	useEffect(() => {
		if (shouldShowLayout && isDocsPage) {
			document.body.classList.add('docs-window-lock');
			return () => {
				document.body.classList.remove('docs-window-lock');
			};
		}

		document.body.classList.remove('docs-window-lock');
	}, [isDocsPage, shouldShowLayout]);

	useEffect(() => {
		if (shouldShowLayout && isProfilePage) {
			document.body.classList.add('profile-window-lock');
			return () => {
				document.body.classList.remove('profile-window-lock');
			};
		}

		document.body.classList.remove('profile-window-lock');
	}, [isProfilePage, shouldShowLayout]);

	useEffect(() => {
		if (!shouldShowLayout) return;

		const resetScrollPositions = () => {
			window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
			document.documentElement.scrollTop = 0;
			document.body.scrollTop = 0;

			const appContainer = document.querySelector('.app');
			if (appContainer) {
				appContainer.scrollTop = 0;
			}

			const mainContainer = document.querySelector('.main-container');
			if (mainContainer) {
				mainContainer.scrollTop = 0;
			}
		};

		// Run immediately and once more after paint to avoid stale preserved offsets.
		resetScrollPositions();
		const rafId = window.requestAnimationFrame(resetScrollPositions);
		return () => window.cancelAnimationFrame(rafId);
	}, [location.pathname, shouldShowLayout]);

	if (loading) return null;

	return (
		<div className={`app ${!shouldShowLayout ? 'login-layout' : ''} ${isSettingsPage ? 'settings-no-scrollbar' : ''} ${isProfilePage ? 'profile-no-scrollbar' : ''} ${isDashboardPage ? 'dashboard-no-scrollbar' : ''}`} ref={app} style={!shouldShowLayout ? { display: 'block' } : {}}>
			<Alert />
			<Confirm />
			{shouldShowLayout && <Menubar />}

			<div className={shouldShowLayout ? 'main-container' : ''} tabIndex="-1" style={shouldShowLayout ? { outline: 'none' } : {}}>
				<Routes>
					<Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />

					<Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
					<Route path="/ExamTimetable" element={<ProtectedRoute requireCoordinator={true}><ExamTimetablePage /></ProtectedRoute>} />
					<Route path="/ViewTimetable" element={<ProtectedRoute><PublishedTimetablePage /></ProtectedRoute>} />
					<Route path="/Settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
					<Route path="/Profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
					<Route path="/Docs" element={<ProtectedRoute><DocsPage /></ProtectedRoute>} />
					<Route path="/AboutUs" element={<ProtectedRoute><AboutUsPage /></ProtectedRoute>} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</div>
		</div>
	)
}

export default App
