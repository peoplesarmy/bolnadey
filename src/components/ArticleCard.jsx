// src/components/ArticleCard.jsx
"use client";
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

const CAT_STYLE = {
  Investigation: { bg: 'rgba(255,10,22,.12)',  color: '#FF0A16', border: 'rgba(255,10,22,.2)'  },
  Politics:      { bg: 'rgba(199,125,255,.12)', color: '#C77DFF', border: 'rgba(199,125,255,.25)' },
  Governance:    { bg: 'rgba(0,240,255,.1)',    color: '#00F0FF', border: 'rgba(0,240,255,.2)'  },
  Opinion:       { bg: 'rgba(255,214,10,.1)',   color: '#FFD60A', border: 'rgba(255,214,10,.22)' },
  'Local Issues':{ bg: 'rgba(0,230,118,.1)',    color: '#00E676', border: 'rgba(0,230,118,.2)'  },
  Environment:   { bg: 'rgba(0,230,118,.1)',    color: '#00E676', border: 'rgba(0,230,118,.2)'  },
  Health:        { bg: 'rgba(255,109,0,.12)',   color: '#FF6D00', border: 'rgba(255,109,0,.22)' },
  Education:     { bg: 'rgba(41,121,255,.1)',   color: '#4488FF', border: 'rgba(41,121,255,.2)' },
};

const CAT_EMOJI = { Investigation:'⚡', Politics:'🏛️', Governance:'📊', Opinion:'💬', 'Local Issues':'📍', Environment:'🌱', Health:'🏥', Education:'📚' };

export default function ArticleCard({ article, size = 'normal' }) {
  const style = CAT_STYLE[article.category] || CAT_STYLE.Governance;
  const isBig = size === 'big';

  return (
    <Link href={`/news/${article.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', transition: 'all .28s', height: '100%' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,.18)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.05)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
        {/* Image area */}
        <div style={{ background: 'var(--bg3)', height: isBig ? 260 : 180, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isBig ? 80 : 56, position: 'relative' }}>
          <span>{CAT_EMOJI[article.category] || '📰'}</span>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 30%,rgba(4,4,10,.9) 100%)' }} />
        </div>
        {/* Body */}
        <div style={{ padding: isBig ? '20px 24px 24px' : 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color, fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100 }}>{article.category}</span>
            <span style={{ fontSize: 11, color: 'var(--w4)', marginLeft: 'auto' }}>{timeAgo(article.createdAt)}</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: isBig ? 20 : 15, fontWeight: 700, lineHeight: 1.3, color: 'var(--w)', marginBottom: 8 }}>{article.title}</h3>
          <p style={{ fontSize: 12.5, color: 'var(--w3)', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.excerpt}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.05)', flexWrap: 'wrap' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#FF0A16,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: 'white', flexShrink: 0 }}>
              {(article.author?.name || 'U').slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--w3)' }}>{article.author?.name}</span>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <span style={{ fontSize: 11, color: 'var(--w4)' }}>👁 {article.views?.toLocaleString()}</span>
              <span style={{ fontSize: 11, color: 'var(--w4)' }}>👏 {article.reactions?.clap || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

