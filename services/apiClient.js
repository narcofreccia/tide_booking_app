import axios from 'axios';
import env from '../config/env';
import { getAuthToken, getRefreshToken, storeAuthToken, storeRefreshToken, removeAuthToken, removeRefreshToken } from '../utils/storage';

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

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor with token refresh logic
ApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized - attempt token refresh
      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return ApiClient(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await getRefreshToken();
          
          if (!refreshToken) {
            // No refresh token available, logout
            await removeAuthToken();
            await removeRefreshToken();
            processQueue(new Error('No refresh token available'), null);
            return Promise.reject(error);
          }

          // Call refresh endpoint
          const response = await AuthApi.post('/auth/refresh-token', {
            token: refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          await storeAuthToken(accessToken);
          if (newRefreshToken) {
            await storeRefreshToken(newRefreshToken);
          }

          // Update authorization header
          ApiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Process queued requests
          processQueue(null, accessToken);

          // Retry original request
          return ApiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          console.log('Token refresh failed, logging out');
          await removeAuthToken();
          await removeRefreshToken();
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Return formatted error
      return Promise.reject({
        status,
        message: data.detail || data.message || 'An error occurred',
        data,
      });
    } else if (error.request) {
      return Promise.reject({
        message: 'Network error - please check your connection',
      });
    } else {
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

// Simple error interceptor for AuthApi (no token refresh)
const authErrorInterceptor = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    return Promise.reject({
      status,
      message: data.detail || data.message || 'An error occurred',
      data,
    });
  } else if (error.request) {
    return Promise.reject({
      message: 'Network error - please check your connection',
    });
  } else {
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
    });
  }
};

AuthApi.interceptors.response.use((response) => response, authErrorInterceptor);

export default ApiClient;
