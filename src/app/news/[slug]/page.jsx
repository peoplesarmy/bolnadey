// src/app/news/[slug]/page.jsx
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import Comment from '@/models/Comment';
import Link from 'next/link';
import CommentSection from './CommentSection';

async function getArticle(slug) {
  try {
    await connectDB();
    Article.findOneAndUpdate(slug.match(/^[a-f\d]{24}$/i) ? { _id: slug } : { slug }, { $inc: { views: 1 } }).exec();
    const article = await Article.findOne(slug.match(/^[a-f\d]{24}$/i) ? { _id: slug } : { slug })
      .populate('author', 'name avatar bio role').lean();
    if (!article) return { article: null, comments: [] };
    const comments = await Comment.find({ refType: 'Article', refId: article._id, isApproved: true })
      .populate('author', 'name avatar').sort({ createdAt: -1 }).limit(50).lean();
    return { article, comments };
  } catch { return { article: null, comments: [] }; }
}

export async function generateMetadata({ params }) {
  const { article } = await getArticle(params.slug);
  return { title: article?.title || 'Article', description: article?.excerpt };
}

export default async function ArticlePage({ params }) {
  const { article, comments } = await getArticle(params.slug);

  if (!article) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '120px 28px', textAlign: 'center' }}>
      <div style={{ fontSize: 60, marginBottom: 20 }}>📭</div>
      <h1 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 32, marginBottom: 12 }}>Article Not Found</h1>
      <Link href="/news" style={{ color: 'var(--pink)' }}>← Back to News</Link>
    </div>
  );

  const CAT_STYLE = { Investigation: { bg: 'rgba(255,10,22,.12)', color: '#FF0A16', border: 'rgba(255,10,22,.2)' }, Politics: { bg: 'rgba(199,125,255,.12)', color: '#C77DFF', border: 'rgba(199,125,255,.25)' }, Governance: { bg: 'rgba(0,240,255,.1)', color: '#00F0FF', border: 'rgba(0,240,255,.2)' }, Opinion: { bg: 'rgba(255,214,10,.1)', color: '#FFD60A', border: 'rgba(255,214,10,.22)' }, 'Local Issues': { bg: 'rgba(0,230,118,.1)', color: '#00E676', border: 'rgba(0,230,118,.2)' } };
  const cs = CAT_STYLE[article.category] || { bg: 'rgba(255,77,136,.12)', color: '#FF4D88', border: 'rgba(255,77,136,.2)' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '110px 28px 80px' }}>
      {/* Categories */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        <span style={{ background: cs.bg, border: `1px solid ${cs.border}`, color: cs.color, fontSize: 9.5, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100 }}>{article.category}</span>
        {(article.tags || []).map(t => <span key={t} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'var(--w3)', fontSize: 9.5, fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>{t}</span>)}
      </div>

      {/* Title */}
      <h1 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, lineHeight: .95, letterSpacing: '-.02em', marginBottom: 20, color: 'var(--w)' }}>{article.title}</h1>

      {/* Subtitle */}
      <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 19, color: 'var(--w3)', lineHeight: 1.65, marginBottom: 24, paddingLeft: 18, borderLeft: '3px solid var(--pink)' }}>{article.excerpt}</p>

      {/* Byline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)', marginBottom: 36 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#FF0A16,#FF4D88)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', flexShrink: 0 }}>
          {(article.author?.name || 'U').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--w)' }}>{article.author?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--w4)', marginTop: 2 }}>
            {new Date(article.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} · {article.readTime} min read · {article.views?.toLocaleString()} views
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button style={{ padding: '8px 16px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 700, color: 'var(--w3)', cursor: 'pointer' }}>Share</button>
          <button style={{ padding: '8px 16px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 700, color: 'var(--w3)', cursor: 'pointer' }}>Save</button>
        </div>
      </div>

      {/* Hero image */}
      <div style={{ width: '100%', height: 420, background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, marginBottom: 40, position: 'relative', overflow: 'hidden' }}>
        {article.coverImage ? <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }} /> : <span style={{ position: 'relative', zIndex: 1 }}>📰</span>}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%,rgba(255,10,22,.06),transparent)' }} />
      </div>

      {/* Content */}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

      {/* Reactions */}
      <CommentSection articleId={article._id.toString()} comments={comments} reactions={article.reactions} />

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.06)' }}>
        {(article.tags || []).map(t => (
          <Link key={t} href={`/news?q=${t}`} style={{ padding: '5px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 100, fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--w4)', textDecoration: 'none', transition: 'all .2s' }}>{t}</Link>
        ))}
      </div>
    </div>
  );
}
