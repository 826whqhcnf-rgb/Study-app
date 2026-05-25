import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/state/store';
import { XP, levelFromXp, titleForLevel } from '@/game';
import { accent, colors, fonts, radius, space } from '@/ui/theme';
import {
  TopStrip,
  Section,
  QuestChip,
  ScreenCheckinCard,
  HabitsList,
} from '@/ui/components';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const xp = useStore((s) => s.state.xp);
  const streak = useStore((s) => s.state.streak);
  const bestStreak = useStore((s) => s.state.bestStreak);
  const today = useStore((s) => s.state.today);
  const habits = useStore((s) => s.state.habits);
  const config = useStore((s) => s.state.config);

  const checkinScreen = useStore((s) => s.checkinScreen);
  const toggleHabit = useStore((s) => s.toggleHabit);
  const addHabit = useStore((s) => s.addHabit);
  const deleteHabit = useStore((s) => s.deleteHabit);

  const li = levelFromXp(xp);
  const title = titleForLevel(li.level);
  const cleared =
    [today.workout.done, today.food.done, today.study.done, today.screen.done].filter(
      Boolean,
    ).length;

  const workoutSub = today.workout.done
    ? `Volume ${today.workout.volume ?? 0} kg`
    : `${today.workout.exercises.length} exercise(s) logged`;

  const foodSub = today.food.done
    ? `${today.food.items.length} items eaten`
    : `${today.food.items.length}/${XP.FOOD_GOAL_ITEMS} healthy items`;

  const studySub = today.study.done
    ? `${today.study.minutes} min focused`
    : `${today.study.minutes}/${config.studyGoalMin} min today`;

  const screenSub = `Under ${config.screenLimitMin} min · +${XP.SCREEN_UNDER_LIMIT} XP`;

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={[
        s.content,
        { paddingTop: insets.top + space.md, paddingBottom: space.xxl * 3 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <TopStrip
        level={li.level}
        title={title}
        into={li.into}
        need={li.need}
        streak={streak}
      />

      <View style={s.hero}>
        <Text style={s.heroTitle}>
          Quest<Text style={s.heroTitleEm}>Log</Text>
        </Text>
        <Text style={s.heroSub}>
          {cleared}/4 main quests cleared
          {today.perfect ? ' · 🌟 Perfect Day!' : ''}
        </Text>
        <View style={s.stats}>
          <Stat label="Total XP" value={xp} />
          <Stat label="Best Streak" value={bestStreak} />
          <Stat label="XP Today" value={today.earned} />
        </View>
      </View>

      <Section title="Daily Quests" pill={`${cleared}/4`} />
      <View style={s.chips}>
        <View style={s.chipRow}>
          <QuestChip
            accent={accent.workout}
            icon="💪"
            title="Move Your Body"
            subtitle={workoutSub}
            done={today.workout.done}
            onPress={() => router.push('/train')}
          />
          <QuestChip
            accent={accent.food}
            icon="🥗"
            title="Nourish"
            subtitle={foodSub}
            done={today.food.done}
            onPress={() => router.push('/eat')}
          />
        </View>
        <View style={s.chipRow}>
          <QuestChip
            accent={accent.study}
            icon="🎯"
            title="Sharpen the Mind"
            subtitle={studySub}
            done={today.study.done}
            onPress={() => router.push('/focus')}
          />
          <QuestChip
            accent={accent.screen}
            icon="📵"
            title="Tame the Screen"
            subtitle={screenSub}
            done={today.screen.done}
          />
        </View>
      </View>

      <ScreenCheckinCard
        done={today.screen.done}
        used={today.screen.used}
        limitMin={config.screenLimitMin}
        rewardXp={XP.SCREEN_UNDER_LIMIT}
        onLog={checkinScreen}
      />

      <Section title="Habit Side-Quests" pill={`+${XP.HABIT} EACH`} />
      <HabitsList
        habits={habits}
        habitsDone={today.habitsDone}
        onToggle={toggleHabit}
        onAdd={addHabit}
        onDelete={deleteHabit}
      />
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.stat}>
      <Text style={s.statV}>{value}</Text>
      <Text style={s.statK}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.lg, gap: 0 },
  hero: {
    marginTop: space.md,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: space.lg,
  },
  heroTitle: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.ink },
  heroTitleEm: { color: colors.gold, fontFamily: fonts.displayItalic },
  heroSub: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, marginTop: 2 },
  stats: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.xs,
    alignItems: 'center',
  },
  statV: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.ink },
  statK: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.faint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  chips: { gap: 11 },
  chipRow: { flexDirection: 'row', gap: 11 },
});
