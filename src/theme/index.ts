// ============================================================================
// 🎨 AVASPLOT DESIGN SYSTEM — Clean Light Theme (Matching Website)
// ============================================================================

export const Colors = {
    // Core palette — Emerald + Slate (matches avasplot.in)
    primary: '#10B981',        // Emerald-500
    primaryLight: '#34D399',   // Emerald-400
    primaryDark: '#059669',    // Emerald-600
    primaryGlow: 'rgba(16, 185, 129, 0.20)',

    secondary: '#047857',      // Emerald-700
    secondaryLight: '#059669',
    secondaryDark: '#065F46',

    accent: '#0F172A',         // Slate-900 (dark CTA / headers)
    accentLight: '#1E293B',    // Slate-800
    accentDark: '#020617',     // Slate-950

    success: '#10B981',
    successLight: '#34D399',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    error: '#EF4444',
    errorLight: '#F87171',

    // Background layers (light mode)
    background: '#F8FAFC',     // Slate-50
    surface: '#FFFFFF',        // White cards
    surfaceElevated: '#F1F5F9', // Slate-100
    surfaceBright: '#FFFFFF',   // Inputs, buttons

    // Glass morphism (light)
    glass: 'rgba(255, 255, 255, 0.80)',
    glassBorder: 'rgba(226, 232, 240, 0.80)', // slate-200
    glassHover: 'rgba(241, 245, 249, 0.90)',

    // Text
    text: '#0F172A',           // Slate-900
    textSecondary: '#475569',  // Slate-600
    textMuted: '#94A3B8',      // Slate-400
    textInverse: '#FFFFFF',

    // Borders
    border: '#E2E8F0',         // Slate-200
    borderLight: '#F1F5F9',    // Slate-100
    borderFocus: '#10B981',    // Emerald-500

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',

    // Gradients (start, end)
    gradientPrimary: ['#10B981', '#059669'] as const,
    gradientAccent: ['#0F172A', '#1E293B'] as const,
    gradientSurface: ['#FFFFFF', '#F8FAFC'] as const,
    gradientDark: ['#0F172A', '#1E293B'] as const,
    gradientGold: ['#F59E0B', '#D97706'] as const,

    // Property type colors
    propertyColors: {
        residential: '#10B981',
        commercial: '#3B82F6',
        agricultural: '#22C55E',
        industrial: '#F97316',
        farmhouse: '#8B5CF6',
        flat: '#06B6D4',
        villa: '#EC4899',
        office: '#6366F1',
        shop: '#14B8A6',
        warehouse: '#64748B',
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
};

export const Typography = {
    hero: {
        fontSize: 32,
        fontWeight: '800' as const,
        letterSpacing: -1,
        lineHeight: 40,
    },
    h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        letterSpacing: -0.5,
        lineHeight: 36,
    },
    h2: {
        fontSize: 22,
        fontWeight: '600' as const,
        letterSpacing: -0.3,
        lineHeight: 30,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600' as const,
        lineHeight: 26,
    },
    body: {
        fontSize: 15,
        fontWeight: '400' as const,
        lineHeight: 22,
    },
    bodyBold: {
        fontSize: 15,
        fontWeight: '600' as const,
        lineHeight: 22,
    },
    caption: {
        fontSize: 13,
        fontWeight: '400' as const,
        lineHeight: 18,
    },
    captionBold: {
        fontSize: 13,
        fontWeight: '600' as const,
        lineHeight: 18,
    },
    tiny: {
        fontSize: 11,
        fontWeight: '500' as const,
        lineHeight: 14,
    },
    price: {
        fontSize: 20,
        fontWeight: '700' as const,
        letterSpacing: -0.3,
        lineHeight: 28,
    },
};

export const Shadows = {
    sm: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
        elevation: 6,
    },
    glow: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 8,
    },
};
