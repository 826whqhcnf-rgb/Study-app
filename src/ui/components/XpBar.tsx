import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export function XpBar({ into, need }: { into: number; need: number }) {
  const pct = need > 0 ? Math.min(100, Math.max(0, (into / need) * 100)) : 0;
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${pct}%` }]} />
    </View>
  );
}

const s = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.wellDark,
    borderColor: colors.line,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.gold,
  },
});
