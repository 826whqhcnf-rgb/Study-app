export type CardRating = 'again' | 'hard' | 'good' | 'easy';

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: number;
  /** SM-2 fields */
  ease: number;
  interval: number; // in days
  repetitions: number;
  due: number; // epoch ms when card is next due
  lapses: number;
  lastReview?: number;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
  createdAt: number;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  deckId: string;
  rating: CardRating;
  at: number;
  prevInterval: number;
  newInterval: number;
}

export interface AppState {
  decks: Deck[];
  cards: Card[];
  logs: ReviewLog[];
}

export type Route =
  | { name: 'dashboard' }
  | { name: 'decks' }
  | { name: 'deck'; deckId: string }
  | { name: 'study'; deckId: string }
  | { name: 'quiz'; deckId: string }
  | { name: 'create' }
  | { name: 'stats' };
