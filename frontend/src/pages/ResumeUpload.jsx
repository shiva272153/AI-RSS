import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { resumeService } from '../services/services';
import { FiUploadCloud, FiFileText, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import './ResumeUpload.css';

export default function ResumeUpload() {
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const { data } = await resumeService.getMy();
      setResume(data);
    } catch (err) {
      // 404 = no resume yet, that's fine
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await resumeService.upload(formData);
      setResume(data);
      setSuccess('Resume uploaded and processed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
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

  const handleDelete = async () => {
    if (!resume || !window.confirm('Delete your resume?')) return;
    try {
      await resumeService.delete(resume._id);
      setResume(null);
      setSuccess('Resume deleted.');
    } catch (err) {
      setError('Failed to delete resume.');
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container resume-page">
        <h1 className="animate-fade-in">My <span className="text-gradient">Resume</span></h1>
        <p className="text-secondary animate-fade-in">Upload your resume and let AI extract your skills</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success"><FiCheckCircle /> {success}</div>}

        {/* Upload Zone */}
        <div className="upload-section animate-fade-in">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${uploading ? 'dropzone-uploading' : ''}`}
          >
            <input {...getInputProps()} id="resume-file-input" />
            {uploading ? (
              <>
                <div className="spinner"></div>
                <p>Processing your resume...</p>
                <span className="text-secondary">Extracting text and identifying skills</span>
              </>
            ) : (
              <>
                <FiUploadCloud className="dropzone-icon" />
                <p>{isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}</p>
                <span className="text-secondary">or click to browse • PDF, DOCX • Max 5MB</span>
              </>
            )}
          </div>
        </div>

        {/* Resume Details */}
        {resume && (
          <div className="resume-details animate-fade-in">
            <div className="resume-file-card card">
              <div className="resume-file-info">
                <FiFileText className="file-icon" />
                <div>
                  <h3>{resume.fileName}</h3>
                  <p className="text-secondary">
                    Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                    {resume.skills?.length > 0 && ` • ${resume.skills.length} skills detected`}
                  </p>
                </div>
              </div>
              <button onClick={handleDelete} className="btn btn-danger btn-sm" id="delete-resume-btn">
                <FiTrash2 /> Delete
              </button>
            </div>

            {/* Extracted Skills */}
            {resume.skills?.length > 0 && (
              <div className="resume-skills card">
                <h3>Extracted Skills</h3>
                <div className="skill-tags">
                  {resume.skills.map((skill, i) => (
                    <span key={i} className="skill-badge">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Text Preview */}
            {resume.extractedText && (
              <div className="resume-text card">
                <h3>Extracted Content Preview</h3>
                <pre className="text-preview">{resume.extractedText.substring(0, 1000)}...</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
