import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService, matchService } from '../services/services';
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiTarget } from 'react-icons/fi';
import './JobListings.css';

export default function JobListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(null);
  const [matchResults, setMatchResults] = useState({});

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data } = await jobService.getAll();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateMatch = async (jobId) => {
    setCalculating(jobId);
    try {
      const { data } = await matchService.calculate(jobId);
      setMatchResults(prev => ({ ...prev, [jobId]: data }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to calculate match. Make sure your resume is uploaded.');
    } finally {
      setCalculating(null);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase()) ||
    job.description.toLowerCase().includes(search.toLowerCase())
  );

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="jobs-header animate-fade-in">
          <h1>Job <span className="text-gradient">Listings</span></h1>
          <p className="text-secondary">Browse available positions and check your match score</p>
        </div>

        <div className="search-bar animate-fade-in">
          <input
            type="text"
            className="form-input"
            placeholder="Search by title, company, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="job-search-input"
          />
        </div>

        {filteredJobs.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">🔍</div>
            <h3>No jobs found</h3>
            <p>No jobs match your search criteria.</p>
          </div>
        ) : (
          <div className="jobs-grid animate-fade-in">
            {filteredJobs.map((job) => (
              <div key={job._id} className="job-listing-card card">
                <div className="job-listing-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                  </div>
                  <span className={`badge badge-primary`}>{job.jobType}</span>
                </div>

                <p className="job-desc">{job.description.substring(0, 150)}...</p>

                <div className="job-meta">
                  <span><FiMapPin /> {job.location}</span>
                  <span><FiDollarSign /> {job.salary}</span>
                  <span><FiClock /> {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>

                {job.requiredSkills?.length > 0 && (
                  <div className="skill-tags" style={{ margin: '0.75rem 0' }}>
                    {job.requiredSkills.slice(0, 6).map((s, i) => (
                      <span key={i} className="skill-badge">{s}</span>
                    ))}
                    {job.requiredSkills.length > 6 && (
                      <span className="skill-badge">+{job.requiredSkills.length - 6}</span>
                    )}
                  </div>
                )}

                {/* Match Result */}
                {matchResults[job._id] && (
                  <div className="match-result-inline">
                    <div className={`score-circle-sm ${getScoreClass(matchResults[job._id].matchScore)}`}>
                      {matchResults[job._id].matchScore}%
                    </div>
                    <div className="match-result-details">
                      <div className="skill-tags">
                        {matchResults[job._id].matchedSkills?.slice(0, 4).map((s, i) => (
                          <span key={i} className="skill-badge matched">{s}</span>
                        ))}
                        {matchResults[job._id].missingSkills?.slice(0, 3).map((s, i) => (
                          <span key={i} className="skill-badge missing">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {user?.role === 'candidate' && (
                  <div className="job-listing-actions">
                    <button
                      onClick={() => handleCalculateMatch(job._id)}
                      className="btn btn-primary btn-sm"
                      disabled={calculating === job._id}
                    >
                      <FiTarget />
                      {calculating === job._id ? 'Calculating...' : matchResults[job._id] ? 'Recalculate' : 'Check Match'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
