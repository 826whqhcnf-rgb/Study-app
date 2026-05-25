import { applyStreakRollover } from '@/game';
import { dayKey } from '@/lib/date';
import { freshDay } from './initial';
import type { HistoryEntry, State } from './types';

export function applyDailyRollover(state: State, today: Date = new Date()): State {
  const todayKey = dayKey(today);

  if (state.today.date === todayKey) {
    const after = applyStreakRollover(state, today);
    return after.streak === state.streak ? state : { ...state, streak: after.streak };
  }

  const entry: HistoryEntry = { xp: state.today.earned };
  if (state.today.workout.volume !== undefined) entry.volume = state.today.workout.volume;
  if (state.today.study.minutes > 0) entry.studyMin = state.today.study.minutes;

  const rolled: State = {
    ...state,
    today: freshDay(todayKey),
    history: { ...state.history, [state.today.date]: entry },
  };

  const after = applyStreakRollover(rolled, today);
  return { ...rolled, streak: after.streak };
}
