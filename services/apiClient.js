import axios from 'axios';
import env from '../config/env';
import { getAuthToken } from '../utils/storage';

// Create axios instance for authenticated requests
export const ApiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Create axios instance for auth requests (no token)
export const AuthApi = axios.create({
  baseURL: env.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token for authenticated requests
ApiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling (both clients)
const errorInterceptor = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (status === 401) {
      // Unauthorized - token expired or invalid
      console.log('Unauthorized - clearing auth data');
      // You can dispatch a logout action here if using state management
    }
    
    // Return formatted error
    return Promise.reject({
      status,
      message: data.detail || data.message || 'An error occurred',
      data,
    });
  } else if (error.request) {
    // Request made but no response
    return Promise.reject({
      message: 'Network error - please check your connection',
    });
  } else {
    // Something else happened
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
    });
  }
};

ApiClient.interceptors.response.use((response) => response, errorInterceptor);
AuthApi.interceptors.response.use((response) => response, errorInterceptor);

export default ApiClient;
