import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useStore } from '@/state/store';
import { colors, fonts, radius, space } from '@/ui/theme';

export default function Settings() {
  const router = useRouter();
  const config = useStore((s) => s.state.config);
  const setScreenLimit = useStore((s) => s.setScreenLimit);
  const setStudyGoal = useStore((s) => s.setStudyGoal);
  const resetToday = useStore((s) => s.resetToday);
  const resetAll = useStore((s) => s.resetAll);

  const [screenText, setScreenText] = useState(String(config.screenLimitMin));
  const [studyText, setStudyText] = useState(String(config.studyGoalMin));

  useEffect(() => {
    setScreenText(String(config.screenLimitMin));
  }, [config.screenLimitMin]);
  useEffect(() => {
    setStudyText(String(config.studyGoalMin));
  }, [config.studyGoalMin]);

  const commitScreen = () => {
    const v = parseInt(screenText, 10);
    if (Number.isFinite(v) && v > 0) setScreenLimit(v);
    else setScreenText(String(config.screenLimitMin));
  };
  const commitStudy = () => {
    const v = parseInt(studyText, 10);
    if (Number.isFinite(v) && v > 0) setStudyGoal(v);
    else setStudyText(String(config.studyGoalMin));
  };

  const confirmResetDay = () => {
    Alert.alert(
      'Reset Today',
      'Clear today’s progress? Your XP, level, and streak stay.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetToday();
            router.back();
          },
        },
      ],
    );
  };

  const confirmResetAll = () => {
    Alert.alert(
      'Erase All',
      'This wipes XP, level, streak, history — everything. Back to Level 1. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase',
          style: 'destructive',
          onPress: () => {
            resetAll();
            router.back();
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quest Master Options',
          headerShown: true,
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 17 },
        }}
      />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.lead}>Tune your adventure. Level &amp; streak stay safe.</Text>

        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Screen-time limit</Text>
            <Text style={s.sub}>Daily budget for the screen quest</Text>
          </View>
          <View style={s.inputCluster}>
            <TextInput
              style={s.input}
              value={screenText}
              onChangeText={setScreenText}
              onEndEditing={commitScreen}
              keyboardType="number-pad"
              inputMode="numeric"
              returnKeyType="done"
            />
            <Text style={s.unit}>min</Text>
          </View>
        </View>

        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Daily study goal</Text>
            <Text style={s.sub}>Focus minutes to clear the study quest</Text>
          </View>
          <View style={s.inputCluster}>
            <TextInput
              style={s.input}
              value={studyText}
              onChangeText={setStudyText}
              onEndEditing={commitStudy}
              keyboardType="number-pad"
              inputMode="numeric"
              returnKeyType="done"
            />
            <Text style={s.unit}>min</Text>
          </View>
        </View>

        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Reset today</Text>
            <Text style={s.sub}>Clears today only — keeps XP, level, streak</Text>
          </View>
          <Pressable style={s.btn} onPress={confirmResetDay} accessibilityRole="button">
            <Text style={s.btnLabel}>Reset Day</Text>
          </Pressable>
        </View>

        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>New game</Text>
            <Text style={s.sub}>Erases everything, back to Level 1</Text>
          </View>
          <Pressable
            style={[s.btn, s.btnDanger]}
            onPress={confirmResetAll}
            accessibilityRole="button"
          >
            <Text style={[s.btnLabel, s.btnLabelDanger]}>Erase All</Text>
          </Pressable>
        </View>

        <Pressable
          style={s.close}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={s.closeLabel}>Done</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xxl * 2 },
  lead: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    marginBottom: space.md,
    lineHeight: 19,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    gap: space.md,
  },
  label: { fontFamily: fonts.body, color: colors.ink, fontSize: 14 },
  sub: {
    fontFamily: fonts.body,
    color: colors.faint,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  inputCluster: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: {
    width: 72,
    backgroundColor: colors.wellDark,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.sm,
    color: colors.ink,
    fontFamily: fonts.pixel,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 7,
    textAlign: 'center',
  },
  unit: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  btn: {
    backgroundColor: colors.card2,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  btnLabel: { color: colors.ink, fontFamily: fonts.bodySemi, fontSize: 13 },
  btnDanger: { borderColor: colors.rose },
  btnLabelDanger: { color: colors.rose },
  close: {
    marginTop: space.lg,
    backgroundColor: colors.card2,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeLabel: { color: colors.muted, fontFamily: fonts.bodySemi, fontSize: 14 },
});
