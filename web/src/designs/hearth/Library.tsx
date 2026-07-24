import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame } from '../../data/games';
import { STATUS_LABELS, STATUS_ORDER } from '../../components/statusMeta';
import type { PlayStatus } from '../../types';
import { SAGE, RatingRow, StatusSelect } from './ui';

export function Library() {
  const app = useApp();
  const [filter, setFilter] = useState<PlayStatus | 'all'>('all');

  const entries = app.library.filter((e) => filter === 'all' || e.status === filter);
  const hours = app.library.reduce((s, e) => s + (e.hoursPlayed ?? 0), 0);
  const rated = app.library.filter((e) => e.rating != null);
  const avg = rated.length ? rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length : null;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="font-serif text-2xl italic text-stone-100">The logbook</h1>
      <p className="mt-2 text-sm text-stone-400 tabular-nums">
        <span style={{ color: SAGE }}>{app.library.length}</span> games ·{' '}
        <span style={{ color: SAGE }}>{hours.toLocaleString()}</span> hours ·{' '}
        average mark <span style={{ color: SAGE }}>{avg ? avg.toFixed(1) : '—'}</span>
      </p>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <button
          onClick={() => setFilter('all')}
          className={`cursor-pointer border-none bg-transparent p-0 ${filter === 'all' ? 'text-stone-100 underline underline-offset-8' : 'text-stone-500'}`}
        >
          everything ({app.library.length})
        </button>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`cursor-pointer border-none bg-transparent p-0 ${filter === s ? 'text-stone-100 underline underline-offset-8' : 'text-stone-500'}`}
          >
            {STATUS_LABELS[s].toLowerCase()} ({app.library.filter((e) => e.status === s).length})
          </button>
        ))}
      </div>

      <div className="mt-6">
        {entries.length === 0 && (
          <p className="py-8 text-sm text-stone-500">
            Blank pages. <Link to="/browse" className="underline underline-offset-4">Browse the shelves</Link> or let the{' '}
            <Link to="/deck" className="underline underline-offset-4">deck</Link> deal you something.
          </p>
        )}
        {entries.map((e) => {
          const g = getGame(e.gameId);
          if (!g) return null;
          return (
            <div key={e.gameId} className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-stone-800/70 py-4">
              <Link to={`/game/${g.id}`} className="min-w-44 flex-1 text-[15px] text-stone-200 hover:underline underline-offset-4">
                {g.title}
                {e.fromSteam && <span className="ml-2 text-xs" style={{ color: SAGE }}>steam</span>}
              </Link>
              <StatusSelect value={e.status} onChange={(s) => app.setStatus(e.gameId, s)} />
              <RatingRow value={e.rating} onChange={(v) => app.setRating(e.gameId, v)} />
              <span className="w-16 text-right text-sm text-stone-500 tabular-nums">{e.hoursPlayed ?? '—'}h</span>
              <button
                className="cursor-pointer border-none bg-transparent p-0 text-xs text-red-400/60 hover:text-red-400"
                onClick={() => app.setStatus(e.gameId, null)}
              >
                tear out
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
