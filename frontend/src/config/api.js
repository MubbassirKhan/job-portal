// Global API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://job-portal-backend-fwdx.onrender.com/api';
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || 'https://job-portal-backend-fwdx.onrender.com';

// Export configurations
export { API_BASE_URL, SERVER_BASE_URL };
export default API_BASE_URL;
