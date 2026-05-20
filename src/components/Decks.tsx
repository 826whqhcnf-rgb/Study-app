import { useState } from 'react';
import type { AppState, Route } from '../types';
import { isDue } from '../sm2';

interface Props {
  state: AppState;
  setState: (s: AppState) => void;
  setRoute: (r: Route) => void;
}

export default function Decks({ state, setState, setRoute }: Props) {
  const [q, setQ] = useState('');
  const decks = state.decks.filter(
    (d) =>
      d.name.toLowerCase().includes(q.toLowerCase()) ||
      (d.description ?? '').toLowerCase().includes(q.toLowerCase()),
  );

  function deleteDeck(id: string) {
    if (!confirm('Delete this deck and all its cards?')) return;
    setState({
      ...state,
      decks: state.decks.filter((d) => d.id !== id),
      cards: state.cards.filter((c) => c.deckId !== id),
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Decks</h1>
          <p className="text-ink-300 mt-1">Browse and manage everything you're learning.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="input w-64"
            placeholder="Search decks…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn-primary" onClick={() => setRoute({ name: 'create' })}>+ New</button>
        </div>
      </header>

      {decks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <h2 className="font-semibold">No decks yet</h2>
          <p className="text-ink-300 mt-1">Create one from scratch, or paste your notes and let Gist build it for you.</p>
          <button className="btn-primary mt-4" onClick={() => setRoute({ name: 'create' })}>Create deck</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((d) => {
            const cards = state.cards.filter((c) => c.deckId === d.id);
            const due = cards.filter((c) => isDue(c)).length;
            return (
              <div key={d.id} className="card p-5 flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{d.emoji || '📚'}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{d.name}</div>
                    {d.description && <p className="text-sm text-ink-400 line-clamp-2 mt-1">{d.description}</p>}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="chip">{cards.length} cards</span>
                  {due > 0 && <span className="chip border-brand-500/40 text-brand-200 bg-brand-500/10">{due} due</span>}
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <button className="btn-primary flex-1" onClick={() => setRoute({ name: 'study', deckId: d.id })} disabled={cards.length === 0}>
                    Study
                  </button>
                  <button className="btn-ghost" onClick={() => setRoute({ name: 'deck', deckId: d.id })}>Open</button>
                  <button className="btn-danger" onClick={() => deleteDeck(d.id)} title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
