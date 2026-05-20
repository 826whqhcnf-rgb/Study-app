import type { AppState, Route } from '../types';
import { dueCount } from '../sm2';

interface Props {
  route: Route;
  setRoute: (r: Route) => void;
  state: AppState;
}

export default function Sidebar({ route, setRoute, state }: Props) {
  const totalDue = dueCount(state.cards);

  const items: Array<{ key: Route['name']; label: string; icon: JSX.Element; route: Route; badge?: number }> = [
    { key: 'dashboard', label: 'Home', icon: <IconHome />, route: { name: 'dashboard' } },
    { key: 'decks', label: 'Decks', icon: <IconDeck />, route: { name: 'decks' }, badge: state.decks.length },
    { key: 'create', label: 'Create', icon: <IconSpark />, route: { name: 'create' } },
    { key: 'stats', label: 'Progress', icon: <IconChart />, route: { name: 'stats' } },
  ];

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-ink-800/80 px-4 py-6 bg-ink-950/40 backdrop-blur sticky top-0 h-screen">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center shadow-[0_8px_24px_-8px_rgba(91,77,255,0.7)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 5h9l5 5v9H5z" fill="white" opacity="0.95" />
            <path d="M14 5v5h5" stroke="#5b4dff" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="font-bold text-lg tracking-tight">Gist</div>
        <span className="chip ml-auto">beta</span>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = route.name === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setRoute(item.route)}
              className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                active
                  ? 'bg-brand-500/15 text-white border border-brand-500/30'
                  : 'text-ink-300 hover:text-white hover:bg-ink-800/70 border border-transparent'
              }`}
            >
              <span className={`${active ? 'text-brand-300' : 'text-ink-300 group-hover:text-white'}`}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="ml-auto chip">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 card p-4">
        <div className="text-xs text-ink-300">Due today</div>
        <div className="text-2xl font-bold mt-1">{totalDue}</div>
        <div className="text-xs text-ink-300 mt-1">{totalDue === 0 ? 'You\'re all caught up.' : 'Cards waiting for review'}</div>
      </div>

      <div className="mt-auto text-[11px] text-ink-500 px-2 pt-6">
        Local-first. Your data stays on this device.
      </div>
    </aside>
  );
}

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" />
    </svg>
  );
}
function IconDeck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="14" height="14" rx="2" /><path d="M7 5V3h14v14h-2" />
    </svg>
  );
}
function IconSpark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z" /><path d="M19 14l.9 2.1 2.1.9-2.1.9L19 20l-.9-2.1-2.1-.9 2.1-.9z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}
