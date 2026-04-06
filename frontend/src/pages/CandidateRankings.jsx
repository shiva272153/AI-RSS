import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchService, jobService } from '../services/services';
import { FiArrowLeft, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './CandidateRankings.css';

export default function CandidateRankings() {
  const { jobId } = useParams();
  const [matches, setMatches] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      const [matchRes, jobRes] = await Promise.all([
        matchService.getByJob(jobId),
        jobService.getById(jobId)
      ]);
      setMatches(matchRes.data);
      setJob(jobRes.data);
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

  const getBarColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const chartData = matches.map((m, i) => ({
    name: m.candidateId?.name || `Candidate ${i + 1}`,
    score: m.matchScore
  }));

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/recruiter/dashboard" className="back-link animate-fade-in">
          <FiArrowLeft /> Back to Dashboard
        </Link>

        <div className="rankings-header animate-fade-in">
          <h1>Candidate <span className="text-gradient">Rankings</span></h1>
          {job && (
            <div className="rankings-job-info">
              <h2>{job.title}</h2>
              <p className="text-secondary">{job.company} • {job.location}</p>
              {job.requiredSkills?.length > 0 && (
                <div className="skill-tags" style={{ marginTop: '0.5rem' }}>
                  {job.requiredSkills.map((s, i) => (
                    <span key={i} className="skill-badge">{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="empty-state card animate-fade-in">
            <div className="empty-state-icon">👥</div>
            <h3>No candidates screened yet</h3>
            <p>Click "Screen Candidates" on your dashboard to calculate match scores</p>
          </div>
        ) : (
          <>
            {/* Score Distribution Chart */}
            <div className="chart-section card animate-fade-in">
              <h3>Match Score Distribution</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid rgba(148,163,184,0.2)',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={getBarColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Candidate List */}
            <div className="candidates-list animate-fade-in">
              <h3>Ranked Candidates ({matches.length})</h3>
              {matches.map((match, index) => (
                <div key={match._id} className="candidate-card card">
                  <div className="candidate-rank">#{index + 1}</div>
                  <div className="candidate-info">
                    <h4>
                      <FiUser /> {match.candidateId?.name || 'Unknown'}
                    </h4>
                    <div className="candidate-contact">
                      {match.candidateId?.email && (
                        <span><FiMail /> {match.candidateId.email}</span>
                      )}
                      {match.candidateId?.phone && (
                        <span><FiPhone /> {match.candidateId.phone}</span>
                      )}
                    </div>
                    <div className="skill-tags" style={{ marginTop: '0.5rem' }}>
                      {match.matchedSkills?.map((s, i) => (
                        <span key={`m-${i}`} className="skill-badge matched">✓ {s}</span>
                      ))}
                      {match.missingSkills?.map((s, i) => (
                        <span key={`x-${i}`} className="skill-badge missing">✗ {s}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`score-circle ${getScoreClass(match.matchScore)}`}>
                    {match.matchScore}%
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
