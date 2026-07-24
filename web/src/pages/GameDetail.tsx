import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGame } from '../data/games';
import { useApp } from '../store/AppContext';
import { GameCover } from '../components/GameCover';
import { StarRating } from '../components/StarRating';
import { STATUS_LABELS, STATUS_ORDER } from '../components/statusMeta';

export function GameDetail() {
  const { id } = useParams();
  const game = getGame(id ?? '');
  const app = useApp();
  const [tab, setTab] = useState<'reviews' | 'discussion'>('reviews');

  if (!game) return <p>Game not found. <Link to="/browse">Back to browse.</Link></p>;

  const entry = app.library.find((e) => e.gameId === game.id);
  const reviews = app.reviews.filter((r) => r.gameId === game.id);
  const threads = app.threads.filter((t) => t.gameId === game.id);
  const isFavorite = app.favorites.includes(game.id);

  return (
    <div>
      <div className="detail-header">
        <GameCover game={game} size="lg" />
        <div className="detail-info">
          <h1>{game.title} <span className="muted">({game.year})</span></h1>
          <p className="muted">{game.developer} · {game.platforms.join(', ')}</p>
          <div className="tag-row">
            {game.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
          <p>{game.description}</p>
          <p>
            <strong>⭐ {game.communityRating.toFixed(1)}/10</strong>{' '}
            <span className="muted">({game.ratingsCount.toLocaleString()} ratings)</span>
          </p>

          <div className="tracker-box">
            <div className="tracker-row">
              <label>Status:</label>
              <select
                value={entry?.status ?? ''}
                onChange={(e) => app.setStatus(game.id, (e.target.value || null) as never)}
              >
                <option value="">— Not in library —</option>
                {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="tracker-row">
              <label>My rating:</label>
              <StarRating value={entry?.rating ?? null} onChange={(v) => app.setRating(game.id, v)} />
            </div>
            <div className="tracker-row">
              <label>Hours played:</label>
              <input
                type="number"
                min={0}
                value={entry?.hoursPlayed ?? ''}
                placeholder="0"
                onChange={(e) => app.setHours(game.id, e.target.value === '' ? null : Number(e.target.value))}
              />
              {entry?.fromSteam && <span className="tag tag-steam">from Steam</span>}
            </div>
            <button className={`btn ${isFavorite ? 'btn-fav-active' : ''}`} onClick={() => app.toggleFavorite(game.id)}>
              {isFavorite ? '❤️ Favorite' : app.favorites.length >= 3 ? '🤍 Top 3 full' : '🤍 Add to Top 3'}
            </button>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>
          Reviews ({reviews.length})
        </button>
        <button className={tab === 'discussion' ? 'active' : ''} onClick={() => setTab('discussion')}>
          Discussion ({threads.length})
        </button>
      </div>

      {tab === 'reviews' ? <ReviewsTab gameId={game.id} /> : <DiscussionTab gameId={game.id} />}
    </div>
  );
}

function ReviewsTab({ gameId }: { gameId: string }) {
  const app = useApp();
  const reviews = app.reviews.filter((r) => r.gameId === gameId);
  const myReview = reviews.find((r) => r.isMine);
  const [text, setText] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  const submit = () => {
    if (!text.trim() || rating == null) return;
    app.addReview(gameId, rating, text.trim());
    setText('');
    setRating(null);
  };

  return (
    <div>
      {!myReview && (
        <div className="compose-box">
          <h3>Write a review</h3>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you think?"
            rows={3}
          />
          <button className="btn btn-primary" onClick={submit} disabled={!text.trim() || rating == null}>
            Post Review
          </button>
        </div>
      )}
      {reviews.map((r) => (
        <article key={r.id} className={`review ${r.isMine ? 'mine' : ''}`}>
          <div className="review-head">
            <strong>{r.author}</strong> {r.isMine && <span className="tag">you</span>}
            <span className="review-rating">{r.rating}/10</span>
          </div>
          <p>{r.text}</p>
          <div className="review-foot">
            <button className="link-btn" onClick={() => app.toggleReviewLike(r.id)}>
              {r.likedByMe ? '👍' : '👍🏻'} {r.likes}
            </button>
            <span className="muted">{r.date}</span>
            {r.isMine && (
              <button className="link-btn danger" onClick={() => app.deleteMyReview(r.id)}>Delete</button>
            )}
          </div>
        </article>
      ))}
      {reviews.length === 0 && <p className="muted">No reviews yet — be the first.</p>}
    </div>
  );
}

function DiscussionTab({ gameId }: { gameId: string }) {
  const app = useApp();
  const threads = app.threads.filter((t) => t.gameId === gameId);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [openThread, setOpenThread] = useState<string | null>(threads[0]?.id ?? null);
  const [reply, setReply] = useState('');

  const create = () => {
    if (!title.trim() || !text.trim()) return;
    app.createThread(gameId, title.trim(), text.trim());
    setTitle('');
    setText('');
  };

  return (
    <div>
      <div className="compose-box">
        <h3>Start a thread</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Thread title" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something…" rows={2} />
        <button className="btn btn-primary" onClick={create} disabled={!title.trim() || !text.trim()}>
          Post Thread
        </button>
      </div>
      {threads.map((t) => (
        <article key={t.id} className="thread">
          <button className="thread-title" onClick={() => setOpenThread(openThread === t.id ? null : t.id)}>
            <strong>{t.title}</strong>
            <span className="muted"> · {t.author} · {t.posts.length} post{t.posts.length !== 1 ? 's' : ''}</span>
          </button>
          {openThread === t.id && (
            <div className="thread-posts">
              {t.posts.map((p) => (
                <div key={p.id} className={`post ${p.isMine ? 'mine' : ''}`}>
                  <strong>{p.author}</strong> <span className="muted">{p.date}</span>
                  <p>{p.text}</p>
                </div>
              ))}
              <div className="reply-row">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply…" />
                <button
                  className="btn"
                  onClick={() => { if (reply.trim()) { app.replyToThread(t.id, reply.trim()); setReply(''); } }}
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </article>
      ))}
      {threads.length === 0 && <p className="muted">No discussions yet — start one.</p>}
    </div>
  );
}
