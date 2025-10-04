// Modern Fresh Light Theme Configuration — "Aurora Daylight" Edition
const lightTheme = {
    mode: 'light',
  
    // Color Palette
    palette: {
      primary: {
        main: '#50E3C2',      // Fresh teal-mint (kept)
        light: '#7FF0D7',     // Lighter teal
        dark: '#3BB69B',      // Darker teal
        contrastText: '#08352C',
      },
      secondary: {
        main: '#4A90E2',      // Bright blue (kept)
        light: '#7AB4ED',
        dark: '#357ABD',
        contrastText: '#0A2A55',
      },
  
      // Signals balanced for light UI (slightly softened saturation)
      error: {
        main: '#D84552',
        light: '#F58B94',
        dark: '#A82E39',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#F2A84A',
        light: '#FFD08E',
        dark: '#C1771C',
        contrastText: '#2A1C00',
      },
      info: {
        main: '#3FB4EE',
        light: '#8FE2FF',
        dark: '#0F86BD',
        contrastText: '#063045',
      },
      success: {
        main: '#64BF80',
        light: '#B7E9C4',
        dark: '#2F8B4E',
        contrastText: '#062611',
      },
  
      // Light backgrounds with cool-neutral tint to pair with teal/blue accents
      background: {
        default: '#FCFEFF',  // brighter, clean white with a whisper of blue
        paper:   '#FFFFFF',  // pure white for primary surfaces
        elevated:'#F6FAFD',  // gentle, airy elevation
        backdrop:'rgba(8, 15, 24, 0.04)', // lighter modal scrim
      },
  
      // Text tuned for high readability on light
      text: {
        primary: '#0F172A',   // Slate-900-like
        secondary: '#475569', // Slate-600-like
        disabled: '#94A3B8',  // Slate-400-like
        hint: '#64748B',      // Slate-500-like
        inverse: '#FFFFFF',   // On primary/secondary solids
      },
  
      // Separators and borders with gentle presence
      divider: '#E2E8F0',     // Slate-200-like
      border: '#CBD5E1',      // Slate-300-like
      focus: '#50E3C2',       // Primary-colored focus ring for accessibility
      overlay: 'rgba(8, 15, 24, 0.06)',
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
      sm: 6,
      md: 10,
      lg: 14,
      xl: 18,
      full: 9999,
    },
  
    // Shadows — airy, color-safe for light surfaces
    shadows: {
      none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      sm: {
        shadowColor: 'rgba(2, 8, 23, 0.06)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: 'rgba(2, 8, 23, 0.08)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 4,
      },
      lg: {
        shadowColor: 'rgba(2, 8, 23, 0.10)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 8,
      },
      xl: {
        shadowColor: 'rgba(2, 8, 23, 0.12)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 18,
        elevation: 12,
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
        color: '#08352C',
        hover: {
          backgroundColor: '#7FF0D7',
        },
        active: {
          backgroundColor: '#3BB69B',
          color: '#072B24',
        },
        focusRing: {
          color: '#50E3C2',
          width: 2,
        },
        subtle: {
          backgroundColor: 'rgba(80, 227, 194, 0.10)',
          color: '#0F172A',
          hoverBg: 'rgba(80, 227, 194, 0.16)',
        },
        outline: {
          borderColor: '#50E3C2',
          color: '#0F172A',
          hoverBg: 'rgba(80, 227, 194, 0.08)',
        },
      },
      input: {
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        placeholderColor: '#64748B',
        minHeight: 48,
        focus: {
          borderColor: '#50E3C2',
          shadow: '0 0 0 3px rgba(80, 227, 194, 0.25)',
        },
        disabledBg: '#F1F5F9',
      },
      card: {
        borderRadius: 14,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        backdropFilter: 'saturate(110%) blur(4px)',
        headerTint: '#475569',
      },
      tab: {
        activeColor: '#0F172A',
        inactiveColor: '#64748B',
        indicatorColor: '#4A90E2', // secondary
        hoverBg: 'rgba(74, 144, 226, 0.10)',
      },
      chip: {
        bg: '#ECFEF8',
        color: '#0F172A',
        borderColor: 'rgba(80, 227, 194, 0.35)',
      },
      tooltip: {
        bg: '#0F172A',
        color: '#FFFFFF',
        borderColor: '#0B1220',
      },
      skeleton: {
        baseColor: '#E2E8F0',
        highlightColor: '#F1F5F9',
      },
      modal: {
        backdrop: 'rgba(8, 15, 24, 0.35)',
        surface: '#FFFFFF',
        borderColor: '#E2E8F0',
      },
    },
  
    // Motion
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
  
  export default lightTheme;