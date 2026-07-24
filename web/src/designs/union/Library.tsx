import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame } from '../../data/games';
import { STATUS_LABELS, STATUS_ORDER } from '../../components/statusMeta';
import type { PlayStatus } from '../../types';
import { Chip, DISPLAY, LINE, MONO, MOSS, MUTED, RatingRow, SLANT, StatusSelect, TEXT, focusRing, inputCls } from './ui';

export function Library() {
  const app = useApp();
  const [filter, setFilter] = useState<PlayStatus | 'all'>('all');

  const entries = app.library.filter((e) => filter === 'all' || e.status === filter);
  const totalHours = app.library.reduce((s, e) => s + (e.hoursPlayed ?? 0), 0);
  const rated = app.library.filter((e) => e.rating != null);
  const avgRating = rated.length ? rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length : null;

  const stats: [string, string][] = [
    ['games', String(app.library.length)],
    ['hours', totalHours.toLocaleString()],
    ['avg rating', avgRating ? avgRating.toFixed(1) : '—'],
    ['playing now', String(app.library.filter((e) => e.status === 'playing').length)],
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <h1 className="text-2xl font-semibold" style={DISPLAY}>Logbook</h1>

      <div className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
        {stats.map(([label, value]) => (
          <div key={label}>
            <p className="text-2xl" style={{ ...MONO, color: TEXT }}>{value}</p>
            <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: MUTED, ...DISPLAY }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {(['all', ...STATUS_ORDER] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s as PlayStatus | 'all')}
            className={`cursor-pointer border-none px-3 py-1 text-xs ${focusRing}`}
            style={{
              clipPath: SLANT,
              ...DISPLAY,
              background: filter === s ? MOSS : 'var(--gu-raised)',
              color: filter === s ? 'var(--gu-ground)' : MUTED,
            }}
          >
            {s === 'all' ? `all (${app.library.length})` : `${STATUS_LABELS[s].toLowerCase()} (${app.library.filter((e) => e.status === s).length})`}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: MUTED }}>
          Nothing here yet.{' '}
          <Link to="/browse" className={`underline underline-offset-4 ${focusRing}`} style={{ color: TEXT }}>Browse games</Link>{' '}
          to start logging, or link Steam from{' '}
          <Link to="/profile" className={`underline underline-offset-4 ${focusRing}`} style={{ color: TEXT }}>your page</Link>.
        </p>
      ) : (
        <div className="mt-6">
          {entries.map((e) => {
            const game = getGame(e.gameId);
            if (!game) return null;
            return (
              <div
                key={e.gameId}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b py-3.5"
                style={{ borderColor: LINE }}
              >
                <Link
                  to={`/game/${game.id}`}
                  className={`min-w-40 flex-1 text-[15px] font-semibold underline-offset-4 hover:underline ${focusRing}`}
                  style={{ ...DISPLAY, color: TEXT }}
                >
                  {game.title}
                </Link>
                {e.fromSteam && <Chip color={MOSS}>steam</Chip>}
                <StatusSelect value={e.status} onChange={(s) => app.setStatus(e.gameId, s)} />
                <RatingRow value={e.rating} onChange={(v) => app.setRating(e.gameId, v)} />
                <label className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                  <input
                    type="number"
                    min={0}
                    className={`${inputCls} w-20`}
                    value={e.hoursPlayed ?? ''}
                    placeholder="0"
                    onChange={(ev) => app.setHours(e.gameId, ev.target.value === '' ? null : Number(ev.target.value))}
                  />
                  h
                </label>
                <button
                  className={`cursor-pointer border-none bg-transparent p-0 text-xs ${focusRing}`}
                  style={{ color: 'var(--gu-danger)' }}
                  onClick={() => app.setStatus(e.gameId, null)}
                >
                  remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
