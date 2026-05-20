import { useState } from 'react';
import type { AppState, Card, Deck, Route } from '../types';
import { isDue, newCardDefaults } from '../sm2';
import { uid } from '../storage';
import { generateCards } from '../generator';

interface Props {
  state: AppState;
  setState: (s: AppState) => void;
  deck: Deck;
  setRoute: (r: Route) => void;
}

export default function DeckDetail({ state, setState, deck, setRoute }: Props) {
  const cards = state.cards.filter((c) => c.deckId === deck.id);
  const due = cards.filter((c) => isDue(c)).length;

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [bulk, setBulk] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  function addCard() {
    if (!front.trim() || !back.trim()) return;
    const c: Card = {
      id: uid(),
      deckId: deck.id,
      front: front.trim(),
      back: back.trim(),
      createdAt: Date.now(),
      ...newCardDefaults(),
    };
    setState({ ...state, cards: [c, ...state.cards] });
    setFront('');
    setBack('');
  }

  function addBulk() {
    if (!bulk.trim()) return;
    const generated = generateCards(bulk);
    if (generated.length === 0) {
      alert('Could not generate any cards from that text. Try lines like "term: definition" or paste a longer passage.');
      return;
    }
    const newCards: Card[] = generated.map((g) => ({
      id: uid(),
      deckId: deck.id,
      front: g.front,
      back: g.back,
      createdAt: Date.now(),
      ...newCardDefaults(),
    }));
    setState({ ...state, cards: [...newCards, ...state.cards] });
    setBulk('');
    setShowBulk(false);
  }

  function deleteCard(id: string) {
    setState({ ...state, cards: state.cards.filter((c) => c.id !== id) });
  }

  function startEdit(c: Card) {
    setEditingId(c.id);
    setEditFront(c.front);
    setEditBack(c.back);
  }
  function saveEdit() {
    if (!editingId) return;
    setState({
      ...state,
      cards: state.cards.map((c) =>
        c.id === editingId ? { ...c, front: editFront.trim(), back: editBack.trim() } : c,
      ),
    });
    setEditingId(null);
  }

  function resetProgress() {
    if (!confirm('Reset spaced-repetition progress for this deck?')) return;
    setState({
      ...state,
      cards: state.cards.map((c) =>
        c.deckId === deck.id ? { ...c, ...newCardDefaults() } : c,
      ),
    });
  }

  return (
    <div className="space-y-6">
      <button onClick={() => setRoute({ name: 'decks' })} className="text-sm text-ink-300 hover:text-white">
        ← All decks
      </button>

      <header className="card p-6 flex flex-wrap items-center gap-4">
        <div className="text-4xl">{deck.emoji || '📚'}</div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold truncate">{deck.name}</h1>
          {deck.description && <p className="text-ink-300 mt-1">{deck.description}</p>}
          <div className="mt-2 flex gap-2 flex-wrap">
            <span className="chip">{cards.length} cards</span>
            {due > 0 && <span className="chip border-brand-500/40 text-brand-200 bg-brand-500/10">{due} due</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={() => setRoute({ name: 'quiz', deckId: deck.id })} disabled={cards.length < 4}>
            Quiz
          </button>
          <button className="btn-primary" onClick={() => setRoute({ name: 'study', deckId: deck.id })} disabled={cards.length === 0}>
            Study {due > 0 ? `(${due})` : ''}
          </button>
        </div>
      </header>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Add a card</h2>
          <button className="text-sm text-brand-300 hover:text-brand-200" onClick={() => setShowBulk((v) => !v)}>
            {showBulk ? 'Switch to single' : '✨ Generate from notes'}
          </button>
        </div>

        {showBulk ? (
          <div className="mt-4 space-y-3">
            <textarea
              className="input min-h-[160px]"
              placeholder={
                'Paste notes, summaries, or term:definition pairs. Examples:\n\nMitochondrion: the organelle that produces ATP.\nGlycolysis — converts glucose to pyruvate.\n\nOr a paragraph of prose; Gist will turn it into Q&A.'
              }
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
            />
            <div className="flex justify-end">
              <button className="btn-primary" onClick={addBulk} disabled={!bulk.trim()}>Generate cards</button>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            <textarea className="input min-h-[100px]" placeholder="Front (question / term)" value={front} onChange={(e) => setFront(e.target.value)} />
            <textarea className="input min-h-[100px]" placeholder="Back (answer / definition)" value={back} onChange={(e) => setBack(e.target.value)} />
            <div className="md:col-span-2 flex justify-end">
              <button className="btn-primary" onClick={addCard} disabled={!front.trim() || !back.trim()}>Add card</button>
            </div>
          </div>
        )}
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Cards ({cards.length})</h2>
          <button className="text-xs text-ink-300 hover:text-white" onClick={resetProgress} disabled={cards.length === 0}>
            Reset progress
          </button>
        </div>
        {cards.length === 0 ? (
          <div className="text-ink-300 text-sm">This deck is empty. Add a card above to get started.</div>
        ) : (
          <ul className="divide-y divide-ink-800">
            {cards.map((c) => (
              <li key={c.id} className="py-3">
                {editingId === c.id ? (
                  <div className="grid md:grid-cols-2 gap-2">
                    <textarea className="input min-h-[70px]" value={editFront} onChange={(e) => setEditFront(e.target.value)} />
                    <textarea className="input min-h-[70px]" value={editBack} onChange={(e) => setEditBack(e.target.value)} />
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <button className="btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                      <button className="btn-primary" onClick={saveEdit}>Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium whitespace-pre-wrap">{c.front}</div>
                      <div className="text-sm text-ink-300 mt-1 whitespace-pre-wrap">{c.back}</div>
                      <div className="text-xs text-ink-500 mt-2 flex items-center gap-2">
                        <span>
                          {c.repetitions === 0 ? 'New' : `Interval: ${c.interval}d`}
                        </span>
                        <span>•</span>
                        <span>Due {formatDue(c.due)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn-ghost" onClick={() => startEdit(c)}>Edit</button>
                      <button className="btn-danger" onClick={() => deleteCard(c.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatDue(t: number): string {
  const diff = t - Date.now();
  if (diff <= 0) return 'now';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  const days = Math.round(hrs / 24);
  return `in ${days}d`;
}
