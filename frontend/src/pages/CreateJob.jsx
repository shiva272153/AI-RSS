import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobService } from '../services/services';
import { FiSave, FiX } from 'react-icons/fi';
import './CreateJob.css';

export default function CreateJob() {
  const { id } = useParams(); // If editing
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', company: '', description: '', requirements: '',
    requiredSkills: '', location: '', salary: '', jobType: 'full-time'
  });

  useEffect(() => {
    if (id) loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const { data } = await jobService.getById(id);
      setForm({
        ...data,
        requiredSkills: data.requiredSkills?.join(', ') || ''
      });
    } catch (err) {
      setError('Failed to load job');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...form,
      requiredSkills: form.requiredSkills
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s)
    };

    try {
      if (id) {
        await jobService.update(id, payload);
      } else {
        await jobService.create(payload);
      }
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container create-job-page">
        <h1 className="animate-fade-in">
          {id ? 'Edit' : 'Post New'} <span className="text-gradient">Job</span>
        </h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-job-form card animate-fade-in">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input type="text" className="form-input" placeholder="e.g. Full Stack Developer"
                value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                required id="job-title" />
            </div>
            <div className="form-group">
              <label className="form-label">Company *</label>
              <input type="text" className="form-input" placeholder="e.g. Google"
                value={form.company} onChange={(e) => setForm({...form, company: e.target.value})}
                required id="job-company" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Description *</label>
            <textarea className="form-textarea" rows="5"
              placeholder="Describe the role, responsibilities, and what the candidate will work on..."
              value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
              required id="job-description" />
          </div>

          <div className="form-group">
            <label className="form-label">Requirements</label>
            <textarea className="form-textarea" rows="3"
              placeholder="e.g. 3+ years of experience, Bachelor's degree in CS..."
              value={form.requirements} onChange={(e) => setForm({...form, requirements: e.target.value})}
              id="job-requirements" />
          </div>

          <div className="form-group">
            <label className="form-label">Required Skills (comma separated)</label>
            <input type="text" className="form-input"
              placeholder="e.g. python, react, machine learning, sql"
              value={form.requiredSkills} onChange={(e) => setForm({...form, requiredSkills: e.target.value})}
              id="job-skills" />
            <p className="form-hint">Separate each skill with a comma</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-input" placeholder="e.g. Bangalore, Remote"
                value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}
                id="job-location" />
            </div>
            <div className="form-group">
              <label className="form-label">Salary</label>
              <input type="text" className="form-input" placeholder="e.g. ₹8-12 LPA"
                value={form.salary} onChange={(e) => setForm({...form, salary: e.target.value})}
                id="job-salary" />
            </div>
            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select className="form-select" value={form.jobType}
                onChange={(e) => setForm({...form, jobType: e.target.value})}
                id="job-type">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="save-job-btn">
              <FiSave /> {loading ? 'Saving...' : (id ? 'Update Job' : 'Post Job')}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>
              <FiX /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
