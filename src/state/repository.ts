import type { State } from './types';

export interface Repository {
  load(): State | null;
  save(state: State): void;
  clear(): void;
}
