import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { GAMES, getGame } from '../../data/games';
import { getRecommendations } from '../../utils/similarity';
import type { Game, Review, Thread } from '../../types';
import { Cover, EMBER, SAGE, ghostBtn, inputCls } from './ui';

/* The river: one continuous interleaved feed. New item kinds slot into this
   union and the renderer switch below — that's the extension point. */
type RiverItem =
  | { kind: 'review'; review: Review }
  | { kind: 'game'; game: Game; reason: string; heat: boolean }
  | { kind: 'thread'; thread: Thread }
  | { kind: 'note'; text: string; game: Game; hours: number };

type Current = 'all' | 'games' | 'talk';

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
        reason: `running hot right now — ${g.ratingsCount.toLocaleString()} logs and climbing`,
        heat: true,
      })),
      ...recs.slice(0, 4).map<RiverItem>((r) => ({
        kind: 'game',
        game: r.game,
        reason: `because your logbook leans ${r.matchedTags.slice(0, 2).join(' and ')} — ${r.score}% your kind of thing`,
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

    // Weave, don't stack: alternate talk and games so no section ever forms.
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
        <SessionBlock onNote={(gameId, text, hours) => setNotes((n) => [{ gameId, text, hours }, ...n])} />

        <div className="mt-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="border-b border-stone-800/70 py-5"
              style={{ paddingLeft: `${[0, 28, 10, 40][i % 4]}px` }}
            >
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
                  <span style={{ color: SAGE }}>you</span> logged{' '}
                  <span className="tabular-nums">+{item.hours}h</span> in{' '}
                  <Link to={`/game/${item.game.id}`} className="text-stone-200 underline-offset-4 hover:underline">
                    {item.game.title}
                  </Link>
                  {item.text && <span className="text-stone-400"> — “{item.text}”</span>}
                </p>
              )}
            </div>
          ))}
          <p className="py-8 text-center text-xs text-stone-600">the river keeps moving — check back soon</p>
        </div>
      </main>

      <aside className="sticky top-20 hidden h-fit w-56 shrink-0 lg:block">
        <p className="font-serif italic text-stone-100">you, briefly</p>
        <div className="mt-3 space-y-1 text-sm text-stone-400 tabular-nums">
          <p><span style={{ color: SAGE }}>{playing.length}</span> playing now</p>
          <p><span style={{ color: SAGE }}>{app.library.length}</span> in the logbook</p>
          <p><span style={{ color: SAGE }}>{app.library.reduce((s, e) => s + (e.hoursPlayed ?? 0), 0).toLocaleString()}</span> hours lived</p>
        </div>
        {app.favorites.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs text-stone-500">carried closest</p>
            <div className="flex gap-2">
              {app.favorites.map((id) => {
                const g = getGame(id);
                return g ? (
                  <Link key={id} to={`/game/${id}`}>
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
              className={`cursor-pointer border px-2.5 py-1 text-xs ${
                current === c ? 'border-stone-300 text-stone-100' : 'border-stone-700 text-stone-500 hover:text-stone-300'
              } bg-transparent`}
            >
              {c === 'all' ? 'the whole river' : c === 'games' ? 'just games' : 'just talk'}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function SessionBlock({ onNote }: { onNote: (gameId: string, text: string, hours: number) => void }) {
  const app = useApp();
  const playing = app.library.filter((e) => e.status === 'playing');
  const [note, setNote] = useState('');
  const [picked, setPicked] = useState<string>('');
  const target = picked || playing[0]?.gameId || '';
  const game = getGame(target);

  if (playing.length === 0) {
    return (
      <div className="border-l-2 py-4 pl-5" style={{ borderColor: SAGE }}>
        <p className="font-serif text-lg italic text-stone-100">Nothing on the fire tonight.</p>
        <p className="mt-1 text-sm text-stone-400">
          Mark a game as <em>playing</em> from <Link to="/browse" className="underline underline-offset-4">Browse</Link> and
          your session lives here, at the head of the river.
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
    <div className="border-l-2 py-4 pl-5" style={{ borderColor: SAGE }}>
      <p className="text-xs" style={{ color: SAGE }}>tonight's session</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {playing.length > 1 ? (
          <select className="bg-stone-900 border border-stone-700 px-2 py-1.5 text-sm" value={target} onChange={(e) => setPicked(e.target.value)}>
            {playing.map((e) => {
              const g = getGame(e.gameId);
              return g ? <option key={g.id} value={g.id}>{g.title}</option> : null;
            })}
          </select>
        ) : (
          <span className="font-serif text-xl italic text-stone-100">{game?.title}</span>
        )}
        <span className="text-sm text-stone-500 tabular-nums">
          {app.library.find((e) => e.gameId === target)?.hoursPlayed ?? 0}h so far
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {[0.5, 1, 2.5].map((h) => (
          <button key={h} className={ghostBtn} onClick={() => log(h)}>+{h}h</button>
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
      <p className="font-serif text-[17px] leading-relaxed text-stone-200">“{review.text}”</p>
      <p className="mt-2 text-xs text-stone-500">
        {review.author} on{' '}
        <Link to={`/game/${review.gameId}`} className="text-stone-300 underline-offset-4 hover:underline">
          {game?.title}
        </Link>{' '}
        · <span className="tabular-nums">{review.rating}/10</span> ·{' '}
        <button className="cursor-pointer border-none bg-transparent p-0 text-xs text-stone-500 hover:text-stone-300" onClick={() => app.toggleReviewLike(review.id)}>
          {review.likedByMe ? '▲ lifted' : '△ lift'} <span className="tabular-nums">{review.likes}</span>
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
      <Link to={`/game/${game.id}`} className="shrink-0">
        <Cover game={game} className="h-28 w-20" />
      </Link>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: heat ? EMBER : SAGE }}>{reason}</p>
        <Link to={`/game/${game.id}`} className="mt-1 block font-serif text-lg text-stone-100 hover:underline underline-offset-4">
          {game.title}
        </Link>
        <p className="mt-0.5 line-clamp-2 text-sm text-stone-400">{game.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs">
          {entry ? (
            <span style={{ color: SAGE }}>in your logbook — {entry.status}</span>
          ) : (
            <button className={ghostBtn} onClick={() => app.setStatus(game.id, 'want')}>want to play</button>
          )}
          <span className="text-stone-600 tabular-nums">★ {game.communityRating.toFixed(1)}</span>
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
      <button onClick={onToggle} className="block w-full cursor-pointer border-none bg-transparent p-0 text-left">
        <p className="text-xs" style={{ color: EMBER }}>
          talk drifting past · {thread.posts.length} {thread.posts.length === 1 ? 'voice' : 'voices'}
        </p>
        <p className="mt-1 text-[15px] text-stone-200">
          “{thread.title}” <span className="text-stone-500">— {game?.title}</span>
        </p>
      </button>
      {open && (
        <div className="mt-3 space-y-3 border-l border-stone-800 pl-4">
          {thread.posts.map((p) => (
            <p key={p.id} className="text-sm text-stone-400">
              <span className={p.isMine ? '' : 'text-stone-300'} style={p.isMine ? { color: SAGE } : undefined}>{p.author}</span>
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
            <button
              className={ghostBtn}
              disabled={!reply.trim()}
              onClick={() => { app.replyToThread(thread.id, reply.trim()); setReply(''); }}
            >
              reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
