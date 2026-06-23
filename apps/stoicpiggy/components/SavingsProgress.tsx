import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

/** Gamified, spring-animated savings progress bar (Reanimated 4). */
export function SavingsProgress({ progress }: { progress: number }) {
  const fill = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, progress));
    fill.value = withSpring(clamped, { damping: 14, stiffness: 120 });
  }, [progress, fill]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 16,
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 999, backgroundColor: '#16a34a' },
});
