// Modern Dark Theme Configuration
const darkTheme = {
  mode: 'dark',
  
  // Color Palette
  palette: {
    primary: {
      main: '#00D4FF',      // Bright cyan
      light: '#5DDFFF',     // Lighter cyan
      dark: '#00A8CC',      // Darker cyan
      contrastText: '#000000',
    },
    secondary: {
      main: '#BB86FC',      // Purple
      light: '#E7B9FF',     // Light purple
      dark: '#9965F4',      // Dark purple
      contrastText: '#000000',
    },
    error: {
      main: '#CF6679',      // Soft red
      light: '#FF9AA2',     // Light red
      dark: '#B00020',      // Dark red
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFB74D',      // Orange
      light: '#FFE97D',     // Light orange
      dark: '#F57C00',      // Dark orange
      contrastText: '#000000',
    },
    info: {
      main: '#64B5F6',      // Blue
      light: '#9BE7FF',     // Light blue
      dark: '#2286C3',      // Dark blue
      contrastText: '#000000',
    },
    success: {
      main: '#81C784',      // Green
      light: '#B2FAB4',     // Light green
      dark: '#519657',      // Dark green
      contrastText: '#000000',
    },
    background: {
      default: '#121212',   // Main background
      paper: '#1E1E1E',     // Card/surface background
      elevated: '#2C2C2C',  // Elevated surfaces
    },
    text: {
      primary: '#FFFFFF',   // Primary text
      secondary: '#B3B3B3', // Secondary text
      disabled: '#6B6B6B',  // Disabled text
      hint: '#808080',      // Hint text
    },
    divider: '#2C2C2C',     // Divider color
    border: '#3C3C3C',      // Border color
  },

  // Typography
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      light: 'System',
    },
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // Shadows
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 12,
    },
  },

  // Component Specific Styles
  components: {
    button: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      minHeight: 44,
    },
    input: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      minHeight: 48,
    },
    card: {
      borderRadius: 12,
      padding: 16,
    },
  },

  // Z-Index
  zIndex: {
    drawer: 1000,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
};

export default darkTheme;
