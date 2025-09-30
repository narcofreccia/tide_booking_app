import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authLogin, getMe } from '../services/api';
import { 
  storeAuthToken, 
  storeUserData, 
  removeAuthToken,
  getUserData 
} from '../utils/storage';

/**
 * Login mutation hook
 * @returns {Object} Mutation object with mutate, isLoading, error, etc.
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authLogin,
    onSuccess: async (data) => {
      // Store auth token and user data
      await storeAuthToken(data.accessToken);
      await storeUserData({
        id: data.id,
        business_id: data.business_id,
        name: data.name,
        email: data.email,
        role: data.role,
        features: data.features,
      });

      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('Login error:', error);
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

  return useMutation({
    mutationFn: async () => {
      // Only remove auth token - this will trigger App.js to switch to LoginScreen
      await removeAuthToken();
      return true;
    },
    onSuccess: () => {
      // Clear all queries and reset cache
      queryClient.clear();
      queryClient.invalidateQueries();
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
