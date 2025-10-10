import { ApiClient } from './apiClient';

/**
 * Submit voice intent to backend for processing
 * @param {Object} data - Voice intent data
 * @param {string} data.transcript - Transcribed text
 * @param {string} data.locale - Locale (e.g., 'it-IT')
 * @param {number} data.confidenceScore - Confidence score (0-100)
 * @param {number} data.duration - Recording duration in milliseconds
 * @param {number} data.wordCount - Number of words in transcript
 * @param {string} data.timestamp - ISO timestamp
 * @param {string} data.timezone - IANA timezone (e.g., 'Europe/Rome')
 * @param {Object} data.metadata - Additional metadata
 * @param {Object} data.extractedTokens - Client-side extracted tokens (optional)
 * @param {Object} data.validation - Validation results (optional)
 * @param {boolean} data.needsServerRecheck - Whether server recheck is needed
 * @param {File|Blob} data.audioFile - Audio file for low confidence (optional)
 * @returns {Promise} Response with booking data or clarifications
 */
export const submitVoiceIntent = async (data) => {
  const formData = new FormData();
  
  // Required fields
  formData.append('transcript', data.transcript);
  formData.append('locale', data.locale);
  formData.append('confidence_score', data.confidenceScore);
  formData.append('duration_ms', data.duration);
  formData.append('word_count', data.wordCount);
  formData.append('timestamp', data.timestamp);
  formData.append('timezone', data.timezone);
  formData.append('metadata', JSON.stringify(data.metadata));
  
  // Optional fields
  if (data.extractedTokens) {
    formData.append('extracted_tokens', JSON.stringify(data.extractedTokens));
  }
  if (data.validation) {
    formData.append('validation', JSON.stringify(data.validation));
  }
  if (data.needsServerRecheck) {
    formData.append('needs_server_recheck', data.needsServerRecheck);
  }
  if (data.audioFile) {
    formData.append('audio_file', data.audioFile, 'recording.m4a');
  }
  
  // Use ApiClient but override Content-Type for multipart
  const response = await ApiClient.post('/voice-intents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Confirm a pending booking (update status to confirmed)
 * @param {number} bookingId - Booking ID
 * @param {Object} updates - Fields to update (optional)
 * @returns {Promise} Updated booking data
 */
export const confirmVoiceBooking = async (bookingId, updates = {}) => {
  // If there are field updates beyond status, update the full booking first
  if (Object.keys(updates).length > 0) {
    await ApiClient.patch(`/booking/${bookingId}`, updates);
  }
  
  // Then update status using the status endpoint
  const response = await ApiClient.patch(`/booking/${bookingId}/status`, {
    status: 'confirmed',
  });
  
  return response.data;
};

/**
 * Cancel a pending booking
 * @param {number} bookingId - Booking ID
 * @returns {Promise} Response data
 */
export const cancelVoiceBooking = async (bookingId) => {
  const response = await ApiClient.delete(`/booking/${bookingId}`);
  return response.data;
};

/**
 * Alternative: Soft delete by updating status
 * @param {number} bookingId - Booking ID
 * @returns {Promise} Updated booking data
 */
export const cancelVoiceBookingSoft = async (bookingId) => {
  const response = await ApiClient.patch(`/booking/${bookingId}/status`, {
    status: 'cancelled_by_restaurant',
  });
  
  return response.data;
};
