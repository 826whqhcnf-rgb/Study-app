import { useEffect, useMemo, useState } from 'react';
import type { AppState, Card, CardRating, Deck, Route } from '../types';
import { isDue, nextDueCard, schedule } from '../sm2';
import { logReview } from '../storage';
import { uid } from '../storage';

interface Props {
  state: AppState;
  setState: (s: AppState) => void;
  deck: Deck;
  setRoute: (r: Route) => void;
}

export default function StudyMode({ state, setState, deck, setRoute }: Props) {
  const deckCards = useMemo(() => state.cards.filter((c) => c.deckId === deck.id), [state.cards, deck.id]);
  const [flipped, setFlipped] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionRight, setSessionRight] = useState(0);

  const current: Card | undefined = nextDueCard(deckCards);

  useEffect(() => {
    setFlipped(false);
  }, [current?.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ') {
        e.preventDefault();
        setFlipped((v) => !v);
      }
      if (!flipped) return;
      if (e.key === '1') rate('again');
      else if (e.key === '2') rate('hard');
      else if (e.key === '3') rate('good');
      else if (e.key === '4') rate('easy');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, current?.id]);

  function rate(r: CardRating) {
    if (!current) return;
    const updated = schedule(current, r);
    const newState: AppState = {
      ...state,
      cards: state.cards.map((c) => (c.id === current.id ? updated : c)),
    };
    const withLog = logReview(newState, {
      id: uid(),
      cardId: current.id,
      deckId: deck.id,
      rating: r,
      at: Date.now(),
      prevInterval: current.interval,
      newInterval: updated.interval,
    });
    setState(withLog);
    setSessionCount((n) => n + 1);
    if (r !== 'again') setSessionRight((n) => n + 1);
    setFlipped(false);
  }

  if (deckCards.length === 0) {
    return (
      <div className="card p-12 text-center space-y-3">
        <div className="text-4xl">📭</div>
        <h2 className="font-semibold">No cards in this deck</h2>
        <p className="text-ink-300">Add cards first, then come back to study.</p>
        <div className="flex justify-center gap-2 pt-2">
          <button className="btn-ghost" onClick={() => setRoute({ name: 'deck', deckId: deck.id })}>Back to deck</button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="space-y-6">
        <button onClick={() => setRoute({ name: 'deck', deckId: deck.id })} className="text-sm text-ink-300 hover:text-white">
          ← Back to deck
        </button>
        <div className="card p-12 text-center space-y-3">
          <div className="text-5xl">🎉</div>
          <h2 className="font-bold text-2xl">All caught up</h2>
          <p className="text-ink-300">No cards are due in <b>{deck.name}</b>. Come back later, or study ahead.</p>
          <div className="flex justify-center gap-2 pt-2 flex-wrap">
            <button className="btn-ghost" onClick={() => setRoute({ name: 'deck', deckId: deck.id })}>Back to deck</button>
            <button
              className="btn-primary"
              onClick={() => studyAheadOne(state, setState, deck)}
              disabled={deckCards.length === 0}
            >
              Study one anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dueRemaining = deckCards.filter((c) => isDue(c)).length;
  const accuracy = sessionCount === 0 ? 0 : Math.round((sessionRight / sessionCount) * 100);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => setRoute({ name: 'deck', deckId: deck.id })} className="text-sm text-ink-300 hover:text-white">
          ← Exit
        </button>
        <div className="flex items-center gap-2 text-xs">
          <span className="chip">{dueRemaining} due</span>
          <span className="chip">{sessionCount} reviewed</span>
          <span className="chip">{accuracy}% recall</span>
        </div>
      </div>

      <div className="flip-card h-[420px] w-full">
        <div
          className={`flip-inner h-full w-full cursor-pointer ${flipped ? 'flipped' : ''}`}
          onClick={() => setFlipped((v) => !v)}
        >
          <div className="flip-face card p-8 flex flex-col items-center justify-center text-center">
            <div className="text-xs text-ink-400 uppercase tracking-wider mb-4">Question</div>
            <div className="text-xl md:text-2xl whitespace-pre-wrap">{current.front}</div>
            <div className="text-xs text-ink-500 mt-auto pt-6">Tap or press Space to flip</div>
          </div>
          <div className="flip-face flip-back card p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-ink-900 to-ink-850">
            <div className="text-xs text-brand-300 uppercase tracking-wider mb-4">Answer</div>
            <div className="text-xl md:text-2xl whitespace-pre-wrap">{current.back}</div>
            <div className="text-xs text-ink-500 mt-auto pt-6">How well did you remember?</div>
          </div>
        </div>
      </div>

      {!flipped ? (
        <div className="flex justify-center">
          <button className="btn-primary px-8" onClick={() => setFlipped(true)}>Show answer</button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          <RateBtn label="Again" sub="<10m" color="red" hint="1" onClick={() => rate('again')} />
          <RateBtn label="Hard" sub={hintFor(current, 'hard')} color="yellow" hint="2" onClick={() => rate('hard')} />
          <RateBtn label="Good" sub={hintFor(current, 'good')} color="brand" hint="3" onClick={() => rate('good')} />
          <RateBtn label="Easy" sub={hintFor(current, 'easy')} color="green" hint="4" onClick={() => rate('easy')} />
        </div>
      )}
    </div>
  );
}

function studyAheadOne(state: AppState, setState: (s: AppState) => void, deck: Deck) {
  const deckCards = state.cards.filter((c) => c.deckId === deck.id);
  if (deckCards.length === 0) return;
  const soonest = [...deckCards].sort((a, b) => a.due - b.due)[0];
  setState({
    ...state,
    cards: state.cards.map((c) => (c.id === soonest.id ? { ...c, due: Date.now() } : c)),
  });
}

function hintFor(card: Card, rating: CardRating): string {
  const previewed = schedule(card, rating);
  const days = previewed.interval;
  if (rating === 'again') return '<10m';
  if (days === 0) return '~10m';
  if (days < 1) return '<1d';
  if (days === 1) return '1d';
  return `${days}d`;
}

function RateBtn({
  label, sub, color, hint, onClick,
}: { label: string; sub: string; color: 'red' | 'yellow' | 'brand' | 'green'; hint: string; onClick: () => void }) {
  const cls =
    color === 'red' ? 'bg-accent-red/15 hover:bg-accent-red/25 border-accent-red/30 text-accent-red'
    : color === 'yellow' ? 'bg-accent-yellow/10 hover:bg-accent-yellow/20 border-accent-yellow/30 text-accent-yellow'
    : color === 'green' ? 'bg-accent-green/10 hover:bg-accent-green/20 border-accent-green/30 text-accent-green'
    : 'bg-brand-500/15 hover:bg-brand-500/25 border-brand-500/40 text-brand-200';

  return (
    <button onClick={onClick} className={`border rounded-xl px-3 py-4 transition active:scale-[0.98] ${cls}`}>
      <div className="flex items-center justify-center gap-1 text-base font-semibold">
        {label}
        <span className="ml-1 text-[10px] text-ink-300 bg-ink-800 px-1.5 py-0.5 rounded">{hint}</span>
      </div>
      <div className="text-xs mt-1 opacity-80">{sub}</div>
    </button>
  );
}
