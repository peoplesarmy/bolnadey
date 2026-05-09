// src/app/profile/[id]/page.jsx
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Article from '@/models/Article';
import Report from '@/models/Report';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import Link from 'next/link';
import ProfileClient from './ProfileClient';

async function getProfile(id) {
  try {
    await connectDB();
    const user = await User.findById(id).select('-password').lean();
    if (!user) return null;
    const [articles, reports] = await Promise.all([
      Article.find({ author: id, status: 'published' }).sort({ createdAt: -1 }).limit(12).lean(),
      Report.find({ submittedBy: id, isPublic: true }).sort({ createdAt: -1 }).limit(6).lean(),
    ]);
    return { user, articles, reports };
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  try {
    await connectDB();
    const u = await User.findById(params.id).select('name').lean();
    return { title: u ? `${u.name} | Bolna Dey` : 'Profile' };
  } catch { return { title: 'Bolna Dey' }; }
}

const CAT_COLOR = { investigation: '#FF0A16', politics: '#C77DFF', governance: '#00F0FF', opinion: '#FFD60A', local: '#00E676' };

export default async function ProfilePage({ params }) {
  const data = await getProfile(params.id);
  if (!data) notFound();

  const { user, articles, reports } = data;
  const session = await getServerSession(authOptions);
  const isOwn = session?.user?.id === params.id;

  const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
  const gradients = ['linear-gradient(135deg,#FF0A16,#FF4D88)', 'linear-gradient(135deg,#00F0FF,#00E676)', 'linear-gradient(135deg,#C77DFF,#FF4D88)', 'linear-gradient(135deg,#FFD60A,#FF6D00)'];
  const grad = gradients[user.name?.charCodeAt(0) % gradients.length];

  const ROLE_LABEL = { admin: 'Administrator ✦', editor: 'Senior Journalist ✦', user: 'Citizen Reporter' };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 88 }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="blob" style={{ width: 400, height: 400, background: 'rgba(255,10,22,.07)', top: -80, right: -80 }} />
        <div className="blob" style={{ width: 300, height: 300, background: 'rgba(199,125,255,.06)', bottom: '20%', left: -60, animationDelay: '-3s' }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>
        {/* Profile hero */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 24, padding: '40px', marginBottom: 16, display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to right,var(--red),var(--pink))' }} />
          <div style={{ position: 'absolute', right: -20, bottom: -20, fontFamily: 'var(--font-unbounded)', fontSize: 140, fontWeight: 900, color: 'var(--red)', opacity: .03, lineHeight: 1, pointerEvents: 'none' }}>BD</div>

          <div style={{ width: 88, height: 88, borderRadius: '50%', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-unbounded)', fontSize: 28, fontWeight: 900, color: 'white', flexShrink: 0, boxShadow: `0 0 0 4px rgba(255,77,136,.18), 0 0 0 8px rgba(255,77,136,.07)` }}>
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: '-.02em', marginBottom: 8 }}>{user.name}</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,77,136,.1)', border: '1px solid rgba(255,77,136,.2)', color: 'var(--pink)', fontSize: 10, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, marginBottom: 12 }}>
              {ROLE_LABEL[user.role] || 'Contributor'}
            </span>
            {user.bio && <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 14, color: 'var(--w3)', lineHeight: 1.7, marginBottom: 18, maxWidth: 480 }}>{user.bio}</p>}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[{ n: articles.length, l: 'Articles' }, { n: reports.length, l: 'Reports' }, { n: user.articlesCount || articles.length, l: 'Total Published' }].map(s => (
                <div key={s.l}>
                  <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 28, fontWeight: 900, background: 'var(--grad1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.n}</div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--w4)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {isOwn && <Link href={`/profile/${params.id}/edit`} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,var(--red),var(--pink))', border: 'none', borderRadius: 100, fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Edit Profile</Link>}
        </div>

        {/* Articles */}
        {articles.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 18, fontWeight: 800, letterSpacing: '-.01em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 20, height: 2, background: 'linear-gradient(to right,var(--red),var(--pink))', display: 'inline-block' }} />
              Articles by {user.name.split(' ')[0]}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
              {articles.map(a => {
                const catKey = a.category?.toLowerCase();
                const cc = CAT_COLOR[catKey] || 'var(--pink)';
                return (
                  <Link key={a._id} href={`/news/${a.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255,77,136,.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.05)'; e.currentTarget.style.transform = 'none'; }}>
                      <div style={{ height: 150, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                        {a.category === 'Investigation' ? '⚡' : a.category === 'Politics' ? '🏛️' : a.category === 'Governance' ? '📋' : a.category === 'Environment' ? '🌱' : '📰'}
                      </div>
                      <div style={{ padding: '16px 18px' }}>
                        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: cc, marginBottom: 7 }}>{a.category}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--w)', lineHeight: 1.35, marginBottom: 8 }}>{a.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--w4)', fontWeight: 600 }}>
                          {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · 👁 {a.views || 0}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Client (settings tab if own) */}
        {isOwn && <ProfileClient userId={params.id} user={{ name: user.name, email: user.email, bio: user.bio || '' }} />}
      </div>
    </div>
  );
}
