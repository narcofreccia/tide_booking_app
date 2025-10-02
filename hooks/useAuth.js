import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authLogin, getMe } from '../services/api';
import { 
  storeAuthToken, 
  storeUserData, 
  removeAuthToken,
  getUserData 
} from '../utils/storage';
import { useDispatchContext } from '../context/ContextProvider';

/**
 * Login mutation hook
 * @returns {Object} Mutation object with mutate, isLoading, error, etc.
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatchContext();

  return useMutation({
    mutationFn: authLogin,
    onSuccess: async (data) => {
      console.log('=== LOGIN SUCCESS ===');
      console.log('Login response:', JSON.stringify(data, null, 2));
      console.log('Response type:', typeof data);
      console.log('Response keys:', Object.keys(data));
      console.log('data.access_token:', data.access_token, 'type:', typeof data.access_token);
      console.log('data.accessToken:', data.accessToken, 'type:', typeof data.accessToken);
      
      try {
        // Store auth token - handle both snake_case and camelCase
        const token = data.access_token || data.accessToken;
        console.log('Selected token:', token, 'type:', typeof token);
        
        if (!token) {
          const errorMsg = `No access token received from server. Response keys: ${Object.keys(data).join(', ')}. Full response: ${JSON.stringify(data)}`;
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
        
        console.log('About to store token...');
        await storeAuthToken(token);
        console.log('Token stored successfully');
        
        // Prepare user data
        const userData = {
          id: data.id,
          business_id: data.business_id,
          restaurant_id: data.restaurant_id,
          name: data.name,
          email: data.email,
          role: data.role,
          features: data.features,
        };

        // Update global context with current user (will auto-persist to AsyncStorage)
        dispatch({ type: 'UPDATE_CURRENT_USER', payload: userData });
        dispatch({ type: 'UPDATE_SELECTED_RESTAURANT', payload: userData.restaurant_id });

        // Invalidate and refetch user query
        queryClient.invalidateQueries({ queryKey: ['user'] });
      } catch (error) {
        console.error('Error in onSuccess:', error);
        // Re-throw so it's caught by onError
        throw error;
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Show detailed error to user
      const errorDetails = {
        message: error.message || 'Unknown error',
        status: error.status || 'N/A',
        response: error.response ? JSON.stringify(error.response) : 'No response',
        stack: error.stack || 'No stack trace'
      };
      console.error('Full error details:', errorDetails);
    },
    onMutate: (variables) => {
      dispatch({ type: 'START_LOADING' });
    },
    onSettled: () => {
      dispatch({ type: 'END_LOADING' });
    },
  });
};

/**
 * Get current user query hook
 * @returns {Object} Query object with data, isLoading, error, etc.
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Logout mutation hook
 * @returns {Object} Mutation object
 */
export const useLogout = () => {
  console.log('useLogout hook called');
  const queryClient = useQueryClient();
  const dispatch = useDispatchContext();

  return useMutation({
    mutationFn: async () => {
      // Only remove auth token - this will trigger App.js to switch to LoginScreen
      await removeAuthToken();
      return true;
    },
    onSuccess: () => {
      // Reset current user in global context
      dispatch({ type: 'RESET_CURRENT_USER' });
      
      // Clear all queries and reset cache
      queryClient.clear();
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Logout error:', error);
    },
  });
};

/**
 * Hook to get stored user data (from AsyncStorage)
 * @returns {Object} Query object with stored user data
 */
export const useStoredUser = () => {
  return useQuery({
    queryKey: ['storedUser'],
    queryFn: getUserData,
    staleTime: Infinity, // Never refetch automatically
  });
};
