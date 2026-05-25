import {
  XP,
  foodGoalReached,
  foodItemXp,
  screenUnderLimit,
  studyGoalCrossed,
  studyMinuteXp,
  workoutXp,
} from '../../src/game/xp';

describe('workoutXp', () => {
  it('returns base only when no sets are logged', () => {
    expect(workoutXp(0)).toBe(XP.WORKOUT_BASE);
  });

  it('adds +5 per set', () => {
    expect(workoutXp(1)).toBe(55);
    expect(workoutXp(4)).toBe(70);
  });

  it('caps the set bonus at +30 (i.e. 6 sets is the ceiling)', () => {
    expect(workoutXp(6)).toBe(80);
    expect(workoutXp(7)).toBe(80);
    expect(workoutXp(100)).toBe(80);
  });
});

describe('foodItemXp', () => {
  it('awards +8 for each of the first 6 items', () => {
    for (let i = 0; i < XP.FOOD_ITEM_CAP; i++) {
      expect(foodItemXp(i)).toBe(XP.FOOD_PER_ITEM);
    }
  });

  it('awards 0 once the per-day cap is reached', () => {
    expect(foodItemXp(6)).toBe(0);
    expect(foodItemXp(20)).toBe(0);
  });
});

describe('foodGoalReached', () => {
  it('clears the food quest at 3 items', () => {
    expect(foodGoalReached(2)).toBe(false);
    expect(foodGoalReached(3)).toBe(true);
    expect(foodGoalReached(10)).toBe(true);
  });
});

describe('studyMinuteXp', () => {
  it('awards +1 XP per minute', () => {
    expect(studyMinuteXp(0)).toBe(0);
    expect(studyMinuteXp(25)).toBe(25);
    expect(studyMinuteXp(45)).toBe(45);
  });

  it('floors fractional minutes and clamps negatives', () => {
    expect(studyMinuteXp(25.9)).toBe(25);
    expect(studyMinuteXp(-10)).toBe(0);
  });
});

describe('studyGoalCrossed', () => {
  it('is true only on the transition across the goal', () => {
    expect(studyGoalCrossed(0, 30, 60)).toBe(false);
    expect(studyGoalCrossed(40, 60, 60)).toBe(true);
    expect(studyGoalCrossed(50, 75, 60)).toBe(true);
    expect(studyGoalCrossed(60, 80, 60)).toBe(false);
  });
});

describe('screenUnderLimit', () => {
  it('clears the screen quest at or below the limit', () => {
    expect(screenUnderLimit(120, 180)).toBe(true);
    expect(screenUnderLimit(180, 180)).toBe(true);
    expect(screenUnderLimit(200, 180)).toBe(false);
  });
});
