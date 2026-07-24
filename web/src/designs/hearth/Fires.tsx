import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame } from '../../data/games';
import { EMBER, SAGE, ghostBtn, inputCls } from './ui';
import type { Group } from '../../types';

/** heat = live-ness of a fire; area on screen follows it. */
const heatOf = (g: Group) => g.members + g.posts.length * 800 + (g.joined ? 500 : 0);

export function Groups() {
  const app = useApp();
  const fires = useMemo(() => [...app.groups].sort((a, b) => heatOf(b) - heatOf(a)), [app.groups]);
  const [big, second, ...embers] = fires;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-36">
      <h1 className="font-serif text-2xl italic text-stone-100">Tonight at the fires</h1>
      <p className="mt-1 text-sm text-stone-500">
        {fires.reduce((s, f) => s + f.posts.length, 0)} conversations burning · a fire's size is how alive it is
      </p>

      {big && (
        <div className="mt-6">
          <FirePanel group={big} size="big" />
        </div>
      )}
      {second && (
        <div className="mt-4 md:w-3/4">
          <FirePanel group={second} size="mid" />
        </div>
      )}
      {embers.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {embers.map((g) => (
            <div key={g.id} className="min-w-56 flex-1">
              <FirePanel group={g} size="ember" />
            </div>
          ))}
        </div>
      )}

      <LogbookDrawer />
    </div>
  );
}

function FirePanel({ group, size }: { group: Group; size: 'big' | 'mid' | 'ember' }) {
  const app = useApp();
  const pad = size === 'big' ? 'p-8' : size === 'mid' ? 'p-6' : 'p-4';
  return (
    <div
      className={`border border-stone-800 bg-stone-900/60 ${pad}`}
      style={{ borderTopColor: EMBER, borderTopWidth: size === 'big' ? 3 : size === 'mid' ? 2 : 1 }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Link
          to={`/groups/${group.id}`}
          className={`font-serif text-stone-100 hover:underline underline-offset-4 ${
            size === 'big' ? 'text-2xl' : size === 'mid' ? 'text-lg' : 'text-base'
          }`}
        >
          {group.name}
        </Link>
        <span className="text-xs tabular-nums" style={{ color: EMBER }}>
          {group.members.toLocaleString()} around it
        </span>
      </div>
      {size !== 'ember' && <p className="mt-2 max-w-2xl text-sm text-stone-400">{group.description}</p>}
      {size === 'big' && group.posts.length > 0 && (
        <p className="mt-3 border-l-2 pl-3 text-sm text-stone-300" style={{ borderColor: EMBER }}>
          “{group.posts[group.posts.length - 1].text}” <span className="text-stone-500">— {group.posts[group.posts.length - 1].author}</span>
        </p>
      )}
      <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
        <span>{group.tags.join(' · ').toLowerCase()}</span>
        <button className="ml-auto cursor-pointer border-none bg-transparent p-0 text-xs text-stone-400 hover:text-stone-200" onClick={() => app.toggleGroupMembership(group.id)}>
          {group.joined ? 'stand up' : 'sit down'}
        </button>
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
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p>This fire has gone out. <Link to="/groups" className="underline underline-offset-4">Back to the circle.</Link></p>
      </div>
    );
  }

  const post = () => {
    if (text.trim()) { app.postToGroup(group.id, text.trim()); setText(''); }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 pb-36">
      <Link to="/groups" className="text-xs text-stone-500 hover:text-stone-300">← back to the fires</Link>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-2xl italic text-stone-100">{group.name}</h1>
        <button className={ghostBtn} onClick={() => app.toggleGroupMembership(group.id)}>
          {group.joined ? 'stand up from this fire' : 'sit down at this fire'}
        </button>
      </div>
      <p className="mt-2 max-w-xl text-sm text-stone-400">{group.description}</p>
      <p className="mt-2 text-xs text-stone-500">
        who sits here: <span style={{ color: EMBER }}>{group.members.toLocaleString()}</span> · {group.tags.join(' · ').toLowerCase()}
      </p>

      <div className="mt-8 space-y-5">
        {[...group.posts].reverse().map((p) => (
          <div key={p.id} className="border-l border-stone-800 pl-4">
            <p className="text-xs text-stone-500">
              <span style={p.isMine ? { color: SAGE } : undefined} className={p.isMine ? '' : 'text-stone-400'}>{p.author}</span> · {p.date}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-stone-200">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 mt-10 border border-stone-700 bg-stone-900 p-3">
        {group.joined ? (
          <div className="flex gap-2">
            <input
              className={`${inputCls} flex-1`}
              placeholder="say it to the fire…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') post(); }}
            />
            <button className={ghostBtn} disabled={!text.trim()} onClick={post}>speak</button>
          </div>
        ) : (
          <p className="text-sm text-stone-500">Sit down at this fire to speak.</p>
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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-700 bg-stone-950/97 backdrop-blur">
      <button
        onClick={() => setOpen(!open)}
        className="mx-auto flex w-full max-w-6xl cursor-pointer items-center gap-4 border-none bg-transparent px-5 py-2.5 text-left text-xs text-stone-400"
      >
        <span style={{ color: SAGE }}>your logbook</span>
        <span className="tabular-nums">{playing.length} playing · {hours.toLocaleString()}h all time</span>
        <span className="ml-auto text-stone-600">{open ? 'tuck away ↓' : 'pull up ↑'}</span>
      </button>
      {open && (
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-2 px-5 pb-4">
          {playing.length === 0 && <p className="text-sm text-stone-500">Nothing marked playing yet.</p>}
          {playing.map((e) => {
            const g = getGame(e.gameId);
            return g ? (
              <Link key={e.gameId} to={`/game/${g.id}`} className="text-sm text-stone-300 hover:underline underline-offset-4">
                {g.title} <span className="text-stone-500 tabular-nums">{e.hoursPlayed ?? 0}h</span>
              </Link>
            ) : null;
          })}
          <Link to="/library" className="text-sm text-stone-500 hover:text-stone-300">full logbook →</Link>
        </div>
      )}
    </div>
  );
}
