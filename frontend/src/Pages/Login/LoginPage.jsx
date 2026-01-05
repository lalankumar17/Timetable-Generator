import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import { url } from '../../Script/fetchUrl';
import './Login.css';

// Icons
import EyeIcon from '../../Icons/Eye';
import UserIcon from '../../Icons/User';
import LockIcon from '../../Icons/Lock';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${url}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password })
            });

            const data = await response.json();

            if (response.ok) {
                login(data);
                navigate('/');
            } else {
                setError('Invalid login, please try again');
            }
        } catch {
            setError('Server connection error. Is the backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <img src="/nitte-logo.png" alt="Nitte University" className="nitte-logo" />
                    <h2 className="login-subtitle">Timetable Generation</h2>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <div className="input-wrapper">
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {!email && <UserIcon className="input-icon" size={20} />}
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {!password && <LockIcon className="input-icon" size={20} />}
                            <button
                                type="button"
                                className="password-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <EyeIcon size={20} />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Log in"}
                    </button>

                    <div className="forgot-password-container">
                        <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
                    </div>
                </form>

                <div className="login-footer">
                    <p className="signup-prompt">Don&apos;t have an account? <Link to="/register" className="signup-link">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
