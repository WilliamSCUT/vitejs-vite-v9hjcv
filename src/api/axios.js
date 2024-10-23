import axios from 'axios';

const api = axios.create({
  baseURL: 'https://williamscut.pythonanywhere.com/api/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Changed from true to false
});

// Add response interceptor to handle CORS errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      console.error('CORS error:', error);
    }
    return Promise.reject(error);
  }
);

export default api;