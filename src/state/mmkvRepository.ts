import { MMKV } from 'react-native-mmkv';
import type { State } from './types';
import type { Repository } from './repository';

const KEY = 'questlog:v1:state';
const storage = new MMKV({ id: 'questlog' });

export const mmkvRepository: Repository = {
  load() {
    const raw = storage.getString(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as State;
    } catch {
      return null;
    }
  },
  save(state) {
    storage.set(KEY, JSON.stringify(state));
  },
  clear() {
    storage.delete(KEY);
  },
};
