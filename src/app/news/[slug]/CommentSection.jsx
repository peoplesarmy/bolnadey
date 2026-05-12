// src/app/news/[slug]/CommentSection.jsx
'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const REACTIONS = [{ emoji: '👏', key: 'clap' }, { emoji: '🔥', key: 'fire' }, { emoji: '😡', key: 'angry' }, { emoji: '💔', key: 'heart' }];

export default function CommentSection({ articleId, comments: initialComments, reactions: initialReactions }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments || []);
  const [reactions, setReactions] = useState(initialReactions || {});
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState({});
  const [reacted, setReacted] = useState({});

  const handleReact = async (key) => {
    if (!session) return alert('Please sign in to react');
    if (reacted[key]) return;
    setReacted(r => ({ ...r, [key]: true }));
    setReactions(r => ({ ...r, [key]: (r[key] || 0) + 1 }));
    await fetch('/api/votes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refType: 'Article', refId: articleId, action: key }) });
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!session) return alert('Please sign in to comment');
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text, refType: 'Article', refId: articleId }) });
      const data = await res.json();
      if (data.comment) {
        setComments(c => [data.comment, ...c]);
        setText('');
      }
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* Reactions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 36, flexWrap: 'wrap' }}>
        {REACTIONS.map(({ emoji, key }) => (
          <button key={key} onClick={() => handleReact(key)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', border: `1px solid ${reacted[key] ? 'var(--pink)' : 'rgba(255,255,255,.08)'}`, background: reacted[key] ? 'rgba(139,92,246,.1)' : 'var(--bg3)', borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 14, fontWeight: 600, color: reacted[key] ? 'var(--pink)' : 'var(--w2)', cursor: 'pointer', transition: 'all .18s' }}>
            {emoji} {reactions[key] || 0}
          </button>
        ))}
      </div>

      {/* Comments */}
      <div style={{ marginTop: 52, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <h3 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 22, fontWeight: 800, letterSpacing: '-.01em', marginBottom: 24 }}>
          Comments <span className="gt">({comments.length})</span>
        </h3>

        {comments.map(c => (
          <div key={c._id} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#C77DFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0 }}>
              {(c.author?.name || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--w2)', marginBottom: 3 }}>{c.author?.name || 'Anonymous'}</div>
              <div style={{ fontSize: 13.5, color: 'var(--w3)', lineHeight: 1.5 }}>{c.content}</div>
            </div>
          </div>
        ))}

        <form onSubmit={handleComment} style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: session ? 'linear-gradient(135deg,#8B5CF6,#C77DFF)' : 'var(--bg5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0, marginTop: 4 }}>
            {session ? session.user.name.slice(0, 2).toUpperCase() : '?'}
          </div>
          <input value={text} onChange={e => setText(e.target.value)} placeholder={session ? 'Drop a comment...' : 'Sign in to comment'} disabled={!session} className="form-input" style={{ flex: 1 }} />
          <button type="submit" disabled={loading || !session} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#8B5CF6,#C77DFF)', border: 'none', borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer', opacity: loading ? .7 : 1, whiteSpace: 'nowrap' }}>
            {loading ? '...' : 'Post'}
          </button>
        </form>
      </div>
    </>
  );
}
