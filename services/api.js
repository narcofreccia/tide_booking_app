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

// ==================== AUTH ENDPOINTS ====================

/**
 * Login user
 * @param {Object} params - Login parameters
 * @param {FormData} params.form_data - Optional FormData object
 * @param {string} params.public_key - Optional public key for restaurant
 * @param {string} params.email - User email
 * @param {string} params.password - User password
 * @returns {Promise} User data with token
 */
export const authLogin = async ({ form_data, public_key, email, password }) => {
  // Build x-www-form-urlencoded body expected by FastAPI OAuth2PasswordRequestForm
  const body = new URLSearchParams();

  // Prefer explicit email/password when provided, otherwise read from form_data
  const usernameValue = email ?? (form_data instanceof FormData ? form_data.get('username') || form_data.get('email') : undefined);
  const passwordValue = password ?? (form_data instanceof FormData ? form_data.get('password') : undefined);

  if (usernameValue) body.append('username', String(usernameValue).trim());
  if (passwordValue) body.append('password', String(passwordValue));

  const url = `/auth/login${public_key ? `?public_key=${encodeURIComponent(public_key)}` : ''}`;

  // IMPORTANT: Do NOT send Authorization header on login
  const response = await AuthApi.post(url, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      // Explicitly remove Authorization for this request
      'Authorization': undefined,
    },
  });

  return response.data;
};

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getMe = async () => {
  const response = await ApiClient.get('/users/me');
  return response.data;
};

// ==================== RESTAURANT ENDPOINTS ====================

/**
 * Get list of restaurants
 * @returns {Promise} Array of restaurants
 */
export const getRestaurants = async () => {
  const response = await ApiClient.get('/restaurants');
  return response.data;
};

/**
 * Get restaurant by ID
 * @param {number} restaurantId - Restaurant ID
 * @returns {Promise} Restaurant data
 */
export const getRestaurant = async (restaurantId) => {
  const response = await ApiClient.get(`/restaurants/${restaurantId}`);
  return response.data;
};

// ==================== BOOKING ENDPOINTS ====================

/**
 * Get bookings for a restaurant
 * @param {number} restaurantId - Restaurant ID
 * @returns {Promise} Array of bookings
 */
export const getBookings = async (restaurantId) => {
  const response = await ApiClient.get(`/restaurants/${restaurantId}/bookings`);
  return response.data;
};

/**
 * Create a new booking
 * @param {number} restaurantId - Restaurant ID
 * @param {object} bookingData - Booking details
 * @returns {Promise} Created booking data
 */
export const createBooking = async (restaurantId, bookingData) => {
  const response = await ApiClient.post(
    `/restaurants/${restaurantId}/bookings`,
    bookingData
  );
  return response.data;
};

/**
 * Cancel a booking
 * @param {number} restaurantId - Restaurant ID
 * @param {number} bookingId - Booking ID
 * @returns {Promise} Response data
 */
export const cancelBooking = async (restaurantId, bookingId) => {
  const response = await ApiClient.delete(
    `/restaurants/${restaurantId}/bookings/${bookingId}`
  );
  return response.data;
};

// ==================== TABLE & AVAILABILITY ENDPOINTS ====================

/**
 * Get available tables for a restaurant
 * @param {number} restaurantId - Restaurant ID
 * @returns {Promise} Array of tables
 */
export const getTables = async (restaurantId) => {
  const response = await ApiClient.get(`/restaurants/${restaurantId}/tables`);
  return response.data;
};

/**
 * Get availability slots for a restaurant
 * @param {number} restaurantId - Restaurant ID
 * @param {object} params - Query parameters (date, time, etc.)
 * @returns {Promise} Availability data
 */
export const getAvailability = async (restaurantId, params = {}) => {
  const response = await ApiClient.get(
    `/restaurants/${restaurantId}/availability`,
    { params }
  );
  return response.data;
};

export default ApiClient;
