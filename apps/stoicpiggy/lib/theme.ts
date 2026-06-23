// App themes — ported from the handoff. Default `zen` (light); `temple` is dark;
// `coral` is a warm light variant. Values are RN-ready (colors + border widths).

export type ThemeName = 'zen' | 'temple' | 'coral';

export interface ThemeColors {
  canvas: string;
  ink: string;
  ink2: string;
  ink3: string;
  accent: string;
  accentInk: string;
  cardBg: string;
  cardBorderColor: string;
  cardBorderWidth: number;
  soft: string;
  darkBg: string;
  darkInk: string;
  darkInk2: string;
  chip: string;
  chipInk: string;
  tabBg: string;
  tabBorderColor: string;
  tabBorderWidth: number;
  divider: string;
  statusbar: string;
}

export const THEMES: Record<ThemeName, ThemeColors> = {
  zen: {
    canvas: '#FAFBF6', ink: '#1D3557', ink2: 'rgba(29,53,87,0.70)', ink3: 'rgba(29,53,87,0.50)',
    accent: '#E63946', accentInk: '#F1FAEE', cardBg: 'transparent', cardBorderColor: '#1D3557', cardBorderWidth: 2,
    soft: 'rgba(168,218,220,0.40)', darkBg: '#1D3557', darkInk: '#F1FAEE', darkInk2: 'rgba(168,218,220,0.85)',
    chip: 'rgba(29,53,87,0.08)', chipInk: 'rgba(29,53,87,0.70)', tabBg: '#F1FAEE', tabBorderColor: '#1D3557', tabBorderWidth: 2,
    divider: 'rgba(29,53,87,0.14)', statusbar: '#1D3557',
  },
  temple: {
    canvas: '#13243B', ink: '#F1FAEE', ink2: 'rgba(241,250,238,0.72)', ink3: 'rgba(168,218,220,0.62)',
    accent: '#E63946', accentInk: '#F1FAEE', cardBg: 'rgba(168,218,220,0.06)', cardBorderColor: 'rgba(168,218,220,0.22)', cardBorderWidth: 1,
    soft: 'rgba(69,123,157,0.30)', darkBg: '#E63946', darkInk: '#F1FAEE', darkInk2: 'rgba(241,250,238,0.82)',
    chip: 'rgba(168,218,220,0.12)', chipInk: 'rgba(241,250,238,0.78)', tabBg: '#0F1D30', tabBorderColor: 'rgba(168,218,220,0.18)', tabBorderWidth: 1,
    divider: 'rgba(168,218,220,0.16)', statusbar: '#F1FAEE',
  },
  coral: {
    canvas: '#FFF3F1', ink: '#1D3557', ink2: 'rgba(29,53,87,0.70)', ink3: 'rgba(29,53,87,0.50)',
    accent: '#E63946', accentInk: '#FFF3F1', cardBg: '#FFFFFF', cardBorderColor: '#E63946', cardBorderWidth: 2,
    soft: 'rgba(230,57,70,0.10)', darkBg: '#1D3557', darkInk: '#F1FAEE', darkInk2: 'rgba(168,218,220,0.85)',
    chip: 'rgba(230,57,70,0.10)', chipInk: '#E63946', tabBg: '#FFFFFF', tabBorderColor: '#E63946', tabBorderWidth: 2,
    divider: 'rgba(230,57,70,0.18)', statusbar: '#1D3557',
  },
};

export const THEME_SWATCHES: { name: ThemeName; label: string; bg: string }[] = [
  { name: 'zen', label: 'Zen', bg: '#FAFBF6' },
  { name: 'temple', label: 'Temple', bg: '#13243B' },
  { name: 'coral', label: 'Coral', bg: '#FFF3F1' },
];
