import { Link } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { FiGithub, FiMail, FiHeart } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <HiOutlineSparkles />
            <span>AI<span className="brand-accent">Resume</span></span>
          </Link>
          <p>AI-powered resume screening using TF-IDF vectorization and cosine similarity.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/register">Get Started</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/jobs">Browse Jobs</Link>
          </div>
          <div className="footer-col">
            <h4>Technology</h4>
            <span>TF-IDF Vectorization</span>
            <span>Cosine Similarity</span>
            <span>NLP Processing</span>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>&copy; {new Date().getFullYear()} AI Resume Screening System. Final Year Project.</p>
        <p className="footer-credit">
          Built with <FiHeart size={12} className="heart-icon" /> using React, Node.js & Python
        </p>
      </div>
    </footer>
  );
}
