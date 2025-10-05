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
    `/booking/restaurant/${restaurantId}`,
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
 * Delete a booking by ID
 * @param {Object} params - Parameters
 * @param {number} params.id - Booking ID
 * @returns {Promise} Response data
 */
export const deleteBooking = async ({ id }) => {
  const response = await ApiClient.delete(`/booking/${id}`);
  return response.data;
};

/**
 * Change booking status
 * @param {Object} payload - Payload
 * @param {number} payload.reservation_id - Booking ID
 * @param {string} payload.status - New status
 * @returns {Promise} Response data
 */
export const changeBookingStatus = async (payload) => {
  if (!payload.reservation_id) throw new Error('reservation_id is required');
  if (!payload.status) throw new Error('status is required');
  const response = await ApiClient.post('/booking/change_reservation_status', payload);
  return response.data;
};

/**
 * Create a walk-in booking
 * @param {number} restaurant_id - Restaurant ID
 * @param {Object} payload - Booking payload
 * @returns {Promise} Created booking data
 */
export const createWalkInBooking = async (restaurant_id, payload) => {
  const response = await ApiClient.post(`/booking/restaurant/${restaurant_id}/walk-in`, payload)
  return response.data
};

/**
 * Get available tables for a restaurant
 * @param {number} restaurantId - Restaurant ID
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

/**
 * Get available times for a restaurant on a specific date
 * @param {number} restaurantId - Restaurant ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} serviceType - Service type (e.g., 'booking')
 * @returns {Promise} Object with available_times array
 */
export const getAvailableTimes = async (restaurantId, date, serviceType = 'booking') => {
  const response = await ApiClient.get(`/calendar-rules/available-times-by-id/${restaurantId}`, {
    params: { selected_date: date, service_type: serviceType }
  });
  return response.data;
};

/**
 * Get all bookings for a restaurant on a given date
 * @param {number} restaurant_id - Restaurant ID
 * @param {Object} params - Query parameters
 * @param {string} params.reservation_date - Date in YYYY-MM-DD format (required)
 * @param {string} params.start_time - Start time in HH:mm or HH:mm:ss format (optional)
 * @param {string} params.end_time - End time in HH:mm or HH:mm:ss format (optional)
 * @returns {Promise} Array of bookings
 */
export const getBookingsByDate = async (restaurant_id, { reservation_date, start_time = undefined, end_time = undefined } = {}) => {
  if (!restaurant_id) throw new Error('restaurant_id is required')
  if (!reservation_date) throw new Error('reservation_date (YYYY-MM-DD) is required')
  
  const params = { reservation_date }
  if (start_time) params.start_time = start_time
  if (end_time) params.end_time = end_time
  
  const response = await ApiClient.get(`/booking/restaurant/${restaurant_id}/bookings/by-date`, { params })
  return response.data
};

/**
 * Switch table position between bookings
 * Move source booking to target table. If target table has overlapping booking, swap their table_ids.
 * Otherwise, assign source booking to target table.
 * @param {Object} payload - Payload
 * @param {number} payload.source_booking_id - Source booking ID
 * @param {number} payload.target_table_id - Target table ID
 * @returns {Promise} Array of updated bookings [updated_source] or [updated_source, updated_target_if_swapped]
 */
export const switchTablePosition = async (payload) => {
  if (!payload.source_booking_id) throw new Error('source_booking_id is required')
  if (!payload.target_table_id) throw new Error('target_table_id is required')
  const response = await ApiClient.post('/booking/switch_table_position', payload)
  return response.data
};


export const updateBooking = async (booking_id, updates) => {
  const response = await ApiClient.put(`/booking/${booking_id}`, updates)
  return response.data
}
