import { formatMoney } from '@stoicpiggy/shared';
import { StyleSheet, Text, View } from 'react-native';

export function BalancePill({ amountCents }: { amountCents: number }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{formatMoney(amountCents)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#16a34a',
  },
  text: { color: '#ffffff', fontWeight: '700', fontSize: 20 },
});
