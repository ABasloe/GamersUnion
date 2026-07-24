import { Link } from 'react-router-dom';
import { GAMES } from '../data/games';
import { NEWS } from '../data/seed';
import { GameCard } from '../components/GameCard';
import { useApp } from '../store/AppContext';
import { getRecommendations } from '../utils/similarity';

export function Home() {
  const { library, favorites, reviews } = useApp();
  const trending = [...GAMES].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 6);
  const recs = getRecommendations(library, favorites).slice(0, 4);
  const recentReviews = reviews.slice(0, 4);

  return (
    <div>
      <section className="hero">
        <h1>Track every game. Rate them all. Find your people.</h1>
        <p>
          GamersUnion is your Goodreads for video games — log what you're playing,
          review what you've finished, and join groups that argue about it with you.
        </p>
        <div className="hero-actions">
          <Link to="/browse" className="btn btn-primary">Browse Games</Link>
          <Link to="/library" className="btn">My Library ({library.length})</Link>
        </div>
      </section>

      <section>
        <h2>🔥 Top Trending</h2>
        <div className="game-grid">
          {trending.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      </section>

      {recs.length > 0 && (
        <section>
          <h2>✨ Recommended for You</h2>
          <p className="muted">Based on the tags of games you've rated and favorited.</p>
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

      <div className="two-col">
        <section>
          <h2>📰 Gaming News</h2>
          {NEWS.map((n) => (
            <article key={n.id} className="news-item">
              <span className="tag">{n.tag}</span>
              <h3>{n.title}</h3>
              <p>{n.blurb}</p>
              <span className="muted">{n.date}</span>
            </article>
          ))}
        </section>
        <section>
          <h2>💬 Fresh Reviews</h2>
          {recentReviews.map((r) => {
            const game = GAMES.find((g) => g.id === r.gameId);
            return (
              <article key={r.id} className="news-item">
                <h3><Link to={`/game/${r.gameId}`}>{game?.title}</Link> — {r.rating}/10</h3>
                <p>"{r.text}"</p>
                <span className="muted">by {r.author} · {r.date}</span>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
