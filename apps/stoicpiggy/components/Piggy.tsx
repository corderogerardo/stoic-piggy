import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

export type PiggyMood = 'zen' | 'happy' | 'tempted' | 'thinking';

/** Stoic Piggy mascot (React Native / react-native-svg). Mirrors the web mascot. */
export function Piggy({ mood = 'zen', size = 96 }: { mood?: PiggyMood; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 120 124" fill="none">
        {mood === 'zen' && (
          <Circle cx={60} cy={66} r={54} fill="none" stroke="#A8DADC" strokeWidth={2} strokeDasharray="3 7" opacity={0.55} />
        )}

        {/* ears */}
        <Path d="M34 44 L24 18 Q23 13 29 16 L52 33 Z" fill="#EFA59E" />
        <Path d="M86 44 L96 18 Q97 13 91 16 L68 33 Z" fill="#EFA59E" />
        <Path d="M36 40 L30 24 L48 35 Z" fill="#E63946" opacity={0.3} />
        <Path d="M84 40 L90 24 L72 35 Z" fill="#E63946" opacity={0.3} />

        {/* head + blush */}
        <Circle cx={60} cy={66} r={41} fill="#F4ACA4" />
        <Circle cx={32} cy={74} r={7.5} fill="#E63946" opacity={0.16} />
        <Circle cx={88} cy={74} r={7.5} fill="#E63946" opacity={0.16} />

        {/* snout */}
        <Ellipse cx={60} cy={78} rx={21} ry={14.5} fill="#ED968E" />
        <Ellipse cx={52} cy={78} rx={3.4} ry={5.4} fill="#1D3557" opacity={0.62} />
        <Ellipse cx={68} cy={78} rx={3.4} ry={5.4} fill="#1D3557" opacity={0.62} />

        {mood === 'zen' && (
          <G stroke="#1D3557" strokeWidth={3.2} strokeLinecap="round" fill="none">
            <Path d="M39 58 Q46.5 64 54 58" />
            <Path d="M66 58 Q73.5 64 81 58" />
          </G>
        )}
        {mood === 'happy' && (
          <G stroke="#1D3557" strokeWidth={3.4} strokeLinecap="round" fill="none">
            <Path d="M39 60 Q46.5 52 54 60" />
            <Path d="M66 60 Q73.5 52 81 60" />
          </G>
        )}
        {mood === 'tempted' && (
          <G>
            <Circle cx={46.5} cy={57} r={7} fill="#FFFFFF" stroke="#1D3557" strokeWidth={2.2} />
            <Circle cx={73.5} cy={57} r={7} fill="#FFFFFF" stroke="#1D3557" strokeWidth={2.2} />
            <Circle cx={48} cy={58.5} r={3.4} fill="#1D3557" />
            <Circle cx={75} cy={58.5} r={3.4} fill="#1D3557" />
            <Path d="M95 50 Q99 58 95 62 Q91 58 95 50 Z" fill="#A8DADC" />
          </G>
        )}
        {mood === 'thinking' && (
          <G>
            <Circle cx={46.5} cy={57} r={6.4} fill="#FFFFFF" stroke="#1D3557" strokeWidth={2.2} />
            <Circle cx={73.5} cy={57} r={6.4} fill="#FFFFFF" stroke="#1D3557" strokeWidth={2.2} />
            <Circle cx={46.5} cy={53.5} r={3} fill="#1D3557" />
            <Circle cx={73.5} cy={53.5} r={3} fill="#1D3557" />
            <G fill="#457B9D">
              <Circle cx={96} cy={40} r={2.4} />
              <Circle cx={104} cy={34} r={3.1} />
              <Circle cx={113} cy={27} r={3.8} />
            </G>
          </G>
        )}
      </Svg>
    </View>
  );
}
