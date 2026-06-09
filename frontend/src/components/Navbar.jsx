import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiBriefcase, FiFileText, FiHome } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

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
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'nav-link-active' : ''}`}>Login</Link>
              <Link to="/" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          ) : (
            <>
              {user.role === 'candidate' && (
                <>
                  <Link to="/candidate/dashboard" className={`nav-link ${isActive('/candidate/dashboard') ? 'nav-link-active' : ''}`}>
                    <FiHome size={16} /> <span>Dashboard</span>
                  </Link>
                  <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'nav-link-active' : ''}`}>
                    <FiBriefcase size={16} /> <span>Jobs</span>
                  </Link>
                  <Link to="/candidate/resume" className={`nav-link ${isActive('/candidate/resume') ? 'nav-link-active' : ''}`}>
                    <FiFileText size={16} /> <span>Resume</span>
                  </Link>
                </>
              )}
              {user.role === 'recruiter' && (
                <>
                  <Link to="/recruiter/dashboard" className={`nav-link ${isActive('/recruiter/dashboard') ? 'nav-link-active' : ''}`}>
                    <FiHome size={16} /> <span>Dashboard</span>
                  </Link>
                </>
              )}
              <div className="nav-divider"></div>
              <Link to="/profile" className={`nav-user ${isActive('/profile') ? 'nav-user-active' : ''}`} title="Edit Profile">
                {user.profilePic ? (
                  <img src={`/${user.profilePic}`} alt={user.name} className="navbar-avatar" />
                ) : (
                  <FiUser size={14} />
                )}
                <span className="nav-user-name">{user.name}</span>
                <span className="badge badge-primary">{user.role}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" id="logout-btn">
                <FiLogOut size={14} /> <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
