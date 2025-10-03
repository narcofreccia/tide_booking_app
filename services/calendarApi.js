import apiClient from './apiClient';

/**
 * Get monthly bookings data for a restaurant
 * @param {number} restaurant_id - Restaurant ID
 * @param {number} selected_year - Year (e.g., 2025)
 * @param {number} selected_month - Month (1-12)
 * @returns {Promise} Monthly bookings response
 */
export const getMonthlyBookings = async (restaurant_id, selected_year, selected_month) => {
  if (!restaurant_id) throw new Error('restaurant_id is required');
  if (!selected_year) throw new Error('selected_year is required');
  if (!selected_month) throw new Error('selected_month is required');
  if (selected_month < 1 || selected_month > 12) {
    throw new Error('selected_month must be between 1 and 12');
  }

  const response = await apiClient.get(`/booking/monthly-bookings/${restaurant_id}`, {
    params: {
      selected_year,
      selected_month,
    },
  });

  return response.data;
};
