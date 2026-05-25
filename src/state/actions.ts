import {
  XP,
  foodGoalReached,
  foodItemXp,
  isPerfectDay,
  registerCompletion,
  screenUnderLimit,
  workoutXp,
} from '@/game';
import { shortId } from '@/lib/id';
import { freshDay } from './initial';
import type { Exercise, ExerciseSet, State } from './types';

const lower = (s: string) => s.trim().toLowerCase();

function addXp(state: State, delta: number): State {
  if (delta === 0) return state;
  return { ...state, xp: Math.max(0, state.xp + delta) };
}

function withCompletion(state: State, today: Date): State {
  const after = registerCompletion(state, today);
  if (after === state) return state;
  return {
    ...state,
    streak: after.streak,
    bestStreak: after.bestStreak,
    lastCompletedDate: after.lastCompletedDate,
  };
}

function withPerfectCheck(state: State, _today: Date): State {
  if (state.today.perfect) return state;
  if (!isPerfectDay(state.today, state.habits)) return state;
  const next: State = {
    ...state,
    today: {
      ...state.today,
      perfect: true,
      earned: state.today.earned + XP.PERFECT_DAY,
    },
  };
  return addXp(next, XP.PERFECT_DAY);
}

// ---------------- Food ----------------

export function addFoodItem(
  state: State,
  today: Date,
  name: string,
  kcal: number | null,
): State {
  const trimmed = name.trim();
  if (!trimmed) return state;
  const item = { id: shortId('f'), name: trimmed, kcal };

  let next: State = {
    ...state,
    today: {
      ...state.today,
      food: {
        ...state.today.food,
        items: [...state.today.food.items, item],
      },
    },
  };

  const itemXp = foodItemXp(state.today.food.xpCount);
  if (itemXp > 0) {
    next = {
      ...next,
      today: {
        ...next.today,
        food: { ...next.today.food, xpCount: next.today.food.xpCount + 1 },
        earned: next.today.earned + itemXp,
      },
    };
    next = addXp(next, itemXp);
  }

  if (foodGoalReached(next.today.food.items.length) && !next.today.food.done) {
    next = {
      ...next,
      today: { ...next.today, food: { ...next.today.food, done: true } },
    };
    if (!next.today.food.bonus) {
      next = {
        ...next,
        today: {
          ...next.today,
          food: { ...next.today.food, bonus: true },
          earned: next.today.earned + XP.FOOD_GOAL_BONUS,
        },
      };
      next = addXp(next, XP.FOOD_GOAL_BONUS);
    }
    next = withCompletion(next, today);
    next = withPerfectCheck(next, today);
  }

  return next;
}

export function deleteFoodItem(state: State, id: string): State {
  const items = state.today.food.items.filter((f) => f.id !== id);
  if (items.length === state.today.food.items.length) return state;
  return {
    ...state,
    today: { ...state.today, food: { ...state.today.food, items } },
  };
}

// ---------------- Screen ----------------

export function checkinScreen(state: State, used: number, today: Date): State {
  if (state.today.screen.done) return state;
  if (used < 0 || !Number.isFinite(used)) return state;

  const recorded: State = {
    ...state,
    today: { ...state.today, screen: { ...state.today.screen, used } },
  };

  if (!screenUnderLimit(used, state.config.screenLimitMin)) return recorded;

  let next: State = {
    ...recorded,
    today: {
      ...recorded.today,
      screen: { ...recorded.today.screen, done: true },
      earned: recorded.today.earned + XP.SCREEN_UNDER_LIMIT,
    },
  };
  next = addXp(next, XP.SCREEN_UNDER_LIMIT);
  next = withCompletion(next, today);
  next = withPerfectCheck(next, today);
  return next;
}

// ---------------- Study (focus session result) ----------------

export function addStudyMinutes(state: State, minutes: number, today: Date): State {
  const min = Math.floor(minutes);
  if (min <= 0) return state;

  let next: State = {
    ...state,
    today: {
      ...state.today,
      study: {
        ...state.today.study,
        minutes: state.today.study.minutes + min,
        sessions: state.today.study.sessions + 1,
      },
      earned: state.today.earned + min,
    },
  };
  next = addXp(next, min);
  next = withCompletion(next, today);

  if (
    next.today.study.minutes >= next.config.studyGoalMin &&
    !next.today.study.done
  ) {
    next = {
      ...next,
      today: {
        ...next.today,
        study: { ...next.today.study, done: true },
        earned: next.today.earned + XP.STUDY_GOAL_BONUS,
      },
    };
    next = addXp(next, XP.STUDY_GOAL_BONUS);
  }

  next = withPerfectCheck(next, today);
  return next;
}

// ---------------- Habits ----------------

export function toggleHabit(state: State, habitId: string, today: Date): State {
  const exists = state.habits.some((h) => h.id === habitId);
  if (!exists) return state;
  const isChecked = state.today.habitsDone[habitId] === true;

  if (isChecked) {
    const habitsDone = { ...state.today.habitsDone };
    delete habitsDone[habitId];
    const next: State = {
      ...state,
      today: {
        ...state.today,
        habitsDone,
        earned: state.today.earned - XP.HABIT,
      },
    };
    return addXp(next, -XP.HABIT);
  }

  let next: State = {
    ...state,
    today: {
      ...state.today,
      habitsDone: { ...state.today.habitsDone, [habitId]: true },
      earned: state.today.earned + XP.HABIT,
    },
  };
  next = addXp(next, XP.HABIT);
  next = withCompletion(next, today);
  next = withPerfectCheck(next, today);
  return next;
}

export function addHabit(state: State, name: string): State {
  const trimmed = name.trim();
  if (!trimmed) return state;
  return {
    ...state,
    habits: [...state.habits, { id: shortId('h'), name: trimmed }],
  };
}

export function deleteHabit(state: State, habitId: string): State {
  const habits = state.habits.filter((h) => h.id !== habitId);
  if (habits.length === state.habits.length) return state;
  const habitsDone = { ...state.today.habitsDone };
  delete habitsDone[habitId];
  return {
    ...state,
    habits,
    today: { ...state.today, habitsDone },
  };
}

// ---------------- Workout ----------------

export function addExercise(state: State, name: string): State {
  const trimmed = name.trim();
  if (!trimmed) return state;
  if (state.today.workout.done) return state;
  const lastW = state.lastWeight[lower(trimmed)];
  const initialSet: ExerciseSet = { w: lastW ?? '', r: '' };
  const exercise: Exercise = {
    id: shortId('e'),
    name: trimmed,
    sets: [initialSet],
  };
  return {
    ...state,
    today: {
      ...state.today,
      workout: {
        ...state.today.workout,
        exercises: [...state.today.workout.exercises, exercise],
      },
    },
  };
}

export function deleteExercise(state: State, id: string): State {
  if (state.today.workout.done) return state;
  const exercises = state.today.workout.exercises.filter((e) => e.id !== id);
  if (exercises.length === state.today.workout.exercises.length) return state;
  return {
    ...state,
    today: { ...state.today, workout: { ...state.today.workout, exercises } },
  };
}

export function addSet(state: State, exerciseId: string): State {
  if (state.today.workout.done) return state;
  const exIdx = state.today.workout.exercises.findIndex((e) => e.id === exerciseId);
  if (exIdx === -1) return state;
  const ex = state.today.workout.exercises[exIdx]!;
  const lastSet = ex.sets[ex.sets.length - 1];
  let prefillW: number | '' = '';
  if (lastSet && lastSet.w !== '') {
    prefillW = lastSet.w;
  } else {
    const last = state.lastWeight[lower(ex.name)];
    if (last !== undefined) prefillW = last;
  }
  const newSets: ExerciseSet[] = [...ex.sets, { w: prefillW, r: '' }];
  const exercises = state.today.workout.exercises.map((e, i) =>
    i === exIdx ? { ...e, sets: newSets } : e,
  );
  return {
    ...state,
    today: { ...state.today, workout: { ...state.today.workout, exercises } },
  };
}

export function deleteSet(state: State, exerciseId: string, setIndex: number): State {
  if (state.today.workout.done) return state;
  const exIdx = state.today.workout.exercises.findIndex((e) => e.id === exerciseId);
  if (exIdx === -1) return state;
  const ex = state.today.workout.exercises[exIdx]!;
  if (setIndex < 0 || setIndex >= ex.sets.length) return state;
  const trimmed = ex.sets.filter((_, i) => i !== setIndex);
  const newSets: ExerciseSet[] = trimmed.length > 0 ? trimmed : [{ w: '', r: '' }];
  const exercises = state.today.workout.exercises.map((e, i) =>
    i === exIdx ? { ...e, sets: newSets } : e,
  );
  return {
    ...state,
    today: { ...state.today, workout: { ...state.today.workout, exercises } },
  };
}

export function setSetField(
  state: State,
  exerciseId: string,
  setIndex: number,
  field: 'w' | 'r',
  value: number | '',
): State {
  if (state.today.workout.done) return state;
  const exIdx = state.today.workout.exercises.findIndex((e) => e.id === exerciseId);
  if (exIdx === -1) return state;
  const ex = state.today.workout.exercises[exIdx]!;
  if (setIndex < 0 || setIndex >= ex.sets.length) return state;
  const newSets = ex.sets.map((s, i) => (i === setIndex ? { ...s, [field]: value } : s));
  const exercises = state.today.workout.exercises.map((e, i) =>
    i === exIdx ? { ...e, sets: newSets } : e,
  );
  return {
    ...state,
    today: { ...state.today, workout: { ...state.today.workout, exercises } },
  };
}

export function finishWorkout(state: State, today: Date): State {
  const w = state.today.workout;
  if (w.done) return state;

  let setsCount = 0;
  let volume = 0;
  const maxByExercise = new Map<string, number>();

  for (const ex of w.exercises) {
    const key = lower(ex.name);
    for (const s of ex.sets) {
      const ww = typeof s.w === 'number' ? s.w : NaN;
      const rr = typeof s.r === 'number' ? s.r : NaN;
      if (Number.isFinite(ww) && Number.isFinite(rr) && rr > 0) {
        setsCount++;
        volume += ww * rr;
        if (ww > (maxByExercise.get(key) ?? 0)) maxByExercise.set(key, ww);
      }
    }
  }

  if (setsCount === 0) return state;

  const prs = { ...state.prs };
  for (const [name, max] of maxByExercise) {
    if (max > (prs[name] ?? 0)) prs[name] = max;
  }

  const lastWeight = { ...state.lastWeight };
  for (const ex of w.exercises) {
    const tail = ex.sets[ex.sets.length - 1];
    if (tail && typeof tail.w === 'number') {
      lastWeight[lower(ex.name)] = tail.w;
    }
  }

  const bonus = workoutXp(setsCount);

  let next: State = {
    ...state,
    prs,
    lastWeight,
    today: {
      ...state.today,
      workout: { ...w, done: true, volume, sets: setsCount },
      earned: state.today.earned + bonus,
    },
  };
  next = addXp(next, bonus);
  next = withCompletion(next, today);
  next = withPerfectCheck(next, today);
  return next;
}

// ---------------- Settings ----------------

export function setScreenLimit(state: State, min: number): State {
  if (!Number.isFinite(min) || min <= 0) return state;
  return { ...state, config: { ...state.config, screenLimitMin: Math.floor(min) } };
}

export function setStudyGoal(state: State, min: number): State {
  if (!Number.isFinite(min) || min <= 0) return state;
  return { ...state, config: { ...state.config, studyGoalMin: Math.floor(min) } };
}

export function resetToday(state: State): State {
  return { ...state, today: freshDay(state.today.date) };
}
