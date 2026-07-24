import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame } from '../../data/games';
import { STATUS_LABELS, STATUS_ORDER } from '../../components/statusMeta';
import type { PlayStatus } from '../../types';
import { Panel, RatingButtons, StatusBadge, inputClass } from './ui';

export function Library() {
  const app = useApp();
  const [filter, setFilter] = useState<PlayStatus | 'all'>('all');

  const entries = app.library.filter((e) => filter === 'all' || e.status === filter);
  const totalHours = app.library.reduce((sum, e) => sum + (e.hoursPlayed ?? 0), 0);
  const rated = app.library.filter((e) => e.rating != null);
  const avgRating = rated.length ? rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length : null;

  const stats = [
    { label: 'Games', value: app.library.length },
    { label: 'Hours', value: totalHours.toLocaleString() },
    { label: 'Avg rating', value: avgRating ? avgRating.toFixed(1) : '—' },
    { label: 'Playing now', value: app.library.filter((e) => e.status === 'playing').length },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-white">My Games</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Panel key={s.label} className="p-4">
            <div className="text-2xl font-extrabold text-white">{s.value}</div>
            <div className="text-xs uppercase tracking-widest text-slate-500">{s.label}</div>
          </Panel>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          All ({app.library.length})
        </FilterChip>
        {STATUS_ORDER.map((s) => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
            {STATUS_LABELS[s]} ({app.library.filter((e) => e.status === s).length})
          </FilterChip>
        ))}
      </div>

      {entries.length === 0 ? (
        <Panel className="p-6 text-sm text-slate-400">
          Nothing here yet.{' '}
          <Link to="/browse" className="text-cyan-300 hover:underline">Browse games</Link> to start
          tracking, or link your accounts on your{' '}
          <Link to="/profile" className="text-cyan-300 hover:underline">profile</Link>.
        </Panel>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => {
            const game = getGame(e.gameId);
            if (!game) return null;
            return (
              <Panel key={e.gameId} className="flex flex-wrap items-center gap-3 p-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center text-lg"
                  style={{ background: `linear-gradient(160deg, ${game.cover.from}, ${game.cover.to})` }}
                >
                  {game.cover.emoji}
                </span>
                <div className="min-w-40 flex-1">
                  <Link to={`/game/${game.id}`} className="text-sm font-semibold text-slate-100 hover:text-cyan-300">
                    {game.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2">
                    <StatusBadge status={e.status} />
                    {e.fromSteam && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-cyan-300">Steam</span>
                    )}
                  </div>
                </div>
                <select
                  value={e.status}
                  onChange={(ev) => app.setStatus(e.gameId, ev.target.value as PlayStatus)}
                  className={inputClass}
                >
                  {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
                <div className="hidden md:block">
                  <RatingButtons value={e.rating} onChange={(v) => app.setRating(e.gameId, v)} />
                </div>
                <span className="w-16 text-right text-sm text-slate-400">{e.hoursPlayed ?? '—'} h</span>
                <button
                  className="cursor-pointer text-xs text-rose-400 hover:text-rose-300"
                  onClick={() => app.setStatus(e.gameId, null)}
                >
                  Remove
                </button>
              </Panel>
            );
          })}
        </div>
      )}
      {entries.length > 0 && (
        <p className="text-xs text-slate-600">
          Ratings can be edited inline on wider screens; open a game page on mobile.
        </p>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
        active
          ? 'bg-gradient-to-r from-violet-400 to-cyan-300 text-slate-950'
          : 'bg-white/5 text-slate-400 ring-1 ring-white/10 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}
