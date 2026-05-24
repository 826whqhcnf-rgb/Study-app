import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors, fonts, radius, space } from '@/ui/theme';

export default function Home() {
  return (
    <View style={s.screen}>
      <View style={s.strip}>
        <View style={s.coin}>
          <Text style={s.coinLv}>LVL</Text>
          <Text style={s.coinNum}>1</Text>
        </View>
        <View style={s.stripMid}>
          <Text style={s.stripName}>
            The <Text style={s.stripNameEm}>Novice</Text>
          </Text>
          <View style={s.miniBar}>
            <View style={[s.miniFill, { width: '0%' }]} />
          </View>
        </View>
        <View style={s.strk}>
          <Text style={s.flame}>🔥</Text>
          <Text style={s.strkNum}>0</Text>
        </View>
        <Link href="/settings" asChild>
          <Pressable style={s.gear}>
            <Text style={s.gearGlyph}>⚙</Text>
          </Pressable>
        </Link>
      </View>

      <View style={s.hero}>
        <Text style={s.heroTitle}>
          Quest<Text style={s.heroTitleEm}>Log</Text>
        </Text>
        <Text style={s.heroSub}>
          Scaffold ready. Game module and screens land in steps 1–4.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: space.lg,
    gap: space.md,
  },
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
  coin: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinLv: { fontFamily: fonts.pixel, fontSize: 6, color: '#3a2906' },
  coinNum: { fontFamily: fonts.pixel, fontSize: 18, color: '#3a2906', lineHeight: 18 },
  stripMid: { flex: 1, minWidth: 0 },
  stripName: { fontFamily: fonts.display, fontSize: 14, color: colors.ink },
  stripNameEm: { fontFamily: fonts.displayItalic, color: colors.goldSoft },
  miniBar: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.wellDark,
    borderColor: colors.line,
    borderWidth: 1,
    marginTop: space.xs,
    overflow: 'hidden',
  },
  miniFill: { height: '100%', backgroundColor: colors.gold },
  strk: { alignItems: 'center', minWidth: 34 },
  flame: { fontSize: 18 },
  strkNum: { fontFamily: fonts.pixel, fontSize: 12, color: colors.ember },
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
  hero: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: space.lg,
  },
  heroTitle: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.ink },
  heroTitleEm: { color: colors.gold, fontFamily: fonts.displayItalic },
  heroSub: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    marginTop: space.xs,
  },
});
