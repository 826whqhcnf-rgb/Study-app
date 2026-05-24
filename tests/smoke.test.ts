import { dayKey, yesterdayKey, isYesterday, isToday } from '../src/lib/date';

describe('date helpers', () => {
  it('formats a known date as YYYY-MM-DD', () => {
    expect(dayKey(new Date(2026, 0, 15))).toBe('2026-01-15');
  });

  it('returns the previous day', () => {
    expect(yesterdayKey(new Date(2026, 0, 15))).toBe('2026-01-14');
  });

  it('handles month rollover', () => {
    expect(yesterdayKey(new Date(2026, 2, 1))).toBe('2026-02-28');
  });

  it('recognises today and yesterday', () => {
    const today = new Date(2026, 4, 24);
    expect(isToday('2026-05-24', today)).toBe(true);
    expect(isYesterday('2026-05-23', today)).toBe(true);
    expect(isYesterday('2026-05-22', today)).toBe(false);
  });
});
