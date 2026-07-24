import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { getGame } from '../data/games';
import { StarRating } from '../components/StarRating';
import { STATUS_LABELS, STATUS_ORDER } from '../components/statusMeta';
import type { PlayStatus } from '../types';

export function Library() {
  const app = useApp();
  const [filter, setFilter] = useState<PlayStatus | 'all'>('all');

  const entries = app.library.filter((e) => filter === 'all' || e.status === filter);
  const totalHours = app.library.reduce((sum, e) => sum + (e.hoursPlayed ?? 0), 0);
  const rated = app.library.filter((e) => e.rating != null);
  const avgRating = rated.length ? rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length : null;

  return (
    <div>
      <h1>My Games</h1>
      <div className="stats-row">
        <div className="stat"><strong>{app.library.length}</strong><span>games</span></div>
        <div className="stat"><strong>{totalHours.toLocaleString()}</strong><span>hours</span></div>
        <div className="stat"><strong>{avgRating ? avgRating.toFixed(1) : '—'}</strong><span>avg rating</span></div>
        <div className="stat"><strong>{app.library.filter((e) => e.status === 'playing').length}</strong><span>playing now</span></div>
      </div>

      <div className="filter-bar">
        <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({app.library.length})
        </button>
        {STATUS_ORDER.map((s) => (
          <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {STATUS_LABELS[s]} ({app.library.filter((e) => e.status === s).length})
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="muted">
          Nothing here yet. <Link to="/browse">Browse games</Link> to start tracking, or import
          your <Link to="/profile">Steam library</Link>.
        </p>
      ) : (
        <table className="library-table">
          <thead>
            <tr><th>Game</th><th>Status</th><th>My Rating</th><th>Hours</th><th></th></tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const game = getGame(e.gameId);
              if (!game) return null;
              return (
                <tr key={e.gameId}>
                  <td><Link to={`/game/${game.id}`}>{game.title}</Link>{e.fromSteam && <span className="tag tag-steam">Steam</span>}</td>
                  <td>
                    <select value={e.status} onChange={(ev) => app.setStatus(e.gameId, ev.target.value as PlayStatus)}>
                      {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td><StarRating compact value={e.rating} onChange={(v) => app.setRating(e.gameId, v)} /></td>
                  <td>{e.hoursPlayed ?? '—'}</td>
                  <td><button className="link-btn danger" onClick={() => app.setStatus(e.gameId, null)}>Remove</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
