import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { authService, resumeService } from '../services/services';
import { FiUser, FiLock, FiPhone, FiMail, FiShield, FiSave, FiCheckCircle, FiAlertTriangle, FiTrash2, FiUploadCloud, FiFileText, FiCamera } from 'react-icons/fi';
import './Profile.css';

export default function Profile() {
  const { updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('general');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    profilePic: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmEmailInput, setConfirmEmailInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Resume states
  const [resume, setResume] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authService.getProfile();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          role: data.role || '',
          phone: data.phone || '',
          profilePic: data.profilePic || ''
        });

        // Load resume if user is a candidate
        if (data.role === 'candidate') {
          try {
            const resData = await resumeService.getMy();
            setResume(resData.data);
          } catch (err) {
            // 404 = no resume uploaded yet, that's fine
          }
        }
      } catch (err) {
        setError('Failed to load profile details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG and WEBP images are allowed');
      return;
    }

    if (file.size > 200 * 1024) {
      setError('Image size must be less than 200KB');
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const { data } = await authService.uploadProfilePic(formData);
      setProfile(prev => ({ ...prev, profilePic: data.profilePic }));
      updateUser({ profilePic: data.profilePic });
      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await authService.deleteProfilePic();
      setProfile(prev => ({ ...prev, profilePic: '' }));
      updateUser({ profilePic: '' });
      setSuccess('Profile picture removed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove profile picture. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!profile.name.trim()) {
      return setError('Name is required');
    }

    setSaving(true);
    try {
      const { data } = await authService.updateProfile({
        name: profile.name,
        phone: profile.phone
      });
      
      // Update locally in context & local storage
      updateUser({
        name: data.name,
        phone: data.phone
      });

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordForm.newPassword) {
      return setError('New password is required');
    }

    if (passwordForm.newPassword.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setError('Passwords do not match');
    }

    setSaving(true);
    try {
      await authService.updateProfile({
        name: profile.name,
        phone: profile.phone,
        password: passwordForm.newPassword
      });

      setSuccess('Password updated successfully!');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmEmailInput.toLowerCase() !== profile.email.toLowerCase()) {
      return setError('Email confirmation does not match');
    }

    setDeleting(true);
    setError('');
    setSuccess('');
    try {
      await authService.deleteAccount();
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploadingResume(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await resumeService.upload(formData);
      setResume(data);
      setSuccess('Resume uploaded and processed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Resume upload failed. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  });

  const handleDeleteResume = async () => {
    if (!resume || !window.confirm('Are you sure you want to delete your resume?')) return;
    setError('');
    setSuccess('');
    try {
      await resumeService.delete(resume._id);
      setResume(null);
      setSuccess('Resume deleted successfully.');
    } catch (err) {
      setError('Failed to delete resume.');
    }
  };

  // Get Initials for Profile Avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Loading your profile settings...</p>
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <div className="profile-layout animate-fade-in">
        {/* Left Side: Avatar Card */}
        <div className="profile-card card">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar" onClick={handleAvatarClick} style={{ cursor: 'pointer' }} title="Click to upload profile picture">
              {profile.profilePic ? (
                <img src={`/${profile.profilePic}`} alt={profile.name} className="profile-avatar-img" />
              ) : (
                getInitials(profile.name)
              )}
              <div className="profile-avatar-edit-overlay">
                <FiCamera size={18} />
              </div>
            </div>
            <div className="profile-avatar-badge">{profile.role}</div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/jpeg,image/png,image/webp" 
              style={{ display: 'none' }}
              id="profile-pic-input"
            />
          </div>
          <h2 className="profile-user-name">{profile.name}</h2>
          <p className="profile-user-email">{profile.email}</p>
          <span className="badge badge-neutral">{profile.role === 'recruiter' ? 'Recruiter Account' : 'Job Seeker Account'}</span>
          {profile.profilePic && (
            <button 
              type="button" 
              className="btn btn-secondary btn-sm remove-avatar-btn"
              onClick={handleRemovePhoto}
              style={{ marginTop: '0.75rem', width: '100%' }}
              id="remove-profile-pic-btn"
            >
              Remove Photo
            </button>
          )}
          
          <div className="profile-nav-menu">
            <button 
              className={`profile-nav-item ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => { setActiveTab('general'); setError(''); setSuccess(''); }}
            >
              <FiUser /> Personal Details
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => { setActiveTab('security'); setError(''); setSuccess(''); }}
            >
              <FiShield /> Password & Security
            </button>
          </div>
        </div>

        {/* Right Side: Form Settings Panel */}
        <div className="profile-settings-panel card">
          <div className="profile-panel-header">
            <h3>{activeTab === 'general' ? 'Personal Details' : 'Password & Security'}</h3>
            <p>
              {activeTab === 'general' 
                ? 'Update your personal information and contact details.' 
                : 'Keep your account secure by choosing a strong password.'}
            </p>
          </div>

          {success && (
            <div className="alert alert-success">
              <FiCheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'general' ? (
            <>
              <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                    id="profile-name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <div className="input-with-icon disabled">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    value={profile.email}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role (Read-only)</label>
                  <div className="input-with-icon disabled">
                    <FiShield className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                      disabled
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-with-icon">
                    <FiPhone className="input-icon" />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 1234567890"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      id="profile-phone"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg save-btn" 
                disabled={saving}
                id="profile-save-btn"
              >
                <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>

            {profile.role === 'candidate' && (
              <div className="profile-resume-section">
                <h4>My Resume</h4>
                <p className="section-description">Upload your latest resume to automatically match with relevant job openings.</p>
                
                {resume ? (
                  <>
                    <div className="profile-resume-card">
                    <div className="resume-file-info">
                      <FiFileText className="file-icon" style={{ color: 'var(--primary-400)', marginRight: '0.75rem', fontSize: '1.5rem' }} />
                      <div>
                        <h5>{resume.fileName}</h5>
                        <p className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                          {resume.skills?.length > 0 && ` • ${resume.skills.length} skills detected`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-sm items-center">
                      <div {...getRootProps()} className="reupload-trigger-btn">
                        <input {...getInputProps()} />
                        <button type="button" className="btn btn-secondary btn-sm">
                          Re-upload
                        </button>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm"
                        onClick={handleDeleteResume}
                        title="Delete Resume"
                        style={{ padding: '0.5rem' }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                    
                    {/* Compact Details display inside Profile Settings */}
                    {(resume.skills?.length > 0 || resume.experience?.length > 0 || resume.education?.length > 0 || resume.certifications?.length > 0) && (
                      <div className="profile-resume-details-compact" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {resume.skills?.length > 0 && (
                          <div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Parsed Skills</span>
                            <div className="skill-tags">
                              {resume.skills.map((skill, i) => (
                                <span key={i} className="skill-badge" style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem' }}>{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {resume.experience?.length > 0 && (
                          <div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Experience Profile</span>
                            <ul style={{ paddingLeft: '1.125rem', margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', listStyleType: 'disc' }}>
                              {resume.experience.slice(0, 3).map((exp, i) => (
                                <li key={i} style={{ marginBottom: '0.25rem' }}>{exp}</li>
                              ))}
                              {resume.experience.length > 3 && <li style={{ listStyleType: 'none', color: 'var(--primary-400)', marginTop: '0.25rem', fontWeight: 500 }}>And {resume.experience.length - 3} more experiences...</li>}
                            </ul>
                          </div>
                        )}

                        {resume.education?.length > 0 && (
                          <div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Academic Background</span>
                            <ul style={{ paddingLeft: '1.125rem', margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', listStyleType: 'disc' }}>
                              {resume.education.slice(0, 2).map((edu, i) => (
                                <li key={i} style={{ marginBottom: '0.25rem' }}>{edu}</li>
                              ))}
                              {resume.education.length > 2 && <li style={{ listStyleType: 'none', color: 'var(--primary-400)', marginTop: '0.25rem', fontWeight: 500 }}>And {resume.education.length - 2} more academic credentials...</li>}
                            </ul>
                          </div>
                        )}

                        {resume.certifications?.length > 0 && (
                          <div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>Certifications & Courses</span>
                            <ul style={{ paddingLeft: '1.125rem', margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', listStyleType: 'disc' }}>
                              {resume.certifications.slice(0, 2).map((cert, i) => (
                                <li key={i} style={{ marginBottom: '0.25rem' }}>{cert}</li>
                              ))}
                              {resume.certifications.length > 2 && <li style={{ listStyleType: 'none', color: 'var(--primary-400)', marginTop: '0.25rem', fontWeight: 500 }}>And {resume.certifications.length - 2} more certifications...</li>}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`profile-dropzone ${isDragActive ? 'active' : ''} ${uploadingResume ? 'uploading' : ''}`}
                  >
                    <input {...getInputProps()} id="profile-resume-file-input" />
                    {uploadingResume ? (
                      <div className="flex items-center gap-md">
                        <div className="spinner spinner-sm"></div>
                        <p style={{ margin: 0 }}>Processing resume...</p>
                      </div>
                    ) : (
                      <>
                        <FiUploadCloud className="dropzone-icon" />
                        <p>{isDragActive ? 'Drop your resume here' : 'Drag & drop or click to upload resume'}</p>
                        <span className="text-secondary">PDF, DOCX • Max 5MB</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="profile-danger-zone">
              <div className="danger-zone-title">
                <FiTrash2 /> Danger Zone
              </div>
              <div className="danger-zone-content">
                <p>Deleting your account is permanent. It will immediately remove all of your profile settings, uploads, matching history, and roles. This cannot be undone.</p>
                <button
                  type="button"
                  className="btn btn-danger btn-sm delete-btn"
                  onClick={() => setShowDeleteModal(true)}
                  id="delete-profile-btn"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </>
        ) : (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min. 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={6}
                    id="profile-new-password"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    id="profile-confirm-password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg save-btn" 
                disabled={saving}
                id="password-save-btn"
              >
                <FiSave /> {saving ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '440px' }}>
            <div className="delete-modal-header">
              <FiAlertTriangle className="warning-icon" />
              <h3>Delete Account?</h3>
            </div>
            <div className="delete-modal-body">
              <p>This action is irreversible. You will permanently lose your profile data, uploaded resumes, matching lists, and access to the system.</p>
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>Type <strong>{profile.email}</strong> to confirm:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter email to confirm"
                  value={confirmEmailInput}
                  onChange={(e) => setConfirmEmailInput(e.target.value)}
                  id="delete-account-confirm-email"
                />
              </div>
            </div>
            <div className="flex justify-between gap-md" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmEmailInput('');
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDeleteAccount}
                disabled={deleting || confirmEmailInput.toLowerCase() !== profile.email.toLowerCase()}
                id="delete-account-confirm-btn"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
