import type { AppState } from '../types';
import { isDue } from '../sm2';

interface Props {
  state: AppState;
}

export default function Stats({ state }: Props) {
  const total = state.cards.length;
  const learned = state.cards.filter((c) => c.repetitions > 0).length;
  const due = state.cards.filter((c) => isDue(c)).length;
  const mature = state.cards.filter((c) => c.interval >= 21).length;

  const last30 = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (29 - i));
    const next = d.getTime() + 24 * 60 * 60 * 1000;
    const count = state.logs.filter((l) => l.at >= d.getTime() && l.at < next).length;
    return { date: d, count };
  });
  const max = Math.max(1, ...last30.map((d) => d.count));

  const totalReviews = state.logs.length;
  const correct = state.logs.filter((l) => l.rating !== 'again').length;
  const accuracy = totalReviews === 0 ? 0 : Math.round((correct / totalReviews) * 100);

  const byDeck = state.decks.map((d) => {
    const cards = state.cards.filter((c) => c.deckId === d.id);
    const reviews = state.logs.filter((l) => l.deckId === d.id).length;
    return { deck: d, cards: cards.length, reviews };
  }).sort((a, b) => b.reviews - a.reviews);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="text-ink-300 mt-1">A snapshot of your learning over time.</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total cards" value={total} />
        <Stat label="Learned" value={learned} />
        <Stat label="Mature" value={mature} />
        <Stat label="Due today" value={due} />
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Last 30 days</h2>
            <p className="text-sm text-ink-300">{totalReviews} total reviews · {accuracy}% recall</p>
          </div>
        </div>
        <div className="mt-6 flex items-end gap-1.5 h-40">
          {last30.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.count} reviews · ${d.date.toLocaleDateString()}`}>
              <div className="w-full bg-ink-800 rounded-md overflow-hidden flex items-end h-full">
                <div
                  className={`w-full rounded-md ${d.count === 0 ? 'bg-transparent' : 'bg-gradient-to-t from-brand-600 to-brand-400'}`}
                  style={{ height: `${(d.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-ink-500">
          <span>{last30[0].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <span>{last30[last30.length - 1].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold mb-3">Activity by deck</h2>
        {byDeck.length === 0 ? (
          <div className="text-ink-300 text-sm">Create a deck to see stats here.</div>
        ) : (
          <ul className="space-y-2">
            {byDeck.map((row) => (
              <li key={row.deck.id} className="flex items-center gap-3">
                <div className="text-xl">{row.deck.emoji || '📚'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{row.deck.name}</div>
                  <div className="text-xs text-ink-400">{row.cards} cards</div>
                </div>
                <div className="w-1/3">
                  <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${Math.min(100, (row.reviews / Math.max(1, totalReviews)) * 100)}%` }} />
                  </div>
                </div>
                <div className="text-sm w-12 text-right">{row.reviews}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-ink-300 uppercase tracking-wider">{label}</div>
      <div className="text-2xl md:text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
