import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export function LevelCoin({ level }: { level: number }) {
  return (
    <View style={s.ring}>
      <View style={s.coin}>
        <Text style={s.lv}>LVL</Text>
        <Text style={s.num}>{level}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  ring: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2a2014',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coin: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lv: {
    fontFamily: fonts.pixel,
    fontSize: 6,
    color: '#3a2906',
    opacity: 0.8,
    marginBottom: 1,
  },
  num: {
    fontFamily: fonts.pixel,
    fontSize: 18,
    color: '#3a2906',
    lineHeight: 18,
  },
});
