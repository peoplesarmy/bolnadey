'use client';
// src/app/tracker/[id]/ProjectDetailClient.jsx
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ProjectDetailClient({ projectId, comments: initComments, session }) {
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [voted, setVoted] = useState(null);
  const [comments, setComments] = useState(initComments || []);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  async function vote(dir) {
    if (!session) { alert('Sign in to vote'); return; }
    if (voted === dir) return;
    try {
      await fetch('/api/votes', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'project', id: projectId, direction: dir }) });
      if (dir === 'up') { setUpvotes(p => p + 1); if (voted === 'down') setDownvotes(p => p - 1); }
      else { setDownvotes(p => p + 1); if (voted === 'up') setUpvotes(p => p - 1); }
      setVoted(dir);
    } catch {}
  }

  async function postComment(e) {
    e.preventDefault();
    if (!session) { alert('Sign in to comment'); return; }
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, refType: 'Project', refId: projectId }) });
      if (res.ok) {
        const newC = await res.json();
        setComments(p => [{ ...newC.comment, author: { name: session.user.name } }, ...p]);
        setText('');
      }
    } catch {} finally { setPosting(false); }
  }

  return (
    <div>
      {/* Vote bar */}
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 20, padding: '20px 28px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--w3)', marginRight: 4 }}>Rate this project:</span>
        {[{dir:'up',icon:'👍',label:'Accurate',val:upvotes,c:'var(--green)'},{dir:'down',icon:'👎',label:'Issues',val:downvotes,c:'var(--red)'}].map(v => (
          <button key={v.dir} onClick={() => vote(v.dir)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: voted === v.dir ? `${v.c}18` : 'rgba(255,255,255,.04)', border: `1px solid ${voted === v.dir ? v.c : 'rgba(255,255,255,.08)'}`, borderRadius: 100, fontSize: 13, fontWeight: 700, color: voted === v.dir ? v.c : 'var(--w3)', cursor: 'pointer', transition: 'all .2s' }}>
            {v.icon} {v.label} {v.val > 0 && <span style={{ opacity: .6 }}>({v.val})</span>}
          </button>
        ))}
      </div>

      {/* Comments */}
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 20, padding: '28px 32px' }}>
        <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 18, fontWeight: 800, letterSpacing: '-.01em', marginBottom: 20 }}>
          Comments <span style={{ background: 'var(--grad1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>({comments.length})</span>
        </div>

        <form onSubmit={postComment} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--red),var(--pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
            {session?.user?.name?.[0] || '?'}
          </div>
          <input value={text} onChange={e => setText(e.target.value)} placeholder={session ? 'Drop a comment...' : 'Sign in to comment'}
            className="form-input" style={{ flex: 1 }} disabled={!session} />
          <button type="submit" disabled={!session || posting || !text.trim()}
            style={{ padding: '0 20px', background: 'linear-gradient(135deg,var(--red),var(--pink))', border: 'none', borderRadius: 100, fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer', opacity: (!session || posting || !text.trim()) ? .5 : 1 }}>
            {posting ? '...' : 'Post'}
          </button>
        </form>

        {comments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-playfair)', fontStyle: 'italic', color: 'var(--w4)', fontSize: 14 }}>
            No comments yet. Be the first to speak up.
          </div>
        )}

        {comments.map((c, i) => (
          <div key={c._id || i} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--pink),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0 }}>
              {c.author?.name?.[0] || '?'}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--w2)', marginBottom: 3 }}>{c.author?.name || 'Anonymous'}</div>
              <div style={{ fontSize: 13, color: 'var(--w3)', lineHeight: 1.55 }}>{c.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
