import React, { createContext, useContext } from 'react';
import darkTheme from './darkTheme';

// Create Theme Context
const ThemeContext = createContext(darkTheme);

/**
 * ThemeProvider component
 * Provides theme configuration to all child components
 */
export const ThemeProvider = ({ children, theme = darkTheme }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
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

export default ThemeProvider;
