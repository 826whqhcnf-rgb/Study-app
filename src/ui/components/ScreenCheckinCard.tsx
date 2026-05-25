import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { accent, colors, fonts, radius, space } from '../theme';

type Props = {
  done: boolean;
  used: number | null;
  limitMin: number;
  rewardXp: number;
  onLog: (used: number) => void;
};

export function ScreenCheckinCard({ done, used, limitMin, rewardXp, onLog }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    const v = parseInt(text, 10);
    if (Number.isFinite(v) && v >= 0) {
      onLog(v);
      setText('');
    }
  };

  return (
    <View style={[s.card, { borderLeftColor: accent.screen }]}>
      <View style={[s.stripe, { backgroundColor: accent.screen }]} />
      <View style={s.head}>
        <View style={[s.icoWrap, { borderColor: accent.screen }]}>
          <Text style={s.ico}>📵</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Screen-Time Check-in</Text>
          <Text style={[s.reward, { color: accent.screen }]}>
            +{rewardXp} XP if under {limitMin} min
          </Text>
        </View>
      </View>

      {done ? (
        <View style={[s.noteSolid, { borderColor: accent.screen }]}>
          <Text style={[s.noteText, { color: accent.screen }]}>
            🛡️ Focus held — {used != null ? `${used} min used today` : 'logged'}
          </Text>
        </View>
      ) : (
        <View style={s.row}>
          <TextInput
            style={s.input}
            value={text}
            onChangeText={setText}
            placeholder="minutes used today"
            placeholderTextColor={colors.faint}
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <Pressable
            style={[s.go, !text ? s.goDisabled : null]}
            onPress={submit}
            disabled={!text}
          >
            <Text style={s.goLabel}>Log</Text>
          </Pressable>
        </View>
      )}

      <View style={s.noteDashed}>
        <Text style={s.noteFaintText}>
          Live screen-time sync needs a native iOS module — for now, enter it manually
          from your phone’s Settings.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    marginTop: space.md,
    position: 'relative',
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.85,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.xs,
  },
  icoWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ico: { fontSize: 20 },
  title: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  reward: { fontFamily: fonts.bodySemi, fontSize: 11, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.wellDark,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.ink,
    fontFamily: fonts.pixel,
    fontSize: 14,
    paddingHorizontal: space.md,
    paddingVertical: 11,
  },
  go: {
    height: 43,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goDisabled: { opacity: 0.4 },
  goLabel: {
    color: colors.inkOnGold,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  noteSolid: {
    marginTop: space.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  noteText: { fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  noteDashed: {
    marginTop: space.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  noteFaintText: {
    fontFamily: fonts.body,
    color: colors.faint,
    fontSize: 11,
    lineHeight: 16,
  },
});
