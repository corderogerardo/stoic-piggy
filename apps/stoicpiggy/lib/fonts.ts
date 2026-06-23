// Loaded font family names (registered in app/_layout via expo-google-fonts).
export const FONT = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  extrabold: 'DMSans_800ExtraBold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

export type FontWeightKey = '400' | '500' | '600' | '700' | '800';

export const WEIGHT: Record<FontWeightKey, string> = {
  '400': FONT.regular,
  '500': FONT.medium,
  '600': FONT.semibold,
  '700': FONT.bold,
  '800': FONT.extrabold,
};
