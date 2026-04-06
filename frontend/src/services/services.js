import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const resumeService = {
  upload: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMy: () => api.get('/resumes/my'),
  getById: (id) => api.get(`/resumes/${id}`),
  delete: (id) => api.delete(`/resumes/${id}`),
};

export const jobService = {
  create: (data) => api.post('/jobs', data),
  getAll: (params) => api.get('/jobs', { params }),
  getMy: () => api.get('/jobs/my'),
  getById: (id) => api.get(`/jobs/${id}`),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

export const matchService = {
  calculate: (jobId) => api.post(`/matches/calculate/${jobId}`),
  calculateAll: (jobId) => api.post(`/matches/calculate-all/${jobId}`),
  getByJob: (jobId) => api.get(`/matches/job/${jobId}`),
  getMy: () => api.get('/matches/my'),
  getById: (id) => api.get(`/matches/${id}`),
};
