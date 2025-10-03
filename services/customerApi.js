import apiClient from './apiClient';

/**
 * Get booking customers with statistics
 * @param {Object} params - Query parameters
 * @param {number} params.restaurant_id - Restaurant ID
 * @param {string} params.search - Search query
 * @param {string} params.orderByColumn - Column to order by (total_bookings, no_show_count, etc.)
 * @param {string} params.orderByType - Order type (asc/desc)
 * @param {number} params.limit - Items per page
 * @param {number} params.page - Page number (0-indexed)
 * @returns {Promise} Paginated customers response
 */
export const getBookingCustomers = async (params = {}) => {
  // Clean params - only send defined values
  const cleanedParams = {};
  const keys = ['restaurant_id', 'search', 'orderByColumn', 'orderByType', 'limit', 'page'];
  
  for (const key of keys) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanedParams[key] = params[key];
    }
  }

  const response = await apiClient.get('/booking/customers-stats', { 
    params: cleanedParams 
  });

  return response.data;
};
