'use client';                   // src/components/ProjectCard.jsx
import Link from 'next/link';
import { useState } from 'react';

const STATUS_STYLE = {
  Completed: { bg: 'rgba(0,230,118,.1)',   color: '#00E676', bar: 'linear-gradient(to right,#00E676,#00F0FF)' },
  Ongoing:   { bg: 'rgba(255,109,0,.12)',  color: '#FF6D00', bar: 'linear-gradient(to right,#FF6D00,#FFD60A)' },
  Delayed:   { bg: 'rgba(255,10,22,.1)',   color: '#FF0A16', bar: 'linear-gradient(to right,#FF0A16,#FF4D88)' },
  Planned:   { bg: 'rgba(41,121,255,.1)',  color: '#4488FF', bar: 'linear-gradient(to right,#2979FF,#C77DFF)' },
};

const CAT_EMOJI = { Infrastructure:'🛣️', Water:'💧', Education:'📚', Health:'🏥', Energy:'⚡', Environment:'🌱', Other:'🏗️' };

export default function ProjectCard({ project, onVote }) {
  const [votes, setVotes] = useState({ up: project.upvotes, down: project.downvotes });
  const st = STATUS_STYLE[project.status] || STATUS_STYLE.Planned;

  const vote = async (dir) => {
    setVotes(v => ({ ...v, [dir]: v[dir] + 1 }));
    if (onVote) onVote(project._id, dir);
    try {
      await fetch('/api/votes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refType: 'Project', refId: project._id, action: dir }) });
    } catch (e) { /* optimistic */ }
  };

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 20, overflow: 'hidden', transition: 'border-color .25s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,77,136,.15)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.05)'}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, padding: 20, alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{ width: 48, height: 48, background: 'var(--bg4)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {CAT_EMOJI[project.category] || '🏗️'}
        </div>

        {/* Info */}
        <div>
          <Link href={`/tracker/${project._id}`} style={{ fontFamily: 'var(--font-outfit)', fontSize: 15, fontWeight: 700, color: 'var(--w)', textDecoration: 'none', marginBottom: 4, display: 'block', lineHeight: 1.3 }}>{project.title}</Link>
          <div style={{ fontSize: 11, color: 'var(--w4)', marginBottom: 12 }}>📍 {project.location}</div>

          {/* Progress bar */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700, color: 'var(--w3)', marginBottom: 5 }}>
              <span>Progress</span><span>{project.progress}%</span>
            </div>
            <div style={{ height: 4, background: 'var(--bg5)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${project.progress}%`, background: st.bar, borderRadius: 100, transition: 'width 1s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}30`, fontSize: 9.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, background: 'currentColor', borderRadius: '50%', opacity: .7 }} />{project.status}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--w2)' }}>Rs. {(project.budget / 1e6).toFixed(1)}M</span>
            <span style={{ fontSize: 11, color: 'var(--w4)' }}>📅 {project.startDate ? new Date(project.startDate).getFullYear() : '—'}–{project.endDate ? new Date(project.endDate).getFullYear() : '—'}</span>
          </div>
        </div>

        {/* Votes */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => vote('up')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 11, fontWeight: 700, color: 'var(--w3)', cursor: 'pointer', transition: 'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00E676'; e.currentTarget.style.color = '#00E676'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'var(--w3)'; }}>
              👍 {votes.up}
            </button>
            <button onClick={() => vote('down')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 11, fontWeight: 700, color: 'var(--w3)', cursor: 'pointer', transition: 'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF0A16'; e.currentTarget.style.color = '#FF0A16'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'var(--w3)'; }}>
              👎 {votes.down}
            </button>
          </div>
          <Link href={`/tracker/${project._id}`} style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--w4)', textDecoration: 'none' }}>View Details →</Link>
        </div>
      </div>
    </div>
  );
}
