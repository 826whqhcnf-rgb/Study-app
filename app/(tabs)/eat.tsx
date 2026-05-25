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

export default function Eat() {
  const insets = useSafeAreaInsets();
  const food = useStore((s) => s.state.today.food);
  const addFoodItem = useStore((s) => s.addFoodItem);
  const deleteFoodItem = useStore((s) => s.deleteFoodItem);

  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');

  const total = food.items.reduce((a, x) => a + (x.kcal ?? 0), 0);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const k = parseInt(kcal, 10);
    addFoodItem(trimmed, Number.isFinite(k) ? k : null);
    setName('');
    setKcal('');
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
      <View style={[s.card, { borderLeftColor: accent.food }]}>
        <View style={[s.stripe, { backgroundColor: accent.food }]} />
        <View style={s.head}>
          <View style={[s.icoWrap, { borderColor: accent.food }]}>
            <Text style={s.ico}>🥗</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Food Log</Text>
            <Text style={[s.reward, { color: accent.food }]}>
              +{XP.FOOD_PER_ITEM} XP/item · clear quest at {XP.FOOD_GOAL_ITEMS} items
            </Text>
          </View>
        </View>

        <View style={s.totalRow}>
          <Text style={s.totalK}>{food.items.length} item(s) today</Text>
          <Text style={s.totalV}>
            {total} <Text style={s.totalKSm}>kcal</Text>
          </Text>
        </View>

        {food.items.length === 0 ? (
          <Text style={s.empty}>Nothing logged yet — add what you eat below.</Text>
        ) : (
          food.items.map((it) => (
            <View key={it.id} style={s.row}>
              <Text style={s.rowName}>{it.name}</Text>
              {it.kcal !== null ? (
                <Text style={s.rowKcal}>{it.kcal} kcal</Text>
              ) : null}
              <Pressable
                onPress={() => deleteFoodItem(it.id)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${it.name}`}
              >
                <Text style={s.rowDel}>✕</Text>
              </Pressable>
            </View>
          ))
        )}

        <View style={s.addRow}>
          <TextInput
            style={[s.input, { flex: 2 }]}
            value={name}
            onChangeText={setName}
            placeholder="What did you eat?"
            placeholderTextColor={colors.faint}
            maxLength={50}
            returnKeyType="next"
          />
          <TextInput
            style={[s.input, { flex: 1, minWidth: 0 }]}
            value={kcal}
            onChangeText={setKcal}
            placeholder="kcal"
            placeholderTextColor={colors.faint}
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <Pressable
            style={[s.addBtn, { backgroundColor: accent.food }]}
            onPress={submit}
            disabled={!name.trim()}
            accessibilityRole="button"
            accessibilityLabel="Add food item"
          >
            <Text style={s.addGlyph}>+</Text>
          </Pressable>
        </View>

        <View style={s.note}>
          <Text style={s.noteText}>
            Calories are optional — log just the food if you prefer.
          </Text>
        </View>
      </View>
    </ScrollView>
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
  totalV: { fontFamily: fonts.displayBold, fontSize: 22, color: accent.food },
  totalKSm: { fontFamily: fonts.body, fontSize: 11, color: colors.faint },

  empty: { fontFamily: fonts.body, color: colors.faint, fontSize: 13, paddingVertical: space.sm },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 8,
  },
  rowName: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  rowKcal: { fontFamily: fonts.pixel, fontSize: 11, color: accent.food },
  rowDel: { color: colors.faint, fontSize: 15 },

  addRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
  },
  input: {
    backgroundColor: colors.wellDark,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  addBtn: {
    width: 46, height: 46, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  addGlyph: { color: '#102018', fontSize: 22, lineHeight: 26 },

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
});
