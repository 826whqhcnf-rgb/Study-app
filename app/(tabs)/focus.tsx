import { View, Text, StyleSheet } from 'react-native';
import { accent, colors, fonts, radius, space } from '@/ui/theme';

export default function Focus() {
  return (
    <View style={s.screen}>
      <View style={[s.card, { borderLeftColor: accent.study }]}>
        <Text style={s.title}>Study Focus</Text>
        <Text style={s.sub}>+1 XP/min · +30 bonus at daily goal</Text>
        <Text style={s.placeholder}>Countdown ring + Strict Mode arrive in step 4.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: space.lg },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  sub: { fontFamily: fonts.body, color: accent.study, fontSize: 12, marginTop: space.xs },
  placeholder: { fontFamily: fonts.body, color: colors.faint, fontSize: 13, marginTop: space.md },
});
