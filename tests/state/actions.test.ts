import * as a from '../../src/state/actions';
import { freshState } from '../../src/state/initial';
import type { State } from '../../src/state/types';

const today = new Date(2026, 4, 24);
const yesterday = new Date(2026, 4, 23);

function base(): State {
  return freshState(today);
}

// ---------------- Food ----------------

describe('addFoodItem', () => {
  it('ignores empty names', () => {
    const s = base();
    expect(a.addFoodItem(s, today, '   ', null)).toBe(s);
  });

  it('awards +8 XP per item for the first 6 items', () => {
    let s = base();
    for (let i = 0; i < 6; i++) {
      s = a.addFoodItem(s, today, `food-${i}`, null);
    }
    expect(s.today.food.items).toHaveLength(6);
    expect(s.today.food.xpCount).toBe(6);
    // 6 × 8 (per-item) + 20 (goal bonus at item 3) = 68
    expect(s.xp).toBe(68);
  });

  it('stops awarding per-item XP after the 6-item cap, even if more items are added', () => {
    let s = base();
    for (let i = 0; i < 8; i++) s = a.addFoodItem(s, today, `f-${i}`, null);
    expect(s.today.food.items).toHaveLength(8);
    expect(s.today.food.xpCount).toBe(6);
    expect(s.xp).toBe(68); // same as above; the 7th and 8th items add no XP
  });

  it('clears the food quest and grants the +20 bonus at 3 items, once per day', () => {
    let s = base();
    s = a.addFoodItem(s, today, 'a', null);
    s = a.addFoodItem(s, today, 'b', null);
    expect(s.today.food.done).toBe(false);
    expect(s.today.food.bonus).toBe(false);
    s = a.addFoodItem(s, today, 'c', null);
    expect(s.today.food.done).toBe(true);
    expect(s.today.food.bonus).toBe(true);
    // 3 × 8 + 20 = 44
    expect(s.xp).toBe(44);
  });

  it('starts a streak on the day the food quest clears', () => {
    let s = base();
    s = a.addFoodItem(s, today, 'a', null);
    s = a.addFoodItem(s, today, 'b', null);
    expect(s.streak).toBe(0);
    s = a.addFoodItem(s, today, 'c', null);
    expect(s.streak).toBe(1);
    expect(s.lastCompletedDate).toBe('2026-05-24');
  });

  it('preserves the xpCount cap across deletes (no XP farming)', () => {
    let s = base();
    for (let i = 0; i < 6; i++) s = a.addFoodItem(s, today, `f-${i}`, null);
    s = a.deleteFoodItem(s, s.today.food.items[0]!.id);
    expect(s.today.food.items).toHaveLength(5);
    expect(s.today.food.xpCount).toBe(6);
    const beforeXp = s.xp;
    s = a.addFoodItem(s, today, 'extra', null);
    expect(s.xp).toBe(beforeXp);
  });
});

// ---------------- Screen ----------------

describe('checkinScreen', () => {
  it('grants +50 XP and clears the quest when under the limit', () => {
    const s = a.checkinScreen(base(), 120, today);
    expect(s.today.screen.used).toBe(120);
    expect(s.today.screen.done).toBe(true);
    expect(s.xp).toBe(50);
    expect(s.streak).toBe(1);
  });

  it('records usage but grants no XP when over the limit', () => {
    const s = a.checkinScreen(base(), 240, today);
    expect(s.today.screen.used).toBe(240);
    expect(s.today.screen.done).toBe(false);
    expect(s.xp).toBe(0);
    expect(s.streak).toBe(0);
  });

  it('is idempotent once the quest is cleared', () => {
    const first = a.checkinScreen(base(), 120, today);
    const second = a.checkinScreen(first, 60, today);
    expect(second).toBe(first);
  });

  it('rejects negative or non-finite values', () => {
    const s = base();
    expect(a.checkinScreen(s, -5, today)).toBe(s);
    expect(a.checkinScreen(s, Number.NaN, today)).toBe(s);
  });
});

// ---------------- Study ----------------

describe('addStudyMinutes', () => {
  it('adds +1 XP per minute and counts the session', () => {
    const s = a.addStudyMinutes(base(), 25, today);
    expect(s.today.study.minutes).toBe(25);
    expect(s.today.study.sessions).toBe(1);
    expect(s.xp).toBe(25);
    expect(s.streak).toBe(1);
  });

  it('grants the +30 goal bonus on the session that crosses the goal', () => {
    let s = a.addStudyMinutes(base(), 30, today);
    expect(s.today.study.done).toBe(false);
    expect(s.xp).toBe(30);
    s = a.addStudyMinutes(s, 30, today);
    expect(s.today.study.done).toBe(true);
    // 30 + 30 (minutes) + 30 (bonus) = 90
    expect(s.xp).toBe(90);
  });

  it('does not grant the goal bonus twice', () => {
    let s = a.addStudyMinutes(base(), 60, today);
    expect(s.xp).toBe(90);
    s = a.addStudyMinutes(s, 30, today);
    // +30 minutes only, no extra bonus
    expect(s.xp).toBe(120);
  });

  it('rejects zero/negative minutes', () => {
    const s = base();
    expect(a.addStudyMinutes(s, 0, today)).toBe(s);
    expect(a.addStudyMinutes(s, -10, today)).toBe(s);
  });
});

// ---------------- Habits ----------------

describe('toggleHabit + add/delete', () => {
  it('checking grants +15 and starts a streak', () => {
    const s = a.toggleHabit(base(), 'h1', today);
    expect(s.today.habitsDone.h1).toBe(true);
    expect(s.xp).toBe(15);
    expect(s.streak).toBe(1);
  });

  it('unchecking subtracts +15 and removes the entry', () => {
    let s = a.toggleHabit(base(), 'h1', today);
    s = a.toggleHabit(s, 'h1', today);
    expect(s.today.habitsDone.h1).toBeUndefined();
    expect(s.xp).toBe(0);
  });

  it('ignores unknown habit ids', () => {
    const s = base();
    expect(a.toggleHabit(s, 'no-such-habit', today)).toBe(s);
  });

  it('addHabit appends a habit with a unique id', () => {
    const s = a.addHabit(base(), 'Stretch');
    expect(s.habits.at(-1)?.name).toBe('Stretch');
    expect(s.habits.at(-1)?.id).toMatch(/^h/);
  });

  it('deleteHabit removes the habit and clears any check on today', () => {
    let s = a.toggleHabit(base(), 'h1', today);
    s = a.deleteHabit(s, 'h1');
    expect(s.habits.find((h) => h.id === 'h1')).toBeUndefined();
    expect(s.today.habitsDone.h1).toBeUndefined();
  });
});

// ---------------- Workout ----------------

describe('exercises + sets', () => {
  it('addExercise creates a single set with empty fields by default', () => {
    const s = a.addExercise(base(), 'Bench Press');
    const ex = s.today.workout.exercises[0]!;
    expect(ex.name).toBe('Bench Press');
    expect(ex.sets).toHaveLength(1);
    expect(ex.sets[0]).toEqual({ w: '', r: '' });
  });

  it('addExercise pre-fills the weight from lastWeight if known', () => {
    let s = base();
    s.lastWeight = { 'bench press': 80 };
    s = a.addExercise(s, 'Bench Press');
    expect(s.today.workout.exercises[0]!.sets[0]!.w).toBe(80);
  });

  it('addSet inherits the previous set\'s weight inside the same exercise', () => {
    let s = a.addExercise(base(), 'Squat');
    const exId = s.today.workout.exercises[0]!.id;
    s = a.setSetField(s, exId, 0, 'w', 100);
    s = a.addSet(s, exId);
    const sets = s.today.workout.exercises[0]!.sets;
    expect(sets).toHaveLength(2);
    expect(sets[1]!.w).toBe(100);
  });

  it('deleteSet keeps at least one (blank) row', () => {
    let s = a.addExercise(base(), 'Deadlift');
    const exId = s.today.workout.exercises[0]!.id;
    s = a.deleteSet(s, exId, 0);
    expect(s.today.workout.exercises[0]!.sets).toEqual([{ w: '', r: '' }]);
  });
});

describe('finishWorkout', () => {
  function loaded(): State {
    let s = a.addExercise(base(), 'Bench Press');
    const exId = s.today.workout.exercises[0]!.id;
    s = a.setSetField(s, exId, 0, 'w', 60);
    s = a.setSetField(s, exId, 0, 'r', 10);
    s = a.addSet(s, exId);
    s = a.setSetField(s, exId, 1, 'w', 65);
    s = a.setSetField(s, exId, 1, 'r', 8);
    return s;
  }

  it('awards base + per-set bonus and records volume', () => {
    const s = a.finishWorkout(loaded(), today);
    expect(s.today.workout.done).toBe(true);
    expect(s.today.workout.sets).toBe(2);
    // volume = 60*10 + 65*8 = 1120
    expect(s.today.workout.volume).toBe(1120);
    // workoutXp(2) = 50 + 10 = 60
    expect(s.xp).toBe(60);
    expect(s.streak).toBe(1);
  });

  it('caps the set bonus at +30 regardless of set count', () => {
    let s = a.addExercise(base(), 'Curl');
    const exId = s.today.workout.exercises[0]!.id;
    for (let i = 0; i < 10; i++) {
      if (i > 0) s = a.addSet(s, exId);
      s = a.setSetField(s, exId, i, 'w', 20);
      s = a.setSetField(s, exId, i, 'r', 12);
    }
    s = a.finishWorkout(s, today);
    expect(s.today.workout.sets).toBe(10);
    expect(s.xp).toBe(80); // 50 + min(50, 30) = 80
  });

  it('records PRs case-insensitively and updates lastWeight', () => {
    const s = a.finishWorkout(loaded(), today);
    expect(s.prs['bench press']).toBe(65);
    expect(s.lastWeight['bench press']).toBe(65);
  });

  it('refuses to finish when no valid (weight+reps) sets exist', () => {
    let s = a.addExercise(base(), 'Plank');
    const exId = s.today.workout.exercises[0]!.id;
    s = a.setSetField(s, exId, 0, 'w', 30);
    // r left blank
    const after = a.finishWorkout(s, today);
    expect(after).toBe(s);
  });

  it('is idempotent once the workout is done', () => {
    const once = a.finishWorkout(loaded(), today);
    const twice = a.finishWorkout(once, today);
    expect(twice).toBe(once);
  });

  it('only increases an existing PR; never lowers it', () => {
    let s = loaded();
    s.prs = { 'bench press': 100 };
    s = a.finishWorkout(s, today);
    expect(s.prs['bench press']).toBe(100);
  });
});

// ---------------- Perfect Day ----------------

describe('Perfect Day bonus', () => {
  function clearAll(state: State): State {
    let s = a.addFoodItem(state, today, 'a', null);
    s = a.addFoodItem(s, today, 'b', null);
    s = a.addFoodItem(s, today, 'c', null);
    s = a.checkinScreen(s, 60, today);
    s = a.addStudyMinutes(s, 60, today);
    s = a.addExercise(s, 'Bench');
    const exId = s.today.workout.exercises.at(-1)!.id;
    s = a.setSetField(s, exId, 0, 'w', 60);
    s = a.setSetField(s, exId, 0, 'r', 10);
    s = a.finishWorkout(s, today);
    for (const h of s.habits) s = a.toggleHabit(s, h.id, today);
    return s;
  }

  it('grants +40 once all four quests and all habits are done', () => {
    const start = base();
    const before = start.xp;
    const done = clearAll(start);
    expect(done.today.perfect).toBe(true);
    // The total earned today should be:
    //   food: 3*8 + 20 = 44
    //   screen: 50
    //   study: 60 (minutes) + 30 (goal bonus) = 90
    //   workout: 50 + 5 (1 set) = 55
    //   habits: 4 × 15 = 60
    //   perfect: 40
    //   = 339
    expect(done.xp).toBe(before + 339);
  });

  it('does not double-fire if you uncheck and re-check a habit', () => {
    let s = clearAll(base());
    const xpAfterPerfect = s.xp;
    const h0 = s.habits[0]!.id;
    s = a.toggleHabit(s, h0, today); // uncheck (-15)
    s = a.toggleHabit(s, h0, today); // re-check (+15)
    expect(s.xp).toBe(xpAfterPerfect);
    expect(s.today.perfect).toBe(true);
  });
});

// ---------------- Settings / reset ----------------

describe('settings & reset', () => {
  it('setScreenLimit accepts positive integers only', () => {
    const s = base();
    expect(a.setScreenLimit(s, 120).config.screenLimitMin).toBe(120);
    expect(a.setScreenLimit(s, 0)).toBe(s);
    expect(a.setScreenLimit(s, -5)).toBe(s);
  });

  it('setStudyGoal accepts positive integers only', () => {
    const s = base();
    expect(a.setStudyGoal(s, 45).config.studyGoalMin).toBe(45);
    expect(a.setStudyGoal(s, 0)).toBe(s);
  });

  it('resetToday clears today but keeps xp, streak, habits, prs', () => {
    let s = a.toggleHabit(base(), 'h1', today);
    s = a.checkinScreen(s, 60, today);
    expect(s.xp).toBeGreaterThan(0);
    const xpBefore = s.xp;
    const streakBefore = s.streak;
    const habitsBefore = s.habits;
    s = a.resetToday(s);
    expect(s.today.earned).toBe(0);
    expect(s.today.habitsDone).toEqual({});
    expect(s.today.screen.done).toBe(false);
    expect(s.xp).toBe(xpBefore);
    expect(s.streak).toBe(streakBefore);
    expect(s.habits).toBe(habitsBefore);
  });
});
