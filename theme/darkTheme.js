// Modern Fresh Dark Theme Configuration — Elevated "Nocturne Neo" Edition
const darkTheme = {
  mode: 'dark',

  // Color Palette
  palette: {
    primary: {
      main: '#50E3C2',      // Fresh teal-mint (kept)
      light: '#7FF0D7',     // Lighter teal
      dark: '#3BB69B',      // Darker teal
      contrastText: '#000000',
    },
    secondary: {
      main: '#4A90E2',      // Bright blue (kept)
      light: '#7AB4ED',     // Lighter blue
      dark: '#357ABD',      // Darker blue
      contrastText: '#FFFFFF',
    },

    // Signal colors tuned for dark elegance (slightly desaturated, less neon)
    error: {
      main: '#E35D6A',
      light: '#FF8A95',
      dark: '#B33C48',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F5B561',
      light: '#FFD08E',
      dark: '#C7832F',
      contrastText: '#000000',
    },
    info: {
      main: '#57C5F6',      // Harmonized cyan
      light: '#8FE2FF',
      dark: '#0F98D1',
      contrastText: '#000000',
    },
    success: {
      main: '#7FCF96',
      light: '#B7E9C4',
      dark: '#3E9B5C',
      contrastText: '#000000',
    },

    // Background system with cinematic depth and subtle hue shifts
    background: {
      default: '#0B1220',   // Deeper midnight blue (elegant, reduces glare)
      paper: '#111A2B',     // Surface-1
      elevated: '#172235',  // Surface-2 (cards, sheets)
      backdrop: '#0A0F1A',  // For modals and scrims
    },

    // Text tuned for contrast ratios and long-read comfort
    text: {
      primary: '#E7EEF6',   // Soft-white, low blue spike
      secondary: '#B4C2CF', // Cool gray-blue
      disabled: '#7690A3',
      hint: '#8DA6B8',
      inverse: '#0B1220',   // On light chips over dark
    },

    // Separators and borders with chroma to avoid muddy grays
    divider: '#243247',
    border: '#2E4057',
    focus: '#50E3C2',       // Primary-colored focus ring for accessibility
    overlay: 'rgba(5, 10, 20, 0.6)',
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
    // Subtle tracking improves legibility on dark backgrounds
    letterSpacing: {
      tight: -0.2,
      normal: 0,
      wide: 0.2,
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
    sm: 6,   // Slightly rounder for modern softness
    md: 10,
    lg: 14,
    xl: 18,
    full: 9999,
  },

  // Shadows — softer, longer, cooler-toned for dark surfaces
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
      shadowRadius: 1.5,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 4.5,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.34,
      shadowRadius: 8.5,
      elevation: 10,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.38,
      shadowRadius: 14,
      elevation: 18,
    },
  },

  // Component Specific Styles
  components: {
    button: {
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 24,
      minHeight: 44,
      backgroundColor: '#50E3C2', // primary
      color: '#0B1220',
      hover: {
        backgroundColor: '#7FF0D7',
      },
      active: {
        backgroundColor: '#3BB69B',
      },
      focusRing: {
        color: '#50E3C2',
        width: 2,
      },
      subtle: {
        backgroundColor: 'rgba(80, 227, 194, 0.12)',
        color: '#50E3C2',
        hoverBg: 'rgba(80, 227, 194, 0.18)',
      },
    },
    input: {
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#2E4057',
      backgroundColor: '#111A2B',
      color: '#E7EEF6',
      placeholderColor: '#8DA6B8',
      minHeight: 48,
      focus: {
        borderColor: '#50E3C2',
        shadow: '0 0 0 3px rgba(80, 227, 194, 0.25)',
      },
      disabledBg: '#0F1726',
    },
    card: {
      borderRadius: 14,
      padding: 16,
      backgroundColor: '#172235',
      borderColor: '#243247',
      borderWidth: 1,
      backdropFilter: 'saturate(120%) blur(6px)', // modern glassy hint
      headerTint: '#B4C2CF',
    },
    tab: {
      activeColor: '#E7EEF6',
      inactiveColor: '#8DA6B8',
      indicatorColor: '#4A90E2', // secondary for motion accents
      hoverBg: 'rgba(122, 180, 237, 0.10)',
    },
    chip: {
      bg: 'rgba(80, 227, 194, 0.12)',
      color: '#50E3C2',
      borderColor: 'rgba(80, 227, 194, 0.25)',
    },
    tooltip: {
      bg: '#0A0F1A',
      color: '#E7EEF6',
      borderColor: '#243247',
    },
    skeleton: {
      baseColor: '#111A2B',
      highlightColor: '#172235',
    },
    modal: {
      backdrop: 'rgba(5, 10, 20, 0.6)',
      surface: '#111A2B',
      borderColor: '#243247',
    },
  },

  // Motion (kept subtle for dark UX)
  motion: {
    duration: {
      fast: 120,
      base: 180,
      slow: 260,
    },
    easing: {
      inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0.0, 1, 1)',
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