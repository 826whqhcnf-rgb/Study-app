export type DayKey = string;

export type ExerciseSet = { w: number | ''; r: number | '' };

export type Exercise = {
  id: string;
  name: string;
  sets: ExerciseSet[];
};

export type FoodItem = {
  id: string;
  name: string;
  kcal: number | null;
};

export type Habit = {
  id: string;
  name: string;
};

export type DayState = {
  date: DayKey;
  workout: {
    exercises: Exercise[];
    done: boolean;
    volume?: number;
    sets?: number;
  };
  food: {
    items: FoodItem[];
    done: boolean;
    xpCount: number;
    bonus: boolean;
  };
  study: {
    minutes: number;
    sessions: number;
    done: boolean;
  };
  screen: {
    used: number | null;
    done: boolean;
  };
  habitsDone: Record<string, boolean>;
  earned: number;
  perfect: boolean;
};

export type HistoryEntry = {
  xp: number;
  volume?: number;
  studyMin?: number;
};

export type Config = {
  screenLimitMin: number;
  studyGoalMin: number;
};

export type State = {
  version: number;
  createdAt: DayKey;
  xp: number;
  streak: number;
  bestStreak: number;
  lastCompletedDate: DayKey | null;
  config: Config;
  habits: Habit[];
  prs: Record<string, number>;
  lastWeight: Record<string, number>;
  today: DayState;
  history: Record<DayKey, HistoryEntry>;
};
