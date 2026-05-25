import { Pressable, Text, View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, fonts, radius, space } from '../theme';

type Props = {
  accent: string;
  icon: string;
  title: string;
  subtitle: string;
  done: boolean;
  onPress?: () => void;
};

export function QuestChip({ accent, icon, title, subtitle, done, onPress }: Props) {
  const containerStyle: ViewStyle[] = [
    s.chip,
    done ? { borderColor: accent, opacity: 0.92 } : null,
  ].filter(Boolean) as ViewStyle[];

  const inner = (
    <>
      <View style={[s.stripe, { backgroundColor: accent }]} />
      {done ? <Text style={[s.badge, { color: accent }]}>✓ DONE</Text> : null}
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.sub}>{subtitle}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable style={containerStyle} onPress={onPress} accessibilityRole="button">
        {inner}
      </Pressable>
    );
  }
  return <View style={containerStyle}>{inner}</View>;
}

const s = StyleSheet.create({
  chip: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.md,
    minHeight: 110,
    overflow: 'hidden',
    position: 'relative',
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.85,
  },
  badge: {
    position: 'absolute',
    top: 11,
    right: 12,
    fontFamily: fonts.pixel,
    fontSize: 7,
  },
  icon: { fontSize: 22 },
  title: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.ink,
    marginTop: 6,
  },
  sub: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});
