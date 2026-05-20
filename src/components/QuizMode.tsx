import { useEffect, useMemo, useState } from 'react';
import type { AppState, Card, Deck, Route } from '../types';

interface Props {
  state: AppState;
  deck: Deck;
  setRoute: (r: Route) => void;
}

interface Question {
  card: Card;
  options: string[];
  correctIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(cards: Card[], n: number): Question[] {
  const pool = shuffle(cards).slice(0, n);
  return pool.map((card) => {
    const distractors = shuffle(cards.filter((c) => c.id !== card.id))
      .slice(0, 3)
      .map((c) => c.back);
    const options = shuffle([card.back, ...distractors]);
    return { card, options, correctIndex: options.indexOf(card.back) };
  });
}

export default function QuizMode({ state, deck, setRoute }: Props) {
  const deckCards = useMemo(() => state.cards.filter((c) => c.deckId === deck.id), [state.cards, deck.id]);
  const [questions, setQuestions] = useState<Question[]>(() => buildQuiz(deckCards, Math.min(10, deckCards.length)));
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setQuestions(buildQuiz(deckCards, Math.min(10, deckCards.length)));
    setI(0); setChosen(null); setScore(0); setDone(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.id]);

  if (deckCards.length < 4) {
    return (
      <div className="card p-12 text-center space-y-3">
        <div className="text-4xl">🧩</div>
        <h2 className="font-semibold">Need at least 4 cards</h2>
        <p className="text-ink-300">Quiz mode uses other cards as distractors. Add a few more cards first.</p>
        <div className="flex justify-center pt-2">
          <button className="btn-ghost" onClick={() => setRoute({ name: 'deck', deckId: deck.id })}>Back to deck</button>
        </div>
      </div>
    );
  }

  const q = questions[i];

  function choose(idx: number) {
    if (chosen !== null) return;
    setChosen(idx);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    if (i + 1 >= questions.length) {
      setDone(true);
    } else {
      setI(i + 1);
      setChosen(null);
    }
  }

  function restart() {
    setQuestions(buildQuiz(deckCards, Math.min(10, deckCards.length)));
    setI(0); setChosen(null); setScore(0); setDone(false);
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const msg = pct >= 90 ? 'Outstanding!' : pct >= 70 ? 'Nicely done.' : pct >= 50 ? 'Keep going!' : 'Time to study.';
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <button onClick={() => setRoute({ name: 'deck', deckId: deck.id })} className="text-sm text-ink-300 hover:text-white">
          ← Back to deck
        </button>
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">🏁</div>
          <div className="text-3xl font-bold">{score} / {questions.length}</div>
          <div className="text-ink-300 mt-1">{pct}% correct — {msg}</div>
          <div className="flex justify-center gap-2 mt-6">
            <button className="btn-ghost" onClick={() => setRoute({ name: 'study', deckId: deck.id })}>Study mode</button>
            <button className="btn-primary" onClick={restart}>Play again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => setRoute({ name: 'deck', deckId: deck.id })} className="text-sm text-ink-300 hover:text-white">← Exit</button>
        <div className="flex items-center gap-2 text-xs">
          <span className="chip">Question {i + 1} of {questions.length}</span>
          <span className="chip">{score} correct</span>
        </div>
      </div>

      <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all" style={{ width: `${((i) / questions.length) * 100}%` }} />
      </div>

      <div className="card p-6">
        <div className="text-xs text-ink-400 uppercase tracking-wider mb-3">Question</div>
        <div className="text-lg md:text-xl whitespace-pre-wrap">{q.card.front}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((opt, idx) => {
          const isCorrect = idx === q.correctIndex;
          const isChosen = idx === chosen;
          let cls = 'card p-4 text-left transition hover:border-brand-500/40';
          if (chosen !== null) {
            if (isCorrect) cls += ' border-emerald-500/60 bg-emerald-500/10';
            else if (isChosen) cls += ' border-accent-red/60 bg-accent-red/10';
            else cls += ' opacity-70';
          }
          return (
            <button key={idx} className={cls} disabled={chosen !== null} onClick={() => choose(idx)}>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 shrink-0 rounded-lg bg-ink-800 grid place-items-center text-sm font-semibold">
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="text-sm whitespace-pre-wrap">{opt}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={next} disabled={chosen === null}>
          {i + 1 >= questions.length ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
