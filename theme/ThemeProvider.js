import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import darkTheme from './darkTheme';
import lightTheme from './lightTheme';

// Create Theme Contexts
const ThemeContext = createContext(lightTheme);
const ThemeModeContext = createContext({
  themeMode: 'light',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

const THEME_STORAGE_KEY = '@theme_mode';

/**
 * ThemeProvider component
 * Provides theme configuration and theme switching to all child components
 */
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    saveThemePreference(newMode);
  };

  const setTheme = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setThemeMode(mode);
      saveThemePreference(mode);
    }
  };

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const themeModeValue = {
    themeMode,
    toggleTheme,
    setThemeMode: setTheme,
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeModeContext.Provider value={themeModeValue}>
      <ThemeContext.Provider value={theme}>
        {children}
      </ThemeContext.Provider>
    </ThemeModeContext.Provider>
  );
};

/**
 * Custom hook to access theme
 * @returns {Object} Theme object with all theme configurations
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Custom hook to access theme mode and toggle function
 * @returns {Object} { themeMode: 'dark' | 'light', toggleTheme: function, setThemeMode: function }
 */
export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
