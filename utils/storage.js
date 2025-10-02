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
  const callStack = new Error().stack;
  try {
    console.log('=== STORE AUTH TOKEN ===');
    console.log('Called from:', callStack);
    console.log('Received token:', token);
    console.log('Token type:', typeof token);
    console.log('Token is null?', token === null);
    console.log('Token is undefined?', token === undefined);
    console.log('Platform:', Platform.OS);
    
    // Ensure token is a string
    if (!token || typeof token !== 'string') {
      const errorMsg = `Invalid token: expected string, got ${typeof token}, value: ${JSON.stringify(token)}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('Token validation passed. Length:', token.length);
    console.log('First 20 chars:', token.substring(0, 20));
    
    if (Platform.OS === 'web') {
      console.log('Using AsyncStorage (web)');
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
    } else {
      console.log('Using SecureStore (native)');
      console.log('Calling SecureStore.setItemAsync with key:', KEYS.AUTH_TOKEN);
      await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
    }
    
    console.log('Token stored successfully!');
    console.log('=== END STORE AUTH TOKEN ===');
  } catch (error) {
    console.error('=== STORE AUTH TOKEN ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Call stack was:', callStack);
    console.error('=== END STORE AUTH TOKEN ERROR ===');
    throw error;
  }
};

/**
 * Get auth token
 */
export const getAuthToken = async () => {
  try {
    console.log('=== GET AUTH TOKEN ===');
    console.log('Platform:', Platform.OS);
    console.log('Key:', KEYS.AUTH_TOKEN);
    
    let token;
    if (Platform.OS === 'web') {
      console.log('Reading from AsyncStorage...');
      token = await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    } else {
      console.log('Reading from SecureStore...');
      token = await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
    }
    
    console.log('Retrieved token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('=== END GET AUTH TOKEN ===');
    return token;
  } catch (error) {
    console.error('=== GET AUTH TOKEN ERROR ===');
    console.error('Error getting auth token:', error);
    console.error('Error message:', error.message);
    console.error('=== END GET AUTH TOKEN ERROR ===');
    return null;
  }
};

/**
 * Remove auth token
 */
export const removeAuthToken = async () => {
  console.log('Removing auth token');
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
