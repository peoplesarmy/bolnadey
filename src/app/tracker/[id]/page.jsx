// src/app/tracker/[id]/page.jsx
import { connectDB } from '@/lib/mongodb';
import Project from '@/models/Project';
import Comment from '@/models/Comment';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import ProjectDetailClient from './ProjectDetailClient';

async function getProject(id) {
  try {
    await connectDB();
    const project = await Project.findById(id).populate('addedBy', 'name avatar role').lean();
    if (!project) return null;
    const comments = await Comment.find({ refType: 'Project', refId: id, isApproved: true })
      .populate('author', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return { project, comments };
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  try {
    await connectDB();
    const p = await Project.findById(params.id).lean();
    if (!p) return { title: 'Project Not Found' };
    return { title: `${p.title} | Gov Tracker — Bolna Dey`, description: p.description?.slice(0, 160) };
  } catch { return { title: 'Bolna Dey' }; }
}

const STATUS_CONFIG = {
  Completed: { color: '#00E676', bg: 'rgba(0,230,118,.1)', border: 'rgba(0,230,118,.2)' },
  Ongoing:   { color: '#FF6D00', bg: 'rgba(255,109,0,.12)', border: 'rgba(255,109,0,.25)' },
  Delayed:   { color: '#FF0A16', bg: 'rgba(255,10,22,.1)',  border: 'rgba(255,10,22,.2)' },
  Planned:   { color: '#4488FF', bg: 'rgba(41,121,255,.1)', border: 'rgba(41,121,255,.2)' },
};

export default async function ProjectDetailPage({ params }) {
  const data = await getProject(params.id);
  if (!data) notFound();

  const { project, comments } = data;
  const session = await getServerSession(authOptions);
  const sc = STATUS_CONFIG[project.status] || STATUS_CONFIG.Planned;
  const spent = project.spent || 0;
  const budget = project.budget || 1;
  const spentPct = Math.min(100, Math.round((spent / budget) * 100));

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 88 }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="blob" style={{ width: 500, height: 500, background: 'rgba(255,10,22,.07)', top: -100, right: -100 }} />
        <div className="blob" style={{ width: 350, height: 350, background: 'rgba(199,125,255,.05)', bottom: '30%', left: -80, animationDelay: '-3s' }} />
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>
        {/* Back */}
        <Link href="/tracker" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--w4)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: 28, transition: 'color .2s' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--pink)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--w4)'}>
          ← Back to Tracker
        </Link>

        {/* Header card */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 24, padding: '36px 40px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to right, var(--red), var(--pink))' }} />
          <div style={{ position: 'absolute', right: -20, top: -20, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,10,22,.07),transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.color, display: 'inline-block' }} />
                  {project.status}
                </span>
                <span style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'var(--w3)', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100 }}>
                  {project.category}
                </span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, letterSpacing: '-.02em', lineHeight: 1.1, marginBottom: 12 }}>
                {project.title}
              </h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--w4)', fontWeight: 600 }}>
                <span>📍 {project.location}{project.district ? `, ${project.district}` : ''}</span>
                {project.ministry && <span>🏛️ {project.ministry}</span>}
                {project.contractor && <span>🏗️ {project.contractor}</span>}
              </div>
            </div>
            {(session?.user?.role === 'admin' || session?.user?.role === 'editor') && (
              <Link href={`/dashboard?edit=project&id=${project._id}`}
                style={{ padding: '10px 20px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: 'var(--w2)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Edit Project
              </Link>
            )}
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--w3)', marginBottom: 8 }}>
              <span>Progress</span>
              <span style={{ background: 'linear-gradient(135deg,var(--red),var(--pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-unbounded)', fontSize: 16, fontWeight: 900 }}>{project.progress || 0}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg5)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${project.progress || 0}%`, background: 'linear-gradient(to right,var(--red),var(--pink))', borderRadius: 100, transition: 'width 1s cubic-bezier(.4,0,.2,1)', position: 'relative' }}>
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 8, background: 'white', opacity: .4, filter: 'blur(3px)' }} />
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
            {[
              { label: 'Total Budget', val: project.budget ? `Rs. ${(project.budget/1e7).toFixed(1)}Cr` : 'N/A', color: 'var(--pink)' },
              { label: 'Amount Spent', val: project.spent ? `Rs. ${(project.spent/1e7).toFixed(1)}Cr` : 'N/A', color: 'var(--orange)' },
              { label: 'Budget Used', val: `${spentPct}%`, color: spentPct > 90 ? 'var(--red)' : 'var(--yellow)' },
              { label: 'Timeline', val: `${project.startDate ? new Date(project.startDate).getFullYear() : '?'}–${project.endDate ? new Date(project.endDate).getFullYear() : '?'}`, color: 'var(--cyan)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 22, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--w4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 20, padding: '28px 32px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 2, background: 'linear-gradient(to right,var(--red),var(--pink))', display: 'inline-block' }} />
              About This Project
            </div>
            <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 15, color: 'var(--w3)', lineHeight: 1.75 }}>{project.description}</p>
          </div>
        )}

        {/* Vote + comment — client component */}
        <ProjectDetailClient projectId={params.id} comments={comments} session={session} />
      </div>
    </div>
  );
}
