import axios from 'axios';

const IS_PRODUCTION = process.env.REACT_APP_ENVIRONMENT === 'production';
const BACKEND_URL = IS_PRODUCTION ? 'https://api.clario.co.in' : 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const apiClient = axios.create({
  baseURL: API,
  timeout: 10000, // 10 seconds default timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;