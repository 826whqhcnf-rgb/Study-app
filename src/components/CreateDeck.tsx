import { useState } from 'react';
import type { AppState, Card, Deck, Route } from '../types';
import { generateCards } from '../generator';
import { newCardDefaults } from '../sm2';
import { uid } from '../storage';

interface Props {
  state: AppState;
  setState: (s: AppState) => void;
  setRoute: (r: Route) => void;
}

const EMOJIS = ['📚', '🧠', '🧬', '🧪', '🧮', '📐', '🌍', '🇫🇷', '🇪🇸', '🇩🇪', '💻', '🩺', '⚖️', '🎨', '🎵', '🪐', '⚛️', '📜'];

export default function CreateDeck({ state, setState, setRoute }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<{ front: string; back: string }[] | null>(null);

  function regeneratePreview(text: string) {
    setPreview(text.trim() ? generateCards(text) : null);
  }

  function create(includeGenerated: boolean) {
    if (!name.trim()) {
      alert('Please give the deck a name.');
      return;
    }
    const deck: Deck = {
      id: uid(),
      name: name.trim(),
      description: description.trim() || undefined,
      emoji,
      createdAt: Date.now(),
    };
    let newCards: Card[] = [];
    if (includeGenerated && preview && preview.length > 0) {
      newCards = preview.map((g) => ({
        id: uid(),
        deckId: deck.id,
        front: g.front,
        back: g.back,
        createdAt: Date.now(),
        ...newCardDefaults(),
      }));
    }
    setState({
      ...state,
      decks: [deck, ...state.decks],
      cards: [...newCards, ...state.cards],
    });
    setRoute({ name: 'deck', deckId: deck.id });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Create a deck</h1>
        <p className="text-ink-300 mt-1">Name your deck and (optionally) drop in some notes to auto-generate cards.</p>
      </header>

      <section className="card p-6 space-y-4">
        <div className="grid sm:grid-cols-[auto,1fr] gap-4 items-start">
          <div>
            <div className="text-xs text-ink-300 mb-2">Icon</div>
            <div className="grid grid-cols-6 gap-1 max-w-[260px]">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl grid place-items-center border transition ${
                    emoji === e ? 'border-brand-500/60 bg-brand-500/10' : 'border-ink-700 hover:border-ink-500'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-ink-300">Name</label>
              <input className="input mt-1" placeholder="e.g. Organic Chemistry — Reactions" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-ink-300">Description (optional)</label>
              <input className="input mt-1" placeholder="A short summary of what's inside" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <h2 className="font-semibold">Generate cards from your notes</h2>
        </div>
        <p className="text-sm text-ink-300">
          Paste study notes, a chapter summary, or "term — definition" lines. Gist will detect explicit pairs and turn longer
          sentences into cloze and concept questions.
        </p>
        <textarea
          className="input min-h-[180px]"
          placeholder={
            'Examples:\nMitochondrion — produces ATP via cellular respiration.\nNucleus: contains the genetic material of a eukaryotic cell.\n\nPhotosynthesis is the process by which plants convert light energy into chemical energy stored in glucose.'
          }
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            regeneratePreview(e.target.value);
          }}
        />
        {preview && preview.length > 0 && (
          <div className="border border-ink-700 rounded-xl divide-y divide-ink-800 overflow-hidden">
            <div className="px-4 py-2 text-xs text-ink-300 bg-ink-900/60 flex items-center justify-between">
              <span>Preview — {preview.length} card{preview.length === 1 ? '' : 's'}</span>
              <button
                className="text-brand-300 hover:text-brand-200"
                onClick={() => regeneratePreview(notes)}
              >
                Regenerate
              </button>
            </div>
            <ul className="max-h-[260px] overflow-auto">
              {preview.map((c, idx) => (
                <li key={idx} className="px-4 py-3">
                  <div className="text-sm font-medium whitespace-pre-wrap">{c.front}</div>
                  <div className="text-sm text-ink-300 mt-1 whitespace-pre-wrap">{c.back}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {notes.trim() && preview && preview.length === 0 && (
          <div className="text-sm text-ink-400">
            Couldn't extract cards. Try adding explicit pairs like <code className="chip">term: definition</code> or a longer passage.
          </div>
        )}
      </section>

      <div className="flex items-center justify-end gap-2 pb-4">
        <button className="btn-ghost" onClick={() => setRoute({ name: 'decks' })}>Cancel</button>
        <button className="btn-ghost" onClick={() => create(false)} disabled={!name.trim()}>Create empty</button>
        <button className="btn-primary" onClick={() => create(true)} disabled={!name.trim() || !preview || preview.length === 0}>
          Create with {preview?.length || 0} cards
        </button>
      </div>
    </div>
  );
}
