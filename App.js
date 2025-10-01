import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import { getAuthToken } from './utils/storage';
import { ContextProvider } from './context/ContextProvider';
import { Notification } from './components/Notification';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Loading } from './components/Loading';
import { ThemeProvider } from './theme';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getAuthToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for auth changes (login/logout)
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = await getAuthToken();
      setIsAuthenticated(!!token);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return isAuthenticated ? <HomeScreen /> : <LoginScreen />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ContextProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
          <Notification />
          <ConfirmDialog />
          <Loading />
          <StatusBar style="auto" />
        </QueryClientProvider>
      </ContextProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
