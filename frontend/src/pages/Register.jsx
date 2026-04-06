import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/services';
import { HiOutlineSparkles } from 'react-icons/hi2';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'candidate', phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const { data } = await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone
      });
      login(data);
      navigate(data.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container register-container animate-fade-in">
        <div className="auth-header">
          <HiOutlineSparkles className="auth-icon" />
          <h1>Create Account</h1>
          <p>Join the AI-powered recruitment platform</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              id="register-name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              id="register-email"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                id="register-password"
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
                id="register-confirm-password"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">I am a</label>
              <select
                className="form-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                id="register-role"
              >
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone (optional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 1234567890"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                id="register-phone"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading} id="register-submit">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
