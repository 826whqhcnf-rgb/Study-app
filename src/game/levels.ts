export const xpReq = (level: number): number => 100 + (level - 1) * 60;

export type LevelInfo = {
  level: number;
  into: number;
  need: number;
};

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  while (remaining >= xpReq(level)) {
    remaining -= xpReq(level);
    level++;
  }
  return { level, into: remaining, need: xpReq(level) };
}

export const TITLE_THRESHOLDS: ReadonlyArray<readonly [number, string]> = [
  [1, 'Novice'],
  [3, 'Apprentice'],
  [5, 'Adventurer'],
  [8, 'Trailblazer'],
  [11, 'Knight'],
  [14, 'Champion'],
  [18, 'Hero'],
  [22, 'Legend'],
  [27, 'Mythic'],
  [33, 'Ascended'],
];

export function titleForLevel(level: number): string {
  let title = 'Novice';
  for (const [threshold, name] of TITLE_THRESHOLDS) {
    if (level >= threshold) title = name;
  }
  return title;
}
