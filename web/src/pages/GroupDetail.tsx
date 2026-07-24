import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';

export function GroupDetail() {
  const { id } = useParams();
  const app = useApp();
  const group = app.groups.find((g) => g.id === id);
  const [text, setText] = useState('');

  if (!group) return <p>Group not found. <Link to="/groups">Back to groups.</Link></p>;

  return (
    <div>
      <Link to="/groups" className="muted">← All groups</Link>
      <div className="group-header">
        <h1>{group.name}</h1>
        <button className={`btn ${group.joined ? '' : 'btn-primary'}`} onClick={() => app.toggleGroupMembership(group.id)}>
          {group.joined ? 'Leave Group' : 'Join Group'}
        </button>
      </div>
      <p>{group.description}</p>
      <div className="tag-row">{group.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      <p className="muted">{group.members.toLocaleString()} members</p>

      <h2>Board</h2>
      {group.joined ? (
        <div className="reply-row">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Post to the group…" />
          <button
            className="btn btn-primary"
            onClick={() => { if (text.trim()) { app.postToGroup(group.id, text.trim()); setText(''); } }}
          >
            Post
          </button>
        </div>
      ) : (
        <p className="muted">Join the group to post.</p>
      )}
      {[...group.posts].reverse().map((p) => (
        <div key={p.id} className={`post ${p.isMine ? 'mine' : ''}`}>
          <strong>{p.author}</strong> <span className="muted">{p.date}</span>
          <p>{p.text}</p>
        </div>
      ))}
    </div>
  );
}
