import { ApiClient, AuthApi } from './apiClient';

/**
 * Login user
 * @param {Object} params - Login parameters
 * @param {FormData} params.form_data - Optional FormData object
 * @param {string} params.public_key - Optional public key for restaurant
 * @param {string} params.email - User email
 * @param {string} params.password - User password
 * @returns {Promise} User data with token
 */
export const authLogin = async ({ form_data, public_key, email, password }) => {
  // Build x-www-form-urlencoded body expected by FastAPI OAuth2PasswordRequestForm
  const body = new URLSearchParams();

  // Prefer explicit email/password when provided, otherwise read from form_data
  const usernameValue = email ?? (form_data instanceof FormData ? form_data.get('username') || form_data.get('email') : undefined);
  const passwordValue = password ?? (form_data instanceof FormData ? form_data.get('password') : undefined);

  if (usernameValue) body.append('username', String(usernameValue).trim());
  if (passwordValue) body.append('password', String(passwordValue));

  const url = `/auth/login${public_key ? `?public_key=${encodeURIComponent(public_key)}` : ''}`;

  // IMPORTANT: Do NOT send Authorization header on login
  const response = await AuthApi.post(url, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      // Explicitly remove Authorization for this request
      'Authorization': undefined,
    },
  });

  return response.data;
};

/**
 * Refresh access token using refresh token (mobile flow)
 * @param {string} refreshToken - The refresh token
 * @returns {Promise} New access token and rotated refresh token
 */
export const refreshAccessToken = async (refreshToken) => {
  const response = await AuthApi.post('/auth/refresh-token', {
    token: refreshToken,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Explicitly remove Authorization for this request
      'Authorization': undefined,
    },
  });

  return response.data;
};

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getMe = async () => {
  const response = await ApiClient.get('/users/me');
  return response.data;
};
