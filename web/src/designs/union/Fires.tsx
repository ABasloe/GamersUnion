import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame } from '../../data/games';
import type { Group } from '../../types';
import { Btn, Chip, DISPLAY, EMBER, LINE, MONO, MOSS, MUTED, NOTCH, SURFACE, TEXT, focusRing, inputCls } from './ui';

/** heat = live-ness of a fire; both area and gauge width follow it. */
const heatOf = (g: Group) => g.members + g.posts.length * 800 + (g.joined ? 500 : 0);

export function Groups() {
  const app = useApp();
  const fires = useMemo(() => [...app.groups].sort((a, b) => heatOf(b) - heatOf(a)), [app.groups]);
  const maxHeat = fires.length ? heatOf(fires[0]) : 1;
  const [big, second, ...embers] = fires;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-36">
      <h1 className="text-2xl font-semibold" style={DISPLAY}>Tonight at the fires</h1>
      <p className="mt-1 text-sm" style={{ color: MUTED }}>
        {fires.reduce((s, f) => s + f.posts.length, 0)} conversations burning · a fire's size is how alive it is
      </p>

      {big && (
        <div className="mt-6">
          <FirePanel group={big} size="big" heatPct={100} />
        </div>
      )}
      {second && (
        <div className="mt-4 md:w-3/4">
          <FirePanel group={second} size="mid" heatPct={(heatOf(second) / maxHeat) * 100} />
        </div>
      )}
      {embers.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {embers.map((g) => (
            <div key={g.id} className="min-w-56 flex-1">
              <FirePanel group={g} size="ember" heatPct={(heatOf(g) / maxHeat) * 100} />
            </div>
          ))}
        </div>
      )}

      <LogbookDrawer />
    </div>
  );
}

function FirePanel({ group, size, heatPct }: { group: Group; size: 'big' | 'mid' | 'ember'; heatPct: number }) {
  const app = useApp();
  const pad = size === 'big' ? 'p-8' : size === 'mid' ? 'p-6' : 'p-4';
  const last = group.posts[group.posts.length - 1];
  return (
    <div className={`border ${pad}`} style={{ clipPath: NOTCH, background: SURFACE, borderColor: LINE }}>
      {/* the heat gauge — same line vocabulary as the river spine */}
      <div aria-hidden className="mb-3 h-[3px] w-full" style={{ background: LINE }}>
        <div className="h-full" style={{ width: `${Math.max(heatPct, 6)}%`, background: EMBER }} />
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Link
          to={`/groups/${group.id}`}
          className={`font-semibold underline-offset-4 hover:underline ${focusRing} ${
            size === 'big' ? 'text-2xl' : size === 'mid' ? 'text-lg' : 'text-base'
          }`}
          style={{ ...DISPLAY, color: TEXT }}
        >
          {group.name}
        </Link>
        <span className="text-xs" style={{ color: EMBER, ...MONO }}>
          {group.members.toLocaleString()} around it
        </span>
      </div>
      {size !== 'ember' && <p className="mt-2 max-w-2xl text-sm" style={{ color: MUTED }}>{group.description}</p>}
      {size === 'big' && last && (
        <p className="mt-3 pl-3 text-sm" style={{ borderLeft: `2px solid ${EMBER}`, color: TEXT }}>
          "{last.text}" <span style={{ color: MUTED }}>— {last.author}</span>
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {group.tags.map((t) => <Chip key={t}>{t.toLowerCase()}</Chip>)}
        <span className="ml-auto">
          <Btn onClick={() => app.toggleGroupMembership(group.id)}>
            {group.joined ? 'stand up' : 'sit down'}
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
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p>
          This fire has gone out.{' '}
          <Link to="/groups" className={`underline underline-offset-4 ${focusRing}`} style={{ color: TEXT }}>
            Back to the circle.
          </Link>
        </p>
      </div>
    );
  }

  const post = () => {
    if (text.trim()) { app.postToGroup(group.id, text.trim()); setText(''); }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 pb-36">
      <Link to="/groups" className={`text-xs hover:text-[var(--gu-text)] ${focusRing}`} style={{ color: MUTED }}>
        back to the fires
      </Link>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold" style={DISPLAY}>{group.name}</h1>
        <Btn onClick={() => app.toggleGroupMembership(group.id)}>
          {group.joined ? 'stand up from this fire' : 'sit down at this fire'}
        </Btn>
      </div>
      <p className="mt-2 max-w-xl text-sm" style={{ color: MUTED }}>{group.description}</p>
      <p className="mt-2 text-xs" style={{ color: MUTED }}>
        who sits here: <span style={{ color: EMBER, ...MONO }}>{group.members.toLocaleString()}</span> ·{' '}
        {group.tags.join(' · ').toLowerCase()}
      </p>

      <div className="mt-8 space-y-5">
        {[...group.posts].reverse().map((p) => (
          <div key={p.id} className="pl-4" style={{ borderLeft: `1px solid ${LINE}` }}>
            <p className="text-xs" style={{ color: MUTED }}>
              <span style={{ color: p.isMine ? MOSS : TEXT }}>{p.author}</span> · <span style={MONO}>{p.date}</span>
            </p>
            <p className="mt-1 text-[15px] leading-relaxed" style={{ color: TEXT }}>{p.text}</p>
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 mt-10 border p-3" style={{ clipPath: NOTCH, background: SURFACE, borderColor: LINE }}>
        {group.joined ? (
          <div className="flex gap-2">
            <input
              className={`${inputCls} flex-1`}
              placeholder="say it to the fire"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') post(); }}
            />
            <Btn primary disabled={!text.trim()} onClick={post}>speak</Btn>
          </div>
        ) : (
          <p className="text-sm" style={{ color: MUTED }}>Sit down at this fire to speak.</p>
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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur" style={{ borderColor: LINE, background: 'rgba(18,16,13,0.96)' }}>
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
