// Stoic Piggy design tokens — single source of truth, shared by web (Tailwind)
// and mobile (NativeWind). Extracted from the Claude Design handoff
// (stoic-piggy-handoff/project/*.dc.html).
//
// Palette: Berkeley navy ink, imperial red accent, honeydew cream, non-photo
// teal, cerulean blue, warm "piggy" pinks, on a soft off-white canvas.
// Type: DM Sans (UI) + Space Mono (numbers / money).

const colors = {
  // Core brand
  navy: { DEFAULT: '#1D3557', 900: '#13243B', 950: '#0F1D30' }, // ink + dark surfaces (temple theme)
  accent: '#E63946', // imperial red — primary action
  cream: '#F1FAEE', // honeydew — ink-on-dark, tab bg
  teal: '#A8DADC', // non-photo blue — soft fills / auras
  blue: '#457B9D', // cerulean — secondary accent (XP)
  canvas: '#FAFBF6', // app background (zen theme)
  coral: '#FFF3F1', // coral theme background
  success: '#2FAE6B', // online / approved
  // Mascot
  pig: { light: '#F4ACA4', DEFAULT: '#EFA59E', dark: '#ED968E' },
  // Convenience alias — use `ink`, `ink/70`, `ink/50` for the muted text variants
  ink: '#1D3557',
};

const radii = {
  lg: '0.75rem', // 12px
  xl: '0.875rem', // 14px
  '2xl': '1.25rem', // 20px
  '3xl': '1.5rem', // 24px
};

const fontFamily = {
  sans: ['DM Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  mono: ['Space Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
};

// Runtime theme maps (apply as CSS variables / RN style vars to switch themes).
// Default is `zen` (light). `temple` is dark; `coral` is a warm light variant.
const themes = {
  zen: {
    canvas: '#FAFBF6',
    ink: '#1D3557',
    accent: '#E63946',
    accentInk: '#F1FAEE',
    soft: 'rgba(168,218,220,0.40)',
    darkBg: '#1D3557',
    darkInk: '#F1FAEE',
    cardBorder: '#1D3557',
    tabBg: '#F1FAEE',
  },
  temple: {
    canvas: '#13243B',
    ink: '#F1FAEE',
    accent: '#E63946',
    accentInk: '#F1FAEE',
    soft: 'rgba(69,123,157,0.30)',
    darkBg: '#E63946',
    darkInk: '#F1FAEE',
    cardBorder: 'rgba(168,218,220,0.22)',
    tabBg: '#0F1D30',
  },
  coral: {
    canvas: '#FFF3F1',
    ink: '#1D3557',
    accent: '#E63946',
    accentInk: '#FFF3F1',
    soft: 'rgba(230,57,70,0.10)',
    darkBg: '#1D3557',
    darkInk: '#F1FAEE',
    cardBorder: '#E63946',
    tabBg: '#FFFFFF',
  },
};

module.exports = { colors, radii, fontFamily, themes };
