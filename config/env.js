import Constants from 'expo-constants';

// Get environment from expo config or default to development
const ENV = Constants.expoConfig?.extra?.environment || 'development';

const envConfig = {
  development: {
    apiUrl: Constants.expoConfig?.extra?.devServerUrl,
    environment: 'development',
  },
  production: {
    apiUrl: Constants.expoConfig?.extra?.prodServerUrl,
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