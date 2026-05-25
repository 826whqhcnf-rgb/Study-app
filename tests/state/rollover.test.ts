import { freshState } from '../../src/state/initial';
import { applyDailyRollover } from '../../src/state/rollover';

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe('applyDailyRollover', () => {
  it('is a no-op when today is the same day as state.today.date', () => {
    const today = day(2026, 5, 24);
    const state = freshState(today);
    expect(applyDailyRollover(state, today)).toBe(state);
  });

  it('archives the previous day into history when the date has changed', () => {
    const yesterday = day(2026, 5, 23);
    const today = day(2026, 5, 24);
    const state = freshState(yesterday);
    state.today.earned = 75;
    state.today.workout.volume = 1200;
    state.today.study.minutes = 30;
    state.lastCompletedDate = '2026-05-23';

    const rolled = applyDailyRollover(state, today);

    expect(rolled.today.date).toBe('2026-05-24');
    expect(rolled.today.earned).toBe(0);
    expect(rolled.history['2026-05-23']).toEqual({
      xp: 75,
      volume: 1200,
      studyMin: 30,
    });
  });

  it('preserves cumulative XP, streak, PRs, lastWeight and habits across the rollover', () => {
    const today = day(2026, 5, 24);
    const state = freshState(day(2026, 5, 23));
    state.xp = 420;
    state.streak = 5;
    state.bestStreak = 9;
    state.lastCompletedDate = '2026-05-23';
    state.prs = { 'bench press': 100 };
    state.lastWeight = { 'bench press': 95 };
    state.habits = [{ id: 'h-custom', name: 'Stretch' }];

    const rolled = applyDailyRollover(state, today);

    expect(rolled.xp).toBe(420);
    expect(rolled.streak).toBe(5);
    expect(rolled.bestStreak).toBe(9);
    expect(rolled.prs).toEqual({ 'bench press': 100 });
    expect(rolled.lastWeight).toEqual({ 'bench press': 95 });
    expect(rolled.habits).toEqual([{ id: 'h-custom', name: 'Stretch' }]);
  });

  it('resets the streak to 0 when the last completion was 2+ days ago', () => {
    const today = day(2026, 5, 24);
    const state = freshState(day(2026, 5, 22));
    state.streak = 12;
    state.bestStreak = 12;
    state.lastCompletedDate = '2026-05-22';

    const rolled = applyDailyRollover(state, today);

    expect(rolled.streak).toBe(0);
    expect(rolled.bestStreak).toBe(12);
  });

  it('keeps the streak when yesterday was completed (still alive today)', () => {
    const today = day(2026, 5, 24);
    const state = freshState(day(2026, 5, 23));
    state.streak = 3;
    state.bestStreak = 3;
    state.lastCompletedDate = '2026-05-23';

    const rolled = applyDailyRollover(state, today);

    expect(rolled.streak).toBe(3);
  });

  it('omits optional volume/studyMin from history when they were not set', () => {
    const today = day(2026, 5, 24);
    const state = freshState(day(2026, 5, 23));
    state.today.earned = 15;

    const rolled = applyDailyRollover(state, today);

    expect(rolled.history['2026-05-23']).toEqual({ xp: 15 });
  });
});
