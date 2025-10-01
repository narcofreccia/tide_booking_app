import { ApiClient } from './apiClient';

/**
 * List bookings with filtering and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.restaurant_id - Restaurant ID
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {string} params.search - Search query
 * @param {string} params.orderByColumn - Column to order by
 * @param {string} params.orderByType - Order type (asc/desc)
 * @param {number} params.limit - Results per page
 * @param {number} params.page - Page number
 * @returns {Promise} Object with bookingsCount, pageCount, and bookings array
 */
export const listBookings = async (params = {}) => {
  // Pass through only defined params to avoid sending undefineds
  const cleanedParams = {};
  const keys = ['restaurant_id', 'startDate', 'endDate', 'search', 'orderByColumn', 'orderByType', 'limit', 'page'];
  for (const k of keys) {
    if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
      cleanedParams[k] = params[k];
    }
  }

  const response = await ApiClient.get('/booking/', { params: cleanedParams });
  return response.data;
};

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
