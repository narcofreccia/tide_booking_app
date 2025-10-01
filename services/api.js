/**
 * Central API exports
 * All API functions are organized by domain for better separation of concerns
 */

// Export API clients
export { ApiClient, AuthApi } from './apiClient';

// Export Auth API functions
export { authLogin, getMe } from './authApi';

// Export Restaurant API functions
export { getRestaurants, getRestaurant, getRestaurantsNames } from './restaurantApi';

// Export Booking API functions
export { 
  listBookings,
  getBookings, 
  createBooking, 
  cancelBooking, 
  getTables, 
  getAvailability,
  getAvailableTimes
} from './bookingApi';

// Default export
export { default } from './apiClient';
