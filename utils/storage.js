import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage keys
const KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  RESTAURANT_ID: 'restaurant_id',
  PUBLIC_KEY: 'public_key',
};

/**
 * Store auth token securely
 * Uses SecureStore on native platforms, AsyncStorage on web
 */
export const storeAuthToken = async (token) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
    } else {
      await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
    }
  } catch (error) {
    console.error('Error storing auth token:', error);
    throw error;
  }
};

/**
 * Get auth token
 */
export const getAuthToken = async () => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    } else {
      return await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Remove auth token
 */
export const removeAuthToken = async () => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
    } else {
      await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
    }
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

/**
 * Store user data
 */
export const storeUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

/**
 * Get user data
 */
export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Remove user data
 */
export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.USER_DATA);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

/**
 * Store restaurant ID
 */
export const storeRestaurantId = async (restaurantId) => {
  try {
    await AsyncStorage.setItem(KEYS.RESTAURANT_ID, restaurantId.toString());
  } catch (error) {
    console.error('Error storing restaurant ID:', error);
    throw error;
  }
};

/**
 * Get restaurant ID
 */
export const getRestaurantId = async () => {
  try {
    const id = await AsyncStorage.getItem(KEYS.RESTAURANT_ID);
    return id ? parseInt(id, 10) : null;
  } catch (error) {
    console.error('Error getting restaurant ID:', error);
    return null;
  }
};

/**
 * Remove restaurant ID
 */
export const removeRestaurantId = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.RESTAURANT_ID);
  } catch (error) {
    console.error('Error removing restaurant ID:', error);
  }
};

/**
 * Store public key
 */
export const storePublicKey = async (publicKey) => {
  try {
    await AsyncStorage.setItem(KEYS.PUBLIC_KEY, publicKey);
  } catch (error) {
    console.error('Error storing public key:', error);
    throw error;
  }
};

/**
 * Get public key
 */
export const getPublicKey = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.PUBLIC_KEY);
  } catch (error) {
    console.error('Error getting public key:', error);
    return null;
  }
};

/**
 * Clear all stored data (logout)
 */
export const clearAllData = async () => {
  try {
    await Promise.all([
      removeAuthToken(),
      removeUserData(),
      removeRestaurantId(),
      AsyncStorage.removeItem(KEYS.PUBLIC_KEY),
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};
