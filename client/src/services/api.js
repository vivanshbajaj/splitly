import axios from 'axios';

// Create an axios instance with a base URL
// All API calls will automatically use this base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor — automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('splitly_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
