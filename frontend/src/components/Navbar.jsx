import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiBriefcase, FiFileText, FiHome } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <HiOutlineSparkles className="brand-icon" />
          <span className="brand-text">AI<span className="brand-accent">Resume</span></span>
        </Link>

        <div className="navbar-links">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          ) : (
            <>
              {user.role === 'candidate' && (
                <>
                  <Link to="/candidate/dashboard" className="nav-link">
                    <FiHome size={16} /> Dashboard
                  </Link>
                  <Link to="/jobs" className="nav-link">
                    <FiBriefcase size={16} /> Jobs
                  </Link>
                  <Link to="/candidate/resume" className="nav-link">
                    <FiFileText size={16} /> Resume
                  </Link>
                </>
              )}
              {user.role === 'recruiter' && (
                <>
                  <Link to="/recruiter/dashboard" className="nav-link">
                    <FiHome size={16} /> Dashboard
                  </Link>
                  <Link to="/recruiter/jobs" className="nav-link">
                    <FiBriefcase size={16} /> My Jobs
                  </Link>
                </>
              )}
              <div className="nav-user">
                <FiUser size={16} />
                <span>{user.name}</span>
                <span className="badge badge-primary">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" id="logout-btn">
                <FiLogOut size={14} /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
