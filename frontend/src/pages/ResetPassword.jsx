import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/services';
import { FiLock, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import './Auth.css';

export default function ResetPassword() {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = location.state?.resetToken;

  // If no reset token, redirect to forgot password
  if (!resetToken) {
    return (
      <div className="auth-page">
        <div className="auth-container animate-fade-in">
          <div className="auth-header">
            <FiLock className="auth-icon" />
            <h1>Invalid Session</h1>
            <p>Your reset session has expired or is invalid.</p>
          </div>
          <Link to="/forgot-password" className="btn btn-primary btn-lg auth-btn" id="go-forgot-btn">
            Request New OTP
          </Link>
          <p className="auth-footer">
            <Link to="/login"><FiArrowLeft /> Back to Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (form.newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const { data } = await authService.resetPassword({
        resetToken,
        newPassword: form.newPassword
      });
      setSuccess(data.message);
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in">
        <div className="auth-header">
          <FiLock className="auth-icon" />
          <h1>Set New Password</h1>
          <p>Create a strong password for your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && (
          <div className="alert alert-success">
            <FiCheckCircle /> {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required
                minLength={6}
                autoFocus
                id="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                id="confirm-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading} id="reset-password-btn">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login"><FiArrowLeft /> Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
