import Constants from 'expo-constants';

// Get environment from expo config or default to development
const ENV = Constants.expoConfig?.extra?.environment || 'development';

console.log('=== ENV CONFIG DEBUG ===');
console.log('ENV:', ENV);
console.log('Constants.expoConfig?.extra:', Constants.expoConfig?.extra);

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
    console.log('Using PRODUCTION config:', envConfig.production);
    return envConfig.production;
  }
  console.log('Using DEVELOPMENT config:', envConfig.development);
  return envConfig.development;
};

const selectedEnv = getEnvVars();
console.log('Selected environment:', selectedEnv);
console.log('=== END ENV CONFIG ===');

export default selectedEnv;
