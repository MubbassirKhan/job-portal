// // Global API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://job-1-5csh.onrender.com/api';
// const SERVER_BASE_URL = process.env.REACT_APP_BASE_URL || 'https://job-1-5csh.onrender.com';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SERVER_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

// Export configurations
export { API_BASE_URL, SERVER_BASE_URL };
export default API_BASE_URL;