import Constants from 'expo-constants';

// Get environment from expo config or default to development
const ENV = Constants.expoConfig?.extra?.environment || 'development';

const envConfig = {
  development: {
    apiUrl: Constants.expoConfig?.extra?.devServerUrl || 'http://localhost:8000',
    environment: 'development',
  },
  production: {
    apiUrl: Constants.expoConfig?.extra?.prodServerUrl || 'https://api.yourdomain.com',
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

export default getEnvVars();
