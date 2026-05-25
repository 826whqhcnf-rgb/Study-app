import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { titleForLevel } from '@/game';
import { useStore } from '@/state/store';
import { colors, fonts, radius, space } from '../theme';

export function LevelUpModal() {
  const pending = useStore((s) => s.pendingLevelUp);
  const clear = useStore((s) => s.clearPendingLevelUp);

  return (
    <Modal
      visible={pending !== null}
      transparent
      animationType="fade"
      onRequestClose={clear}
    >
      <View style={s.bg}>
        <View style={s.card}>
          <Text style={s.burst}>🎉</Text>
          <Text style={s.heading}>LEVEL UP</Text>
          <Text style={s.bigLevel}>{pending ?? ''}</Text>
          <Text style={s.body}>
            You are now a{' '}
            <Text style={s.titleEm}>
              {pending !== null ? titleForLevel(pending) : ''}
            </Text>
            .{'\n'}Keep the streak alive, hero.
          </Text>
          <Pressable style={s.cta} onPress={clear} accessibilityRole="button">
            <Text style={s.ctaLabel}>Continue the Quest</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: 'rgba(8,5,3,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xxl,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 26,
    alignItems: 'center',
    maxWidth: 340,
  },
  burst: { fontSize: 48, marginBottom: 6 },
  heading: {
    fontFamily: fonts.pixel,
    fontSize: 13,
    color: colors.gold,
    letterSpacing: 1,
    marginTop: 4,
  },
  bigLevel: {
    fontFamily: fonts.displayBold,
    fontSize: 44,
    color: colors.goldSoft,
    marginTop: 4,
  },
  body: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 20,
  },
  titleEm: { color: colors.ink, fontFamily: fonts.displayItalic },
  cta: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 30,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  ctaLabel: {
    color: colors.inkOnGold,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
});
