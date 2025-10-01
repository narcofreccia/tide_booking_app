import { ApiClient } from './apiClient';

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

/**
 * Get restaurant names (minimal data for selection)
 * @param {number} businessId - Business ID
 * @param {string} search - Optional search query
 * @returns {Promise} Object with restaurants array
 */
export const getRestaurantsNames = async (businessId, search = '') => {
  const response = await ApiClient.get('/restaurant/names/', {
    params: { business_id: businessId, search },
  });
  return response.data;
};
