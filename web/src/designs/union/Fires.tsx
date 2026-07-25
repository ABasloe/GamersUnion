import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame } from '../../data/games';
import type { Group } from '../../types';
import { AuthorLink, Btn, Chip, DISPLAY, EMBER, LINE, MONO, MOSS, MUTED, NOTCH, SURFACE, TEXT, focusRing, inputCls } from './ui';

/** Activity score drives the ember gauge and the board ordering. */
const activityOf = (g: Group) => g.members + g.posts.length * 800 + (g.joined ? 500 : 0);

export function Groups() {
  const app = useApp();
  const boards = useMemo(() => [...app.groups].sort((a, b) => activityOf(b) - activityOf(a)), [app.groups]);
  const maxActivity = boards.length ? activityOf(boards[0]) : 1;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-36">
      <h1 className="text-2xl font-semibold" style={DISPLAY}>Forum</h1>
      <p className="mt-1 text-sm" style={{ color: MUTED }}>
        {boards.length} boards · {boards.reduce((s, f) => s + f.posts.length, 0)} posts · the ember line shows how alive a board is
      </p>

      {/* Column headers — traditional board index */}
      <div
        className="mt-6 hidden gap-4 border-b px-4 pb-2 text-[11px] uppercase tracking-[0.14em] md:grid md:grid-cols-[1fr_7rem_5rem_12rem_7rem]"
        style={{ color: MUTED, borderColor: LINE, ...DISPLAY }}
      >
        <span>board</span>
        <span className="text-right">members</span>
        <span className="text-right">posts</span>
        <span>last post</span>
        <span />
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {boards.map((g) => (
          <BoardRow key={g.id} group={g} activityPct={(activityOf(g) / maxActivity) * 100} />
        ))}
      </div>

      <LogbookDrawer />
    </div>
  );
}

function BoardRow({ group, activityPct }: { group: Group; activityPct: number }) {
  const app = useApp();
  const last = group.posts[group.posts.length - 1];
  return (
    <div className="border" style={{ clipPath: NOTCH, background: SURFACE, borderColor: LINE }}>
      {/* ember gauge — same line vocabulary as the river spine */}
      <div aria-hidden className="h-[3px] w-full" style={{ background: LINE }}>
        <div className="h-full" style={{ width: `${Math.max(activityPct, 6)}%`, background: EMBER }} />
      </div>
      <div className="grid gap-x-4 gap-y-2 p-4 md:grid-cols-[1fr_7rem_5rem_12rem_7rem] md:items-center">
        <div className="min-w-0">
          <Link
            to={`/groups/${group.id}`}
            className={`font-semibold underline-offset-4 hover:underline ${focusRing}`}
            style={{ ...DISPLAY, color: TEXT }}
          >
            {group.name}
          </Link>
          <p className="mt-0.5 truncate text-sm" style={{ color: MUTED }}>{group.description}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {group.tags.map((t) => <Chip key={t}>{t.toLowerCase()}</Chip>)}
          </div>
        </div>
        <span className="text-sm md:text-right" style={{ color: EMBER, ...MONO }}>
          {group.members.toLocaleString()}
        </span>
        <span className="text-sm md:text-right" style={{ color: TEXT, ...MONO }}>
          {group.posts.length}
        </span>
        <span className="min-w-0 truncate text-xs" style={{ color: MUTED }}>
          {last ? (
            <>
              <AuthorLink name={last.author} mine={last.isMine} />
              {' · '}
              <span style={MONO}>{last.date}</span>
            </>
          ) : (
            'no posts yet'
          )}
        </span>
        <span className="md:justify-self-end">
          <Btn onClick={() => app.toggleGroupMembership(group.id)}>
            {group.joined ? 'leave' : 'join'}
          </Btn>
        </span>
      </div>
    </div>
  );
}

export function GroupDetail() {
  const { id } = useParams();
  const app = useApp();
  const group = app.groups.find((g) => g.id === id);
  const [text, setText] = useState('');

  if (!group) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10">
        <p>
          This board doesn't exist.{' '}
          <Link to="/groups" className={`underline underline-offset-4 ${focusRing}`} style={{ color: TEXT }}>
            Back to the forum.
          </Link>
        </p>
      </div>
    );
  }

  const post = () => {
    if (text.trim()) { app.postToGroup(group.id, text.trim()); setText(''); }
  };

  const posts = [...group.posts].reverse();

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 pb-36">
      <p className="text-xs" style={{ color: MUTED }}>
        <Link to="/groups" className={`hover:text-[var(--gu-text)] ${focusRing}`} style={{ color: MUTED }}>
          forum
        </Link>
        {' / '}
        <span style={{ color: TEXT }}>{group.name}</span>
      </p>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold" style={DISPLAY}>{group.name}</h1>
        <Btn onClick={() => app.toggleGroupMembership(group.id)}>
          {group.joined ? 'leave board' : 'join board'}
        </Btn>
      </div>
      <p className="mt-2 max-w-xl text-sm" style={{ color: MUTED }}>{group.description}</p>
      <p className="mt-2 text-xs" style={{ color: MUTED }}>
        members: <span style={{ color: EMBER, ...MONO }}>{group.members.toLocaleString()}</span> · posts:{' '}
        <span style={{ ...MONO, color: TEXT }}>{group.posts.length}</span> · {group.tags.join(' · ').toLowerCase()}
      </p>

      {/* Forum-style post rows: author rail left, message right */}
      <div className="mt-8 flex flex-col gap-2">
        {posts.map((p, i) => (
          <div key={p.id} className="grid border md:grid-cols-[11rem_1fr]" style={{ background: SURFACE, borderColor: LINE }}>
            <div className="border-b p-3 md:border-b-0 md:border-r" style={{ borderColor: LINE }}>
              <p className="text-sm font-semibold" style={DISPLAY}>
                <AuthorLink name={p.author} mine={p.isMine} />
              </p>
              <p className="mt-0.5 text-[11px]" style={{ color: MUTED, ...MONO }}>
                {p.date} · #{posts.length - i}
              </p>
            </div>
            <p className="p-3 text-[15px] leading-relaxed" style={{ color: TEXT }}>{p.text}</p>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-sm" style={{ color: MUTED }}>No posts yet — start the board off below.</p>
        )}
      </div>

      <div className="sticky bottom-6 mt-8 border p-3" style={{ clipPath: NOTCH, background: SURFACE, borderColor: LINE }}>
        {group.joined ? (
          <div className="flex gap-2">
            <input
              className={`${inputCls} flex-1`}
              placeholder="write a reply"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') post(); }}
            />
            <Btn primary disabled={!text.trim()} onClick={post}>post reply</Btn>
          </div>
        ) : (
          <p className="text-sm" style={{ color: MUTED }}>Join this board to post.</p>
        )}
      </div>

      <LogbookDrawer />
    </div>
  );
}

export function LogbookDrawer() {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const playing = app.library.filter((e) => e.status === 'playing');
  const hours = app.library.reduce((s, e) => s + (e.hoursPlayed ?? 0), 0);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur"
      style={{ borderColor: LINE, background: 'color-mix(in srgb, var(--gu-ground) 96%, transparent)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`mx-auto flex w-full max-w-6xl cursor-pointer items-center gap-4 border-none bg-transparent px-5 py-2.5 text-left text-xs ${focusRing}`}
        style={{ color: MUTED }}
      >
        <span style={{ color: MOSS, ...DISPLAY }}>your logbook</span>
        <span style={MONO}>{playing.length} playing · {hours.toLocaleString()}h all time</span>
        <span className="ml-auto">{open ? 'tuck away' : 'pull up'}</span>
      </button>
      {open && (
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-2 px-5 pb-4">
          {playing.length === 0 && <p className="text-sm" style={{ color: MUTED }}>Nothing marked playing yet.</p>}
          {playing.map((e) => {
            const g = getGame(e.gameId);
            return g ? (
              <Link key={e.gameId} to={`/game/${g.id}`} className={`text-sm underline-offset-4 hover:underline ${focusRing}`} style={{ color: TEXT }}>
                {g.title} <span style={{ color: MUTED, ...MONO }}>{e.hoursPlayed ?? 0}h</span>
              </Link>
            ) : null;
          })}
          <Link to="/library" className={`text-sm hover:text-[var(--gu-text)] ${focusRing}`} style={{ color: MUTED }}>
            full logbook
          </Link>
        </div>
      )}
    </div>
  );
}
