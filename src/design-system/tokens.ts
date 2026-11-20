/**
 * Design Tokens for BiblioEST
 * Centralized specifications for colors, typography, elevations, spacing, and glassmorphism.
 */

export const tokens = {
  colors: {
    // Brand Palette (EST Specifications)
    brand: {
      turquoiseLight: '#8AD6D1',
      turquoiseDeep: '#359F9F',
      turquoiseDark: '#227878',
      ivory: '#FFF0C5',
      coral: '#FF8C52',
      coralDark: '#E67236',
    },
    // Backgrounds & Canvas
    surfaces: {
      canvas: '#FCFAF4', // Warm ivory canvas breathing space
      opaque: '#FFFFFF', // Clean readable card background
      warm: '#FCF9F0',   // Secondary panel background
      translucent: 'rgba(255, 255, 255, 0.78)',
      glassNav: 'rgba(252, 250, 244, 0.85)',
      glassPanel: 'rgba(255, 255, 255, 0.75)',
    },
    // Neutral Text Colors (High Contrast WCAG AAA)
    text: {
      primary: '#1E293B',   // Deep slate
      secondary: '#475569', // Medium slate
      muted: '#64748B',     // Caption & footnote slate
      inverse: '#FFFFFF',   // On dark or turquoise
    },
    // Borders
    borders: {
      subtle: 'rgba(138, 214, 209, 0.3)',
      default: '#E2E8F0',
      emphasis: '#359F9F',
    },
    // Semantic States (distinct from brand palette)
    semantic: {
      success: {
        background: '#ECFDF5',
        text: '#065F46',
        border: '#A7F3D0',
        icon: '#059669',
      },
      warning: {
        background: '#FFFBEB',
        text: '#92400E',
        border: '#FDE68A',
        icon: '#D97706',
      },
      error: {
        background: '#FEF2F2',
        text: '#991B1B',
        border: '#FECACA',
        icon: '#DC2626',
      },
      info: {
        background: '#F0F9FF',
        text: '#075985',
        border: '#BAE6FD',
        icon: '#0284C7',
      },
    },
    // Delay Classification (Jaune, Orange, Rouge / Corail)
    delays: {
      none: {
        label: 'Dans les délais',
        bg: '#ECFDF5',
        text: '#065F46',
        border: '#A7F3D0',
      },
      yellow: {
        label: 'Retard léger (1-3j)',
        bg: '#FFF0C5',
        text: '#78350F',
        border: '#FDE68A',
      },
      orange: {
        label: 'Retard moyen (4-7j)',
        bg: '#FFEDD5',
        text: '#9A3412',
        border: '#FDBA74',
      },
      red: {
        label: 'Alerte critique (8j+)',
        bg: 'rgba(255, 140, 82, 0.16)',
        text: '#C2410C',
        border: 'rgba(255, 140, 82, 0.5)',
      },
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },
  shadows: {
    subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    card: '0 4px 20px -2px rgba(53, 159, 159, 0.06)',
    cardHover: '0 12px 28px -4px rgba(53, 159, 159, 0.12)',
    modal: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
  },
  blur: {
    subtle: 'blur(8px)',
    standard: 'blur(16px)',
    deep: 'blur(24px)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  focus: {
    ring: 'focus:outline-none focus:ring-4 focus:ring-[#8AD6D1]/40',
  },
} as const;

export type DesignTokens = typeof tokens;
