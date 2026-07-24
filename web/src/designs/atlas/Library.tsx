import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame } from '../../data/games';
import { STATUS_LABELS, STATUS_ORDER } from '../../components/statusMeta';
import type { PlayStatus } from '../../types';
import { RatingRow, inputCls } from './ui';

export function Library() {
  const app = useApp();
  const [filter, setFilter] = useState<PlayStatus | 'all'>('all');

  const entries = app.library.filter((e) => filter === 'all' || e.status === filter);
  const totalHours = app.library.reduce((sum, e) => sum + (e.hoursPlayed ?? 0), 0);
  const rated = app.library.filter((e) => e.rating != null);
  const avgRating = rated.length ? rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length : null;

  const stats: [string, string][] = [
    ['Titles', String(app.library.length)],
    ['Hours logged', totalHours.toLocaleString()],
    ['Average rating', avgRating ? avgRating.toFixed(1) : '—'],
    ['Now playing', String(app.library.filter((e) => e.status === 'playing').length)],
  ];

  return (
    <div className="mt-10">
      <h1 className="font-serif text-4xl font-black text-neutral-900">Your Ledger</h1>
      <p className="mt-1 italic text-neutral-500">A record of everything you&rsquo;ve played, wanted, and abandoned.</p>

      <dl className="mt-6 grid grid-cols-2 divide-x divide-neutral-300 border-y border-neutral-300 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="px-4 py-4 text-center">
            <dd className="font-serif text-3xl font-bold text-emerald-900">{value}</dd>
            <dt className="mt-1 text-xs uppercase tracking-wider text-neutral-500">{label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'font-bold text-emerald-900 underline' : 'text-neutral-600 hover:text-emerald-900'}
        >
          All ({app.library.length})
        </button>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={filter === s ? 'font-bold text-emerald-900 underline' : 'text-neutral-600 hover:text-emerald-900'}
          >
            {STATUS_LABELS[s]} ({app.library.filter((e) => e.status === s).length})
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="mt-8 italic text-neutral-500">
          Nothing recorded here yet.{' '}
          <Link to="/browse" className="text-emerald-900 underline">Browse the catalog</Link> or import from{' '}
          <Link to="/profile" className="text-emerald-900 underline">a linked account</Link>.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-300 border-y border-neutral-300">
          {entries.map((e) => {
            const game = getGame(e.gameId);
            if (!game) return null;
            return (
              <li key={e.gameId} className="grid items-center gap-3 py-4 sm:grid-cols-[1fr_auto_auto_auto_auto]">
                <div>
                  <Link to={`/game/${game.id}`} className="font-serif text-lg font-semibold text-neutral-900 hover:underline">
                    {game.title}
                  </Link>
                  {e.fromSteam && (
                    <span className="ml-2 text-xs uppercase tracking-wider text-emerald-900">Steam</span>
                  )}
                </div>
                <select
                  value={e.status}
                  onChange={(ev) => app.setStatus(e.gameId, ev.target.value as PlayStatus)}
                  className={inputCls}
                >
                  {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
                <RatingRow value={e.rating} onChange={(v) => app.setRating(e.gameId, v)} />
                <span className="text-sm text-neutral-600">{e.hoursPlayed != null ? `${e.hoursPlayed} h` : '—'}</span>
                <button
                  onClick={() => app.setStatus(e.gameId, null)}
                  className="text-sm text-red-900/70 hover:underline"
                >
                  Strike out
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
