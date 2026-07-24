import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGame } from '../../data/games';
import { useApp } from '../../store/AppContext';
import { Cover, EMBER, SAGE, ghostBtn, inputCls, RatingRow, StatusSelect, Hairline } from './ui';

export function GameDetail() {
  const { id } = useParams();
  const game = getGame(id ?? '');
  const app = useApp();
  const [tab, setTab] = useState<'reviews' | 'talk'>('reviews');

  if (!game) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p>Never heard of it. <Link to="/browse" className="underline underline-offset-4">Back to the shelves.</Link></p>
      </div>
    );
  }

  const entry = app.library.find((e) => e.gameId === game.id);
  const reviews = app.reviews.filter((r) => r.gameId === game.id);
  const threads = app.threads.filter((t) => t.gameId === game.id);
  const isFav = app.favorites.includes(game.id);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex flex-wrap gap-8">
        <Cover game={game} className="h-64 w-44 shrink-0" />
        <div className="min-w-64 flex-1">
          <h1 className="font-serif text-3xl text-stone-100">{game.title}</h1>
          <p className="mt-1 text-sm text-stone-500">{game.developer} · {game.year} · {game.platforms.join(', ')}</p>
          <p className="mt-1 text-xs text-stone-500">{game.tags.join(' · ').toLowerCase()}</p>
          <p className="mt-4 max-w-xl leading-relaxed text-stone-300">{game.description}</p>
          <p className="mt-3 text-sm text-stone-400 tabular-nums">
            ★ {game.communityRating.toFixed(1)} <span className="text-stone-600">from {game.ratingsCount.toLocaleString()} logs</span>
          </p>

          <div className="mt-6 border-l-2 py-3 pl-5" style={{ borderColor: SAGE }}>
            <p className="text-xs" style={{ color: SAGE }}>your record</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <StatusSelect value={entry?.status ?? ''} onChange={(s) => app.setStatus(game.id, s)} />
              <RatingRow value={entry?.rating ?? null} onChange={(v) => app.setRating(game.id, v)} />
              <label className="flex items-center gap-2 text-stone-400">
                <input
                  type="number" min={0}
                  className="w-20 border-b border-stone-600 bg-transparent px-1 py-1 text-sm tabular-nums focus:outline-none focus:border-stone-300"
                  value={entry?.hoursPlayed ?? ''}
                  placeholder="0"
                  onChange={(e) => app.setHours(game.id, e.target.value === '' ? null : Number(e.target.value))}
                />
                hours{entry?.fromSteam && <span className="text-xs" style={{ color: SAGE }}>· steam</span>}
              </label>
              <button className={ghostBtn} onClick={() => app.toggleFavorite(game.id)}>
                {isFav ? 'carried closest ✕' : app.favorites.length >= 3 ? 'top 3 is full' : 'carry it closest'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Hairline />

      <div className="flex gap-6 text-sm">
        <button
          className={`cursor-pointer border-none bg-transparent p-0 ${tab === 'reviews' ? 'text-stone-100 underline underline-offset-8' : 'text-stone-500'}`}
          onClick={() => setTab('reviews')}
        >
          voices ({reviews.length})
        </button>
        <button
          className={`cursor-pointer border-none bg-transparent p-0 ${tab === 'talk' ? 'text-stone-100 underline underline-offset-8' : 'text-stone-500'}`}
          onClick={() => setTab('talk')}
        >
          around the fire ({threads.length})
        </button>
      </div>

      {tab === 'reviews' ? <ReviewsTab gameId={game.id} /> : <TalkTab gameId={game.id} />}
    </div>
  );
}

function ReviewsTab({ gameId }: { gameId: string }) {
  const app = useApp();
  const reviews = app.reviews.filter((r) => r.gameId === gameId);
  const mine = reviews.find((r) => r.isMine);
  const [text, setText] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  return (
    <div className="mt-6">
      {!mine && (
        <div className="mb-8 border-l-2 py-3 pl-5" style={{ borderColor: SAGE }}>
          <p className="text-xs" style={{ color: SAGE }}>add your voice</p>
          <div className="mt-2"><RatingRow value={rating} onChange={setRating} /></div>
          <textarea
            className="mt-3 w-full border border-stone-700 bg-transparent p-2 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-stone-400"
            rows={3} placeholder="what stayed with you?"
            value={text} onChange={(e) => setText(e.target.value)}
          />
          <button
            className={`${ghostBtn} mt-2`}
            disabled={!text.trim() || rating == null}
            onClick={() => { if (text.trim() && rating != null) { app.addReview(gameId, rating, text.trim()); setText(''); setRating(null); } }}
          >
            let it drift
          </button>
        </div>
      )}
      <div className="space-y-6">
        {reviews.map((r) => (
          <div key={r.id} className="border-l border-stone-800 pl-4" style={r.isMine ? { borderColor: SAGE } : undefined}>
            <p className="font-serif text-[17px] leading-relaxed text-stone-200">“{r.text}”</p>
            <p className="mt-2 text-xs text-stone-500">
              <span style={r.isMine ? { color: SAGE } : undefined}>{r.author}</span> · <span className="tabular-nums">{r.rating}/10</span> · {r.date} ·{' '}
              <button className="cursor-pointer border-none bg-transparent p-0 text-xs text-stone-500 hover:text-stone-300" onClick={() => app.toggleReviewLike(r.id)}>
                {r.likedByMe ? '▲' : '△'} <span className="tabular-nums">{r.likes}</span>
              </button>
              {r.isMine && (
                <>
                  {' · '}
                  <button className="cursor-pointer border-none bg-transparent p-0 text-xs text-red-400/70 hover:text-red-400" onClick={() => app.deleteMyReview(r.id)}>take it back</button>
                </>
              )}
            </p>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-stone-500">No voices yet — yours could be first.</p>}
      </div>
    </div>
  );
}

function TalkTab({ gameId }: { gameId: string }) {
  const app = useApp();
  const threads = app.threads.filter((t) => t.gameId === gameId);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [open, setOpen] = useState<string | null>(threads[0]?.id ?? null);
  const [reply, setReply] = useState('');

  return (
    <div className="mt-6">
      <div className="mb-8 border-l-2 py-3 pl-5" style={{ borderColor: EMBER }}>
        <p className="text-xs" style={{ color: EMBER }}>light a new conversation</p>
        <input className={`${inputCls} mt-2 w-full`} placeholder="what's it about?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={`${inputCls} mt-2 w-full`} placeholder="first spark…" value={text} onChange={(e) => setText(e.target.value)} />
        <button
          className={`${ghostBtn} mt-3`}
          disabled={!title.trim() || !text.trim()}
          onClick={() => { app.createThread(gameId, title.trim(), text.trim()); setTitle(''); setText(''); }}
        >
          strike the match
        </button>
      </div>
      <div className="space-y-4">
        {threads.map((t) => (
          <div key={t.id}>
            <button
              className="block w-full cursor-pointer border-none bg-transparent p-0 text-left"
              onClick={() => setOpen(open === t.id ? null : t.id)}
            >
              <p className="text-[15px] text-stone-200">“{t.title}”</p>
              <p className="text-xs text-stone-500">{t.author} · {t.posts.length} {t.posts.length === 1 ? 'voice' : 'voices'} · {t.date}</p>
            </button>
            {open === t.id && (
              <div className="mt-3 space-y-3 border-l border-stone-800 pl-4">
                {t.posts.map((p) => (
                  <p key={p.id} className="text-sm text-stone-400">
                    <span style={p.isMine ? { color: SAGE } : undefined} className={p.isMine ? '' : 'text-stone-300'}>{p.author}</span>
                    {' — '}{p.text}
                  </p>
                ))}
                <div className="flex gap-2 pt-1">
                  <input
                    className={`${inputCls} flex-1`} placeholder="add your voice…"
                    value={reply} onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && reply.trim()) { app.replyToThread(t.id, reply.trim()); setReply(''); } }}
                  />
                  <button className={ghostBtn} disabled={!reply.trim()} onClick={() => { app.replyToThread(t.id, reply.trim()); setReply(''); }}>
                    reply
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {threads.length === 0 && <p className="text-sm text-stone-500">Quiet here. Strike the first match.</p>}
      </div>
    </div>
  );
}
