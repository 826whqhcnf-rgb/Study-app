import { dayKey, isToday, isYesterday } from '../lib/date';

export type StreakState = {
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
};

export function applyStreakRollover(
  state: StreakState,
  today: Date = new Date(),
): StreakState {
  if (!state.lastCompletedDate) return state;
  if (isToday(state.lastCompletedDate, today)) return state;
  if (isYesterday(state.lastCompletedDate, today)) return state;
  if (state.streak === 0) return state;
  return { ...state, streak: 0 };
}

export function registerCompletion(
  state: StreakState,
  today: Date = new Date(),
): StreakState {
  const key = dayKey(today);
  if (state.lastCompletedDate === key) return state;
  const continued = state.lastCompletedDate
    ? isYesterday(state.lastCompletedDate, today)
    : false;
  const streak = continued ? state.streak + 1 : 1;
  const bestStreak = Math.max(state.bestStreak, streak);
  return { ...state, streak, bestStreak, lastCompletedDate: key };
}
