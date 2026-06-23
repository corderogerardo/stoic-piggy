import { Text, type TextProps } from 'react-native';
import { FONT, type FontWeightKey, WEIGHT } from '../lib/fonts';

interface TxtProps extends TextProps {
  /** Font weight (maps to a loaded DM Sans family). Default 400. */
  w?: FontWeightKey;
  /** Use Space Mono (for money / numbers). */
  mono?: boolean;
}

/** Text with the correct loaded font family applied (RN needs explicit families per weight). */
export function Txt({ w = '400', mono, style, ...rest }: TxtProps) {
  return <Text {...rest} style={[{ fontFamily: mono ? FONT.monoBold : WEIGHT[w] }, style]} />;
}
