import { create } from 'zustand';
import { levelFromXp } from '@/game';
import { shortId } from '@/lib/id';
import * as actions from './actions';
import { freshState } from './initial';
import { mmkvRepository } from './mmkvRepository';
import { applyDailyRollover } from './rollover';
import type { State } from './types';

export type XpFlash = { id: string; amount: number };

type Store = {
  state: State;
  pendingLevelUp: number | null;
  xpFlashes: XpFlash[];
  hydrated: boolean;

  bootstrap: () => void;
  clearPendingLevelUp: () => void;
  consumeXpFlash: (id: string) => void;

  addFoodItem: (name: string, kcal: number | null) => void;
  deleteFoodItem: (id: string) => void;

  checkinScreen: (used: number) => void;
  addStudyMinutes: (minutes: number) => void;

  toggleHabit: (id: string) => void;
  addHabit: (name: string) => void;
  deleteHabit: (id: string) => void;

  addExercise: (name: string) => void;
  deleteExercise: (id: string) => void;
  addSet: (exerciseId: string) => void;
  deleteSet: (exerciseId: string, setIndex: number) => void;
  setSetField: (
    exerciseId: string,
    setIndex: number,
    field: 'w' | 'r',
    value: number | '',
  ) => void;
  finishWorkout: () => void;

  setScreenLimit: (min: number) => void;
  setStudyGoal: (min: number) => void;
  resetToday: () => void;
  resetAll: () => void;
};

const FLASH_KEEP = 3;

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(state: State) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => mmkvRepository.save(state), 200);
}

export const useStore = create<Store>((set, get) => {
  const apply = (fn: (s: State) => State) => {
    const store = get();
    const beforeLevel = levelFromXp(store.state.xp).level;
    const beforeXp = store.state.xp;
    const next = fn(store.state);
    if (next === store.state) return;
    const afterLevel = levelFromXp(next.xp).level;
    const xpDelta = next.xp - beforeXp;
    const flashes =
      xpDelta > 0
        ? [...store.xpFlashes, { id: shortId('x'), amount: xpDelta }].slice(
            -FLASH_KEEP,
          )
        : store.xpFlashes;
    debouncedSave(next);
    set({
      state: next,
      pendingLevelUp:
        afterLevel > beforeLevel ? afterLevel : store.pendingLevelUp,
      xpFlashes: flashes,
    });
  };

  return {
    state: freshState(),
    pendingLevelUp: null,
    xpFlashes: [],
    hydrated: false,

    bootstrap: () => {
      const loaded = mmkvRepository.load();
      const base = loaded ?? freshState();
      const rolled = applyDailyRollover(base);
      if (rolled !== base) debouncedSave(rolled);
      set({ state: rolled, hydrated: true });
    },

    clearPendingLevelUp: () => set({ pendingLevelUp: null }),
    consumeXpFlash: (id) =>
      set((store) => ({ xpFlashes: store.xpFlashes.filter((f) => f.id !== id) })),

    addFoodItem: (name, kcal) =>
      apply((s) => actions.addFoodItem(s, new Date(), name, kcal)),
    deleteFoodItem: (id) => apply((s) => actions.deleteFoodItem(s, id)),

    checkinScreen: (used) =>
      apply((s) => actions.checkinScreen(s, used, new Date())),
    addStudyMinutes: (min) =>
      apply((s) => actions.addStudyMinutes(s, min, new Date())),

    toggleHabit: (id) => apply((s) => actions.toggleHabit(s, id, new Date())),
    addHabit: (name) => apply((s) => actions.addHabit(s, name)),
    deleteHabit: (id) => apply((s) => actions.deleteHabit(s, id)),

    addExercise: (name) => apply((s) => actions.addExercise(s, name)),
    deleteExercise: (id) => apply((s) => actions.deleteExercise(s, id)),
    addSet: (exId) => apply((s) => actions.addSet(s, exId)),
    deleteSet: (exId, i) => apply((s) => actions.deleteSet(s, exId, i)),
    setSetField: (exId, i, f, v) =>
      apply((s) => actions.setSetField(s, exId, i, f, v)),
    finishWorkout: () => apply((s) => actions.finishWorkout(s, new Date())),

    setScreenLimit: (min) => apply((s) => actions.setScreenLimit(s, min)),
    setStudyGoal: (min) => apply((s) => actions.setStudyGoal(s, min)),
    resetToday: () => apply((s) => actions.resetToday(s)),
    resetAll: () => {
      mmkvRepository.clear();
      const blank = freshState();
      debouncedSave(blank);
      set({ state: blank, pendingLevelUp: null, xpFlashes: [] });
    },
  };
});
