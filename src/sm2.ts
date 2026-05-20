import type { Card, CardRating } from './types';

const DAY = 24 * 60 * 60 * 1000;

export function newCardDefaults(): Pick<Card, 'ease' | 'interval' | 'repetitions' | 'due' | 'lapses'> {
  return {
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    due: Date.now(),
    lapses: 0,
  };
}

/**
 * SM-2 inspired scheduler with four rating buttons:
 *   again -> reset, short delay
 *   hard  -> small growth
 *   good  -> standard growth
 *   easy  -> aggressive growth
 *
 * Returns updated scheduling fields.
 */
export function schedule(card: Card, rating: CardRating, now: number = Date.now()): Card {
  let { ease, interval, repetitions, lapses } = card;

  if (rating === 'again') {
    repetitions = 0;
    lapses += 1;
    interval = 0; // minutes-level relearn
    ease = Math.max(1.3, ease - 0.2);
    const due = now + 10 * 60 * 1000; // 10 minutes
    return { ...card, ease, interval, repetitions, lapses, due, lastReview: now };
  }

  // Quality mapping
  const q = rating === 'hard' ? 3 : rating === 'good' ? 4 : 5;

  if (repetitions === 0) {
    interval = rating === 'easy' ? 4 : 1;
  } else if (repetitions === 1) {
    interval = rating === 'easy' ? 7 : rating === 'hard' ? 3 : 6;
  } else {
    const factor = rating === 'hard' ? 1.2 : rating === 'easy' ? ease * 1.3 : ease;
    interval = Math.round(interval * factor);
  }

  // Ease adjustment (SM-2 formula adapted)
  ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  ease = Math.max(1.3, Math.min(3.0, ease));

  repetitions += 1;
  const due = now + Math.max(1, interval) * DAY;

  return { ...card, ease, interval, repetitions, lapses, due, lastReview: now };
}

export function isDue(card: Card, now: number = Date.now()): boolean {
  return card.due <= now;
}

export function dueCount(cards: Card[], now: number = Date.now()): number {
  return cards.filter((c) => isDue(c, now)).length;
}

export function nextDueCard(cards: Card[], now: number = Date.now()): Card | undefined {
  const due = cards.filter((c) => isDue(c, now));
  if (due.length === 0) return undefined;
  // Prioritize new cards first, then earliest due
  due.sort((a, b) => {
    if (a.repetitions === 0 && b.repetitions !== 0) return -1;
    if (b.repetitions === 0 && a.repetitions !== 0) return 1;
    return a.due - b.due;
  });
  return due[0];
}
