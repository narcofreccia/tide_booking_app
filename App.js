import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import { getAuthToken } from './utils/storage';
import { ContextProvider } from './context/ContextProvider';
import { Notification } from './components/Notification';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Loading } from './components/Loading';
import { ThemeProvider, useTheme } from './theme';

// Web-specific: Inject global styles to fix background color
if (Platform.OS === 'web') {
  // Wait for DOM to be ready
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
      }
      html, body, #root, #root > div {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      #root {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      #root > div {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
    `;
    document.head.appendChild(style);
  }
}

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
  const theme = useTheme();

  // Apply theme background to body on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.style.backgroundColor = theme.palette.background.default;
    }
  }, [theme.palette.background.default]);

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
          <StatusBar style="light" translucent={false} backgroundColor="#1a1a1a" />
          <AppContent />
          <Notification />
          <ConfirmDialog />
          <Loading />
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
