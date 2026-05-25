import { dayKey } from '@/lib/date';
import type { DayState, Habit, State } from './types';

export const DEFAULT_HABITS: ReadonlyArray<Habit> = [
  { id: 'h1', name: 'Drink water on waking' },
  { id: 'h2', name: 'Make the bed' },
  { id: 'h3', name: '10 min reading' },
  { id: 'h4', name: '5 min mindfulness' },
];

export const DEFAULT_CONFIG = {
  screenLimitMin: 180,
  studyGoalMin: 60,
} as const;

export function freshDay(date: string): DayState {
  return {
    date,
    workout: { exercises: [], done: false },
    food: { items: [], done: false, xpCount: 0, bonus: false },
    study: { minutes: 0, sessions: 0, done: false },
    screen: { used: null, done: false },
    habitsDone: {},
    earned: 0,
    perfect: false,
  };
}

export function freshState(today: Date = new Date()): State {
  const key = dayKey(today);
  return {
    version: 1,
    createdAt: key,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    config: { ...DEFAULT_CONFIG },
    habits: DEFAULT_HABITS.map((h) => ({ ...h })),
    prs: {},
    lastWeight: {},
    today: freshDay(key),
    history: {},
  };
}
