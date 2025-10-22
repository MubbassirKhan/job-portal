import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// Jobs API calls
export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: (params) => api.get('/jobs/admin/my-jobs', { params }),
  getJobStats: () => api.get('/jobs/admin/stats'),
};

// Applications API calls
export const applicationsAPI = {
  applyToJob: (applicationData) => api.post('/applications', applicationData),
  getMyApplications: (params) => api.get('/applications/my-applications', { params }),
  getApplication: (id) => api.get(`/applications/${id}`),
  updateApplicationStatus: (id, statusData) => api.put(`/applications/${id}/status`, statusData),
  getAllApplications: (params) => api.get('/applications/admin/all', { params }),
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
};

// Upload API calls
export const uploadAPI = {
  uploadResume: (formData) => api.post('/upload/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  downloadResume: (filename) => api.get(`/upload/resume/${filename}`, {
    responseType: 'blob',
  }),
  deleteResume: () => api.delete('/upload/resume'),
};

export default api;