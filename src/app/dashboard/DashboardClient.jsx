'use client';
// src/app/dashboard/DashboardClient.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ROLE_BADGE = {
  super_admin:   { label: 'Super Admin',    bg: 'rgba(255,10,22,.12)',   color: '#FF0A16', border: 'rgba(255,10,22,.25)' },
  senior_editor: { label: 'Senior Editor',  bg: 'rgba(139,92,246,.12)',  color: '#8B5CF6', border: 'rgba(139,92,246,.25)' },
  reporter:      { label: 'Reporter',       bg: 'rgba(0,240,255,.1)',    color: '#00F0FF', border: 'rgba(0,240,255,.2)' },
  reader:        { label: 'Reader',         bg: 'rgba(255,255,255,.06)', color: '#9898A0', border: 'rgba(255,255,255,.1)' },
};

const STATUS_COLORS = {
  published: { bg: 'rgba(0,230,118,.1)', color: '#00E676', border: 'rgba(0,230,118,.2)' },
  pending:   { bg: 'rgba(255,214,10,.1)', color: '#FFD60A', border: 'rgba(255,214,10,.2)' },
  rejected:  { bg: 'rgba(255,10,22,.1)', color: '#FF0A16', border: 'rgba(255,10,22,.2)' },
  draft:     { bg: 'rgba(255,255,255,.05)', color: '#9898A0', border: 'rgba(255,255,255,.1)' },
  Submitted:     { bg: 'rgba(0,240,255,.1)',    color: '#00F0FF', border: 'rgba(0,240,255,.2)' },
  'Under Review':{ bg: 'rgba(255,109,0,.12)',   color: '#FF6D00', border: 'rgba(255,109,0,.2)' },
  'Action Taken':{ bg: 'rgba(0,230,118,.1)',    color: '#00E676', border: 'rgba(0,230,118,.2)' },
};

function Badge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:100,fontSize:9.5,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',background:s.bg,color:s.color,border:`1px solid ${s.border}`,whiteSpace:'nowrap' }}>
      <span style={{ width:5,height:5,borderRadius:'50%',background:s.color,display:'inline-block' }} />
      {status}
    </span>
  );
}

function RoleBadge({ role }) {
  const r = ROLE_BADGE[role] || ROLE_BADGE.reader;
  return (
    <span style={{ display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:100,fontSize:9,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',background:r.bg,color:r.color,border:`1px solid ${r.border}` }}>
      {r.label}
    </span>
  );
}

function StatCard({ n, label, color, sub }) {
  return (
    <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.05)',borderRadius:16,padding:'20px 22px',position:'relative',overflow:'hidden',transition:'all .25s' }}
      onMouseOver={e=>e.currentTarget.style.borderColor='rgba(139,92,246,.12)'}
      onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,.05)'}>
      <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:color }} />
      <div style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:36,fontWeight:900,lineHeight:1,marginBottom:4,background:color,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>{n}</div>
      <div style={{ fontSize:10,fontWeight:700,letterSpacing:'.16em',textTransform:'uppercase',color:'var(--w4)' }}>{label}</div>
      {sub && <div style={{ fontSize:11.5,fontWeight:700,marginTop:8,color:'var(--green)' }}>{sub}</div>}
    </div>
  );
}

export default function DashboardClient({ session, stats, pendingForReview, recentPublished, allReporters, recentReports, allProjects }) {
  const [tab, setTab]         = useState('overview');
  const [reviewing, setReviewing] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [msg, setMsg]         = useState(null);
  const [articles, setArticles] = useState({ pending: pendingForReview, published: recentPublished });
  const router = useRouter();

  const isSuperAdmin = session.user.role === 'super_admin';
  const isEditor     = ['senior_editor','super_admin'].includes(session.user.role);

  async function reviewArticle(id, action) {
    setMsg(null);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'review', reviewStatus: action, reviewNote }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg({ ok: true, text: d.message });
        setArticles(a => ({
          ...a,
          pending: a.pending.filter(x => x._id !== id),
          published: action === 'published' ? [d.article, ...a.published] : a.published,
        }));
        setReviewing(null); setReviewNote('');
      } else { setMsg({ ok: false, text: d.error }); }
    } catch { setMsg({ ok: false, text: 'Network error' }); }
  }

  async function toggleUser(userId, isActive) {
    const res = await fetch(`/api/users/${userId}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ isActive: !isActive }) });
    if (res.ok) { setMsg({ ok: true, text: `User ${isActive ? 'suspended' : 'activated'}` }); router.refresh(); }
  }

  const TABS = [
    { k: 'overview', l: '📊 Overview' },
    { k: 'review',   l: `📝 Review Queue ${articles.pending.length > 0 ? `(${articles.pending.length})` : ''}` },
    { k: 'articles', l: '📰 Articles' },
    { k: 'projects', l: '🏛️ Projects' },
    { k: 'reports',  l: '📢 Reports' },
    ...(isSuperAdmin ? [{ k: 'users', l: '👥 Users' }] : []),
  ];

  return (
    <div style={{ background:'var(--bg)',minHeight:'100vh',paddingTop:88 }}>
      {/* Header */}
      <div style={{ background:'var(--bg2)',borderBottom:'1px solid rgba(255,255,255,.05)',padding:'20px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
        <div>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:4 }}>
            <div style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:20,fontWeight:900,letterSpacing:'-.01em' }}>Dashboard</div>
            <RoleBadge role={session.user.role} />
          </div>
          <div style={{ fontSize:12,color:'var(--w4)',fontWeight:600 }}>Welcome back, {session.user.name}</div>
        </div>
        <div style={{ display:'flex',gap:8 }}>
          {isEditor && <Link href="/news/new" style={{ padding:'9px 20px',background:'linear-gradient(135deg,var(--red),var(--pink))',borderRadius:100,fontSize:12,fontWeight:700,color:'white',textDecoration:'none',display:'flex',alignItems:'center',gap:6 }}>+ New Article</Link>}
          <button onClick={() => window.location.href='/api/auth/signout'} style={{ padding:'9px 18px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:100,fontSize:12,fontWeight:600,color:'var(--w3)',cursor:'pointer' }}>Sign Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid rgba(255,255,255,.05)',padding:'0 28px',display:'flex',gap:0,overflowX:'auto',background:'var(--bg2)' }}>
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{ padding:'13px 18px',fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',background:'transparent',border:'none',borderBottom:tab===t.k?'2px solid var(--pink)':'2px solid transparent',color:tab===t.k?'var(--pink)':'var(--w4)',cursor:'pointer',transition:'all .2s',whiteSpace:'nowrap',marginBottom:-1 }}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:1300,margin:'0 auto',padding:'24px 28px 80px' }}>
        {msg && (
          <div style={{ padding:'11px 16px',borderRadius:10,fontSize:13,fontWeight:600,marginBottom:20,background:msg.ok?'rgba(0,230,118,.08)':'rgba(255,10,22,.08)',border:`1px solid ${msg.ok?'rgba(0,230,118,.2)':'rgba(255,10,22,.2)'}`,color:msg.ok?'var(--green)':'var(--red)',display:'flex',justifyContent:'space-between' }}>
            <span>{msg.ok ? '✓ ' : '⚠ '}{msg.text}</span>
            <button onClick={() => setMsg(null)} style={{ background:'transparent',border:'none',color:'inherit',cursor:'pointer',fontSize:14 }}>✕</button>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10,marginBottom:24 }}>
              <StatCard n={stats.publishedArticles} label="Published" color="linear-gradient(to right,var(--red),var(--pink))" sub={stats.pendingArticles > 0 ? `⚠ ${stats.pendingArticles} pending review` : ''} />
              <StatCard n={stats.totalProjects}     label="Projects"  color="linear-gradient(to right,var(--cyan),var(--green))" />
              <StatCard n={stats.openReports}       label="Open Reports" color="linear-gradient(to right,var(--yellow),var(--orange))" />
              {isSuperAdmin && <StatCard n={stats.totalUsers} label="Total Users" color="linear-gradient(to right,var(--purple),var(--pink))" sub={`${stats.reporters} reporters`} />}
            </div>

            {/* Pending review alert */}
            {articles.pending.length > 0 && (
              <div style={{ background:'rgba(255,214,10,.07)',border:'1px solid rgba(255,214,10,.2)',borderRadius:16,padding:'18px 22px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
                <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                  <span style={{ fontSize:20 }}>📝</span>
                  <div>
                    <div style={{ fontSize:14,fontWeight:700,color:'var(--yellow)' }}>{articles.pending.length} article{articles.pending.length>1?'s':''} waiting for review</div>
                    <div style={{ fontSize:12,color:'var(--w3)',marginTop:2 }}>Reporters have submitted work that needs your approval</div>
                  </div>
                </div>
                <button onClick={() => setTab('review')} style={{ padding:'8px 20px',background:'rgba(255,214,10,.15)',border:'1px solid rgba(255,214,10,.3)',borderRadius:100,fontSize:12,fontWeight:700,color:'var(--yellow)',cursor:'pointer' }}>
                  Review Now →
                </button>
              </div>
            )}

            {/* Role descriptions */}
            <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.05)',borderRadius:20,padding:'24px',marginBottom:16 }}>
              <div style={{ fontSize:10,fontWeight:800,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--pink)',marginBottom:16,display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ width:16,height:2,background:'linear-gradient(to right,var(--red),var(--pink))',display:'inline-block' }} />
                Role Permissions
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10 }}>
                {[
                  { role:'super_admin', icon:'👑', perms:['Full system access','Manage all users','Set editor permissions','Change roles','Delete anything','View all analytics'] },
                  { role:'senior_editor', icon:'✍️', perms:['Review reporter articles','Approve or reject submissions','Publish directly','Manage projects','View reports','Cannot manage user roles'] },
                  { role:'reporter', icon:'📰', perms:['Submit articles for review','Create own profile','Track article status','Submit citizen reports','Cannot publish directly'] },
                  { role:'reader', icon:'👁️', perms:['Read all published articles','Comment on articles','Submit reports','Vote on projects','No writing access'] },
                ].map(r => {
                  const rb = ROLE_BADGE[r.role];
                  return (
                    <div key={r.role} style={{ background:'var(--bg3)',borderRadius:14,padding:'16px' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                        <span style={{ fontSize:18 }}>{r.icon}</span>
                        <RoleBadge role={r.role} />
                      </div>
                      {r.perms.map(p => (
                        <div key={p} style={{ fontSize:12,color:'var(--w3)',marginBottom:4,display:'flex',alignItems:'center',gap:6 }}>
                          <span style={{ color:'var(--green)',fontSize:10 }}>✓</span> {p}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEW QUEUE ── */}
        {tab === 'review' && (
          <div>
            <div style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:18,fontWeight:800,letterSpacing:'-.01em',marginBottom:16 }}>
              Review Queue <span style={{ background:'var(--grad1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>({articles.pending.length})</span>
            </div>
            {articles.pending.length === 0 ? (
              <div style={{ textAlign:'center',padding:'60px 0',fontFamily:'var(--font-playfair,serif)',fontStyle:'italic',color:'var(--w4)',fontSize:15 }}>
                ✓ All caught up! No articles waiting for review.
              </div>
            ) : (
              articles.pending.map(a => (
                <div key={a._id} style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.05)',borderRadius:18,padding:'22px 24px',marginBottom:10,transition:'border-color .2s' }}
                  onMouseOver={e=>e.currentTarget.style.borderColor='rgba(139,92,246,.15)'}
                  onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,.05)'}>
                  <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap' }}>
                    <div style={{ flex:1,minWidth:200 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap' }}>
                        <Badge status="pending" />
                        <span style={{ fontSize:9.5,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--pink)' }}>{a.category}</span>
                      </div>
                      <div style={{ fontSize:16,fontWeight:700,color:'var(--w)',marginBottom:6,lineHeight:1.3 }}>{a.title}</div>
                      <div style={{ fontSize:13,color:'var(--w3)',lineHeight:1.5,marginBottom:10 }}>{a.excerpt}</div>
                      <div style={{ display:'flex',alignItems:'center',gap:12,fontSize:11,color:'var(--w4)',fontWeight:600 }}>
                        <span>by {a.author?.name}</span>
                        <RoleBadge role={a.author?.role} />
                        <span>· {a.readTime} min read</span>
                        <span>· {new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex',flexDirection:'column',gap:8,flexShrink:0 }}>
                      <Link href={`/news/${a.slug}`} target="_blank" style={{ padding:'8px 16px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:100,fontSize:11,fontWeight:700,color:'var(--w3)',textDecoration:'none',textAlign:'center' }}>
                        Preview ↗
                      </Link>
                      <button onClick={() => reviewArticle(a._id, 'published')}
                        style={{ padding:'8px 16px',background:'rgba(0,230,118,.1)',border:'1px solid rgba(0,230,118,.2)',borderRadius:100,fontSize:11,fontWeight:700,color:'var(--green)',cursor:'pointer' }}>
                        ✓ Approve & Publish
                      </button>
                      <button onClick={() => setReviewing(reviewing === a._id ? null : a._id)}
                        style={{ padding:'8px 16px',background:'rgba(255,10,22,.08)',border:'1px solid rgba(255,10,22,.15)',borderRadius:100,fontSize:11,fontWeight:700,color:'var(--red)',cursor:'pointer' }}>
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                  {reviewing === a._id && (
                    <div style={{ marginTop:14,paddingTop:14,borderTop:'1px solid rgba(255,255,255,.05)' }}>
                      <div style={{ fontSize:10,fontWeight:800,letterSpacing:'.16em',textTransform:'uppercase',color:'var(--w4)',marginBottom:8 }}>Rejection reason (sent to reporter)</div>
                      <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Explain why this article is being rejected so the reporter can improve it..."
                        className="form-input" rows={3} style={{ borderRadius:12,resize:'vertical',marginBottom:10 }} />
                      <div style={{ display:'flex',gap:8 }}>
                        <button onClick={() => reviewArticle(a._id, 'rejected')}
                          style={{ padding:'9px 20px',background:'linear-gradient(135deg,var(--red),#CC0000)',border:'none',borderRadius:100,fontSize:12,fontWeight:700,color:'white',cursor:'pointer' }}>
                          Confirm Rejection
                        </button>
                        <button onClick={() => { setReviewing(null); setReviewNote(''); }}
                          style={{ padding:'9px 18px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:100,fontSize:12,fontWeight:600,color:'var(--w3)',cursor:'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── ARTICLES ── */}
        {tab === 'articles' && (
          <div>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10 }}>
              <div style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:18,fontWeight:800,letterSpacing:'-.01em' }}>All Articles</div>
              <Link href="/news/new" style={{ padding:'9px 20px',background:'linear-gradient(135deg,var(--red),var(--pink))',borderRadius:100,fontSize:12,fontWeight:700,color:'white',textDecoration:'none' }}>+ Write Article</Link>
            </div>
            <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.05)',borderRadius:18,overflow:'hidden' }}>
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'rgba(255,255,255,.02)' }}>
                    {['Title','Category','Author','Status','Views','Actions'].map(h => (
                      <th key={h} style={{ textAlign:'left',fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--w4)',padding:'11px 14px',borderBottom:'1px solid rgba(255,255,255,.05)',fontWeight:800 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...articles.pending, ...articles.published].map(a => (
                    <tr key={a._id} style={{ borderBottom:'1px solid rgba(255,255,255,.04)',transition:'background .15s' }}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'}
                      onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 14px',fontSize:13,fontWeight:600,color:'var(--w)',maxWidth:280 }}><div style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{a.title}</div></td>
                      <td style={{ padding:'12px 14px' }}><span style={{ fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--pink)' }}>{a.category}</span></td>
                      <td style={{ padding:'12px 14px' }}>
                        <div style={{ display:'flex',flexDirection:'column',gap:3 }}>
                          <span style={{ fontSize:12,color:'var(--w2)',fontWeight:600 }}>{a.author?.name}</span>
                          <RoleBadge role={a.author?.role} />
                        </div>
                      </td>
                      <td style={{ padding:'12px 14px' }}><Badge status={a.status} /></td>
                      <td style={{ padding:'12px 14px',fontSize:12,color:'var(--w4)',fontWeight:600 }}>{a.views?.toLocaleString()}</td>
                      <td style={{ padding:'12px 14px' }}>
                        <div style={{ display:'flex',gap:6 }}>
                          <Link href={`/news/${a.slug}`} style={{ padding:'4px 10px',border:'1px solid rgba(255,255,255,.1)',borderRadius:100,fontSize:9.5,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--w3)',textDecoration:'none' }}>View</Link>
                          {a.status === 'pending' && (
                            <button onClick={() => { setTab('review'); }}
                              style={{ padding:'4px 10px',border:'1px solid rgba(255,214,10,.3)',borderRadius:100,fontSize:9.5,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--yellow)',background:'rgba(255,214,10,.08)',cursor:'pointer' }}>Review</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PROJECTS ── */}
        {tab === 'projects' && (
          <div>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
              <div style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:18,fontWeight:800 }}>Projects</div>
            </div>
            <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.05)',borderRadius:18,overflow:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <thead><tr style={{ background:'rgba(255,255,255,.02)' }}>{['Project','Location','Budget','Status','Progress'].map(h=><th key={h} style={{ textAlign:'left',fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--w4)',padding:'11px 14px',borderBottom:'1px solid rgba(255,255,255,.05)',fontWeight:800 }}>{h}</th>)}</tr></thead>
                <tbody>
                  {allProjects.map(p => (
                    <tr key={p._id} style={{ borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                      <td style={{ padding:'12px 14px',fontSize:13,fontWeight:600,color:'var(--w)',maxWidth:260 }}><div style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.title}</div></td>
                      <td style={{ padding:'12px 14px',fontSize:12,color:'var(--w4)' }}>{p.district}</td>
                      <td style={{ padding:'12px 14px',fontSize:12,fontWeight:700,color:'var(--w2)' }}>Rs. {(p.budget/1e7).toFixed(1)}Cr</td>
                      <td style={{ padding:'12px 14px' }}><Badge status={p.status} /></td>
                      <td style={{ padding:'12px 14px' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                          <div style={{ width:80,height:4,background:'var(--bg5)',borderRadius:100,overflow:'hidden' }}>
                            <div style={{ height:'100%',width:`${p.progress}%`,background:'linear-gradient(to right,var(--red),var(--pink))',borderRadius:100 }} />
                          </div>
                          <span style={{ fontSize:11,fontWeight:800,color:'var(--pink)' }}>{p.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab === 'reports' && (
          <div>
            <div style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:18,fontWeight:800,marginBottom:16 }}>Citizen Reports</div>
            <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.05)',borderRadius:18,overflow:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <thead><tr style={{ background:'rgba(255,255,255,.02)' }}>{['Title','Type','District','Submitted By','Status'].map(h=><th key={h} style={{ textAlign:'left',fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--w4)',padding:'11px 14px',borderBottom:'1px solid rgba(255,255,255,.05)',fontWeight:800 }}>{h}</th>)}</tr></thead>
                <tbody>
                  {recentReports.map(r => (
                    <tr key={r._id} style={{ borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                      <td style={{ padding:'12px 14px',fontSize:13,fontWeight:600,color:'var(--w)',maxWidth:260 }}><div style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{r.title}</div></td>
                      <td style={{ padding:'12px 14px',fontSize:11,fontWeight:700,color:'var(--pink)',letterSpacing:'.1em',textTransform:'uppercase' }}>{r.type}</td>
                      <td style={{ padding:'12px 14px',fontSize:12,color:'var(--w4)' }}>{r.district}</td>
                      <td style={{ padding:'12px 14px',fontSize:12,color:'var(--w2)' }}>{r.isAnonymous ? '🔒 Anonymous' : r.submittedBy?.name}</td>
                      <td style={{ padding:'12px 14px' }}><Badge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS (super_admin only) ── */}
        {tab === 'users' && isSuperAdmin && (
          <div>
            <div style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:18,fontWeight:800,marginBottom:16 }}>User Management</div>
            <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.05)',borderRadius:18,overflow:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <thead><tr style={{ background:'rgba(255,255,255,.02)' }}>{['User','Role','Articles','Joined','Status','Actions'].map(h=><th key={h} style={{ textAlign:'left',fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--w4)',padding:'11px 14px',borderBottom:'1px solid rgba(255,255,255,.05)',fontWeight:800 }}>{h}</th>)}</tr></thead>
                <tbody>
                  {allReporters.map(u => (
                    <tr key={u._id} style={{ borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                      <td style={{ padding:'12px 14px' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                          <div style={{ width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,var(--red),var(--pink))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'white',flexShrink:0 }}>{u.name?.[0]}</div>
                          <div><div style={{ fontSize:13,fontWeight:600,color:'var(--w)' }}>{u.name}</div><div style={{ fontSize:11,color:'var(--w4)' }}>{u.email}</div></div>
                        </div>
                      </td>
                      <td style={{ padding:'12px 14px' }}><RoleBadge role={u.role} /></td>
                      <td style={{ padding:'12px 14px',fontSize:12,color:'var(--w3)' }}>{u.articlesCount || 0}</td>
                      <td style={{ padding:'12px 14px',fontSize:12,color:'var(--w4)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding:'12px 14px' }}>
                        <span style={{ fontSize:11,fontWeight:700,color:u.isActive?'var(--green)':'var(--red)' }}>{u.isActive ? '● Active' : '● Suspended'}</span>
                      </td>
                      <td style={{ padding:'12px 14px' }}>
                        <button onClick={() => toggleUser(u._id, u.isActive)}
                          style={{ padding:'4px 12px',border:`1px solid ${u.isActive?'rgba(255,10,22,.3)':'rgba(0,230,118,.3)'}`,borderRadius:100,fontSize:9.5,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:u.isActive?'var(--red)':'var(--green)',background:u.isActive?'rgba(255,10,22,.08)':'rgba(0,230,118,.08)',cursor:'pointer' }}>
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

