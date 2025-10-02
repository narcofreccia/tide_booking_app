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
  console.log('=== AUTH LOGIN DEBUG ===');
  console.log('ENVIRONMENT CHECK:');
  console.log('- AuthApi.defaults.baseURL:', AuthApi.defaults.baseURL);
  console.log('- Expected prod URL: https://lofficinasirolo-85a0da8063ad.herokuapp.com/');
  console.log('- Expected dev URL: http://localhost:8000');
  
  // Build x-www-form-urlencoded body expected by FastAPI OAuth2PasswordRequestForm
  const body = new URLSearchParams();

  // Prefer explicit email/password when provided, otherwise read from form_data
  const usernameValue = email ?? (form_data instanceof FormData ? form_data.get('username') || form_data.get('email') : undefined);
  const passwordValue = password ?? (form_data instanceof FormData ? form_data.get('password') : undefined);

  console.log('Login credentials:');
  console.log('- Username:', usernameValue);
  console.log('- Password length:', passwordValue ? passwordValue.length : 0);
  console.log('- Public key:', public_key);

  if (usernameValue) body.append('username', String(usernameValue).trim());
  if (passwordValue) body.append('password', String(passwordValue));

  const url = `/auth/login${public_key ? `?public_key=${encodeURIComponent(public_key)}` : ''}`;
  
  console.log('Request details:');
  console.log('- Relative URL:', url);
  console.log('- Full URL:', `${AuthApi.defaults.baseURL}${url}`);
  console.log('- Body:', body.toString());
  console.log('Making POST request now...');

  try {
    // IMPORTANT: Do NOT send Authorization header on login
    const response = await AuthApi.post(url, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        // Explicitly remove Authorization for this request
        'Authorization': undefined,
      },
    });

    console.log('✅ REQUEST SUCCEEDED!');
    console.log('Login response status:', response.status);
    console.log('Login response headers:', response.headers);
    console.log('Login response data:', JSON.stringify(response.data, null, 2));
    console.log('=== END AUTH LOGIN DEBUG ===');
    
    return response.data;
  } catch (error) {
    console.error('❌ REQUEST FAILED!');
    console.error('=== AUTH LOGIN ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Error response headers:', error.response?.headers);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('=== END AUTH LOGIN ERROR ===');
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getMe = async () => {
  const response = await ApiClient.get('/users/me');
  return response.data;
};
