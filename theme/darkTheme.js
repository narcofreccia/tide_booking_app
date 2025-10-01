// Modern Fresh Dark Theme Configuration
const darkTheme = {
  mode: 'dark',
  
  // Color Palette
  palette: {
    primary: {
      main: '#50E3C2',      // Fresh teal-mint (now primary)
      light: '#7FF0D7',     // Lighter teal
      dark: '#3BB69B',      // Darker teal
      contrastText: '#000000',
    },
    secondary: {
      main: '#4A90E2',      // Bright blue (now secondary accent)
      light: '#7AB4ED',     // Lighter blue
      dark: '#357ABD',      // Darker blue
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF5350',      // Softer material red
      light: '#FF867C',
      dark: '#C62828',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFB74D',
      light: '#FFD98D',
      dark: '#F57C00',
      contrastText: '#000000',
    },
    info: {
      main: '#4FC3F7',      // Cyan-ish info
      light: '#8BF6FF',
      dark: '#0093C4',
      contrastText: '#000000',
    },
    success: {
      main: '#81C784',
      light: '#B2FAB4',
      dark: '#388E3C',
      contrastText: '#000000',
    },
    background: {
      default: '#0D1B2A',   // Deep blue-gray background instead of flat black
      paper: '#1B263B',     // Slightly lighter but still moody
      elevated: '#243B53',  // Even lighter bluish tone for raised cards
    },
    text: {
      primary: '#FFFFFF',   // Crisp white
      secondary: '#C9D6DF', // Softer gray-blue text
      disabled: '#6E7C87',
      hint: '#8DA6B8',
    },
    divider: '#2E3C4D',
    border: '#3C4F65',
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
      shadowOpacity: 0.15,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 5.5,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.40,
      shadowRadius: 8.5,
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
      backgroundColor: '#50E3C2', // emphasize new primary
    },
    input: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#3C4F65',
      backgroundColor: '#1B263B',
      color: '#FFFFFF',
      minHeight: 48,
    },
    card: {
      borderRadius: 12,
      padding: 16,
      backgroundColor: '#1B263B', // consistent with paper
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