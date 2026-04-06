import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService, matchService } from '../services/services';
import { FiBriefcase, FiPlus, FiUsers, FiTrendingUp, FiTrash2, FiEdit, FiBarChart2 } from 'react-icons/fi';
import './Dashboard.css';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const { data } = await jobService.getMy();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await jobService.delete(id);
      setJobs(jobs.filter(j => j._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleCalculateAll = async (jobId) => {
    setCalculating(jobId);
    try {
      const { data } = await matchService.calculateAll(jobId);
      alert(`Matching complete! ${data.totalCandidates} candidates scored.`);
      navigate(`/recruiter/matches/${jobId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to calculate matches');
    } finally {
      setCalculating(null);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div><p>Loading dashboard...</p></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="dashboard-header animate-fade-in">
          <div>
            <h1>Welcome, <span className="text-gradient">{user.name}</span></h1>
            <p className="text-secondary">Manage job postings and find the best candidates</p>
          </div>
          <Link to="/recruiter/jobs/create" className="btn btn-primary" id="create-job-btn">
            <FiPlus /> Post New Job
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid animate-fade-in">
          <div className="stat-card card-gradient">
            <div className="stat-card-icon"><FiBriefcase /></div>
            <div>
              <p className="stat-card-label">Total Jobs</p>
              <p className="stat-card-value">{jobs.length}</p>
            </div>
          </div>
          <div className="stat-card card-gradient">
            <div className="stat-card-icon"><FiUsers /></div>
            <div>
              <p className="stat-card-label">Active Jobs</p>
              <p className="stat-card-value">{jobs.filter(j => j.status === 'active').length}</p>
            </div>
          </div>
          <div className="stat-card card-gradient">
            <div className="stat-card-icon"><FiTrendingUp /></div>
            <div>
              <p className="stat-card-label">Total Skills</p>
              <p className="stat-card-value">
                {jobs.reduce((acc, j) => acc + (j.requiredSkills?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="dashboard-section animate-fade-in">
          <h2>Your Job Postings</h2>
          {jobs.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">📋</div>
              <h3>No jobs posted yet</h3>
              <p>Create your first job posting to start screening candidates</p>
              <Link to="/recruiter/jobs/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <FiPlus /> Post a Job
              </Link>
            </div>
          ) : (
            <div className="job-list">
              {jobs.map((job) => (
                <div key={job._id} className="job-card card">
                  <div className="job-card-header">
                    <div>
                      <h3>{job.title}</h3>
                      <p className="text-secondary">{job.company} • {job.location}</p>
                    </div>
                    <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="skill-tags" style={{ margin: '0.75rem 0' }}>
                    {job.requiredSkills?.map((s, i) => (
                      <span key={i} className="skill-badge">{s}</span>
                    ))}
                  </div>
                  <div className="job-card-actions">
                    <button 
                      onClick={() => handleCalculateAll(job._id)} 
                      className="btn btn-primary btn-sm"
                      disabled={calculating === job._id}
                    >
                      <FiBarChart2 /> {calculating === job._id ? 'Calculating...' : 'Screen Candidates'}
                    </button>
                    <Link to={`/recruiter/matches/${job._id}`} className="btn btn-secondary btn-sm">
                      <FiUsers /> View Rankings
                    </Link>
                    <Link to={`/recruiter/jobs/edit/${job._id}`} className="btn btn-secondary btn-sm btn-icon">
                      <FiEdit />
                    </Link>
                    <button onClick={() => handleDelete(job._id)} className="btn btn-danger btn-sm btn-icon">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
