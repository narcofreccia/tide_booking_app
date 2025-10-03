import Constants from 'expo-constants';

// Get environment from expo config or default to development
const ENV = Constants.expoConfig?.extra?.environment || 'development';
const APP_OWNERSHIP = Constants.appOwnership; // 'expo' when running inside Expo Go

// Prefer a dedicated URL when running in Expo Go (real device via LAN/Tunnel)
const DEV_URL_DEFAULT = Constants.expoConfig?.extra?.devServerUrl;
const DEV_URL_EXPO_GO = Constants.expoConfig?.extra?.devServerUrlExpoGo;
const PROD_URL = Constants.expoConfig?.extra?.prodServerUrl;

const envConfig = {
  development: {
    // If running in Expo Go, use the Expo Go-specific URL when provided, otherwise use default
    apiUrl: APP_OWNERSHIP === 'expo' && DEV_URL_EXPO_GO
      ? DEV_URL_EXPO_GO
      : DEV_URL_DEFAULT,
    environment: 'development',
  },
  production: {
    apiUrl: PROD_URL,
    environment: 'production',
  },
};

// Select config based on environment
const getEnvVars = () => {
  if (ENV === 'production') {
    return envConfig.production;
  }
  return envConfig.development;
};

const config = getEnvVars();

// Debug log to verify which URL is being used
console.log('🌐 Environment Config:', {
  environment: config.environment,
  apiUrl: config.apiUrl,
  appOwnership: APP_OWNERSHIP,
  isExpoGo: APP_OWNERSHIP === 'expo',
});

export default config;