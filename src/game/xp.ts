export const XP = {
  HABIT: 15,
  PERFECT_DAY: 40,
  SCREEN_UNDER_LIMIT: 50,
  FOOD_PER_ITEM: 8,
  FOOD_ITEM_CAP: 6,
  FOOD_GOAL_ITEMS: 3,
  FOOD_GOAL_BONUS: 20,
  WORKOUT_BASE: 50,
  WORKOUT_PER_SET: 5,
  WORKOUT_SET_BONUS_CAP: 30,
  STUDY_PER_MIN: 1,
  STUDY_GOAL_BONUS: 30,
} as const;

export function workoutXp(setsLogged: number): number {
  const setBonus = Math.min(setsLogged * XP.WORKOUT_PER_SET, XP.WORKOUT_SET_BONUS_CAP);
  return XP.WORKOUT_BASE + setBonus;
}

export function foodItemXp(itemsAlreadyAwarded: number): number {
  return itemsAlreadyAwarded < XP.FOOD_ITEM_CAP ? XP.FOOD_PER_ITEM : 0;
}

export function foodGoalReached(itemCount: number): boolean {
  return itemCount >= XP.FOOD_GOAL_ITEMS;
}

export function studyMinuteXp(minutes: number): number {
  return Math.max(0, Math.floor(minutes)) * XP.STUDY_PER_MIN;
}

export function studyGoalCrossed(
  prevMinutes: number,
  newMinutes: number,
  goalMin: number,
): boolean {
  return prevMinutes < goalMin && newMinutes >= goalMin;
}

export function screenUnderLimit(usedMin: number, limitMin: number): boolean {
  return usedMin <= limitMin;
}
