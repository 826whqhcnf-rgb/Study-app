import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/state/store';
import { XP } from '@/game';
import { accent, colors, fonts, radius, space } from '@/ui/theme';

const lower = (s: string) => s.trim().toLowerCase();

export default function Train() {
  const insets = useSafeAreaInsets();
  const today = useStore((s) => s.state.today);
  const prs = useStore((s) => s.state.prs);

  const addExercise = useStore((s) => s.addExercise);
  const deleteExercise = useStore((s) => s.deleteExercise);
  const addSet = useStore((s) => s.addSet);
  const deleteSet = useStore((s) => s.deleteSet);
  const setSetField = useStore((s) => s.setSetField);
  const finishWorkout = useStore((s) => s.finishWorkout);

  const [exerciseName, setExerciseName] = useState('');

  const w = today.workout;

  if (w.done) {
    return (
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.content,
          { paddingTop: insets.top + space.md },
        ]}
      >
        <View style={[s.card, { borderLeftColor: accent.workout }]}>
          <View style={[s.stripe, { backgroundColor: accent.workout }]} />
          <CardHead title="Workout Complete" reward="Logged for today" color={accent.workout} icon="💪" />
          <View style={s.summary}>
            <Text style={s.summaryBig}>{w.volume ?? 0} kg</Text>
            <Text style={s.summaryLbl}>
              total volume · {w.sets ?? 0} sets
            </Text>
          </View>
          <View style={s.noteSolid}>
            <Text style={s.noteText}>
              Nice work. Your top weights are saved as PRs — they’ll pre-fill the next time you log the same lift.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const submitExercise = () => {
    const trimmed = exerciseName.trim();
    if (!trimmed) return;
    addExercise(trimmed);
    setExerciseName('');
  };

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={[
        s.content,
        { paddingTop: insets.top + space.md, paddingBottom: space.xxl * 3 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[s.card, { borderLeftColor: accent.workout }]}>
        <View style={[s.stripe, { backgroundColor: accent.workout }]} />
        <CardHead
          title="Today’s Workout"
          reward={`+${XP.WORKOUT_BASE} XP +${XP.WORKOUT_PER_SET}/set · weights in kg`}
          color={accent.workout}
          icon="💪"
        />

        {w.exercises.length === 0 ? (
          <Text style={s.empty}>Add your first exercise to start logging sets.</Text>
        ) : (
          w.exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exerciseId={ex.id}
              name={ex.name}
              sets={ex.sets}
              pr={prs[lower(ex.name)] ?? null}
              onSetField={(i, f, v) => setSetField(ex.id, i, f, v)}
              onAddSet={() => addSet(ex.id)}
              onDeleteSet={(i) => deleteSet(ex.id, i)}
              onDelete={() => deleteExercise(ex.id)}
            />
          ))
        )}

        <View style={s.addRow}>
          <TextInput
            style={s.addInput}
            value={exerciseName}
            onChangeText={setExerciseName}
            placeholder="Exercise name (e.g. Bench Press)"
            placeholderTextColor={colors.faint}
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={submitExercise}
          />
          <Pressable
            style={[s.addBtn, { backgroundColor: accent.workout }]}
            onPress={submitExercise}
            disabled={!exerciseName.trim()}
            accessibilityRole="button"
          >
            <Text style={s.addGlyph}>+</Text>
          </Pressable>
        </View>

        <Pressable
          style={[s.finish, w.exercises.length === 0 ? s.finishDisabled : null]}
          onPress={() => finishWorkout()}
          disabled={w.exercises.length === 0}
          accessibilityRole="button"
        >
          <Text style={s.finishLabel}>Finish & Log Workout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function CardHead({
  title,
  reward,
  color,
  icon,
}: {
  title: string;
  reward: string;
  color: string;
  icon: string;
}) {
  return (
    <View style={s.head}>
      <View style={[s.icoWrap, { borderColor: color }]}>
        <Text style={s.ico}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.headTitle}>{title}</Text>
        <Text style={[s.headReward, { color }]}>{reward}</Text>
      </View>
    </View>
  );
}

function ExerciseCard({
  exerciseId,
  name,
  sets,
  pr,
  onSetField,
  onAddSet,
  onDeleteSet,
  onDelete,
}: {
  exerciseId: string;
  name: string;
  sets: { w: number | ''; r: number | '' }[];
  pr: number | null;
  onSetField: (i: number, f: 'w' | 'r', v: number | '') => void;
  onAddSet: () => void;
  onDeleteSet: (i: number) => void;
  onDelete: () => void;
}) {
  return (
    <View style={s.ex}>
      <View style={s.exHead}>
        <View style={{ flex: 1 }}>
          <Text style={s.exName}>{name}</Text>
          {pr !== null ? (
            <Text style={s.exHint}>
              PR <Text style={{ color: colors.gold }}>{pr} kg</Text>
            </Text>
          ) : null}
        </View>
        <Pressable onPress={onDelete} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Delete ${name}`}>
          <Text style={s.exDel}>🗑</Text>
        </Pressable>
      </View>
      {sets.map((set, i) => (
        <SetRow
          key={`${exerciseId}-${i}`}
          index={i}
          set={set}
          onChange={(f, v) => onSetField(i, f, v)}
          onDelete={() => onDeleteSet(i)}
        />
      ))}
      <Pressable style={s.addSet} onPress={onAddSet} accessibilityRole="button">
        <Text style={s.addSetLabel}>+ add set</Text>
      </Pressable>
    </View>
  );
}

function SetRow({
  index,
  set,
  onChange,
  onDelete,
}: {
  index: number;
  set: { w: number | ''; r: number | '' };
  onChange: (field: 'w' | 'r', value: number | '') => void;
  onDelete: () => void;
}) {
  const [wStr, setWStr] = useState(set.w === '' ? '' : String(set.w));
  const [rStr, setRStr] = useState(set.r === '' ? '' : String(set.r));

  const onChangeW = (t: string) => {
    setWStr(t);
    if (t === '') return onChange('w', '');
    const n = parseFloat(t);
    onChange('w', Number.isFinite(n) ? n : '');
  };
  const onChangeR = (t: string) => {
    setRStr(t);
    if (t === '') return onChange('r', '');
    const n = parseInt(t, 10);
    onChange('r', Number.isFinite(n) && n >= 0 ? n : '');
  };

  return (
    <View style={s.setRow}>
      <Text style={s.setNum}>{index + 1}</Text>
      <TextInput
        style={s.setInput}
        value={wStr}
        onChangeText={onChangeW}
        placeholder="kg"
        placeholderTextColor={colors.faint}
        keyboardType="decimal-pad"
        inputMode="decimal"
      />
      <Text style={s.setUnit}>kg</Text>
      <Text style={s.setX}>×</Text>
      <TextInput
        style={s.setInput}
        value={rStr}
        onChangeText={onChangeR}
        placeholder="reps"
        placeholderTextColor={colors.faint}
        keyboardType="number-pad"
        inputMode="numeric"
      />
      <Text style={s.setUnit}>reps</Text>
      <Pressable onPress={onDelete} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Delete set ${index + 1}`}>
        <Text style={s.rmSet}>✕</Text>
      </Pressable>
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
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md },
  icoWrap: {
    width: 40, height: 40, borderRadius: radius.md,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  ico: { fontSize: 20 },
  headTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  headReward: { fontFamily: fonts.bodySemi, fontSize: 11, marginTop: 2 },

  empty: { fontFamily: fonts.body, color: colors.faint, fontSize: 13, paddingVertical: space.md },

  ex: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: 11,
  },
  exHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  exName: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  exHint: { fontFamily: fonts.pixel, fontSize: 10, color: colors.faint, marginTop: 2 },
  exDel: { color: colors.faint, fontSize: 15 },

  setRow: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: 7,
  },
  setNum: {
    width: 20, textAlign: 'center',
    fontFamily: fonts.pixel, fontSize: 10, color: colors.faint,
  },
  setInput: {
    flex: 1,
    backgroundColor: colors.wellDark,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.sm,
    color: colors.ink,
    fontFamily: fonts.pixel,
    fontSize: 13,
    padding: 9,
    textAlign: 'center',
    minWidth: 0,
  },
  setUnit: { fontFamily: fonts.body, fontSize: 10, color: colors.faint, width: 26 },
  setX: { color: colors.faint, fontSize: 12 },
  rmSet: { color: colors.faint, fontSize: 14 },

  addSet: {
    backgroundColor: 'rgba(239,124,58,0.10)',
    borderColor: accent.workout,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    paddingVertical: space.sm,
    alignItems: 'center',
    marginTop: 2,
  },
  addSetLabel: { color: accent.workout, fontFamily: fonts.bodySemi, fontSize: 12 },

  addRow: {
    flexDirection: 'row', gap: space.sm, marginTop: space.md,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.wellDark,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  addBtn: {
    width: 46, height: 46, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  addGlyph: { color: '#1a120a', fontSize: 22, lineHeight: 26 },

  finish: {
    marginTop: space.md,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  finishDisabled: { opacity: 0.4 },
  finishLabel: {
    color: colors.inkOnGold,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },

  summary: { alignItems: 'center', paddingVertical: space.md },
  summaryBig: { fontFamily: fonts.displayBold, fontSize: 28, color: accent.workout },
  summaryLbl: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 4 },
  noteSolid: {
    marginTop: space.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  noteText: { fontFamily: fonts.body, color: colors.faint, fontSize: 11, lineHeight: 16 },
});
