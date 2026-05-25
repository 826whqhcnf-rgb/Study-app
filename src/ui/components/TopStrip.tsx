import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, space } from '../theme';
import { LevelCoin } from './LevelCoin';
import { XpBar } from './XpBar';
import { StreakFlame } from './StreakFlame';

type Props = {
  level: number;
  title: string;
  into: number;
  need: number;
  streak: number;
};

export function TopStrip({ level, title, into, need, streak }: Props) {
  const router = useRouter();
  return (
    <View style={s.strip}>
      <LevelCoin level={level} />
      <View style={s.mid}>
        <Text style={s.name}>
          The <Text style={s.nameEm}>{title}</Text>
        </Text>
        <View style={{ marginTop: space.xs }}>
          <XpBar into={into} need={need} />
        </View>
      </View>
      <StreakFlame streak={streak} />
      <Pressable
        style={s.gear}
        onPress={() => router.push('/settings')}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        hitSlop={8}
      >
        <Text style={s.gearGlyph}>⚙</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.md,
  },
  mid: { flex: 1, minWidth: 0 },
  name: { fontFamily: fonts.display, fontSize: 14, color: colors.ink },
  nameEm: { fontFamily: fonts.displayItalic, color: colors.goldSoft },
  gear: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearGlyph: { color: colors.muted, fontSize: 16 },
});
