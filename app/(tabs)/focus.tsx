import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  AppState,
  type AppStateStatus,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { useStore } from '@/state/store';
import { XP } from '@/game';
import { accent, colors, fonts, radius, space } from '@/ui/theme';

const PRESETS = [15, 25, 45] as const;
const RADIUS = 54;
const CIRC = 2 * Math.PI * RADIUS;

export default function Focus() {
  const insets = useSafeAreaInsets();
  const study = useStore((s) => s.state.today.study);
  const goal = useStore((s) => s.state.config.studyGoalMin);
  const addStudyMinutes = useStore((s) => s.addStudyMinutes);

  const [selMin, setSelMin] = useState<number>(25);
  const [customText, setCustomText] = useState('');
  const [strict, setStrict] = useState(false);
  const [session, setSession] = useState<{ endAt: number; durSec: number } | null>(null);

  const onFinish = (durSec: number) => {
    setSession(null);
    addStudyMinutes(Math.round(durSec / 60));
  };

  const onCancel = () => setSession(null);

  if (session) {
    return (
      <RunningView
        insets={insets}
        endAt={session.endAt}
        durSec={session.durSec}
        strict={strict}
        onFinish={() => onFinish(session.durSec)}
        onCancel={onCancel}
      />
    );
  }

  const effectiveMin = (() => {
    const t = customText.trim();
    if (!t) return selMin;
    const n = parseInt(t, 10);
    return Number.isFinite(n) && n > 0 ? n : selMin;
  })();

  const start = () => {
    if (effectiveMin < 1) return;
    const durSec = effectiveMin * 60;
    setSession({ endAt: Date.now() + durSec * 1000, durSec });
  };

  const goalPct = Math.min(100, Math.round((study.minutes / goal) * 100));

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={[
        s.content,
        { paddingTop: insets.top + space.md, paddingBottom: space.xxl * 3 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[s.card, { borderLeftColor: accent.study }]}>
        <View style={[s.stripe, { backgroundColor: accent.study }]} />
        <View style={s.head}>
          <View style={[s.icoWrap, { borderColor: accent.study }]}>
            <Text style={s.ico}>🎯</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Study Focus</Text>
            <Text style={[s.reward, { color: accent.study }]}>
              +{XP.STUDY_PER_MIN} XP/min · goal {goal} min/day
            </Text>
          </View>
        </View>

        <View style={s.totalRow}>
          <Text style={s.totalK}>
            Focused today · {study.sessions} session(s)
          </Text>
          <Text style={s.totalV}>
            {study.minutes} <Text style={s.totalKSm}>min</Text>
          </Text>
        </View>

        <View style={s.barTrack}>
          <View style={[s.barFill, { width: `${goalPct}%` }]} />
        </View>
        <Text style={s.subline}>
          {study.minutes}/{goal} min
          {study.done ? ' · quest cleared ✓' : ''}
        </Text>

        <Text style={s.pickHint}>Pick a session length:</Text>
        <View style={s.picker}>
          {PRESETS.map((m) => {
            const selected = effectiveMin === m && customText.trim() === '';
            return (
              <Pressable
                key={m}
                style={[s.preset, selected ? s.presetOn : null]}
                onPress={() => {
                  setSelMin(m);
                  setCustomText('');
                }}
                accessibilityRole="button"
              >
                <Text style={[s.presetLabel, selected ? s.presetLabelOn : null]}>
                  {m} min
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={s.customRow}>
          <Text style={s.customLbl}>or custom:</Text>
          <TextInput
            style={s.customInput}
            value={customText}
            onChangeText={setCustomText}
            placeholder="min"
            placeholderTextColor={colors.faint}
            keyboardType="number-pad"
            inputMode="numeric"
          />
          <Text style={s.customLbl}>minutes</Text>
        </View>

        <Pressable
          style={[s.toggle, strict ? s.toggleOn : null]}
          onPress={() => setStrict((v) => !v)}
          accessibilityRole="switch"
          accessibilityState={{ checked: strict }}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.toggleTitle}>Strict Mode 🔒</Text>
            <Text style={s.toggleSub}>
              Leaving QuestLog ends the session with no XP. Real app-blocking lands with native iOS.
            </Text>
          </View>
          <View style={[s.sw, strict ? s.swOn : null]}>
            <View style={[s.swDot, strict ? s.swDotOn : null]} />
          </View>
        </Pressable>

        <Pressable style={s.begin} onPress={start} accessibilityRole="button">
          <Text style={s.beginLabel}>Begin {effectiveMin}-min Focus</Text>
        </Pressable>

        <View style={s.note}>
          <Text style={s.noteText}>
            A web/web-like app can’t lock other apps — Strict Mode only enforces presence while QuestLog is foregrounded.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function RunningView({
  insets,
  endAt,
  durSec,
  strict,
  onFinish,
  onCancel,
}: {
  insets: ReturnType<typeof useSafeAreaInsets>;
  endAt: number;
  durSec: number;
  strict: boolean;
  onFinish: () => void;
  onCancel: () => void;
}) {
  useKeepAwake();
  const [remaining, setRemaining] = useState(Math.max(0, endAt - Date.now()));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const rem = Math.max(0, endAt - Date.now());
      setRemaining(rem);
      if (rem <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        onFinish();
      }
    }, 250);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [endAt, onFinish]);

  useEffect(() => {
    if (!strict) return;
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next !== 'active' && !finishedRef.current) {
        finishedRef.current = true;
        onCancel();
      }
    });
    return () => sub.remove();
  }, [strict, onCancel]);

  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  const frac = durSec > 0 ? Math.min(1, Math.max(0, remaining / (durSec * 1000))) : 0;
  const offset = CIRC * (1 - frac);

  return (
    <View
      style={[
        s.scroll,
        {
          paddingTop: insets.top + space.md,
          paddingHorizontal: space.lg,
        },
      ]}
    >
      <View style={[s.card, { borderLeftColor: accent.study }]}>
        <View style={[s.stripe, { backgroundColor: accent.study }]} />
        <View style={s.head}>
          <View style={[s.icoWrap, { borderColor: accent.study }]}>
            <Text style={s.ico}>🎯</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Focus Session</Text>
            <Text style={[s.reward, { color: accent.study }]}>
              Stay in the app to earn XP
            </Text>
          </View>
        </View>

        <View style={s.ringWrap}>
          <Svg width={180} height={180} viewBox="0 0 130 130">
            <G rotation={-90} origin="65, 65">
              <Circle
                cx={65}
                cy={65}
                r={RADIUS}
                fill="none"
                stroke={colors.wellDark}
                strokeWidth={9}
              />
              <Circle
                cx={65}
                cy={65}
                r={RADIUS}
                fill="none"
                stroke={accent.study}
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={`${CIRC}`}
                strokeDashoffset={offset}
              />
            </G>
            <SvgText
              x={65}
              y={73}
              textAnchor="middle"
              fontSize={28}
              fontFamily={fonts.pixel}
              fill={colors.ink}
            >
              {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
            </SvgText>
          </Svg>
          <Text style={s.runHint}>
            {strict ? (
              <Text style={s.runStrict}>
                🔒 Strict mode — leaving the app fails the session
              </Text>
            ) : (
              'Keep QuestLog open to bank your focus minutes'
            )}
          </Text>
        </View>

        <Pressable
          style={s.cancel}
          onPress={() => {
            finishedRef.current = true;
            onCancel();
          }}
          accessibilityRole="button"
        >
          <Text style={s.cancelLabel}>Give Up Session</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.lg },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, opacity: 0.85 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  icoWrap: {
    width: 40, height: 40, borderRadius: radius.md,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  ico: { fontSize: 20 },
  title: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  reward: { fontFamily: fonts.bodySemi, fontSize: 11, marginTop: 2 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginVertical: space.sm,
  },
  totalK: { fontFamily: fonts.body, fontSize: 11, color: colors.faint },
  totalV: { fontFamily: fonts.displayBold, fontSize: 22, color: accent.study },
  totalKSm: { fontFamily: fonts.body, fontSize: 11, color: colors.faint },

  barTrack: {
    height: 8, borderRadius: radius.pill,
    backgroundColor: colors.wellDark,
    borderColor: colors.line, borderWidth: 1,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: accent.study },
  subline: { fontFamily: fonts.body, fontSize: 11, color: colors.faint, marginTop: 6 },

  pickHint: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: space.lg, marginBottom: 6 },
  picker: { flexDirection: 'row', gap: space.sm },
  preset: {
    flex: 1,
    backgroundColor: colors.wellDark,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  presetOn: { borderColor: accent.study, backgroundColor: 'rgba(118,174,230,0.14)' },
  presetLabel: { fontFamily: fonts.pixel, fontSize: 12, color: colors.ink },
  presetLabelOn: { color: accent.study },

  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.md,
    marginBottom: space.md,
  },
  customLbl: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  customInput: {
    width: 74,
    backgroundColor: colors.wellDark,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.sm,
    color: colors.ink,
    fontFamily: fonts.pixel,
    fontSize: 13,
    paddingHorizontal: space.sm,
    paddingVertical: 9,
    textAlign: 'center',
  },

  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: 6,
    gap: space.md,
  },
  toggleOn: { borderColor: colors.rose },
  toggleTitle: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  toggleSub: { fontFamily: fonts.body, fontSize: 11, color: colors.faint, marginTop: 2, lineHeight: 15 },
  sw: {
    width: 46, height: 26, borderRadius: radius.pill,
    backgroundColor: colors.wellDark,
    borderColor: colors.line, borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  swOn: { backgroundColor: 'rgba(232,138,160,0.35)', borderColor: colors.rose },
  swDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.faint,
  },
  swDotOn: { backgroundColor: colors.rose, marginLeft: 20 },

  begin: {
    marginTop: space.md,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  beginLabel: { color: colors.inkOnGold, fontFamily: fonts.bodyBold, fontSize: 14 },

  note: {
    marginTop: space.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  noteText: { fontFamily: fonts.body, color: colors.faint, fontSize: 11, lineHeight: 16 },

  ringWrap: { alignItems: 'center', paddingVertical: space.md },
  runHint: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 8, textAlign: 'center' },
  runStrict: { color: colors.rose, fontFamily: fonts.bodySemi },
  cancel: {
    marginTop: space.md,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelLabel: { color: colors.rose, fontFamily: fonts.bodySemi, fontSize: 14 },
});
