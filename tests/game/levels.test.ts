import { levelFromXp, titleForLevel, xpReq } from '../../src/game/levels';

describe('xpReq', () => {
  it('matches the prototype formula 100 + (L-1)*60', () => {
    expect(xpReq(1)).toBe(100);
    expect(xpReq(2)).toBe(160);
    expect(xpReq(3)).toBe(220);
    expect(xpReq(10)).toBe(640);
  });
});

describe('levelFromXp', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, into: 0, need: 100 });
  });

  it('stays at level 1 below the level-2 threshold', () => {
    expect(levelFromXp(99)).toEqual({ level: 1, into: 99, need: 100 });
  });

  it('reaches level 2 exactly at 100 XP', () => {
    expect(levelFromXp(100)).toEqual({ level: 2, into: 0, need: 160 });
  });

  it('reaches level 3 at the cumulative threshold (100 + 160)', () => {
    expect(levelFromXp(260)).toEqual({ level: 3, into: 0, need: 220 });
  });

  it('reaches level 4 at the cumulative threshold (100 + 160 + 220)', () => {
    expect(levelFromXp(480)).toEqual({ level: 4, into: 0, need: 280 });
  });

  it('reports remainder progress within a level', () => {
    expect(levelFromXp(330)).toEqual({ level: 3, into: 70, need: 220 });
  });

  it('clamps negative totals to level 1 at 0', () => {
    expect(levelFromXp(-50)).toEqual({ level: 1, into: 0, need: 100 });
  });
});

describe('titleForLevel', () => {
  const cases: Array<[number, string]> = [
    [1, 'Novice'],
    [2, 'Novice'],
    [3, 'Apprentice'],
    [4, 'Apprentice'],
    [5, 'Adventurer'],
    [7, 'Adventurer'],
    [8, 'Trailblazer'],
    [10, 'Trailblazer'],
    [11, 'Knight'],
    [14, 'Champion'],
    [18, 'Hero'],
    [22, 'Legend'],
    [27, 'Mythic'],
    [33, 'Ascended'],
    [99, 'Ascended'],
  ];
  it.each(cases)('level %i → %s', (level, title) => {
    expect(titleForLevel(level)).toBe(title);
  });
});
