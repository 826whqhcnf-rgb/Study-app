import type { AppState, Card, Deck, ReviewLog } from './types';
import { newCardDefaults } from './sm2';

const KEY = 'gist.appState.v1';

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

const seedDecks: Deck[] = [
  {
    id: 'seed-bio',
    name: 'Cell Biology Basics',
    description: 'Foundational concepts about cells, organelles and processes.',
    emoji: '🧬',
    color: 'from-emerald-500/30 to-cyan-500/20',
    createdAt: Date.now(),
  },
  {
    id: 'seed-fr',
    name: 'French — Common Verbs',
    description: 'Top 30 French verbs and their English meanings.',
    emoji: '🇫🇷',
    color: 'from-rose-500/30 to-amber-500/20',
    createdAt: Date.now(),
  },
];

const seedCardData: Array<{ deckId: string; front: string; back: string }> = [
  { deckId: 'seed-bio', front: 'What is the powerhouse of the cell?', back: 'The mitochondrion — it produces ATP via cellular respiration.' },
  { deckId: 'seed-bio', front: 'Which organelle synthesizes proteins?', back: 'The ribosome.' },
  { deckId: 'seed-bio', front: 'What separates the inside of a cell from its environment?', back: 'The plasma (cell) membrane — a phospholipid bilayer.' },
  { deckId: 'seed-bio', front: 'Where is genetic information stored in eukaryotes?', back: 'In the nucleus, organized as chromatin/chromosomes.' },
  { deckId: 'seed-bio', front: 'What process converts glucose to pyruvate?', back: 'Glycolysis, occurring in the cytoplasm.' },
  { deckId: 'seed-fr', front: 'être', back: 'to be' },
  { deckId: 'seed-fr', front: 'avoir', back: 'to have' },
  { deckId: 'seed-fr', front: 'faire', back: 'to do / to make' },
  { deckId: 'seed-fr', front: 'aller', back: 'to go' },
  { deckId: 'seed-fr', front: 'pouvoir', back: 'to be able to / can' },
  { deckId: 'seed-fr', front: 'vouloir', back: 'to want' },
  { deckId: 'seed-fr', front: 'savoir', back: 'to know (a fact)' },
];

function freshState(): AppState {
  const cards: Card[] = seedCardData.map((c) => ({
    id: uid(),
    deckId: c.deckId,
    front: c.front,
    back: c.back,
    createdAt: Date.now(),
    ...newCardDefaults(),
  }));
  return { decks: seedDecks, cards, logs: [] };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = freshState();
      saveState(s);
      return s;
    }
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.decks || !parsed.cards) return freshState();
    parsed.logs ||= [];
    return parsed;
  } catch {
    return freshState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importState(json: string): AppState | null {
  try {
    const parsed = JSON.parse(json) as AppState;
    if (!parsed.decks || !parsed.cards) return null;
    parsed.logs ||= [];
    return parsed;
  } catch {
    return null;
  }
}

export function logReview(state: AppState, log: ReviewLog): AppState {
  return { ...state, logs: [...state.logs.slice(-1999), log] };
}
