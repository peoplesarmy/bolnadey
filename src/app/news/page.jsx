// src/app/news/page.jsx
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/utils';

async function getArticles(searchParams) {
  try {
    await connectDB();
    const category = searchParams.category;
    const q        = searchParams.q;
    const page     = parseInt(searchParams.page || '1');
    const query    = { status: 'published' };
    if (category) query.category = category;
    if (q)        query.$text    = { $search: q };
    const [articles, total] = await Promise.all([
      Article.find(query).populate('author', 'name avatar').sort({ createdAt: -1 }).skip((page - 1) * 12).limit(12).lean(),
      Article.countDocuments(query),
    ]);
    return { articles, total, page, pages: Math.ceil(total / 12) };
  } catch { return { articles: [], total: 0, page: 1, pages: 1 }; }
}

export default async function NewsPage({ searchParams }) {
  const { articles, total, page, pages } = await getArticles(searchParams);
  const activeCategory = searchParams.category;

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '110px 28px 80px', position: 'relative', zIndex: 1 }}>
      <div style={{ marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 20, height: 2, background: 'var(--grad1)', display: 'inline-block' }} /> Journalism
        </div>
        <h1 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(36px,5vw,60px)', fontWeight: 900, letterSpacing: '-.02em', lineHeight: .92 }}>
          News &amp; <span className="gt">Articles</span> ✍️
        </h1>
      </div>

      {/* Search */}
      <form method="GET" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input name="q" defaultValue={searchParams.q || ''} placeholder="Search stories, investigations, opinions..." className="form-input" style={{ flex: 1, borderRadius: 100 }} />
        <button type="submit" style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#FF0A16,#8B5CF6)', border: 'none', borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 800, color: 'white', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '.08em', textTransform: 'uppercase' }}>Search</button>
      </form>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32, overflowX: 'auto', flexWrap: 'wrap' }}>
        {[{ label: 'All', value: '' }, ...CATEGORIES.map(c => ({ label: c, value: c }))].map(({ label, value }) => (
          <Link key={value} href={value ? `/news?category=${value}` : '/news'} style={{ padding: '7px 18px', background: activeCategory === value || (!activeCategory && !value) ? 'linear-gradient(135deg,#FF0A16,#8B5CF6)' : 'rgba(255,255,255,.05)', border: `1px solid ${activeCategory === value || (!activeCategory && !value) ? 'transparent' : 'rgba(255,255,255,.08)'}`, borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 700, color: activeCategory === value || (!activeCategory && !value) ? 'white' : 'var(--w3)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all .2s', boxShadow: activeCategory === value || (!activeCategory && !value) ? '0 4px 20px rgba(255,10,22,.22)' : 'none' }}>{label}</Link>
        ))}
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: 'var(--w4)', marginBottom: 24 }}>
        {total} article{total !== 1 ? 's' : ''}{activeCategory ? ` in ${activeCategory}` : ''}
      </div>

      {/* Grid */}
      {articles.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {articles.map(a => <ArticleCard key={a._id} article={a} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--w4)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
          <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 20, marginBottom: 8 }}>No articles yet</div>
          <Link href="/api/seed" style={{ color: 'var(--pink)' }}>Seed the database to add demo content</Link>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <Link key={p} href={`/news?${activeCategory ? `category=${activeCategory}&` : ''}page=${p}`} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: p === page ? 'linear-gradient(135deg,#FF0A16,#8B5CF6)' : 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', fontFamily: 'var(--font-outfit)', fontSize: 13, fontWeight: 700, color: p === page ? 'white' : 'var(--w3)', textDecoration: 'none', boxShadow: p === page ? '0 4px 16px rgba(255,10,22,.22)' : 'none' }}>{p}</Link>
          ))}
        </div>
      )}
    </div>
  );
}

