import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { XP } from '@/game';
import { accent, colors, fonts, radius, space } from '../theme';
import type { Habit } from '@/state/types';

type Props = {
  habits: Habit[];
  habitsDone: Record<string, boolean>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string) => void;
};

export function HabitsList({ habits, habitsDone, onToggle, onDelete, onAdd }: Props) {
  const [name, setName] = useState('');
  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  return (
    <View style={s.wrap}>
      {habits.length === 0 ? (
        <Text style={s.empty}>No habits yet — add one below.</Text>
      ) : (
        habits.map((h) => {
          const done = habitsDone[h.id] === true;
          return (
            <View key={h.id} style={[s.row, done ? s.rowDone : null]}>
              <Pressable
                style={[s.check, done ? s.checkOn : null]}
                onPress={() => onToggle(h.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                hitSlop={6}
              >
                {done ? <Text style={s.checkGlyph}>✓</Text> : null}
              </Pressable>
              <Text style={[s.name, done ? s.nameDone : null]}>{h.name}</Text>
              <Text style={s.xp}>+{XP.HABIT}</Text>
              <Pressable
                style={s.del}
                onPress={() => onDelete(h.id)}
                accessibilityRole="button"
                accessibilityLabel={`Delete habit ${h.name}`}
                hitSlop={6}
              >
                <Text style={s.delGlyph}>✕</Text>
              </Pressable>
            </View>
          );
        })
      )}
      <View style={s.addRow}>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="Add a daily habit…"
          placeholderTextColor={colors.faint}
          maxLength={50}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <Pressable
          style={s.addBtn}
          onPress={submit}
          accessibilityRole="button"
          accessibilityLabel="Add habit"
          disabled={!name.trim()}
        >
          <Text style={s.addGlyph}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 9 },
  empty: { fontFamily: fonts.body, color: colors.faint, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowDone: { opacity: 0.62 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: accent.food, borderColor: accent.food },
  checkGlyph: { color: '#102018', fontSize: 15, fontFamily: fonts.bodyBold },
  name: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  nameDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  xp: { fontFamily: fonts.bodySemi, fontSize: 11, color: accent.food },
  del: { padding: 2 },
  delGlyph: { color: colors.faint, fontSize: 16 },
  addRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.xs,
  },
  input: {
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
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: accent.food,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGlyph: { color: '#102018', fontSize: 22, lineHeight: 26 },
});
