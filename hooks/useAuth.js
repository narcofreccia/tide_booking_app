import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authLogin, getMe, refreshAccessToken } from '../services/api';
import { 
  storeAuthToken, 
  storeRefreshToken,
  storeUserData, 
  removeAuthToken,
  removeRefreshToken,
  getUserData,
  getRefreshToken
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
      try {
        // Store auth token - handle both snake_case and camelCase
        const token = data.access_token || data.accessToken;
        const refreshToken = data.refresh_token || data.refreshToken;
        
        if (!token) {
          throw new Error('No access token received from server');
        }
        
        await storeAuthToken(token);
        
        // Store refresh token if provided (mobile flow)
        if (refreshToken) {
          await storeRefreshToken(refreshToken);
        }
        
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
  const queryClient = useQueryClient();
  const dispatch = useDispatchContext();

  return useMutation({
    mutationFn: async () => {
      // Remove both auth and refresh tokens
      await removeAuthToken();
      await removeRefreshToken();
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
