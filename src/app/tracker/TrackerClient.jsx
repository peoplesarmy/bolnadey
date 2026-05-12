'use client';
// src/app/tracker/TrackerClient.jsx
import { useState, useMemo } from 'react';

const ST = {
  Completed: { color:'#00E676', bg:'rgba(0,230,118,.1)',  border:'rgba(0,230,118,.2)',  icon:'✅' },
  Ongoing:   { color:'#FF6D00', bg:'rgba(255,109,0,.12)', border:'rgba(255,109,0,.25)', icon:'🔄' },
  Delayed:   { color:'#FF0A16', bg:'rgba(255,10,22,.1)',  border:'rgba(255,10,22,.2)',  icon:'⚠️' },
  Planned:   { color:'#4488FF', bg:'rgba(68,136,255,.1)', border:'rgba(68,136,255,.2)', icon:'📋' },
};

const CATEGORIES = ['Infrastructure','Health','Education','Water','Energy','Environment','Other'];
const CAT_ICON = { Infrastructure:'🛣️', Health:'🏥', Education:'📚', Water:'💧', Energy:'⚡', Environment:'🌱', Other:'📋' };

function StatusBadge({ status }) {
  const s = ST[status] || ST.Planned;
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'4px 12px',borderRadius:100,fontSize:10,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',background:s.bg,color:s.color,border:`1px solid ${s.border}`,whiteSpace:'nowrap' }}>
      <span style={{ width:5,height:5,borderRadius:'50%',background:s.color,display:'inline-block',animation:status==='Ongoing'?'pulse 1.4s infinite':'none' }} />
      {status}
    </span>
  );
}

function Timeline({ startDate, endDate, progress, status }) {
  const today  = new Date();
  const start  = new Date(startDate);
  const end    = new Date(endDate);
  const total  = end - start;
  const elapsed= Math.min(Math.max(today - start, 0), total);
  const timePos= total > 0 ? Math.round((elapsed / total) * 100) : 0;
  const st     = ST[status] || ST.Planned;

  const fmt = (d) => new Date(d).toLocaleDateString('en-US',{ day:'numeric', month:'short', year:'numeric' });
  const daysLeft = Math.ceil((end - today) / (1000*60*60*24));
  const isOver   = today > end;

  return (
    <div style={{ marginTop:12 }}>
      <div style={{ display:'flex',justifyContent:'space-between',fontSize:10.5,fontWeight:700,color:'var(--w4)',marginBottom:6 }}>
        <span>🗓 {fmt(startDate)}</span>
        <span style={{ color: isOver && status !== 'Completed' ? '#FF0A16' : 'var(--w4)' }}>
          {status === 'Completed' ? '✅ Completed' :
           isOver ? `⚠ Overdue by ${Math.abs(daysLeft)}d` :
           daysLeft > 0 ? `⏳ ${daysLeft} days left` : 'Due today'}
        </span>
        <span>🏁 {fmt(endDate)}</span>
      </div>

      {/* Timeline bar */}
      <div style={{ position:'relative',height:8,background:'var(--bg5)',borderRadius:100,overflow:'visible',marginBottom:4 }}>
        {/* Completed progress */}
        <div style={{ position:'absolute',left:0,top:0,height:'100%',width:`${progress}%`,background:`linear-gradient(to right,${st.color},${st.color}88)`,borderRadius:100,transition:'width 1s cubic-bezier(.4,0,.2,1)' }} />
        {/* Today marker */}
        {timePos > 0 && timePos < 100 && (
          <div style={{ position:'absolute',left:`${timePos}%`,top:-4,transform:'translateX(-50%)',zIndex:2 }}>
            <div style={{ width:2,height:16,background:'white',opacity:.7,borderRadius:1 }} />
            <div style={{ position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',fontSize:9,fontWeight:800,color:'white',background:'rgba(0,0,0,.6)',padding:'1px 5px',borderRadius:4,whiteSpace:'nowrap' }}>TODAY</div>
          </div>
        )}
      </div>

      <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--w4)',fontWeight:600 }}>
        <span>Progress: <span style={{ color:st.color,fontWeight:800 }}>{progress}%</span></span>
        <span>Time elapsed: <span style={{ fontWeight:700,color:'var(--w3)' }}>{timePos}%</span></span>
      </div>
    </div>
  );
}

function ProjectForm({ onSave, onClose, editing }) {
  const [form, setForm] = useState(editing || {
    title:'', description:'', location:'', district:'', category:'Infrastructure',
    budget:'', spent:'', progress:'0', startDate:'', endDate:'', contractor:'', ministry:'',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // Preview what status would be
  const previewStatus = form.startDate && form.endDate
    ? (() => {
        const today = new Date();
        const start = new Date(form.startDate);
        const end   = new Date(form.endDate);
        const p     = Number(form.progress || 0);
        if (p >= 100)           return 'Completed';
        if (today < start)      return 'Planned';
        if (today > end)        return 'Delayed';
        return 'Ongoing';
      })()
    : null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.title||!form.location||!form.district||!form.budget||!form.startDate||!form.endDate) {
      setErr('Please fill all required fields'); return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setErr('End date must be after start date'); return;
    }
    setSaving(true); setErr('');
    try {
      const method = editing ? 'PUT' : 'POST';
      const url    = editing ? `/api/projects/${editing._id}` : '/api/projects';
      const res = await fetch(url, {
        method, headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, budget: Number(form.budget), spent: Number(form.spent||0), progress: Number(form.progress||0) }),
      });
      const d = await res.json();
      if (res.ok) { onSave(d.project, d.message); }
      else setErr(d.error || 'Failed');
    } catch { setErr('Network error'); } finally { setSaving(false); }
  }

  const F = ({ label, req, children }) => (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block',fontSize:9.5,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--w3)',marginBottom:7 }}>
        {label} {req && <span style={{ color:'var(--red)' }}>*</span>}
      </label>
      {children}
    </div>
  );

  const inp = (k, type='text', placeholder='', props={}) => (
    <input type={type} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
      style={{ width:'100%',padding:'11px 14px',background:'var(--bg3)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,color:'var(--w)',fontSize:13,outline:'none',fontFamily:'var(--font-outfit,sans-serif)',transition:'border-color .2s' }}
      onFocus={e=>e.target.style.borderColor='var(--pink)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.08)'}
      {...props} />
  );

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',backdropFilter:'blur(16px)' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.08)',borderRadius:24,width:'100%',maxWidth:680,maxHeight:'88vh',overflowY:'auto',position:'relative' }}>
        {/* Top bar */}
        <div style={{ position:'sticky',top:0,background:'var(--bg2)',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'18px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:1 }}>
          <div>
            <div style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:18,fontWeight:800 }}>{editing ? 'Edit Project' : 'Add Government Project'}</div>
            {previewStatus && (
              <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:4,fontSize:12,color:'var(--w3)' }}>
                Auto-detected status: <StatusBadge status={previewStatus} />
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ width:30,height:30,background:'rgba(255,255,255,.06)',border:'none',borderRadius:'50%',cursor:'pointer',fontSize:14,color:'var(--w3)' }}>✕</button>
        </div>

        <form onSubmit={submit} style={{ padding:'24px' }}>
          <F label="Project Title" req>
            {inp('title','text','e.g. Kathmandu Ring Road Expansion Phase 3')}
          </F>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <F label="Location" req>{inp('location','text','City / Ward / Area')}</F>
            <F label="District" req>{inp('district','text','e.g. Kathmandu')}</F>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <F label="Category" req>
              <select value={form.category} onChange={e=>set('category',e.target.value)}
                style={{ width:'100%',padding:'11px 14px',background:'var(--bg3)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,color:'var(--w)',fontSize:13,outline:'none' }}>
                {CATEGORIES.map(c=><option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
              </select>
            </F>
            <F label="Ministry / Department">
              {inp('ministry','text','e.g. Dept of Roads')}
            </F>
          </div>

          {/* Dates — the key section */}
          <div style={{ background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'16px',marginBottom:16 }}>
            <div style={{ fontSize:10,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--pink)',marginBottom:14,display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ width:14,height:2,background:'linear-gradient(to right,var(--red),var(--pink))',display:'inline-block' }} />
              Project Timeline — Status auto-calculated from these dates
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              <F label="Start Date" req>{inp('startDate','date')}</F>
              <F label="End Date (Deadline)" req>{inp('endDate','date')}</F>
            </div>
            {previewStatus && (
              <div style={{ background: ST[previewStatus].bg, border:`1px solid ${ST[previewStatus].border}`, borderRadius:10, padding:'10px 14px', fontSize:12, color: ST[previewStatus].color, fontWeight:600, display:'flex',alignItems:'center',gap:8 }}>
                {ST[previewStatus].icon} Based on these dates, status will be: <strong>{previewStatus}</strong>
                {previewStatus==='Delayed' && ' — End date has already passed!'}
                {previewStatus==='Planned' && ' — Start date is in the future'}
                {previewStatus==='Ongoing' && ' — Currently within the project period'}
              </div>
            )}
          </div>

          {/* Budget */}
          <div style={{ background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'16px',marginBottom:16 }}>
            <div style={{ fontSize:10,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--cyan)',marginBottom:14 }}>Budget (in NPR)</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12 }}>
              <F label="Total Budget" req>{inp('budget','number','e.g. 420000000',{min:0})}</F>
              <F label="Amount Spent">{inp('spent','number','0',{min:0})}</F>
              <F label="Progress %">{inp('progress','number','0',{min:0,max:100})}</F>
            </div>
            {form.budget && form.spent && (
              <div style={{ fontSize:12,color:'var(--w3)',marginTop:4 }}>
                Budget used: <strong style={{ color: Number(form.spent)/Number(form.budget) > .9 ? 'var(--red)' : 'var(--green)' }}>
                  {Math.round((Number(form.spent)/Number(form.budget))*100)}%
                </strong> — Remaining: <strong>Rs. {((Number(form.budget)-Number(form.spent))/1e7).toFixed(2)} Cr</strong>
              </div>
            )}
          </div>

          <F label="Contractor">{inp('contractor','text','Company name')}</F>
          <F label="Description">
            <textarea value={form.description} onChange={e=>set('description',e.target.value)}
              placeholder="What is this project? What problem does it solve? Current situation..."
              rows={3} style={{ width:'100%',padding:'11px 14px',background:'var(--bg3)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,color:'var(--w)',fontSize:13,outline:'none',resize:'vertical',fontFamily:'var(--font-outfit,sans-serif)',lineHeight:1.6 }}
              onFocus={e=>e.target.style.borderColor='var(--pink)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.08)'} />
          </F>

          {err && <div style={{ background:'rgba(255,10,22,.08)',border:'1px solid rgba(255,10,22,.2)',borderRadius:10,padding:'10px 14px',fontSize:13,color:'var(--red)',marginBottom:16 }}>⚠ {err}</div>}

          <div style={{ display:'flex',gap:10 }}>
            <button type="submit" disabled={saving}
              style={{ flex:1,padding:'14px',background:'linear-gradient(135deg,var(--red),var(--pink))',border:'none',borderRadius:100,fontFamily:'var(--font-unbounded,sans-serif)',fontSize:13,fontWeight:800,color:'white',cursor:'pointer',opacity:saving?.7:1,boxShadow:'0 4px 20px rgba(255,10,22,.22)' }}>
              {saving ? 'Saving...' : editing ? 'Update Project' : 'Add Project'}
            </button>
            <button type="button" onClick={onClose}
              style={{ padding:'14px 24px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:100,fontSize:13,fontWeight:600,color:'var(--w3)',cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TrackerClient({ initialProjects, stats: initStats, canManage, session }) {
  const [projects, setProjects] = useState(initialProjects);
  const [stats, setStats]       = useState(initStats);
  const [filter, setFilter]     = useState('all');
  const [catFilter, setCat]     = useState('all');
  const [search, setSearch]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [toast, setToast]       = useState(null);
  const [expanded, setExpanded] = useState(null);

  function showToast(msg, ok=true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }

  function handleSaved(project, message) {
    setProjects(prev => {
      const exists = prev.find(p => p._id === project._id);
      return exists ? prev.map(p => p._id===project._id ? project : p) : [project, ...prev];
    });
    // Recount stats
    const all = projects.map(p => p._id===project._id ? project : p);
    setStats({
      total:     all.length,
      Planned:   all.filter(p=>p.status==='Planned').length,
      Ongoing:   all.filter(p=>p.status==='Ongoing').length,
      Completed: all.filter(p=>p.status==='Completed').length,
      Delayed:   all.filter(p=>p.status==='Delayed').length,
    });
    setShowForm(false); setEditing(null);
    showToast(message || 'Project saved!');
  }

  async function deleteProject(id) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects(p => p.filter(x => x._id !== id));
      showToast('Project deleted');
    } else { showToast('Delete failed', false); }
  }

  const filtered = useMemo(() => {
    let p = projects;
    if (filter !== 'all')    p = p.filter(x => x.status === filter);
    if (catFilter !== 'all') p = p.filter(x => x.category === catFilter);
    if (search.trim())       p = p.filter(x => x.title.toLowerCase().includes(search.toLowerCase()) || x.location.toLowerCase().includes(search.toLowerCase()));
    return p;
  }, [projects, filter, catFilter, search]);

  const STATUSES = ['Planned','Ongoing','Completed','Delayed'];

  return (
    <div style={{ background:'var(--bg)',minHeight:'100vh',paddingTop:88,position:'relative' }}>
      {/* Blobs */}
      <div style={{ position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0 }}>
        <div style={{ position:'absolute',width:500,height:500,borderRadius:'50%',background:'rgba(255,10,22,.06)',top:-100,right:-100,filter:'blur(80px)' }} />
        <div style={{ position:'absolute',width:350,height:350,borderRadius:'50%',background:'rgba(68,136,255,.05)',bottom:'20%',left:-80,filter:'blur(80px)' }} />
      </div>

      <div style={{ maxWidth:1200,margin:'0 auto',padding:'40px 28px 80px',position:'relative',zIndex:1 }}>
        {/* Header */}
        <div style={{ marginBottom:32,display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16 }}>
          <div>
            <div style={{ fontSize:10,fontWeight:800,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--pink)',marginBottom:8,display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ width:16,height:2,background:'linear-gradient(to right,var(--red),var(--pink))',display:'inline-block' }} />
              Public Accountability
            </div>
            <h1 style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:'clamp(32px,5vw,52px)',fontWeight:900,letterSpacing:'-.02em',lineHeight:.92,marginBottom:10 }}>
              Gov <span style={{ background:'linear-gradient(135deg,var(--red),var(--pink))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>Tracker</span> 📊
            </h1>
            <p style={{ fontFamily:'var(--font-playfair,serif)',fontStyle:'italic',fontSize:14,color:'var(--w3)',maxWidth:480,lineHeight:1.65 }}>
              Project status is automatically calculated from start date, end date, and progress — updated daily.
            </p>
          </div>
          {canManage && (
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              style={{ padding:'13px 28px',background:'linear-gradient(135deg,var(--red),var(--pink))',border:'none',borderRadius:100,fontFamily:'var(--font-unbounded,sans-serif)',fontSize:13,fontWeight:800,color:'white',cursor:'pointer',boxShadow:'0 4px 20px rgba(255,10,22,.22)',whiteSpace:'nowrap',transition:'all .25s' }}
              onMouseOver={e=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 8px 32px rgba(255,10,22,.3)'}}
              onMouseOut={e=>{e.target.style.transform='none';e.target.style.boxShadow='0 4px 20px rgba(255,10,22,.22)'}}>
              + Add Project
            </button>
          )}
        </div>

        {/* Status legend */}
        <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.05)',borderRadius:16,padding:'14px 18px',marginBottom:20,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
          <span style={{ fontSize:10,fontWeight:800,letterSpacing:'.16em',textTransform:'uppercase',color:'var(--w4)',marginRight:4 }}>How status is determined:</span>
          {[
            { s:'Planned',   rule:'Start date in the future' },
            { s:'Ongoing',   rule:'Between start & end date' },
            { s:'Delayed',   rule:'Past end date, not 100%' },
            { s:'Completed', rule:'Progress = 100%' },
          ].map(({ s, rule }) => (
            <div key={s} style={{ display:'flex',alignItems:'center',gap:6,background:ST[s].bg,border:`1px solid ${ST[s].border}`,borderRadius:100,padding:'4px 12px' }}>
              <span style={{ width:5,height:5,borderRadius:'50%',background:ST[s].color,display:'inline-block' }} />
              <span style={{ fontSize:10.5,fontWeight:700,color:ST[s].color }}>{s}</span>
              <span style={{ fontSize:10,color:'var(--w4)' }}>— {rule}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:24 }}>
          {[{ k:'total',label:'Total',color:'linear-gradient(135deg,var(--red),var(--pink))' },...STATUSES.map(s=>({ k:s,label:s,color:`linear-gradient(135deg,${ST[s].color},${ST[s].color}88)` }))].map(({ k,label,color }) => (
            <div key={k} onClick={() => setFilter(k==='total'?'all':k)}
              style={{ background:filter===(k==='total'?'all':k)?'var(--bg3)':'var(--bg2)',border:`1px solid ${filter===(k==='total'?'all':k)?'rgba(139,92,246,.25)':'rgba(255,255,255,.05)'}`,borderTop:`3px solid ${ST[k]?.color||'var(--pink)'}`,borderRadius:16,padding:'18px 16px',cursor:'pointer',transition:'all .2s' }}>
              <div style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:32,fontWeight:900,marginBottom:4,background:color,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>{stats[k]}</div>
              <div style={{ fontSize:9.5,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--w4)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:20,alignItems:'center' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects..."
            style={{ padding:'9px 16px',background:'var(--bg2)',border:'1px solid rgba(255,255,255,.08)',borderRadius:100,color:'var(--w)',fontSize:12,outline:'none',minWidth:200,fontFamily:'var(--font-outfit,sans-serif)' }} />
          <span style={{ fontSize:9.5,fontWeight:800,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--w4)' }}>Category:</span>
          {['all',...CATEGORIES].map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              style={{ padding:'6px 14px',background:catFilter===c?'linear-gradient(135deg,var(--red),var(--pink))':'transparent',border:`1px solid ${catFilter===c?'transparent':'rgba(255,255,255,.08)'}`,borderRadius:100,fontSize:11,fontWeight:700,color:catFilter===c?'white':'var(--w3)',cursor:'pointer',transition:'all .18s',whiteSpace:'nowrap' }}>
              {c==='all'?'All':c}
            </button>
          ))}
        </div>

        {/* Project list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center',padding:'80px 0',fontFamily:'var(--font-playfair,serif)',fontStyle:'italic',color:'var(--w4)',fontSize:16 }}>
            No projects found matching your filters.
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {filtered.map(p => {
              const isExp = expanded === p._id;
              const s = ST[p.status] || ST.Planned;
              const spentPct = p.budget ? Math.round((p.spent/p.budget)*100) : 0;
              return (
                <div key={p._id} style={{ background:'var(--bg2)',border:`1px solid ${isExp?'rgba(139,92,246,.2)':'rgba(255,255,255,.05)'}`,borderRadius:20,overflow:'hidden',transition:'border-color .25s' }}>
                  {/* Status stripe */}
                  <div style={{ height:3,background:`linear-gradient(to right,${s.color},${s.color}44)` }} />

                  <div style={{ padding:'20px 24px' }}>
                    <div style={{ display:'grid',gridTemplateColumns:'auto 1fr auto',gap:16,alignItems:'start' }}>
                      {/* Icon */}
                      <div style={{ width:48,height:48,background:'var(--bg3)',border:'1px solid rgba(255,255,255,.06)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>
                        {CAT_ICON[p.category]||'📋'}
                      </div>

                      {/* Info */}
                      <div>
                        <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:6 }}>
                          <StatusBadge status={p.status} />
                          <span style={{ fontSize:9.5,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--w4)',padding:'2px 8px',background:'rgba(255,255,255,.04)',borderRadius:100,border:'1px solid rgba(255,255,255,.07)' }}>{p.category}</span>
                          {p.district && <span style={{ fontSize:11,color:'var(--w4)' }}>📍 {p.district}</span>}
                        </div>
                        <div style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:16,fontWeight:800,color:'var(--w)',lineHeight:1.2,marginBottom:8 }}>{p.title}</div>

                        {/* Key numbers */}
                        <div style={{ display:'flex',gap:16,flexWrap:'wrap' }}>
                          <div style={{ fontSize:12,fontWeight:600,color:'var(--w3)' }}>
                            💰 <span style={{ fontWeight:700,color:'var(--w)' }}>Rs. {(p.budget/1e7).toFixed(1)}Cr</span> budget
                          </div>
                          {p.spent > 0 && (
                            <div style={{ fontSize:12,fontWeight:600,color:'var(--w3)' }}>
                              📤 Rs. {(p.spent/1e7).toFixed(1)}Cr spent
                              <span style={{ marginLeft:4,color:spentPct>90?'var(--red)':'var(--w4)',fontSize:11 }}>({spentPct}%)</span>
                            </div>
                          )}
                          {p.ministry && <div style={{ fontSize:12,color:'var(--w4)' }}>🏛 {p.ministry}</div>}
                          {p.contractor && <div style={{ fontSize:12,color:'var(--w4)' }}>🏗 {p.contractor}</div>}
                        </div>

                        {/* Timeline */}
                        <Timeline startDate={p.startDate} endDate={p.endDate} progress={p.progress} status={p.status} />
                      </div>

                      {/* Actions */}
                      <div style={{ display:'flex',flexDirection:'column',gap:6,flexShrink:0 }}>
                        <button onClick={() => setExpanded(isExp ? null : p._id)}
                          style={{ padding:'7px 16px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:100,fontSize:11,fontWeight:700,color:'var(--w3)',cursor:'pointer',whiteSpace:'nowrap' }}>
                          {isExp ? 'Collapse ↑' : 'Details ↓'}
                        </button>
                        {canManage && (
                          <>
                            <button onClick={() => { setEditing(p); setShowForm(true); }}
                              style={{ padding:'7px 16px',background:'rgba(255,214,10,.08)',border:'1px solid rgba(255,214,10,.2)',borderRadius:100,fontSize:11,fontWeight:700,color:'var(--yellow)',cursor:'pointer' }}>
                              ✏ Edit
                            </button>
                            {session?.role === 'super_admin' && (
                              <button onClick={() => deleteProject(p._id)}
                                style={{ padding:'7px 16px',background:'rgba(255,10,22,.08)',border:'1px solid rgba(255,10,22,.2)',borderRadius:100,fontSize:11,fontWeight:700,color:'var(--red)',cursor:'pointer' }}>
                                🗑 Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExp && (
                      <div style={{ marginTop:18,paddingTop:18,borderTop:'1px solid rgba(255,255,255,.05)' }}>
                        {p.description && (
                          <p style={{ fontFamily:'var(--font-playfair,serif)',fontStyle:'italic',fontSize:14,color:'var(--w3)',lineHeight:1.75,marginBottom:16 }}>{p.description}</p>
                        )}
                        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10 }}>
                          {[
                            { label:'Total Budget',  val:`Rs. ${(p.budget/1e7).toFixed(2)} Crore`,  c:'var(--pink)' },
                            { label:'Amount Spent',  val: p.spent ? `Rs. ${(p.spent/1e7).toFixed(2)} Crore` : 'N/A', c:'var(--orange)' },
                            { label:'Progress',      val:`${p.progress}% complete`, c:s.color },
                            { label:'Start Date',    val:new Date(p.startDate).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'}), c:'var(--cyan)' },
                            { label:'Deadline',      val:new Date(p.endDate).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'}), c: new Date(p.endDate)<new Date()&&p.progress<100?'var(--red)':'var(--cyan)' },
                            { label:'Added by',      val:p.addedBy?.name||'Admin', c:'var(--purple)' },
                          ].map(s=>(
                            <div key={s.label} style={{ background:'var(--bg3)',borderRadius:12,padding:'12px 14px' }}>
                              <div style={{ fontSize:13,fontWeight:800,color:s.c,marginBottom:3 }}>{s.val}</div>
                              <div style={{ fontSize:9.5,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--w4)' }}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <ProjectForm
          editing={editing}
          onSave={handleSaved}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed',bottom:28,right:28,zIndex:9999,background:toast.ok?'rgba(0,230,118,.1)':'rgba(255,10,22,.1)',border:`1px solid ${toast.ok?'rgba(0,230,118,.3)':'rgba(255,10,22,.3)'}`,borderRadius:100,padding:'12px 20px',fontSize:13,fontWeight:700,color:toast.ok?'var(--green)':'var(--red)',boxShadow:'0 8px 32px rgba(0,0,0,.4)',transition:'all .3s' }}>
          {toast.ok ? '✓' : '⚠'} {toast.msg}
        </div>
      )}
    </div>
  );
}

