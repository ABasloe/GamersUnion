import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';

export function Groups() {
  const { groups, toggleGroupMembership } = useApp();
  return (
    <div>
      <h1>Groups</h1>
      <p className="muted">Find friends and groups to play with — part discussion board, part review club.</p>
      <div className="group-grid">
        {groups.map((g) => (
          <div key={g.id} className="group-card">
            <h3><Link to={`/groups/${g.id}`}>{g.name}</Link></h3>
            <p>{g.description}</p>
            <div className="tag-row">{g.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            <div className="group-foot">
              <span className="muted">{g.members.toLocaleString()} members</span>
              <button className={`btn ${g.joined ? '' : 'btn-primary'}`} onClick={() => toggleGroupMembership(g.id)}>
                {g.joined ? 'Leave' : 'Join'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
