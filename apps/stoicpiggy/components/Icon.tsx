import { FontAwesome } from '@expo/vector-icons';

type FaName = keyof typeof FontAwesome.glyphMap;

/**
 * Thin wrapper over Font Awesome 4.7 (which @expo/vector-icons' FontAwesome set
 * matches) so screens can use the same icon names as the design's `fa fa-*`.
 */
export function Icon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  return <FontAwesome name={name as FaName} size={size} color={color} />;
}
