import { View, Text, StyleSheet } from 'react-native';
import { accent, colors, fonts, radius, space } from '@/ui/theme';

export default function Train() {
  return (
    <View style={s.screen}>
      <View style={[s.card, { borderLeftColor: accent.workout }]}>
        <Text style={s.title}>Today's Workout</Text>
        <Text style={s.sub}>+50 XP base · +5 per set (cap +30)</Text>
        <Text style={s.placeholder}>Exercise + set logging arrives in step 4.</Text>
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
  sub: { fontFamily: fonts.body, color: accent.workout, fontSize: 12, marginTop: space.xs },
  placeholder: { fontFamily: fonts.body, color: colors.faint, fontSize: 13, marginTop: space.md },
});
