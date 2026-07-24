import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Btn, Tag } from './ui';

export function Groups() {
  const { groups, toggleGroupMembership } = useApp();
  return (
    <div className="mt-10">
      <h1 className="font-serif text-4xl font-black text-neutral-900">Societies</h1>
      <p className="mt-1 italic text-neutral-500">
        Part discussion board, part review club — find your people and someone to play with.
      </p>

      <ul className="mt-8 divide-y divide-neutral-300 border-y border-neutral-300">
        {groups.map((g) => (
          <li key={g.id} className="grid gap-4 py-6 sm:grid-cols-[1fr_auto]">
            <div>
              <Link to={`/groups/${g.id}`} className="font-serif text-2xl font-bold text-neutral-900 hover:underline">
                {g.name}
              </Link>
              <p className="mt-1 leading-relaxed text-neutral-700">{g.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {g.tags.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
            <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-end sm:justify-center">
              <span className="text-sm text-neutral-500">{g.members.toLocaleString()} members</span>
              <Btn primary={!g.joined} onClick={() => toggleGroupMembership(g.id)}>
                {g.joined ? 'Resign' : 'Join'}
              </Btn>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
