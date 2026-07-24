import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGame } from '../../data/games';
import { useApp } from '../../store/AppContext';
import { STATUS_LABELS, STATUS_ORDER } from '../../components/statusMeta';
import type { PlayStatus } from '../../types';
import { Btn, Cover, RatingRow, Tag, inputCls } from './ui';

export function GameDetail() {
  const { id } = useParams();
  const game = getGame(id ?? '');
  const app = useApp();
  const [tab, setTab] = useState<'reviews' | 'discussion'>('reviews');

  if (!game) {
    return (
      <p className="mt-10 italic text-neutral-600">
        Title not found. <Link to="/browse" className="text-emerald-900 underline">Return to the catalog.</Link>
      </p>
    );
  }

  const entry = app.library.find((e) => e.gameId === game.id);
  const reviews = app.reviews.filter((r) => r.gameId === game.id);
  const threads = app.threads.filter((t) => t.gameId === game.id);
  const isFavorite = app.favorites.includes(game.id);

  return (
    <div className="mt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-900/80">
        {game.tags[0]} · {game.year}
      </p>
      <h1 className="mt-1 font-serif text-5xl font-black leading-tight text-neutral-900">{game.title}</h1>
      <p className="mt-2 border-b border-neutral-300 pb-4 text-sm uppercase tracking-wider text-neutral-500">
        By {game.developer} · {game.platforms.join(' / ')} ·{' '}
        <span className="font-bold text-emerald-900">{game.communityRating.toFixed(1)}/10</span>{' '}
        ({game.ratingsCount.toLocaleString()} ratings)
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="flex gap-6">
            <Cover game={game} className="hidden h-56 w-42 shrink-0 sm:flex" />
            <p className="text-lg leading-relaxed text-neutral-700 first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.8] first-letter:text-emerald-900">
              {game.description}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {game.tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>

          {/* Tabs */}
          <div className="mt-10 flex border-b-2 border-neutral-900">
            {(['reviews', 'discussion'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 font-serif text-lg capitalize ${
                  tab === t ? 'bg-neutral-900 font-bold text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {t} ({t === 'reviews' ? reviews.length : threads.length})
              </button>
            ))}
          </div>
          {tab === 'reviews' ? <ReviewsPanel gameId={game.id} /> : <DiscussionPanel gameId={game.id} />}
        </div>

        {/* Tracking sidebar */}
        <aside className="h-fit border border-neutral-300 bg-white p-5 lg:sticky lg:top-6">
          <h2 className="border-b border-neutral-300 pb-2 font-serif text-lg font-bold text-neutral-900">
            Your record
          </h2>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <label className="mb-1 block font-semibold uppercase tracking-wider text-neutral-500">Status</label>
              <select
                value={entry?.status ?? ''}
                onChange={(e) => app.setStatus(game.id, (e.target.value || null) as PlayStatus | null)}
                className={`${inputCls} w-full`}
              >
                <option value="">— Not in library —</option>
                {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-semibold uppercase tracking-wider text-neutral-500">
                Rating {entry?.rating != null && <span className="text-emerald-900">{entry.rating}/10</span>}
              </label>
              <RatingRow value={entry?.rating ?? null} onChange={(v) => app.setRating(game.id, v)} />
            </div>
            <div>
              <label className="mb-1 block font-semibold uppercase tracking-wider text-neutral-500">Hours played</label>
              <input
                type="number"
                min={0}
                value={entry?.hoursPlayed ?? ''}
                placeholder="0"
                onChange={(e) => app.setHours(game.id, e.target.value === '' ? null : Number(e.target.value))}
                className={`${inputCls} w-28`}
              />
              {entry?.fromSteam && (
                <span className="ml-2 text-xs uppercase tracking-wider text-emerald-900">from Steam</span>
              )}
            </div>
            <Btn onClick={() => app.toggleFavorite(game.id)} primary={isFavorite} className="w-full">
              {isFavorite ? '★ In your Top 3' : app.favorites.length >= 3 ? 'Top 3 is full' : '☆ Add to Top 3'}
            </Btn>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReviewsPanel({ gameId }: { gameId: string }) {
  const app = useApp();
  const reviews = app.reviews.filter((r) => r.gameId === gameId);
  const myReview = reviews.find((r) => r.isMine);
  const [text, setText] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  return (
    <div className="mt-6">
      {!myReview && (
        <div className="border border-neutral-300 bg-white p-5">
          <h3 className="font-serif text-lg font-bold text-neutral-900">Submit your review</h3>
          <div className="mt-3"><RatingRow value={rating} onChange={setRating} /></div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="What did you make of it?"
            className={`${inputCls} mt-3 w-full`}
          />
          <Btn
            primary
            className="mt-3"
            disabled={!text.trim() || rating == null}
            onClick={() => {
              if (text.trim() && rating != null) {
                app.addReview(gameId, rating, text.trim());
                setText('');
                setRating(null);
              }
            }}
          >
            Publish review
          </Btn>
        </div>
      )}
      <ul className="mt-4 divide-y divide-neutral-300">
        {reviews.map((r) => (
          <li key={r.id} className="py-5">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-lg font-bold text-neutral-900">{r.author}</span>
              {r.isMine && <span className="text-xs uppercase tracking-wider text-emerald-900">you</span>}
              <span className="ml-auto font-serif text-xl font-bold text-emerald-900">{r.rating}/10</span>
            </div>
            <p className="mt-1 leading-relaxed text-neutral-700">{r.text}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500">
              <button onClick={() => app.toggleReviewLike(r.id)} className={`hover:text-emerald-900 ${r.likedByMe ? 'font-bold text-emerald-900' : ''}`}>
                Commend ({r.likes})
              </button>
              <span>{r.date}</span>
              {r.isMine && (
                <button onClick={() => app.deleteMyReview(r.id)} className="text-red-900/70 hover:underline">
                  Retract
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {reviews.length === 0 && <p className="py-8 italic text-neutral-500">No reviews yet — be the first critic.</p>}
    </div>
  );
}

function DiscussionPanel({ gameId }: { gameId: string }) {
  const app = useApp();
  const threads = app.threads.filter((t) => t.gameId === gameId);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [open, setOpen] = useState<string | null>(threads[0]?.id ?? null);
  const [reply, setReply] = useState('');

  return (
    <div className="mt-6">
      <div className="border border-neutral-300 bg-white p-5">
        <h3 className="font-serif text-lg font-bold text-neutral-900">Open a correspondence</h3>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Subject"
          className={`${inputCls} mt-3 w-full`}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Your opening remarks…"
          className={`${inputCls} mt-2 w-full`}
        />
        <Btn
          primary
          className="mt-3"
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
        </Btn>
      </div>

      <ul className="mt-4 divide-y divide-neutral-300">
        {threads.map((t) => (
          <li key={t.id} className="py-4">
            <button onClick={() => setOpen(open === t.id ? null : t.id)} className="w-full text-left">
              <span className="font-serif text-lg font-semibold text-neutral-900 hover:underline">{t.title}</span>
              <span className="ml-3 text-sm text-neutral-500">
                {t.author} · {t.posts.length} {t.posts.length === 1 ? 'letter' : 'letters'}
              </span>
            </button>
            {open === t.id && (
              <div className="mt-3 border-l-2 border-neutral-300 pl-4">
                {t.posts.map((p) => (
                  <div key={p.id} className="py-2">
                    <p className="text-sm">
                      <span className={`font-bold ${p.isMine ? 'text-emerald-900' : 'text-neutral-900'}`}>{p.author}</span>{' '}
                      <span className="text-neutral-500">· {p.date}</span>
                    </p>
                    <p className="mt-0.5 leading-relaxed text-neutral-700">{p.text}</p>
                  </div>
                ))}
                <div className="mt-2 flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply…"
                    className={`${inputCls} flex-1`}
                  />
                  <Btn
                    onClick={() => {
                      if (reply.trim()) {
                        app.replyToThread(t.id, reply.trim());
                        setReply('');
                      }
                    }}
                  >
                    Reply
                  </Btn>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {threads.length === 0 && <p className="py-8 italic text-neutral-500">No discussions yet — start one.</p>}
    </div>
  );
}
