/**
 * Centralized Icon Mapping Configuration
 * Single source of truth for all icons used throughout the app
 * Uses MaterialCommunityIcons from @expo/vector-icons
 * Reference: https://icons.expo.fyi/Index/MaterialCommunityIcons
 */

export const ICONS = {
  // Booking related
  time: 'clock-outline',
  guests: 'account-group-outline',
  table: 'table-chair',
  email: 'email-outline',
  phone: 'phone-outline',
  notes: 'message-text-outline',
  
  // Actions
  edit: 'pencil-outline',
  delete: 'delete-outline',
  move: 'swap-horizontal',
  status: 'check-circle-outline',
  add: 'plus-circle-outline',
  close: 'close-circle-outline',
  
  // Navigation
  bookings: 'format-list-bulleted',
  calendar: 'calendar-outline',
  customers: 'account-group-outline',
  settings: 'cog-outline',
  home: 'home-outline',
  back: 'arrow-left',
  map: 'map-outline',
  
  // Status indicators
  confirmed: 'check-circle',
  pending: 'clock-outline',
  cancelled: 'close-circle',
  arrived: 'login',
  seated: 'seat',
  completed: 'check-all',
  
  // Accessibility
  wheelchair: 'wheelchair-accessibility',
  highchair: 'baby-carriage',
  
  // General
  search: 'magnify',
  filter: 'filter-outline',
  sort: 'sort',
  info: 'information-outline',
  warning: 'alert-outline',
  error: 'alert-circle-outline',
  success: 'check-circle-outline',
  help: 'help-circle-outline',
  
  // Settings
  shop: 'store-outline',
  notification: 'bell-outline',
  lock: 'lock-outline',
  team: 'account-group-outline',
  billing: 'credit-card-outline',
  document: 'file-document-outline',
  version: 'cellphone',
  
  // User
  user: 'account-outline',
  logout: 'logout',
  login: 'login',
  
  // Date/Time
  date: 'calendar-outline',
  clock: 'clock-outline',
  
  // Restaurant
  restaurant: 'silverware-fork-knife',
  menu: 'menu',
};

/**
 * Get icon name by key
 * @param {string} key - Icon key from ICONS object
 * @returns {string} Icon name for MaterialCommunityIcons
 */
export const getIcon = (key) => {
  return ICONS[key] || 'help-circle-outline';
};

/**
 * Icon sizes (in pixels)
 */
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
};

/**
 * Get icon size by key
 * @param {string} size - Size key from ICON_SIZES
 * @returns {number} Size in pixels
 */
export const getIconSize = (size = 'md') => {
  return ICON_SIZES[size] || ICON_SIZES.md;
};
