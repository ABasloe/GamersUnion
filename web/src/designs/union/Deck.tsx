import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { GAMES, getGame } from '../../data/games';
import { getRecommendations } from '../../utils/similarity';
import type { Game, Review, Thread } from '../../types';
import { Btn, Cover, DISPLAY, EMBER, LINE, MONO, MOSS, MUTED, RatingRow, TEXT, focusRing, inputCls } from './ui';

/* Deck cards are a discriminated union — add new card kinds here. */
type Card =
  | { kind: 'game'; game: Game; why: string }
  | { kind: 'review'; review: Review; game: Game }
  | { kind: 'thread'; thread: Thread; game: Game };

export function Deck() {
  const app = useApp();
  const [i, setI] = useState(0);
  const [strip, setStrip] = useState(false);

  const cards = useMemo<Card[]>(() => {
    const recs = getRecommendations(app.library, app.favorites);
    const owned = new Set(app.library.map((e) => e.gameId));
    const gameCards: Card[] = (recs.length > 0
      ? recs.slice(0, 8).map((r) => ({
          kind: 'game' as const,
          game: r.game,
          why: `dealt because your logbook leans ${r.matchedTags.slice(0, 2).join(' and ')} · ${r.score}% match`,
        }))
      : [...GAMES].sort((a, b) => b.trendingScore - a.trendingScore).filter((g) => !owned.has(g.id)).slice(0, 8).map((g) => ({
          kind: 'game' as const,
          game: g,
          why: 'dealt because the whole river is talking about it',
        })));
    const reviewCards: Card[] = [...app.reviews]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 6)
      .map((review) => ({ kind: 'review' as const, review, game: getGame(review.gameId)! }))
      .filter((c) => c.game);
    const threadCards: Card[] = app.threads
      .slice(0, 5)
      .map((thread) => ({ kind: 'thread' as const, thread, game: getGame(thread.gameId)! }))
      .filter((c) => c.game);

    const deck: Card[] = [];
    const max = Math.max(gameCards.length, reviewCards.length, threadCards.length);
    for (let k = 0; k < max; k++) {
      if (gameCards[k]) deck.push(gameCards[k]);
      if (reviewCards[k]) deck.push(reviewCards[k]);
      if (threadCards[k]) deck.push(threadCards[k]);
    }
    return deck;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = (d: number) => setI((v) => Math.min(Math.max(v + d, 0), cards.length - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); advance(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); advance(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  const card = cards[i];

  return (
    <div className="flex h-[calc(100vh-110px)] flex-col">
      <div className="relative min-h-0 flex-1">
        {card && <CardFace card={card} onAdvance={() => advance(1)} />}
        <div className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col gap-2">
          <Btn ariaLabel="Previous card" onClick={() => advance(-1)} disabled={i === 0}>prev</Btn>
          <Btn ariaLabel="Next card" onClick={() => advance(1)} disabled={i >= cards.length - 1}>next</Btn>
        </div>
        <p className="absolute bottom-3 left-5 text-xs" style={{ color: MUTED, ...MONO }}>
          card {i + 1} of {cards.length} · arrow keys or space to deal
        </p>
      </div>

      <div className="border-t" style={{ borderColor: LINE, background: '#12100d' }}>
        <button
          onClick={() => setStrip(!strip)}
          className={`flex w-full cursor-pointer items-center gap-3 border-none bg-transparent px-5 py-2 text-left text-xs ${focusRing}`}
          style={{ color: MUTED }}
        >
          <span style={{ color: MOSS, ...DISPLAY }}>your filmstrip</span>
          <span style={MONO}>{app.library.length} frames</span>
          <span className="ml-auto">{strip ? 'lower it' : 'raise it'}</span>
        </button>
        {strip && (
          <div className="flex gap-3 overflow-x-auto px-5 pb-4">
            {app.library.map((e) => {
              const g = getGame(e.gameId);
              return g ? (
                <Link key={e.gameId} to={`/game/${g.id}`} className={`shrink-0 text-center ${focusRing}`}>
                  <Cover game={g} className="h-24 w-[68px]" />
                  <span className="mt-1 block text-[10px]" style={{ color: MUTED, ...MONO }}>{e.hoursPlayed ?? 0}h</span>
                </Link>
              ) : null;
            })}
            {app.library.length === 0 && (
              <p className="pb-2 text-sm" style={{ color: MUTED }}>No frames yet — deal cards and keep what you like.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CardFace({ card, onAdvance }: { card: Card; onAdvance: () => void }) {
  const app = useApp();
  const [reply, setReply] = useState('');
  const game = card.game;
  const entry = app.library.find((e) => e.gameId === game.id);

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden px-6">
      {/* hard two-tone backdrop plate — no gradient */}
      <div aria-hidden className="absolute inset-0 opacity-[0.16]" style={{ background: game.cover.to }} />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.16]"
        style={{ background: game.cover.from, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      <div className="relative w-full max-w-xl">
        {card.kind === 'game' && (
          <>
            <p className="text-xs" style={{ color: MOSS }}>{card.why}</p>
            <div className="mt-4 flex items-start gap-6">
              <Cover game={game} className="h-44 w-32 shrink-0" />
              <div>
                <h2 className="text-3xl font-semibold" style={DISPLAY}>{game.title}</h2>
                <p className="mt-1 text-xs" style={{ color: MUTED, ...MONO }}>
                  {game.developer} · {game.year} · {game.communityRating.toFixed(1)}/10
                </p>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: TEXT }}>{game.description}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {entry ? (
                <span className="text-sm" style={{ color: MOSS }}>already in your logbook</span>
              ) : (
                <Btn primary onClick={() => { app.setStatus(game.id, 'want'); onAdvance(); }}>
                  keep it — want to play
                </Btn>
              )}
              <Btn onClick={onAdvance}>deal past it</Btn>
              <Link to={`/game/${game.id}`} className={`text-xs underline-offset-4 hover:underline ${focusRing}`} style={{ color: MUTED }}>
                full page
              </Link>
            </div>
          </>
        )}

        {card.kind === 'review' && (
          <>
            <p className="text-xs" style={{ color: EMBER }}>one voice, chosen for this card</p>
            <blockquote className="mt-4 text-2xl font-medium leading-snug" style={DISPLAY}>
              "{card.review.text}"
            </blockquote>
            <p className="mt-3 text-sm" style={{ color: MUTED }}>
              {card.review.author} · <span style={MONO}>{card.review.rating}/10</span> on{' '}
              <Link to={`/game/${game.id}`} className={`underline-offset-4 hover:underline ${focusRing}`} style={{ color: TEXT }}>
                {game.title}
              </Link>
            </p>
            <div className="mt-5 flex items-center gap-4">
              <span className="text-xs" style={{ color: MUTED }}>your read on it:</span>
              <RatingRow value={entry?.rating ?? null} onChange={(v) => app.setRating(game.id, v)} />
            </div>
          </>
        )}

        {card.kind === 'thread' && (
          <>
            <p className="text-xs" style={{ color: EMBER }}>talk burning on {game.title}</p>
            <h2 className="mt-3 text-2xl font-semibold" style={DISPLAY}>"{card.thread.title}"</h2>
            <p className="mt-3 pl-4 text-sm leading-relaxed" style={{ borderLeft: `2px solid ${EMBER}`, color: TEXT }}>
              {card.thread.posts[0]?.text}
            </p>
            <p className="mt-2 text-xs" style={{ color: MUTED, ...MONO }}>{card.thread.posts.length} voices so far</p>
            <div className="mt-5 flex gap-2">
              <input
                className={`${inputCls} flex-1`}
                placeholder="jump in from right here"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && reply.trim()) { app.replyToThread(card.thread.id, reply.trim()); setReply(''); onAdvance(); }
                }}
              />
              <Btn primary disabled={!reply.trim()} onClick={() => { app.replyToThread(card.thread.id, reply.trim()); setReply(''); onAdvance(); }}>
                speak
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
