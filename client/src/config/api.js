// Global API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SERVER_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

console.log('API Configuration:', {
  API_BASE_URL,
  SERVER_BASE_URL,
  env: process.env.NODE_ENV
});

// Export configurations
export { API_BASE_URL, SERVER_BASE_URL };
export default API_BASE_URL;