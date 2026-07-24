import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Panel, PanelTitle, Tag, btnClass, btnPrimaryClass, inputClass } from './ui';

export function Groups() {
  const { groups, toggleGroupMembership } = useApp();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Groups</h1>
        <p className="text-sm text-slate-400">
          Find friends and squads — part discussion board, part review club.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {groups.map((g) => (
          <Panel key={g.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <Link to={`/groups/${g.id}`} className="text-base font-bold text-slate-100 hover:text-cyan-300">
                {g.name}
              </Link>
              {g.joined && (
                <span className="bg-cyan-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-300 ring-1 ring-cyan-400/30">
                  member
                </span>
              )}
            </div>
            <p className="mt-1 flex-1 text-sm text-slate-400">{g.description}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {g.tags.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">{g.members.toLocaleString()} members</span>
              <button
                className={g.joined ? btnClass : btnPrimaryClass}
                onClick={() => toggleGroupMembership(g.id)}
              >
                {g.joined ? 'Leave' : 'Join'}
              </button>
            </div>
          </Panel>
        ))}
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
      <p className="text-slate-300">
        Group not found. <Link to="/groups" className="text-cyan-300 hover:underline">Back to groups.</Link>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Link to="/groups" className="text-xs uppercase tracking-widest text-slate-500 hover:text-slate-300">
        ← All groups
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-white">{group.name}</h1>
        <button
          className={group.joined ? btnClass : btnPrimaryClass}
          onClick={() => app.toggleGroupMembership(group.id)}
        >
          {group.joined ? 'Leave group' : 'Join group'}
        </button>
      </div>
      <p className="text-sm text-slate-400">{group.description}</p>
      <div className="flex flex-wrap items-center gap-2">
        {group.tags.map((t) => <Tag key={t}>{t}</Tag>)}
        <span className="text-xs text-slate-500">{group.members.toLocaleString()} members</span>
      </div>

      <Panel className="space-y-3 p-5">
        <PanelTitle>Board</PanelTitle>
        {group.joined ? (
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Post to the group…"
              className={`${inputClass} flex-1`}
            />
            <button
              className={btnPrimaryClass}
              onClick={() => {
                if (text.trim()) {
                  app.postToGroup(group.id, text.trim());
                  setText('');
                }
              }}
            >
              Post
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Join the group to post.</p>
        )}
        <div className="space-y-3">
          {[...group.posts].reverse().map((p) => (
            <div key={p.id} className="border-t border-white/10 pt-3">
              <strong className={`text-sm ${p.isMine ? 'text-cyan-300' : 'text-slate-100'}`}>{p.author}</strong>{' '}
              <span className="text-xs text-slate-500">{p.date}</span>
              <p className="mt-1 text-sm text-slate-300">{p.text}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
