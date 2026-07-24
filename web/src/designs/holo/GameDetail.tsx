import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGame } from '../../data/games';
import { useApp } from '../../store/AppContext';
import { STATUS_LABELS, STATUS_ORDER } from '../../components/statusMeta';
import type { PlayStatus } from '../../types';
import { Panel, PanelTitle, RatingButtons, Tag, btnClass, btnPrimaryClass, inputClass } from './ui';

export function GameDetail() {
  const { id } = useParams();
  const game = getGame(id ?? '');
  const app = useApp();
  const [tab, setTab] = useState<'reviews' | 'discussion'>('reviews');

  if (!game) {
    return (
      <p className="text-slate-300">
        Game not found. <Link to="/browse" className="text-cyan-300 hover:underline">Back to browse.</Link>
      </p>
    );
  }

  const entry = app.library.find((e) => e.gameId === game.id);
  const reviews = app.reviews.filter((r) => r.gameId === game.id);
  const threads = app.threads.filter((t) => t.gameId === game.id);
  const isFavorite = app.favorites.includes(game.id);

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-2xl p-6 ring-1 ring-white/10 md:p-8"
        style={{ background: `linear-gradient(120deg, ${game.cover.from}, ${game.cover.to} 70%)` }}
      >
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="relative">
          <div className="text-5xl">{game.cover.emoji}</div>
          <h1 className="mt-2 text-3xl font-extrabold text-white">
            {game.title} <span className="text-lg font-semibold text-white/60">({game.year})</span>
          </h1>
          <p className="text-sm text-white/70">{game.developer} · {game.platforms.join(', ')}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {game.tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
          <p className="mt-3 max-w-2xl text-sm text-white/85">{game.description}</p>
          <p className="mt-2 text-sm font-bold text-white">
            ★ {game.communityRating.toFixed(1)}/10{' '}
            <span className="font-normal text-white/60">({game.ratingsCount.toLocaleString()} ratings)</span>
          </p>
        </div>
      </div>

      <Panel className="space-y-3 p-5">
        <PanelTitle>Your tracker</PanelTitle>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-300">Status</label>
          <select
            value={entry?.status ?? ''}
            onChange={(e) => app.setStatus(game.id, (e.target.value || null) as PlayStatus | null)}
            className={inputClass}
          >
            <option value="">— Not in library —</option>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <label className="text-sm font-semibold text-slate-300">Hours</label>
          <input
            type="number"
            min={0}
            value={entry?.hoursPlayed ?? ''}
            placeholder="0"
            onChange={(e) => app.setHours(game.id, e.target.value === '' ? null : Number(e.target.value))}
            className={`${inputClass} w-24`}
          />
          <button
            className={isFavorite ? btnPrimaryClass : btnClass}
            onClick={() => app.toggleFavorite(game.id)}
          >
            {isFavorite ? '♥ Favorite' : app.favorites.length >= 3 ? '♡ Top 3 full' : '♡ Add to Top 3'}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-300">My rating</label>
          <RatingButtons value={entry?.rating ?? null} onChange={(v) => app.setRating(game.id, v)} />
        </div>
      </Panel>

      <div className="flex gap-1">
        {(['reviews', 'discussion'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wide cursor-pointer ${
              tab === t
                ? 'bg-gradient-to-r from-violet-500/30 to-cyan-400/20 text-white ring-1 ring-violet-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'reviews' ? `Reviews (${reviews.length})` : `Discussion (${threads.length})`}
          </button>
        ))}
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

  return (
    <div className="space-y-3">
      {!myReview && (
        <Panel className="space-y-3 p-5">
          <PanelTitle>Write a review</PanelTitle>
          <RatingButtons value={rating} onChange={setRating} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you think?"
            rows={3}
            className={`${inputClass} w-full resize-y`}
          />
          <button
            className={btnPrimaryClass}
            disabled={!text.trim() || rating == null}
            onClick={() => {
              if (text.trim() && rating != null) {
                app.addReview(gameId, rating, text.trim());
                setText('');
                setRating(null);
              }
            }}
          >
            Post review
          </button>
        </Panel>
      )}
      {reviews.map((r) => (
        <Panel key={r.id} className={`p-4 ${r.isMine ? 'ring-violet-400/40' : ''}`}>
          <div className="flex items-center gap-2">
            <strong className="text-sm text-slate-100">{r.author}</strong>
            {r.isMine && <Tag>you</Tag>}
            <span className="ml-auto text-sm font-bold text-cyan-300">{r.rating}/10</span>
          </div>
          <p className="mt-2 text-sm text-slate-300">{r.text}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <button
              className="cursor-pointer text-cyan-300 hover:text-cyan-200"
              onClick={() => app.toggleReviewLike(r.id)}
            >
              {r.likedByMe ? '👍' : '👍🏻'} {r.likes}
            </button>
            <span>{r.date}</span>
            {r.isMine && (
              <button
                className="cursor-pointer text-rose-400 hover:text-rose-300"
                onClick={() => app.deleteMyReview(r.id)}
              >
                Delete
              </button>
            )}
          </div>
        </Panel>
      ))}
      {reviews.length === 0 && <p className="text-sm text-slate-500">No reviews yet — be the first.</p>}
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

  return (
    <div className="space-y-3">
      <Panel className="space-y-3 p-5">
        <PanelTitle>Start a thread</PanelTitle>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Thread title"
          className={`${inputClass} w-full`}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something…"
          rows={2}
          className={`${inputClass} w-full resize-y`}
        />
        <button
          className={btnPrimaryClass}
          disabled={!title.trim() || !text.trim()}
          onClick={() => {
            if (title.trim() && text.trim()) {
              app.createThread(gameId, title.trim(), text.trim());
              setTitle('');
              setText('');
            }
          }}
        >
          Post thread
        </button>
      </Panel>
      {threads.map((t) => (
        <Panel key={t.id} className="overflow-hidden">
          <button
            className="w-full cursor-pointer px-4 py-3 text-left hover:bg-white/5"
            onClick={() => setOpenThread(openThread === t.id ? null : t.id)}
          >
            <strong className="text-sm text-slate-100">{t.title}</strong>
            <span className="ml-2 text-xs text-slate-500">
              {t.author} · {t.posts.length} post{t.posts.length !== 1 ? 's' : ''}
            </span>
          </button>
          {openThread === t.id && (
            <div className="space-y-3 px-4 pb-4">
              {t.posts.map((p) => (
                <div key={p.id} className="border-t border-white/10 pt-3">
                  <strong className={`text-sm ${p.isMine ? 'text-cyan-300' : 'text-slate-100'}`}>{p.author}</strong>{' '}
                  <span className="text-xs text-slate-500">{p.date}</span>
                  <p className="mt-1 text-sm text-slate-300">{p.text}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply…"
                  className={`${inputClass} flex-1`}
                />
                <button
                  className={btnClass}
                  onClick={() => {
                    if (reply.trim()) {
                      app.replyToThread(t.id, reply.trim());
                      setReply('');
                    }
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </Panel>
      ))}
      {threads.length === 0 && <p className="text-sm text-slate-500">No discussions yet — start one.</p>}
    </div>
  );
}
