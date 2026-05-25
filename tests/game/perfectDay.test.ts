import { allHabitsChecked, allQuestsDone, isPerfectDay } from '../../src/game/perfectDay';
import type { DayState, Habit } from '../../src/state/types';

function makeDay(overrides: Partial<DayState> = {}): DayState {
  return {
    date: '2026-05-24',
    workout: { exercises: [], done: false },
    food: { items: [], done: false, xpCount: 0, bonus: false },
    study: { minutes: 0, sessions: 0, done: false },
    screen: { used: null, done: false },
    habitsDone: {},
    earned: 0,
    perfect: false,
    ...overrides,
  };
}

const habits: Habit[] = [
  { id: 'h1', name: 'Water' },
  { id: 'h2', name: 'Read' },
];

const allDone = (): DayState =>
  makeDay({
    workout: { exercises: [], done: true },
    food: { items: [], done: true, xpCount: 3, bonus: true },
    study: { minutes: 60, sessions: 1, done: true },
    screen: { used: 100, done: true },
    habitsDone: { h1: true, h2: true },
  });

describe('allQuestsDone', () => {
  it('is true only when all four main quests are cleared', () => {
    expect(allQuestsDone(allDone())).toBe(true);
    expect(allQuestsDone(makeDay())).toBe(false);
  });

  it('is false if any single quest is missing', () => {
    const d = allDone();
    d.screen.done = false;
    expect(allQuestsDone(d)).toBe(false);
  });
});

describe('allHabitsChecked', () => {
  it('is false when the user has no habits', () => {
    expect(allHabitsChecked(allDone(), [])).toBe(false);
  });

  it('is true when every habit is checked', () => {
    expect(allHabitsChecked(allDone(), habits)).toBe(true);
  });

  it('is false when a single habit is missing', () => {
    const d = allDone();
    d.habitsDone = { h1: true };
    expect(allHabitsChecked(d, habits)).toBe(false);
  });

  it('treats explicit false as unchecked', () => {
    const d = allDone();
    d.habitsDone = { h1: true, h2: false };
    expect(allHabitsChecked(d, habits)).toBe(false);
  });
});

describe('isPerfectDay', () => {
  it('requires both all quests and all habits', () => {
    expect(isPerfectDay(allDone(), habits)).toBe(true);
  });

  it('fails if a quest is missing', () => {
    const d = allDone();
    d.workout.done = false;
    expect(isPerfectDay(d, habits)).toBe(false);
  });

  it('fails if a habit is missing', () => {
    const d = allDone();
    delete d.habitsDone.h2;
    expect(isPerfectDay(d, habits)).toBe(false);
  });

  it('fails when the user has no habits at all', () => {
    expect(isPerfectDay(allDone(), [])).toBe(false);
  });
});
