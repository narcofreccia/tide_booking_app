import { ApiClient } from './apiClient';

/**
 * Update user password
 * @param {Object} data - Password update data
 * @param {number} data.id - User ID
 * @param {string} data.oldPassword - Current password
 * @param {string} data.newPassword - New password
 * @returns {Promise} Updated user data
 */
export const updatePassword = async ({ id, oldPassword, newPassword }) => {
  const response = await ApiClient.put(`/users/password/${id}`, {
    oldPassword,
    newPassword,
  });
  return response.data;
};
