import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGame } from '../../data/games';
import { useApp } from '../../store/AppContext';
import { Btn, Chip, Cover, DISPLAY, EMBER, LINE, MONO, MOSS, MUTED, Panel, RatingRow, StatusSelect, TEXT, focusRing, inputCls } from './ui';

export function GameDetail() {
  const { id } = useParams();
  const game = getGame(id ?? '');
  const app = useApp();
  const [tab, setTab] = useState<'reviews' | 'talk'>('reviews');

  if (!game) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p>
          That game isn't in the catalog.{' '}
          <Link to="/browse" className={`underline underline-offset-4 ${focusRing}`} style={{ color: TEXT }}>Back to Browse.</Link>
        </p>
      </div>
    );
  }

  const entry = app.library.find((e) => e.gameId === game.id);
  const reviews = app.reviews.filter((r) => r.gameId === game.id);
  const threads = app.threads.filter((t) => t.gameId === game.id);
  const isFavorite = app.favorites.includes(game.id);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex flex-wrap gap-8">
        <Cover game={game} className="h-72 w-52 shrink-0" />
        <div className="min-w-64 flex-1">
          <h1 className="text-3xl font-semibold" style={DISPLAY}>{game.title}</h1>
          <p className="mt-1 text-xs" style={{ color: MUTED, ...MONO }}>
            {game.developer} · {game.year} · {game.platforms.join(' / ')}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {game.tags.map((t) => <Chip key={t}>{t.toLowerCase()}</Chip>)}
          </div>
          <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: TEXT }}>{game.description}</p>
          <p className="mt-2 text-sm" style={{ color: EMBER, ...MONO }}>
            {game.communityRating.toFixed(1)}/10 from {game.ratingsCount.toLocaleString()} players
          </p>

          <Panel edge={MOSS} className="mt-5 p-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <label className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                status
                <StatusSelect value={entry?.status ?? ''} onChange={(s) => app.setStatus(game.id, s)} />
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                hours
                <input
                  type="number"
                  min={0}
                  className={`${inputCls} w-24`}
                  value={entry?.hoursPlayed ?? ''}
                  placeholder="0"
                  onChange={(e) => app.setHours(game.id, e.target.value === '' ? null : Number(e.target.value))}
                />
              </label>
              {entry?.fromSteam && <Chip color={MOSS}>from steam</Chip>}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                your rating <RatingRow value={entry?.rating ?? null} onChange={(v) => app.setRating(game.id, v)} />
              </span>
              <Btn onClick={() => app.toggleFavorite(game.id)}>
                {isFavorite ? 'remove from top 3' : app.favorites.length >= 3 ? 'top 3 is full' : 'add to top 3'}
              </Btn>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-8 flex gap-1 border-b" style={{ borderColor: LINE }}>
        {(['reviews', 'talk'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`cursor-pointer border-none bg-transparent px-4 py-2 text-sm ${focusRing}`}
            style={{
              ...DISPLAY,
              color: tab === t ? TEXT : MUTED,
              borderBottom: tab === t ? `2px solid ${t === 'reviews' ? MOSS : EMBER}` : '2px solid transparent',
            }}
          >
            {t === 'reviews' ? `reviews (${reviews.length})` : `talk (${threads.length})`}
          </button>
        ))}
      </div>

      {tab === 'reviews' ? <ReviewsTab gameId={game.id} /> : <TalkTab gameId={game.id} />}
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
    <div className="mt-5 space-y-5">
      {!myReview && (
        <Panel edge={MOSS} className="p-4">
          <p className="text-sm font-semibold" style={DISPLAY}>write your review</p>
          <div className="mt-2"><RatingRow value={rating} onChange={setRating} /></div>
          <textarea
            className={`${inputCls} mt-3 resize-y`}
            rows={3}
            placeholder="what stayed with you?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-3">
            <Btn primary disabled={!text.trim() || rating == null} onClick={submit}>post review</Btn>
          </div>
        </Panel>
      )}
      {reviews.map((r) => (
        <div key={r.id} className="pl-4" style={{ borderLeft: `2px solid ${r.isMine ? MOSS : LINE}` }}>
          <p className="text-sm">
            <span style={{ color: r.isMine ? MOSS : TEXT }}>{r.author}</span>{' '}
            <span style={{ color: MUTED, ...MONO }}>{r.rating}/10 · {r.date}</span>
          </p>
          <p className="mt-1 max-w-2xl text-[15px] leading-relaxed" style={{ color: TEXT }}>{r.text}</p>
          <p className="mt-1.5 flex items-center gap-4 text-xs">
            <button
              className={`cursor-pointer border-none bg-transparent p-0 hover:text-[#e3ddd2] ${focusRing}`}
              style={{ color: r.likedByMe ? MOSS : MUTED }}
              onClick={() => app.toggleReviewLike(r.id)}
            >
              {r.likedByMe ? 'lifted' : 'lift this'} <span style={MONO}>{r.likes}</span>
            </button>
            {r.isMine && (
              <button
                className={`cursor-pointer border-none bg-transparent p-0 ${focusRing}`}
                style={{ color: '#b5484d' }}
                onClick={() => app.deleteMyReview(r.id)}
              >
                delete
              </button>
            )}
          </p>
        </div>
      ))}
      {reviews.length === 0 && <p className="text-sm" style={{ color: MUTED }}>No reviews yet — yours goes first.</p>}
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

  const create = () => {
    if (!title.trim() || !text.trim()) return;
    app.createThread(gameId, title.trim(), text.trim());
    setTitle('');
    setText('');
  };

  return (
    <div className="mt-5 space-y-5">
      <Panel edge={EMBER} className="p-4">
        <p className="text-sm font-semibold" style={DISPLAY}>start a thread</p>
        <input className={`${inputCls} mt-2`} placeholder="thread title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea
          className={`${inputCls} mt-2 resize-y`}
          rows={2}
          placeholder="open the conversation"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3">
          <Btn primary disabled={!title.trim() || !text.trim()} onClick={create}>post thread</Btn>
        </div>
      </Panel>
      {threads.map((t) => (
        <div key={t.id}>
          <button
            onClick={() => setOpen(open === t.id ? null : t.id)}
            className={`block w-full cursor-pointer border-none bg-transparent p-0 text-left ${focusRing}`}
          >
            <p className="text-[15px]" style={{ color: TEXT }}>
              "{t.title}"{' '}
              <span className="text-xs" style={{ color: EMBER, ...MONO }}>
                {t.posts.length} {t.posts.length === 1 ? 'voice' : 'voices'}
              </span>
            </p>
            <p className="text-xs" style={{ color: MUTED }}>{t.author} · {t.date}</p>
          </button>
          {open === t.id && (
            <div className="mt-3 space-y-3 pl-4" style={{ borderLeft: `1px solid ${LINE}` }}>
              {t.posts.map((p) => (
                <p key={p.id} className="text-sm" style={{ color: MUTED }}>
                  <span style={{ color: p.isMine ? MOSS : TEXT }}>{p.author}</span> — {p.text}
                </p>
              ))}
              <div className="flex gap-2 pt-1">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="reply"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && reply.trim()) { app.replyToThread(t.id, reply.trim()); setReply(''); }
                  }}
                />
                <Btn disabled={!reply.trim()} onClick={() => { app.replyToThread(t.id, reply.trim()); setReply(''); }}>
                  reply
                </Btn>
              </div>
            </div>
          )}
        </div>
      ))}
      {threads.length === 0 && <p className="text-sm" style={{ color: MUTED }}>No talk yet — start the first thread.</p>}
    </div>
  );
}
