import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, space } from '../theme';

export function Section({ title, pill }: { title: string; pill?: string }) {
  return (
    <View style={s.row}>
      <Text style={s.title}>{title}</Text>
      <View style={s.rule} />
      {pill ? <Text style={s.pill}>{pill}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.xxl,
    marginBottom: space.md,
    paddingHorizontal: space.xs,
  },
  title: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  rule: { flex: 1, height: 1, backgroundColor: colors.line },
  pill: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.faint,
    borderColor: colors.line,
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
  },
});
