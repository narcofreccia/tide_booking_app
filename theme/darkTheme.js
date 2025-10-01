// Modern Dark Theme Configuration (Updated with new palette)
const darkTheme = {
  mode: 'dark',
  
  // Color Palette
  palette: {
    primary: {
      main: '#4A90E2',      // Primary blue
      light: '#7AB4ED',     // Lighter blue
      dark: '#357ABD',      // Darker blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#50E3C2',      // Teal-mint
      light: '#7FF0D7',     // Lighter teal
      dark: '#3BB69B',      // Darker teal
      contrastText: '#000000',
    },
    error: {
      main: '#CF6679',      // Soft red
      light: '#FF9AA2',
      dark: '#B00020',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFB74D',
      light: '#FFE97D',
      dark: '#F57C00',
      contrastText: '#000000',
    },
    info: {
      main: '#64B5F6',
      light: '#9BE7FF',
      dark: '#2286C3',
      contrastText: '#000000',
    },
    success: {
      main: '#81C784',
      light: '#B2FAB4',
      dark: '#519657',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
      elevated: '#2C2C2C',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      disabled: '#6B6B6B',
      hint: '#808080',
    },
    divider: '#2C2C2C',
    border: '#3C3C3C',
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
