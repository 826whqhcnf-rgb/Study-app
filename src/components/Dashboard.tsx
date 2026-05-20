import type { AppState, Route } from '../types';
import { dueCount, isDue } from '../sm2';

interface Props {
  state: AppState;
  setRoute: (r: Route) => void;
}

export default function Dashboard({ state, setRoute }: Props) {
  const totalCards = state.cards.length;
  const due = dueCount(state.cards);
  const learned = state.cards.filter((c) => c.repetitions > 0).length;

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - i));
    const next = day.getTime() + 24 * 60 * 60 * 1000;
    const count = state.logs.filter((l) => l.at >= day.getTime() && l.at < next).length;
    return { label: day.toLocaleDateString(undefined, { weekday: 'short' }), count };
  });
  const max7 = Math.max(1, ...last7.map((d) => d.count));

  const streak = computeStreak(state.logs);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Good to see you 👋</h1>
          <p className="text-ink-300 mt-1">Pick up where you left off, or generate something new.</p>
        </div>
        <button className="btn-primary" onClick={() => setRoute({ name: 'create' })}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New deck
        </button>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Stat label="Due today" value={due} accent="brand" />
        <Stat label="Cards" value={totalCards} />
        <Stat label="Learned" value={learned} />
        <Stat label="Streak" value={`${streak}d`} accent="green" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Last 7 days</h2>
              <p className="text-sm text-ink-300">Reviews completed</p>
            </div>
            <span className="chip">{state.logs.length} total</span>
          </div>
          <div className="mt-6 flex items-end gap-3 h-40">
            {last7.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-ink-800 rounded-md overflow-hidden flex items-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-md"
                    style={{ height: `${(d.count / max7) * 100}%` }}
                    title={`${d.count} reviews`}
                  />
                </div>
                <div className="text-xs text-ink-300">{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold">Jump back in</h2>
          <p className="text-sm text-ink-300">Decks with due cards</p>
          <div className="mt-4 space-y-2">
            {state.decks.length === 0 && (
              <div className="text-sm text-ink-400">No decks yet — create your first one.</div>
            )}
            {state.decks.map((d) => {
              const deckCards = state.cards.filter((c) => c.deckId === d.id);
              const deckDue = deckCards.filter((c) => isDue(c)).length;
              return (
                <button
                  key={d.id}
                  onClick={() => setRoute({ name: 'deck', deckId: d.id })}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-ink-800/70 border border-transparent hover:border-ink-700 transition text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-ink-800 grid place-items-center text-lg">{d.emoji || '📚'}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{d.name}</div>
                    <div className="text-xs text-ink-400">{deckCards.length} cards</div>
                  </div>
                  {deckDue > 0 ? (
                    <span className="chip border-brand-500/40 text-brand-200 bg-brand-500/10">{deckDue} due</span>
                  ) : (
                    <span className="chip">0 due</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Your decks</h2>
            <p className="text-sm text-ink-300">Tap a deck to study, quiz, or edit</p>
          </div>
          <button className="btn-ghost" onClick={() => setRoute({ name: 'decks' })}>See all</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {state.decks.slice(0, 6).map((d) => {
            const deckCards = state.cards.filter((c) => c.deckId === d.id);
            const deckDue = deckCards.filter((c) => isDue(c)).length;
            return (
              <button
                key={d.id}
                onClick={() => setRoute({ name: 'deck', deckId: d.id })}
                className="text-left card p-4 hover:border-brand-500/40 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{d.emoji || '📚'}</div>
                  <div className="font-medium truncate">{d.name}</div>
                </div>
                {d.description && <p className="text-xs text-ink-400 mt-2 line-clamp-2">{d.description}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <span className="chip">{deckCards.length} cards</span>
                  {deckDue > 0 && <span className="chip border-brand-500/40 text-brand-200 bg-brand-500/10">{deckDue} due</span>}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: 'brand' | 'green' }) {
  const ring =
    accent === 'brand' ? 'from-brand-500/30 to-brand-400/0'
    : accent === 'green' ? 'from-emerald-500/30 to-emerald-400/0'
    : 'from-ink-700/40 to-ink-700/0';
  return (
    <div className={`card p-4 bg-gradient-to-br ${ring}`}>
      <div className="text-xs text-ink-300 uppercase tracking-wider">{label}</div>
      <div className="text-2xl md:text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

function computeStreak(logs: AppState['logs']): number {
  if (logs.length === 0) return 0;
  const days = new Set<string>();
  for (const l of logs) {
    const d = new Date(l.at);
    d.setHours(0, 0, 0, 0);
    days.add(d.toISOString().slice(0, 10));
  }
  let streak = 0;
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  while (days.has(cur.toISOString().slice(0, 10))) {
    streak += 1;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}
