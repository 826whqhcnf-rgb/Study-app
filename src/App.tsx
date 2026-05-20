import { useEffect, useMemo, useState } from 'react';
import type { AppState, Route } from './types';
import { loadState, saveState } from './storage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Decks from './components/Decks';
import DeckDetail from './components/DeckDetail';
import StudyMode from './components/StudyMode';
import QuizMode from './components/QuizMode';
import CreateDeck from './components/CreateDeck';
import Stats from './components/Stats';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentDeck = useMemo(() => {
    if (route.name === 'deck' || route.name === 'study' || route.name === 'quiz') {
      return state.decks.find((d) => d.id === route.deckId);
    }
    return undefined;
  }, [route, state.decks]);

  const screen = (() => {
    switch (route.name) {
      case 'dashboard':
        return <Dashboard state={state} setRoute={setRoute} />;
      case 'decks':
        return <Decks state={state} setRoute={setRoute} setState={setState} />;
      case 'deck':
        return currentDeck ? (
          <DeckDetail
            state={state}
            setState={setState}
            deck={currentDeck}
            setRoute={setRoute}
          />
        ) : (
          <Empty msg="Deck not found." />
        );
      case 'study':
        return currentDeck ? (
          <StudyMode state={state} setState={setState} deck={currentDeck} setRoute={setRoute} />
        ) : (
          <Empty msg="Deck not found." />
        );
      case 'quiz':
        return currentDeck ? (
          <QuizMode state={state} deck={currentDeck} setRoute={setRoute} />
        ) : (
          <Empty msg="Deck not found." />
        );
      case 'create':
        return <CreateDeck state={state} setState={setState} setRoute={setRoute} />;
      case 'stats':
        return <Stats state={state} />;
    }
  })();

  return (
    <div className="min-h-screen flex">
      <Sidebar route={route} setRoute={setRoute} state={state} />
      <main className="flex-1 min-w-0 px-6 md:px-10 py-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">{screen}</div>
      </main>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="card p-8 text-center text-ink-300">{msg}</div>
  );
}
