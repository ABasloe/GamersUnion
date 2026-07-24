import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { GAMES, getGame } from '../../data/games';
import { getRecommendations } from '../../utils/similarity';
import type { Game, Review, Thread } from '../../types';
import { Btn, Cover, DISPLAY, EMBER, LINE, MONO, MOSS, MUTED, SLANT, TEXT, focusRing, inputCls, selectCls } from './ui';

/* The river: one continuous interleaved feed hung off a single spine line.
   New item kinds slot into this union and the renderer switch. */
type RiverItem =
  | { kind: 'review'; review: Review }
  | { kind: 'game'; game: Game; reason: string; heat: boolean }
  | { kind: 'thread'; thread: Thread }
  | { kind: 'note'; text: string; game: Game; hours: number };

type Current = 'all' | 'games' | 'talk';

/* Meander: indentation cycle for items hanging off the spine (not a rhythm of three). */
const MEANDER = [16, 44, 24, 60, 32];

export function Home() {
  const app = useApp();
  const [current, setCurrent] = useState<Current>('all');
  const [notes, setNotes] = useState<{ text: string; gameId: string; hours: number }[]>([]);
  const [openThread, setOpenThread] = useState<string | null>(null);

  const playing = app.library.filter((e) => e.status === 'playing');
  const recs = useMemo(() => getRecommendations(app.library, app.favorites), [app.library, app.favorites]);

  const items = useMemo<RiverItem[]>(() => {
    const trending = [...GAMES].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 5);
    const games: RiverItem[] = [
      ...trending.map<RiverItem>((g) => ({
        kind: 'game',
        game: g,
        reason: `running hot — ${g.ratingsCount.toLocaleString()} logs and climbing`,
        heat: true,
      })),
      ...recs.slice(0, 4).map<RiverItem>((r) => ({
        kind: 'game',
        game: r.game,
        reason: `your logbook leans ${r.matchedTags.slice(0, 2).join(' and ')} — ${r.score}% your kind of thing`,
        heat: false,
      })),
    ];
    const talk: RiverItem[] = [
      ...app.reviews.slice(0, 8).map<RiverItem>((review) => ({ kind: 'review', review })),
      ...app.threads.slice(0, 6).map<RiverItem>((thread) => ({ kind: 'thread', thread })),
    ];
    const noteItems: RiverItem[] = notes
      .map<RiverItem | null>((n) => {
        const game = getGame(n.gameId);
        return game ? { kind: 'note', text: n.text, game, hours: n.hours } : null;
      })
      .filter((n): n is RiverItem => n !== null);

    const woven: RiverItem[] = [...noteItems];
    const a = current === 'games' ? [] : talk;
    const b = current === 'talk' ? [] : games;
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      if (a[i]) woven.push(a[i]);
      if (b[i]) woven.push(b[i]);
    }
    return woven;
  }, [app.reviews, app.threads, recs, notes, current]);

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-5 py-8">
      <main className="min-w-0 flex-1">
        <SessionBlock playing={playing} onNote={(gameId, text, hours) => setNotes((n) => [{ gameId, text, hours }, ...n])} />

        {/* the current — the spine every item hangs from */}
        <div className="relative mt-4" style={{ borderLeft: `1px solid ${LINE}` }}>
          {items.map((item, i) => (
            <div key={i} className="relative py-5" style={{ paddingLeft: `${MEANDER[i % MEANDER.length]}px` }}>
              <span
                aria-hidden
                className="absolute top-1/2 left-0 h-px"
                style={{ width: `${MEANDER[i % MEANDER.length] - 8}px`, background: LINE }}
              />
              {item.kind === 'review' && <ReviewDrift review={item.review} />}
              {item.kind === 'game' && <GameDrift game={item.game} reason={item.reason} heat={item.heat} />}
              {item.kind === 'thread' && (
                <ThreadDrift
                  thread={item.thread}
                  open={openThread === item.thread.id}
                  onToggle={() => setOpenThread(openThread === item.thread.id ? null : item.thread.id)}
                />
              )}
              {item.kind === 'note' && (
                <p className="text-sm">
                  <span style={{ color: MOSS }}>you</span> logged{' '}
                  <span style={MONO}>+{item.hours}h</span> in{' '}
                  <Link to={`/game/${item.game.id}`} className={`underline-offset-4 hover:underline ${focusRing}`} style={{ color: TEXT }}>
                    {item.game.title}
                  </Link>
                  {item.text && <span style={{ color: MUTED }}> — "{item.text}"</span>}
                </p>
              )}
            </div>
          ))}
          <p className="py-8 pl-4 text-xs" style={{ color: MUTED }}>
            the river keeps moving — check back soon
          </p>
        </div>
      </main>

      <aside className="sticky top-20 hidden h-fit w-56 shrink-0 lg:block">
        <p className="text-sm font-semibold" style={DISPLAY}>you, briefly</p>
        <div className="mt-3 space-y-1 text-sm" style={{ color: MUTED, ...MONO }}>
          <p><span style={{ color: MOSS }}>{playing.length}</span> playing now</p>
          <p><span style={{ color: MOSS }}>{app.library.length}</span> in the logbook</p>
          <p><span style={{ color: MOSS }}>{app.library.reduce((s, e) => s + (e.hoursPlayed ?? 0), 0).toLocaleString()}</span> hours lived</p>
        </div>
        {app.favorites.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs" style={{ color: MUTED }}>carried closest</p>
            <div className="flex gap-2">
              {app.favorites.map((id) => {
                const g = getGame(id);
                return g ? (
                  <Link key={id} to={`/game/${id}`} className={focusRing}>
                    <Cover game={g} className="h-20 w-14" />
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-1.5">
          {(['all', 'games', 'talk'] as Current[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrent(c)}
              className={`cursor-pointer border-none px-3 py-1 text-xs ${focusRing}`}
              style={{
                clipPath: SLANT,
                ...DISPLAY,
                background: current === c ? MOSS : 'var(--gu-raised)',
                color: current === c ? 'var(--gu-ground)' : MUTED,
              }}
            >
              {c === 'all' ? 'everything' : c === 'games' ? 'just games' : 'just talk'}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function SessionBlock({
  playing,
  onNote,
}: {
  playing: ReturnType<typeof useApp>['library'];
  onNote: (gameId: string, text: string, hours: number) => void;
}) {
  const app = useApp();
  const [note, setNote] = useState('');
  const [picked, setPicked] = useState<string>('');
  const target = picked || playing[0]?.gameId || '';
  const game = getGame(target);

  if (playing.length === 0) {
    return (
      <div className="py-4 pl-5" style={{ borderLeft: `3px solid ${MOSS}` }}>
        <p className="text-lg font-semibold" style={DISPLAY}>Nothing on tonight.</p>
        <p className="mt-1 text-sm" style={{ color: MUTED }}>
          Mark a game as playing from <Link to="/browse" className={`underline underline-offset-4 ${focusRing}`} style={{ color: TEXT }}>Browse</Link>{' '}
          and your session lives here, at the head of the river.
        </p>
      </div>
    );
  }

  const log = (hours: number) => {
    if (!game) return;
    const entry = app.library.find((e) => e.gameId === game.id);
    app.setHours(game.id, Math.round(((entry?.hoursPlayed ?? 0) + hours) * 10) / 10);
    onNote(game.id, note.trim(), hours);
    setNote('');
  };

  return (
    <div className="py-4 pl-5" style={{ borderLeft: `3px solid ${MOSS}` }}>
      <p className="text-xs" style={{ color: MOSS, ...DISPLAY }}>tonight's session</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {playing.length > 1 ? (
          <select className={selectCls} value={target} onChange={(e) => setPicked(e.target.value)}>
            {playing.map((e) => {
              const g = getGame(e.gameId);
              return g ? <option key={g.id} value={g.id}>{g.title}</option> : null;
            })}
          </select>
        ) : (
          <span className="text-xl font-semibold" style={DISPLAY}>{game?.title}</span>
        )}
        <span className="text-sm" style={{ color: MUTED, ...MONO }}>
          {app.library.find((e) => e.gameId === target)?.hoursPlayed ?? 0}h so far
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {[0.5, 1, 2.5, 4].map((h) => (
          <Btn key={h} onClick={() => log(h)}>+{h}h</Btn>
        ))}
        <input
          className={`${inputCls} min-w-0 flex-1`}
          placeholder="one line about tonight (drifts into the river)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') log(1); }}
        />
      </div>
    </div>
  );
}

function ReviewDrift({ review }: { review: Review }) {
  const app = useApp();
  const game = getGame(review.gameId);
  return (
    <div>
      <p className="max-w-2xl text-[16px] leading-relaxed">"{review.text}"</p>
      <p className="mt-2 text-xs" style={{ color: MUTED }}>
        {review.author} on{' '}
        <Link to={`/game/${review.gameId}`} className={`underline-offset-4 hover:underline ${focusRing}`} style={{ color: TEXT }}>
          {game?.title}
        </Link>{' '}
        · <span style={MONO}>{review.rating}/10</span> ·{' '}
        <button
          className={`cursor-pointer border-none bg-transparent p-0 text-xs hover:text-[var(--gu-text)] ${focusRing}`}
          style={{ color: review.likedByMe ? MOSS : MUTED }}
          onClick={() => app.toggleReviewLike(review.id)}
        >
          {review.likedByMe ? 'lifted' : 'lift this'} <span style={MONO}>{review.likes}</span>
        </button>
      </p>
    </div>
  );
}

function GameDrift({ game, reason, heat }: { game: Game; reason: string; heat: boolean }) {
  const app = useApp();
  const entry = app.library.find((e) => e.gameId === game.id);
  return (
    <div className="flex gap-4">
      <Link to={`/game/${game.id}`} className={`shrink-0 ${focusRing}`}>
        <Cover game={game} className="h-28 w-20" />
      </Link>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: heat ? EMBER : MOSS }}>{reason}</p>
        <Link
          to={`/game/${game.id}`}
          className={`mt-1 block text-lg font-semibold underline-offset-4 hover:underline ${focusRing}`}
          style={{ ...DISPLAY, color: TEXT }}
        >
          {game.title}
        </Link>
        <p className="mt-0.5 line-clamp-2 max-w-xl text-sm" style={{ color: MUTED }}>{game.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs">
          {entry ? (
            <span style={{ color: MOSS }}>in your logbook — {entry.status}</span>
          ) : (
            <Btn onClick={() => app.setStatus(game.id, 'want')}>want to play</Btn>
          )}
          <span style={{ color: MUTED, ...MONO }}>{game.communityRating.toFixed(1)}/10 community</span>
        </div>
      </div>
    </div>
  );
}

function ThreadDrift({ thread, open, onToggle }: { thread: Thread; open: boolean; onToggle: () => void }) {
  const app = useApp();
  const game = getGame(thread.gameId);
  const [reply, setReply] = useState('');
  return (
    <div>
      <button onClick={onToggle} className={`block w-full cursor-pointer border-none bg-transparent p-0 text-left ${focusRing}`}>
        <p className="text-xs" style={{ color: EMBER }}>
          talk drifting past · {thread.posts.length} {thread.posts.length === 1 ? 'voice' : 'voices'}
        </p>
        <p className="mt-1 text-[15px]" style={{ color: TEXT }}>
          "{thread.title}" <span style={{ color: MUTED }}>— {game?.title}</span>
        </p>
      </button>
      {open && (
        <div className="mt-3 space-y-3 pl-4" style={{ borderLeft: `1px solid ${LINE}` }}>
          {thread.posts.map((p) => (
            <p key={p.id} className="text-sm" style={{ color: MUTED }}>
              <span style={{ color: p.isMine ? MOSS : TEXT }}>{p.author}</span>
              {' — '}{p.text}
            </p>
          ))}
          <div className="flex gap-2 pt-1">
            <input
              className={`${inputCls} flex-1`}
              placeholder="add your voice, stay in the river"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && reply.trim()) { app.replyToThread(thread.id, reply.trim()); setReply(''); }
              }}
            />
            <Btn disabled={!reply.trim()} onClick={() => { app.replyToThread(thread.id, reply.trim()); setReply(''); }}>
              reply
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
