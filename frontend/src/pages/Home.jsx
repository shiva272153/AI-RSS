import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUpload, FiBriefcase, FiTrendingUp, FiZap, FiTarget, FiBarChart2 } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  const features = [
    { icon: <FiUpload />, title: 'Resume Upload', desc: 'Upload PDF or DOCX resumes with instant text extraction using NLP' },
    { icon: <FiTarget />, title: 'Smart Matching', desc: 'TF-IDF vectorization and cosine similarity for accurate job matching' },
    { icon: <FiTrendingUp />, title: 'Ranked Results', desc: 'Candidates ranked by match score with detailed skill analysis' },
    { icon: <FiZap />, title: 'Skill Extraction', desc: 'Automatically identifies technical and soft skills from resumes' },
    { icon: <FiBriefcase />, title: 'Job Management', desc: 'Recruiters can post, manage, and track job listings effortlessly' },
    { icon: <FiBarChart2 />, title: 'Analytics', desc: 'Visual insights into match distributions and skill gaps' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="container hero-content">
          <div className="hero-badge animate-fade-in">
            <HiOutlineSparkles /> Powered by AI &amp; Machine Learning
          </div>
          <h1 className="hero-title animate-fade-in">
            AI-Based Resume<br />
            <span className="text-gradient">Screening &amp; Job Matching</span>
          </h1>
          <p className="hero-subtitle animate-fade-in">
            Automate candidate selection using NLP and machine learning. 
            Upload resumes, post jobs, and let our AI find the perfect match 
            with TF-IDF vectorization and cosine similarity scoring.
          </p>
          <div className="hero-actions animate-fade-in">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" id="hero-get-started">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login">
                  Sign In
                </Link>
              </>
            ) : (
              <Link 
                to={user.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard'} 
                className="btn btn-primary btn-lg"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
          <div className="hero-stats animate-fade-in">
            <div className="stat-item">
              <span className="stat-value">TF-IDF</span>
              <span className="stat-label">Vectorization</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">Cosine</span>
              <span className="stat-label">Similarity</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">NLP</span>
              <span className="stat-label">Processing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="section-subtitle">
            Our system leverages cutting-edge NLP techniques to match candidates to jobs intelligently.
          </p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card card-gradient" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="process-section">
        <div className="container">
          <h2 className="section-title">
            The <span className="text-gradient">Process</span>
          </h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Upload Resume</h3>
              <p>Candidates upload PDF/DOCX resumes. Text is extracted and preprocessed using NLP.</p>
            </div>
            <div className="process-connector"></div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>TF-IDF Vectorization</h3>
              <p>Resumes and job descriptions are converted into numerical vectors using TF-IDF.</p>
            </div>
            <div className="process-connector"></div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Cosine Similarity</h3>
              <p>Match scores are calculated measuring the similarity between resume and job vectors.</p>
            </div>
            <div className="process-connector"></div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Ranked Results</h3>
              <p>Candidates are ranked by score with insights into matched and missing skills.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
