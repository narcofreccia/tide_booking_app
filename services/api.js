/**
 * Central API exports
 * All API functions are organized by domain for better separation of concerns
 */

// Export API clients
export { ApiClient, AuthApi } from './apiClient';

// Export Auth API functions
export { authLogin, getMe, refreshAccessToken } from './authApi';

// Export Restaurant API functions
export { getRestaurants, getRestaurant, getRestaurantsNames } from './restaurantApi';

// Export Booking API functions
export { 
  listBookings,
  getBookings, 
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  changeBookingStatus,
  getTables, 
  getAvailability,
  getAvailableTimes,
  getBookingsByDate
} from './bookingApi';

// Export Customer API functions
export { getBookingCustomers } from './customerApi';

// Export Calendar API functions
export { getMonthlyBookings } from './calendarApi';

// Export Floor API functions
export { 
  getFloorById,
  getElementsByFloor,
  getAllTablesByRestaurantId,
  getSectionsByRestaurantRule
} from './floorApi';

// Export User API functions
export {
  updatePassword
} from './userApi';

// Default export
export { default } from './apiClient';
