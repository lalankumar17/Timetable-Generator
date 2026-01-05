import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { url } from '../../Script/fetchUrl';
import EyeIcon from '../../Icons/Eye';
import './Login.css';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: OTP Input, 3: New Password Input, 4: Success
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Pre-warm the Render backend as soon as the page loads
    // so the user doesn't hit a cold-start delay when they click "Send Reset Link"
    useEffect(() => {
        fetch(`${url}/health`).catch(() => {});
    }, []);


    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${url}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setStep(2);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to send reset link');
            }
        } catch {
            setError('Server connection error. Is the backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');



        try {
            const response = await fetch(`${url}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: otp, newPassword })
            });



            if (response.ok) {

                setStep(4); // Success
            } else {
                const data = await response.json();
                console.error("Reset error data:", data);
                setError(data.error || 'Invalid or expired token');
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError('Server connection error. Is the backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {step !== 4 && (
                    <div className="login-header">
                        <h1>{step === 3 ? "Set New Password" : "Forgot Password"}</h1>
                        <p>
                            {step === 1 && "Enter your email address below to reset your password"}
                            {step === 2 && "Verification email sent! Click the link in your email to continue."}
                            {step === 3 && "Please choose a strong password"}
                        </p>
                    </div>
                )}

                {step === 1 && (
                    <form className="login-form" onSubmit={handleEmailSubmit}>
                        {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

                        <div className="form-group center-aligned-group">

                            <div className="input-wrapper">
                                {email.length === 0 && (
                                    <span className="input-icon centered-icon-inside">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    </span>
                                )}
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={email.length === 0 ? "centered-input-with-icon" : ""}
                                />
                            </div>
                        </div>
                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form className="login-form" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                        <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Enter the 6-digit code sent to <strong>{email}</strong>
                        </p>
                        <div className="form-group">
                            <label htmlFor="otp">Verification Code</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </span>
                                <input
                                    type="text"
                                    id="otp"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength="6"
                                    required
                                    style={{ letterSpacing: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}
                                />
                            </div>
                        </div>
                        <button type="submit" className="login-button">
                            Verify OTP
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form className="login-form" onSubmit={handlePasswordReset}>
                        {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

                        <div className="form-group">
                            <label htmlFor="new-password" style={{ fontWeight: '500', marginBottom: '0.5rem', display: 'block', textAlign: 'left', color: '#334155', fontSize: '1rem' }}>New Password</label>
                            <div className="input-wrapper">
                                {!newPassword && (
                                    <span className="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </span>
                                )}
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    id="new-password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-icon"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <EyeIcon size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm-password" style={{ fontWeight: '500', marginBottom: '0.5rem', display: 'block', textAlign: 'left', color: '#334155', fontSize: '1rem' }}>Confirm Password</label>
                            <div className="input-wrapper">
                                {!confirmPassword && (
                                    <span className="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </span>
                                )}
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirm-password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-icon"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <EyeIcon size={20} />
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                )}

                {step === 4 && (
                    <div className="reset-success" style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(74, 222, 128, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Success!</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1rem' }}>
                            Your password has been reset successfully.
                        </p>
                        <button onClick={() => navigate('/login')} className="login-button" style={{ width: '100%' }}>
                            Go to Login
                        </button>
                    </div>
                )}

                {step !== 4 && (
                    <div className="login-footer" style={{ textAlign: 'center', borderTop: 'none' }}>
                        <p style={{ fontSize: '0.95rem', color: '#64748b' }}>Remember your password? <Link to="/login" className="back-to-login-link">Back to Login</Link></p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
