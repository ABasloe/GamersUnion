import { Link, Navigate, useParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame } from '../../data/games';
import { getCommunityUser } from '../../data/users';
import { Chip, Cover, DISPLAY, EMBER, LINE, MONO, MOSS, MUTED, Panel, SURFACE, TEXT, focusRing } from './ui';
import { STATUS_LABELS } from '../../components/statusMeta';

/** Public profile for any community member — reachable from every author name. */
export function UserProfile() {
  const { name = '' } = useParams();
  const app = useApp();
  const decoded = decodeURIComponent(name);

  // Your own name leads to your editable profile instead.
  if (decoded.toLowerCase() === app.username.toLowerCase()) return <Navigate to="/profile" replace />;

  const user = getCommunityUser(decoded);
  const reviews = app.reviews.filter((r) => !r.isMine && r.author.toLowerCase() === decoded.toLowerCase());
  const forumPosts = app.groups.flatMap((g) =>
    g.posts.filter((p) => !p.isMine && p.author.toLowerCase() === decoded.toLowerCase()).map((p) => ({ ...p, board: g })),
  );
  const threadPosts = app.threads.flatMap((t) =>
    t.posts.filter((p) => !p.isMine && p.author.toLowerCase() === decoded.toLowerCase()).map((p) => ({ ...p, thread: t })),
  );

  const hasActivity = reviews.length > 0 || forumPosts.length > 0 || threadPosts.length > 0;
  if (!user && !hasActivity) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10">
        <p style={{ color: TEXT }}>
          No one here goes by "{decoded}".{' '}
          <Link to="/" className={`underline underline-offset-4 ${focusRing}`} style={{ color: TEXT }}>
            Back to the river.
          </Link>
        </p>
      </div>
    );
  }

  const favorites = (user?.favorites ?? []).map(getGame).filter((g) => g != null);
  const hours = user?.library.reduce((s, e) => s + (e.hours ?? 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-2xl font-semibold" style={DISPLAY}>{user?.name ?? decoded}</h1>
        {user && <p className="text-sm italic" style={{ color: MUTED }}>"{user.tagline}"</p>}
      </div>
      <p className="mt-1 text-xs" style={{ color: MUTED, ...MONO }}>
        {user ? `member since ${user.joined} · ` : ''}
        {user ? `${user.library.length} games · ${hours.toLocaleString()}h · ` : ''}
        {reviews.length} reviews · {forumPosts.length + threadPosts.length} posts
      </p>

      {favorites.length > 0 && (
        <section className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED, ...DISPLAY }}>carries closest</p>
          <div className="mt-3 flex flex-wrap gap-4">
            {favorites.map((g, i) => (
              <Link key={g.id} to={`/game/${g.id}`} className={`flex items-center gap-3 ${focusRing}`}>
                <span className="text-xl" style={{ ...DISPLAY, color: MOSS }}>{i + 1}</span>
                <Cover game={g} className="h-24 w-[68px]" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {user && user.library.length > 0 && (
        <section className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED, ...DISPLAY }}>their logbook</p>
          <div className="mt-3 flex flex-col gap-1.5">
            {user.library.map((e) => {
              const g = getGame(e.gameId);
              if (!g) return null;
              return (
                <div key={e.gameId} className="flex flex-wrap items-center gap-x-4 gap-y-1 border px-4 py-2.5" style={{ background: SURFACE, borderColor: LINE }}>
                  <Link to={`/game/${g.id}`} className={`min-w-40 font-semibold underline-offset-4 hover:underline ${focusRing}`} style={{ ...DISPLAY, color: TEXT }}>
                    {g.title}
                  </Link>
                  <Chip>{STATUS_LABELS[e.status].toLowerCase()}</Chip>
                  <span className="text-xs" style={{ color: e.rating != null ? MOSS : MUTED, ...MONO }}>
                    {e.rating != null ? `${e.rating}/10` : 'unrated'}
                  </span>
                  <span className="ml-auto text-xs" style={{ color: MUTED, ...MONO }}>
                    {e.hours != null ? `${e.hours}h` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED, ...DISPLAY }}>their reviews</p>
          <div className="mt-3 flex flex-col gap-3">
            {reviews.map((r) => {
              const g = getGame(r.gameId);
              return (
                <Panel key={r.id} className="p-4">
                  <p className="text-xs" style={{ color: MUTED }}>
                    on{' '}
                    <Link to={`/game/${r.gameId}`} className={`underline-offset-4 hover:underline ${focusRing}`} style={{ color: TEXT }}>
                      {g?.title}
                    </Link>{' '}
                    · <span style={{ color: MOSS, ...MONO }}>{r.rating}/10</span> · <span style={MONO}>{r.date}</span>
                  </p>
                  <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: TEXT }}>{r.text}</p>
                </Panel>
              );
            })}
          </div>
        </section>
      )}

      {(forumPosts.length > 0 || threadPosts.length > 0) && (
        <section className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED, ...DISPLAY }}>around the forum</p>
          <div className="mt-3 flex flex-col gap-2">
            {forumPosts.map((p) => (
              <div key={p.id} className="border-l pl-4" style={{ borderColor: LINE }}>
                <p className="text-xs" style={{ color: MUTED }}>
                  in{' '}
                  <Link to={`/groups/${p.board.id}`} className={`underline-offset-4 hover:underline ${focusRing}`} style={{ color: EMBER }}>
                    {p.board.name}
                  </Link>{' '}
                  · <span style={MONO}>{p.date}</span>
                </p>
                <p className="mt-0.5 text-sm" style={{ color: TEXT }}>{p.text}</p>
              </div>
            ))}
            {threadPosts.map((p) => (
              <div key={p.id} className="border-l pl-4" style={{ borderColor: LINE }}>
                <p className="text-xs" style={{ color: MUTED }}>
                  in "{p.thread.title}" on{' '}
                  <Link to={`/game/${p.thread.gameId}`} className={`underline-offset-4 hover:underline ${focusRing}`} style={{ color: EMBER }}>
                    {getGame(p.thread.gameId)?.title}
                  </Link>{' '}
                  · <span style={MONO}>{p.date}</span>
                </p>
                <p className="mt-0.5 text-sm" style={{ color: TEXT }}>{p.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
