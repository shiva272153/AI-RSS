import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resumeService, matchService } from '../services/services';
import { FiFileText, FiUpload, FiBriefcase, FiTrendingUp, FiTarget } from 'react-icons/fi';
import './Dashboard.css';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resumeRes, matchesRes] = await Promise.allSettled([
        resumeService.getMy(),
        matchService.getMy()
      ]);
      if (resumeRes.status === 'fulfilled') setResume(resumeRes.value.data);
      if (matchesRes.status === 'fulfilled') setMatches(matchesRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div><p>Loading dashboard...</p></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="dashboard-header animate-fade-in">
          <div>
            <h1>Welcome, <span className="text-gradient">{user.name}</span></h1>
            <p className="text-secondary">Manage your resume and explore job matches</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid animate-fade-in">
          <div className="stat-card card-gradient">
            <div className="stat-card-icon"><FiFileText /></div>
            <div>
              <p className="stat-card-label">Resume</p>
              <p className="stat-card-value">{resume ? 'Uploaded' : 'Not uploaded'}</p>
            </div>
          </div>
          <div className="stat-card card-gradient">
            <div className="stat-card-icon"><FiTarget /></div>
            <div>
              <p className="stat-card-label">Total Matches</p>
              <p className="stat-card-value">{matches.length}</p>
            </div>
          </div>
          <div className="stat-card card-gradient">
            <div className="stat-card-icon"><FiTrendingUp /></div>
            <div>
              <p className="stat-card-label">Best Match</p>
              <p className="stat-card-value">
                {matches.length > 0 ? `${Math.max(...matches.map(m => m.matchScore))}%` : 'N/A'}
              </p>
            </div>
          </div>
          <div className="stat-card card-gradient">
            <div className="stat-card-icon"><FiBriefcase /></div>
            <div>
              <p className="stat-card-label">Skills Found</p>
              <p className="stat-card-value">{resume?.skills?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section animate-fade-in">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {!resume ? (
              <Link to="/candidate/resume" className="action-card card">
                <FiUpload className="action-icon" />
                <h3>Upload Resume</h3>
                <p>Upload your resume to start matching with jobs</p>
              </Link>
            ) : (
              <Link to="/candidate/resume" className="action-card card">
                <FiFileText className="action-icon" />
                <h3>View Resume</h3>
                <p>{resume.fileName} • {resume.skills?.length || 0} skills detected</p>
              </Link>
            )}
            <Link to="/jobs" className="action-card card">
              <FiBriefcase className="action-icon" />
              <h3>Browse Jobs</h3>
              <p>Find jobs and calculate your match score</p>
            </Link>
          </div>
        </div>

        {/* Recent Matches */}
        {matches.length > 0 && (
          <div className="dashboard-section animate-fade-in">
            <h2>Recent Matches</h2>
            <div className="matches-list">
              {matches.slice(0, 5).map((match) => (
                <div key={match._id} className="match-card card">
                  <div className="match-info">
                    <h3>{match.jobId?.title || 'Job'}</h3>
                    <p>{match.jobId?.company} • {match.jobId?.location}</p>
                    <div className="skill-tags">
                      {match.matchedSkills?.slice(0, 5).map((s, i) => (
                        <span key={i} className="skill-badge matched">{s}</span>
                      ))}
                      {match.missingSkills?.slice(0, 3).map((s, i) => (
                        <span key={i} className="skill-badge missing">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`score-circle ${getScoreClass(match.matchScore)}`}>
                    {match.matchScore}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Skills */}
        {resume?.skills?.length > 0 && (
          <div className="dashboard-section animate-fade-in">
            <h2>Your Skills</h2>
            <div className="skill-tags">
              {resume.skills.map((skill, i) => (
                <span key={i} className="skill-badge">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
