import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export function StreakFlame({ streak }: { streak: number }) {
  return (
    <View style={s.wrap}>
      <Text style={s.flame}>🔥</Text>
      <Text style={s.num}>{streak}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 34 },
  flame: { fontSize: 18 },
  num: { fontFamily: fonts.pixel, fontSize: 12, color: colors.ember },
});
