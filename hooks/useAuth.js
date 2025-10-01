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
      // Store auth token
      await storeAuthToken(data.accessToken);
      
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
