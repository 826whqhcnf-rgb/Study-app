export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function yesterdayKey(today: Date = new Date()): string {
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

export function isYesterday(key: string, today: Date = new Date()): boolean {
  return key === yesterdayKey(today);
}

export function isToday(key: string, today: Date = new Date()): boolean {
  return key === dayKey(today);
}
