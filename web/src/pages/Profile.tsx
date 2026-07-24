import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { getGame } from '../data/games';
import { GameCover } from '../components/GameCover';
import { getRecommendations } from '../utils/similarity';

export function Profile() {
  const app = useApp();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(app.username);
  const [importing, setImporting] = useState(false);

  const favorites = app.favorites.map(getGame).filter((g) => g != null);
  const myReviews = app.reviews.filter((r) => r.isMine);
  const joinedGroups = app.groups.filter((g) => g.joined);
  const recs = getRecommendations(app.library, app.favorites).slice(0, 6);

  const runImport = () => {
    setImporting(true);
    setTimeout(() => {
      app.importSteam();
      setImporting(false);
    }, 1200);
  };

  return (
    <div>
      <div className="profile-head">
        <div className="avatar">👤</div>
        <div>
          {editingName ? (
            <div className="reply-row">
              <input value={name} onChange={(e) => setName(e.target.value)} />
              <button className="btn btn-primary" onClick={() => { app.setUsername(name.trim() || 'Player One'); setEditingName(false); }}>Save</button>
            </div>
          ) : (
            <h1>{app.username} <button className="link-btn" onClick={() => setEditingName(true)}>edit</button></h1>
          )}
          <p className="muted">{app.library.length} games tracked · {myReviews.length} reviews · {joinedGroups.length} groups</p>
        </div>
      </div>

      <section>
        <h2>🏆 Top 3 Favorites</h2>
        {favorites.length === 0 ? (
          <p className="muted">No favorites yet — open a game page and hit "Add to Top 3".</p>
        ) : (
          <div className="fav-row">
            {favorites.map((g, i) => (
              <Link key={g.id} to={`/game/${g.id}`} className="fav-card">
                <span className="fav-rank">#{i + 1}</span>
                <GameCover game={g} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>🎮 Steam Import</h2>
        {app.steamImported ? (
          <p className="muted">✅ Steam library imported — playtime hours synced to <Link to="/library">My Games</Link>.</p>
        ) : (
          <div className="compose-box">
            <p>Connect your Steam account to import your games and hours played.</p>
            <button className="btn btn-primary" onClick={runImport} disabled={importing}>
              {importing ? 'Importing…' : 'Import Steam Library'}
            </button>
            <p className="muted">Demo mode: imports a sample Steam library. Real Steam OAuth requires a backend.</p>
          </div>
        )}
      </section>

      {recs.length > 0 && (
        <section>
          <h2>✨ Similarity Picks</h2>
          <p className="muted">Games you'd probably like, scored by tag overlap with your library.</p>
          <div className="rec-grid">
            {recs.map((r) => (
              <Link key={r.game.id} to={`/game/${r.game.id}`} className="rec-card">
                <div className="rec-score">{r.score}% match</div>
                <div className="rec-title">{r.game.title}</div>
                <div className="tag-row">
                  {r.matchedTags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2>📝 My Reviews</h2>
        {myReviews.length === 0 ? (
          <p className="muted">You haven't reviewed anything yet.</p>
        ) : (
          myReviews.map((r) => (
            <article key={r.id} className="review mine">
              <div className="review-head">
                <strong><Link to={`/game/${r.gameId}`}>{getGame(r.gameId)?.title}</Link></strong>
                <span className="review-rating">{r.rating}/10</span>
              </div>
              <p>{r.text}</p>
              <span className="muted">{r.date} · 👍 {r.likes}</span>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
