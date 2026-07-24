import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Btn, Tag, inputCls } from './ui';

export function GroupDetail() {
  const { id } = useParams();
  const app = useApp();
  const group = app.groups.find((g) => g.id === id);
  const [text, setText] = useState('');

  if (!group) {
    return (
      <p className="mt-10 italic text-neutral-600">
        Society not found. <Link to="/groups" className="text-emerald-900 underline">Back to societies.</Link>
      </p>
    );
  }

  return (
    <div className="mt-10">
      <Link to="/groups" className="text-sm uppercase tracking-wider text-neutral-500 hover:text-emerald-900">
        ← All societies
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-b-2 border-neutral-900 pb-4">
        <h1 className="font-serif text-4xl font-black text-neutral-900">{group.name}</h1>
        <Btn primary={!group.joined} onClick={() => app.toggleGroupMembership(group.id)}>
          {group.joined ? 'Resign membership' : 'Join society'}
        </Btn>
      </div>
      <p className="mt-4 text-lg leading-relaxed text-neutral-700">{group.description}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {group.tags.map((t) => <Tag key={t}>{t}</Tag>)}
        <span className="ml-2 text-sm text-neutral-500">{group.members.toLocaleString()} members</span>
      </div>

      <h2 className="mt-10 border-b border-neutral-300 pb-2 font-serif text-2xl font-bold text-neutral-900">
        Notice board
      </h2>
      {group.joined ? (
        <div className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pin a notice for the group…"
            className={`${inputCls} flex-1`}
          />
          <Btn
            primary
            onClick={() => {
              if (text.trim()) {
                app.postToGroup(group.id, text.trim());
                setText('');
              }
            }}
          >
            Post
          </Btn>
        </div>
      ) : (
        <p className="mt-4 italic text-neutral-500">Join the society to post notices.</p>
      )}

      <ul className="mt-4 divide-y divide-neutral-300">
        {[...group.posts].reverse().map((p) => (
          <li key={p.id} className="py-4">
            <p className="text-sm">
              <span className={`font-bold ${p.isMine ? 'text-emerald-900' : 'text-neutral-900'}`}>{p.author}</span>{' '}
              <span className="text-neutral-500">· {p.date}</span>
            </p>
            <p className="mt-1 leading-relaxed text-neutral-700">{p.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
