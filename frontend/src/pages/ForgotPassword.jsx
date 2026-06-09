import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/services';
import { FiMail, FiArrowLeft, FiCheckCircle, FiShield } from 'react-icons/fi';
import './Auth.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await authService.forgotPassword({ email });
      setSuccess(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1); // Only last digit
    if (value && !/^\d$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Backspace: clear current and go back
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { data } = await authService.verifyOTP({ email, otp: otpString });
      navigate('/reset-password', { state: { resetToken: data.resetToken } });
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSuccess('A new OTP has been sent to your email.');
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in">
        {step === 1 ? (
          <>
            <div className="auth-header">
              <FiMail className="auth-icon" />
              <h1>Forgot Password</h1>
              <p>Enter your email and we'll send you a verification code</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success"><FiCheckCircle /> {success}</div>}

            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="forgot-email"
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading} id="send-otp-btn">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <p className="auth-footer">
              <Link to="/login"><FiArrowLeft /> Back to Sign In</Link>
            </p>
          </>
        ) : (
          <>
            <div className="auth-header">
              <FiShield className="auth-icon" />
              <h1>Enter OTP</h1>
              <p>We sent a 6-digit code to <strong>{email}</strong></p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success"><FiCheckCircle /> {success}</div>}

            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="otp-input-group" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-digit"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    id={`otp-digit-${i}`}
                  />
                ))}
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading || otp.join('').length !== 6} id="verify-otp-btn">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div className="otp-footer">
              <p className="auth-footer">
                Didn't receive the code?{' '}
                <button onClick={handleResend} className="resend-btn" disabled={loading}>
                  Resend OTP
                </button>
              </p>
              <p className="auth-footer">
                <Link to="/login"><FiArrowLeft /> Back to Sign In</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
