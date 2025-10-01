import { ApiClient } from './apiClient';

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
