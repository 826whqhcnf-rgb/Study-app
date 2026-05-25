import { applyStreakRollover, registerCompletion, StreakState } from '../../src/game/streaks';

const today = new Date(2026, 4, 24); // 2026-05-24
const yesterday = '2026-05-23';
const twoDaysAgo = '2026-05-22';

const fresh = (): StreakState => ({
  streak: 0,
  bestStreak: 0,
  lastCompletedDate: null,
});

describe('registerCompletion', () => {
  it('starts a streak at 1 on the first completion ever', () => {
    const next = registerCompletion(fresh(), today);
    expect(next.streak).toBe(1);
    expect(next.bestStreak).toBe(1);
    expect(next.lastCompletedDate).toBe('2026-05-24');
  });

  it('is idempotent within the same day', () => {
    const first = registerCompletion(fresh(), today);
    const second = registerCompletion(first, today);
    expect(second).toBe(first);
  });

  it('increments the streak when yesterday was completed', () => {
    const state: StreakState = { streak: 4, bestStreak: 4, lastCompletedDate: yesterday };
    const next = registerCompletion(state, today);
    expect(next.streak).toBe(5);
    expect(next.bestStreak).toBe(5);
    expect(next.lastCompletedDate).toBe('2026-05-24');
  });

  it('resets the streak to 1 after a gap of 2+ days', () => {
    const state: StreakState = { streak: 12, bestStreak: 12, lastCompletedDate: twoDaysAgo };
    const next = registerCompletion(state, today);
    expect(next.streak).toBe(1);
    expect(next.bestStreak).toBe(12);
  });

  it('preserves bestStreak when the current streak is lower', () => {
    const state: StreakState = { streak: 0, bestStreak: 30, lastCompletedDate: null };
    const next = registerCompletion(state, today);
    expect(next.bestStreak).toBe(30);
    expect(next.streak).toBe(1);
  });
});

describe('applyStreakRollover', () => {
  it('does nothing when nothing has ever been completed', () => {
    const state = fresh();
    expect(applyStreakRollover(state, today)).toBe(state);
  });

  it('does nothing when the last completion was today', () => {
    const state: StreakState = { streak: 3, bestStreak: 3, lastCompletedDate: '2026-05-24' };
    expect(applyStreakRollover(state, today)).toBe(state);
  });

  it('does nothing when the last completion was yesterday (streak still alive)', () => {
    const state: StreakState = { streak: 3, bestStreak: 3, lastCompletedDate: yesterday };
    expect(applyStreakRollover(state, today)).toBe(state);
  });

  it('resets the streak to 0 when the gap is 2+ days', () => {
    const state: StreakState = { streak: 9, bestStreak: 9, lastCompletedDate: twoDaysAgo };
    const next = applyStreakRollover(state, today);
    expect(next.streak).toBe(0);
    expect(next.bestStreak).toBe(9);
    expect(next.lastCompletedDate).toBe(twoDaysAgo);
  });
});
