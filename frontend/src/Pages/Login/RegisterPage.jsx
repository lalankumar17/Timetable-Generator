import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { url } from '../../Script/fetchUrl';
import EyeIcon from '../../Icons/Eye';
import ExclamationIcon from '../../Icons/Exclamation';
import { canScheduleTimetable } from '../../Script/Constants';
import './Login.css';

function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    // Field-specific errors
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;

        // Clear specific field error when user types
        setErrors(prev => ({ ...prev, [id]: '' }));

        // Name: only allow letters, spaces, and dots
        if (id === 'name') {
            setFormData({ ...formData, [id]: value.replace(/[^a-zA-Z\s.]/g, '') });
            return;
        }
        setFormData({ ...formData, [id]: value });
    };

    const handleBlur = (e) => {
        const { id, value } = e.target;
        if (!value.trim()) {
            setErrors(prev => ({ ...prev, [id]: true }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // Helper to check empty
        if (!formData.name.trim()) newErrors.name = true;
        if (!formData.email.trim()) newErrors.email = true;
        if (!formData.password) newErrors.password = true;
        if (!formData.confirmPassword) newErrors.confirmPassword = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Validate name has at least two words
        const nameWords = formData.name.trim().split(/\s+/).filter(w => w.length > 0);
        if (nameWords.length < 2) {
            setError('Please enter at least two words for your name (e.g. First Last).');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const normalizedEmail = formData.email.trim().toLowerCase();
        if (normalizedEmail.endsWith('@nmit.ac.in') && !canScheduleTimetable(normalizedEmail)) {
            setError('Only authorized @nmit.ac.in emails are permitted. Please use a personal email.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${url}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    username: normalizedEmail,
                    email: normalizedEmail,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/login', { state: { message: 'Registration successful! Please login.' } });
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch {
            setError('Server connection error. Is the backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container register-container">
                <div className="login-header">
                    <h1>Create your account</h1>

                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

                    <div className="form-group">

                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="name"
                                placeholder="Full name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={errors.name ? 'input-error' : ''}
                                required
                            />
                            {!formData.name && (
                                <span className="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </span>
                            )}
                            {errors.name && (
                                <span className="validation-icon">
                                    <ExclamationIcon size={20} color="#ef4444" />
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">

                        <div className="input-wrapper">
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'input-error' : ''}
                                required
                            />
                            {!formData.email && (
                                <span className="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                </span>
                            )}
                            {errors.email && (
                                <span className="validation-icon">
                                    <ExclamationIcon size={20} color="#ef4444" />
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">

                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'input-error' : ''}
                                required
                            />
                            {!formData.password && (
                                <span className="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </span>
                            )}
                            {errors.password ? (
                                <span className="validation-icon">
                                    <ExclamationIcon size={20} color="#ef4444" />
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="password-toggle-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <EyeIcon size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="form-group">

                        <div className="input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                placeholder="Repeat your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'input-error' : ''}
                                required
                            />
                            {!formData.confirmPassword && (
                                <span className="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </span>
                            )}
                            {errors.confirmPassword ? (
                                <span className="validation-icon">
                                    <ExclamationIcon size={20} color="#ef4444" />
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="password-toggle-icon"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <EyeIcon size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="login-button signup-btn-blue" disabled={isLoading}>
                        {isLoading ? "creating account..." : "Sign up"}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Already have an account? <Link to="/login">Log in</Link></p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
