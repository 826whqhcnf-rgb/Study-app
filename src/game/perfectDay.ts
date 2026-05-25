import type { DayState, Habit } from '../state/types';

export function allQuestsDone(day: DayState): boolean {
  return (
    day.workout.done && day.food.done && day.study.done && day.screen.done
  );
}

export function allHabitsChecked(day: DayState, habits: Habit[]): boolean {
  if (habits.length === 0) return false;
  return habits.every((h) => day.habitsDone[h.id] === true);
}

export function isPerfectDay(day: DayState, habits: Habit[]): boolean {
  return allQuestsDone(day) && allHabitsChecked(day, habits);
}
