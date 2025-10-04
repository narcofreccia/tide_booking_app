/**
 * Locale Utilities
 * Centralized locale mapping and formatting functions
 */

/**
 * Map language codes to locale strings
 */
export const LOCALE_MAP = {
  en: 'en-US',
  it: 'it-IT',
  es: 'es-ES',
};

/**
 * Get locale string from language code
 * @param {string} language - Language code (en, it, es)
 * @param {string} fallback - Fallback locale (default: 'en-US')
 * @returns {string} Locale string
 */
export const getLocale = (language, fallback = 'en-US') => {
  return LOCALE_MAP[language] || fallback;
};

/**
 * Format date with locale support
 * @param {Date|string} date - Date to format
 * @param {string} language - Language code
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDateWithLocale = (date, language, options = {}) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getLocale(language);
  return dateObj.toLocaleDateString(locale, options);
};
