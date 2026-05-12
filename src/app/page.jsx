// src/app/page.jsx
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import Project from '@/models/Project';
import Report from '@/models/Report';
import User from '@/models/User';
import ArticleCard from '@/components/ArticleCard';
import ProjectCard from '@/components/ProjectCard';
import '@/styles/animations.css';

async function getData() {
  try {
    await connectDB();
    const [articles, projects, stats] = await Promise.all([
      Article.find({ status: 'published' }).populate('author', 'name avatar').sort({ createdAt: -1 }).limit(7).lean(),
      Project.find({}).sort({ createdAt: -1 }).limit(3).lean(),
      Promise.all([
        Article.countDocuments({ status: 'published' }),
        User.countDocuments({}),
        Report.countDocuments({}),
        Project.countDocuments({}),
      ]),
    ]);
    return { articles, projects, stats: { articles: stats[0], users: stats[1], reports: stats[2], projects: stats[3] } };
  } catch { return { articles: [], projects: [], stats: { articles: 0, users: 0, reports: 0, projects: 0 } }; }
}

const STORIES = [
  { emoji: '🔴', label: 'Live',      ring: 'linear-gradient(135deg,#FF0A16,#8B5CF6)' },
  { emoji: '🏛️', label: 'Politics',  ring: 'linear-gradient(135deg,#00F0FF,#00E676)' },
  { emoji: '⚡', label: 'Invest.',   ring: 'linear-gradient(135deg,#C77DFF,#8B5CF6)' },
  { emoji: '🛣️', label: 'Gov Work',  ring: 'linear-gradient(135deg,#FFD60A,#FF6D00)' },
  { emoji: '📢', label: 'Opinion',   ring: 'rgba(255,255,255,.1)' },
  { emoji: '🌱', label: 'Environ.',  ring: 'rgba(255,255,255,.1)' },
  { emoji: '📚', label: 'Education', ring: 'rgba(255,255,255,.1)' },
  { emoji: '💧', label: 'Water',     ring: 'rgba(255,255,255,.1)' },
];

export default async function HomePage() {
  const { articles, projects, stats } = await getData();
  const featured = articles[0];
  const rest = articles.slice(1, 7);

  return (
    <div style={{ position: 'relative' }}>
      {/* Blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="blob" style={{ width: 500, height: 500, background: 'rgba(255,10,22,.07)', top: -100, right: -100 }} />
        <div className="blob" style={{ width: 400, height: 400, background: 'rgba(139,92,246,.06)', bottom: '20%', left: -100, animationDelay: '-5s' }} />
        <div className="blob" style={{ width: 300, height: 300, background: 'rgba(199,125,255,.05)', top: '40%', right: '20%', animationDelay: '-1s' }} />
      </div>

      {/* STORIES ROW */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '104px 28px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 20, height: 2, background: 'linear-gradient(to right,#FF0A16,#8B5CF6)', display: 'inline-block' }} />
          Categories
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {STORIES.map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', padding: 2, background: s.ring }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '2px solid var(--bg)' }}>{s.emoji}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--w3)', textAlign: 'center', maxWidth: 64 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 28px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
          {/* Main card */}
          {featured ? (
            <Link href={`/news/${featured.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
              <div className="card-lift" style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 24, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ height: 320, background: 'linear-gradient(135deg,var(--bg3),var(--bg4))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, position: 'relative' }}>
                  <span>⚡</span>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,var(--bg2) 100%)' }} />
                  <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.35)', color: 'var(--pink)', fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 100, animation: 'floatAnim 4s ease-in-out infinite', transform: 'rotate(6deg)' }}>⚡ Featured</div>
                </div>
                <div style={{ padding: '24px 28px 28px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255,10,22,.15)', border: '1px solid rgba(255,10,22,.3)', color: 'var(--red)', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 5, height: 5, background: 'var(--red)', borderRadius: '50%', animation: 'pulseAnim 1.4s infinite' }} /> Live
                    </span>
                    <span style={{ background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.25)', color: 'var(--pink)', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 100 }}>{featured.category}</span>
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 28, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-.01em', color: 'var(--w)', marginBottom: 12 }}>
                    {featured.title.includes('Where') ? <>{featured.title.split(':')[0]}: <span style={{ background: 'var(--grad1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{featured.title.split(':')[1]}</span></> : featured.title}
                  </h1>
                  <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 14, color: 'var(--w3)', lineHeight: 1.7, marginBottom: 20 }}>{featured.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#FF0A16,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white' }}>{(featured.author?.name || 'U').slice(0,2).toUpperCase()}</div>
                      <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--w2)' }}>{featured.author?.name}</div><div style={{ fontSize: 11, color: 'var(--w4)' }}>{featured.readTime} min read</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--w4)' }}>👏 {featured.reactions?.clap || 0}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--w4)' }}>💬 {featured.commentsCount}</span>
                      <span style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#FF0A16,#8B5CF6)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: 'white', boxShadow: '0 4px 20px rgba(255,10,22,.22)' }}>Read Now →</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div style={{ background: 'var(--bg2)', borderRadius: 24, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--w4)', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 40 }}>✍️</span>
              <span style={{ fontFamily: 'var(--font-outfit)', fontSize: 14 }}>No articles yet. <Link href="/api/seed" style={{ color: 'var(--pink)' }}>Seed the database</Link></span>
            </div>
          )}

          {/* Trending sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-unbounded)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--w2)' }}>Trending 🔥</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, background: 'var(--red)', borderRadius: '50%', animation: 'pulseAnim 1.4s infinite' }} /> Live
              </span>
            </div>
            {rest.slice(0, 4).map((a, i) => (
              <Link key={a._id} href={`/news/${a.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card-trend" style={{ background: 'var(--bg2)', borderRadius: 16, padding: 16, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: i === 0 ? 32 : 28, background: i === 0 ? 'var(--grad1)' : 'rgba(255,255,255,.06)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, flexShrink: 0, width: 32 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 4 }}>{a.category}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--w2)', lineHeight: 1.35 }}>{a.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--w4)', marginTop: 5 }}>👁 {a.views?.toLocaleString()} reading</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* MARQUEE */}
      <div style={{ marginTop: 32, background: 'linear-gradient(135deg,#FF0A16,#8B5CF6)', padding: '14px 0', overflow: 'hidden' }}>
        <div className="animate-ticker" style={{ display: 'inline-flex', whiteSpace: 'nowrap', alignItems: 'center' }}>
          {['BOLNA DEY','LET THE PEOPLE SPEAK','जनताको आवाज़','ACCOUNTABILITY','TRANSPARENCY','TRUTH','BOLNA DEY','LET THE PEOPLE SPEAK','जनताको आवाज़','ACCOUNTABILITY','TRANSPARENCY','TRUTH'].map((item, i) => (
            <div key={i} style={{ fontFamily: 'var(--font-unbounded)', fontSize: 13, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', marginRight: 0 }}>
              {item}
              <span style={{ width: 6, height: 6, background: 'rgba(255,255,255,.4)', borderRadius: '50%', margin: '0 28px', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: 'var(--bg2)', borderTop: '1px solid rgba(255,255,255,.05)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            { emoji: '🏛️', num: stats.projects, label: 'Projects Tracked', grad: 'gt',  delta: '+3 this month' },
            { emoji: '👥', num: stats.users,    label: 'Citizens Registered', grad: 'gt2', delta: '+234 this week' },
            { emoji: '📢', num: stats.reports,  label: 'Open Reports', grad: 'gt3', delta: '⚡ Awaiting action' },
            { emoji: '✍️', num: stats.articles,  label: 'Articles Published', grad: 'gt2', delta: '+12 this week' },
          ].map((s, i) => (
            <div key={i} className="stat-cell" style={{ padding: '36px 28px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.05)' : 'none', position: 'relative', overflow: 'hidden' }}>
              <span style={{ fontSize: 28, marginBottom: 12, display: 'block' }}>{s.emoji}</span>
              <div className={s.grad} style={{ fontFamily: 'var(--font-unbounded)', fontSize: 40, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>{s.num?.toLocaleString() || 0}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--w3)', letterSpacing: '.04em' }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, marginTop: 8 }}>{s.delta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* NEWS BENTO */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '48px 28px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 20, fontWeight: 800, letterSpacing: '-.01em' }}>
            What's <span className="gt">Hot Right Now</span> 🔥
          </h2>
          <Link href="/news" style={{ fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 700, color: 'var(--pink)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>See everything →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          {rest[0] && <div style={{ gridRow: 'span 2' }}><ArticleCard article={rest[0]} size="big" /></div>}
          {rest.slice(1, 3).map(a => <ArticleCard key={a._id} article={a} />)}
          {rest.slice(3, 5).map(a => <ArticleCard key={a._id} article={a} />)}
        </div>
      </div>

      {/* TRACKER PREVIEW */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '48px 28px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 24, padding: 36, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,10,22,.07),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 8 }}>Public Accountability</div>
              <h2 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 22, fontWeight: 800, letterSpacing: '-.01em' }}>Gov <span className="gt">Tracker</span> 📊</h2>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {[{ n: 62, l: 'Completed', c: 'var(--green)' }, { n: 48, l: 'Ongoing', c: 'var(--orange)' }, { n: 37, l: 'Delayed', c: 'var(--red)' }].map(s => (
                <div key={s.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 28, fontWeight: 900, color: s.c }}>{s.n}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--w4)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.map(p => <ProjectCard key={p._id} project={p} />)}
          </div>
          <Link href="/tracker" style={{ display: 'block', marginTop: 16, width: '100%', padding: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, fontFamily: 'var(--font-outfit)', fontSize: 13, fontWeight: 700, color: 'var(--w3)', cursor: 'pointer', transition: 'all .25s', textAlign: 'center', textDecoration: 'none' }}>See all {stats.projects} projects →</Link>
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '48px 28px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 28, padding: 56, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 40, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,10,22,.06) 0%,rgba(139,92,246,.04) 40%,rgba(199,125,255,.04) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: -20, bottom: -20, fontFamily: 'var(--font-unbounded)', fontSize: 180, fontWeight: 900, color: 'var(--red)', opacity: .03, lineHeight: 1, pointerEvents: 'none' }}>SPEAK</div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 2, background: 'var(--grad1)', display: 'inline-block' }} /> Your Voice Matters
            </div>
            <h2 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 32, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: 14 }}>
              See something wrong?<br /><span className="gt">Drop a report. ✦</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 16, color: 'var(--w3)', lineHeight: 1.65, maxWidth: 500 }}>Your report enters our public tracking system, reaches journalists, and gets escalated to authorities. You're protected. Your voice isn't.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
              {['🔒 Anonymous option', '⚡ Reviewed in 24h', '📍 Location tracking'].map(t => (
                <span key={t} style={{ padding: '5px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 100, fontSize: 11, fontWeight: 600, color: 'var(--w4)' }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0, position: 'relative' }}>
            <Link href="/report" style={{ padding: '18px 36px', background: 'linear-gradient(135deg,#FF0A16,#8B5CF6)', border: 'none', borderRadius: 100, fontFamily: 'var(--font-unbounded)', fontSize: 14, fontWeight: 800, color: 'white', textDecoration: 'none', textAlign: 'center', transition: 'all .3s', boxShadow: '0 8px 32px rgba(255,10,22,.22)', whiteSpace: 'nowrap' }}>Report an Issue ↗</Link>
            <Link href="/register" style={{ padding: '14px 28px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 13, fontWeight: 700, color: 'var(--w2)', textDecoration: 'none', textAlign: 'center', transition: 'all .25s', whiteSpace: 'nowrap' }}>Join the Platform</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
