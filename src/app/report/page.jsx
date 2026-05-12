'use client';
// src/app/report/page.jsx
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { NEPAL_DISTRICTS, NEPAL_DISTRICTS_BY_PROVINCE, searchDistricts, isValidDistrict } from '@/lib/nepal-districts';

const TYPES = [
  { key:'Corruption',      icon:'⚠️', desc:'Bribery, fraud, misuse of funds' },
  { key:'Infrastructure',  icon:'🛣️', desc:'Roads, bridges, public works' },
  { key:'Public Service',  icon:'🏥', desc:'Hospitals, schools, utilities' },
  { key:'Environment',     icon:'🌱', desc:'Pollution, illegal dumping' },
  { key:'Safety',          icon:'🚨', desc:'Public safety hazards' },
  { key:'Education',       icon:'📚', desc:'Schools, teachers, curriculum' },
  { key:'Health',          icon:'💊', desc:'Healthcare access, clinics' },
  { key:'Other',           icon:'📋', desc:'Anything else that matters' },
];

// ── District autocomplete component ──────────────────────────────────────────
function DistrictInput({ value, onChange, error }) {
  const [query, setQuery]       = useState(value || '');
  const [suggestions, setSugs]  = useState([]);
  const [focused, setFocused]   = useState(false);
  const [touched, setTouched]   = useState(false);
  const [selIdx, setSelIdx]     = useState(-1);
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  const valid   = isValidDistrict(query);
  const showErr = touched && query.trim() && !valid;
  const showOk  = touched && valid;

  useEffect(() => {
    if (query.trim()) {
      setSugs(searchDistricts(query));
    } else {
      setSugs([]);
    }
    setSelIdx(-1);
  }, [query]);

  function pick(district) {
    setQuery(district);
    setSugs([]);
    setFocused(false);
    setTouched(true);
    onChange(district);
  }

  function handleKey(e) {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelIdx(i => Math.min(i+1, suggestions.length-1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelIdx(i => Math.max(i-1, -1)); }
    if (e.key === 'Enter' && selIdx >= 0) { e.preventDefault(); pick(suggestions[selIdx]); }
    if (e.key === 'Escape') { setSugs([]); setFocused(false); }
  }

  function handleChange(val) {
    setQuery(val);
    onChange(isValidDistrict(val) ? val : '');
  }

  const borderColor = showErr ? 'var(--red)' : showOk ? 'var(--green)' : focused ? 'var(--pink)' : 'rgba(255,255,255,.1)';

  return (
    <div style={{ position:'relative' }}>
      <div style={{ position:'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setTimeout(() => { setFocused(false); setTouched(true); }, 180); }}
          onKeyDown={handleKey}
          placeholder="Type a district name..."
          autoComplete="off"
          style={{ width:'100%',padding:'12px 44px 12px 14px',background:'var(--bg3)',border:`1.5px solid ${borderColor}`,borderRadius:12,color:'var(--w)',fontSize:14,outline:'none',fontFamily:'var(--font-outfit,sans-serif)',transition:'border-color .2s' }}
        />
        {/* Status icon */}
        <div style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',fontSize:16,pointerEvents:'none' }}>
          {showOk  && <span style={{ color:'var(--green)' }}>✓</span>}
          {showErr && <span style={{ color:'var(--red)' }}>✗</span>}
          {!showOk && !showErr && <span style={{ color:'var(--w4)',fontSize:12 }}>🔍</span>}
        </div>
      </div>

      {/* Error message */}
      {showErr && (
        <div style={{ marginTop:6,fontSize:12,color:'var(--red)',fontWeight:600,display:'flex',alignItems:'center',gap:5 }}>
          ⚠ <span>"{query}" is not a valid Nepal district.</span>
        </div>
      )}
      {showOk && (
        <div style={{ marginTop:6,fontSize:12,color:'var(--green)',fontWeight:600 }}>
          ✓ Valid district
        </div>
      )}

      {/* Dropdown suggestions */}
      {focused && suggestions.length > 0 && (
        <div ref={listRef} style={{ position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'var(--bg2)',border:'1px solid rgba(255,255,255,.1)',borderRadius:14,zIndex:100,overflow:'hidden',boxShadow:'0 16px 48px rgba(0,0,0,.5)' }}>
          {suggestions.map((d, i) => {
            // Find province
            const prov = NEPAL_DISTRICTS_BY_PROVINCE.find(p => p.districts.includes(d))?.province || '';
            return (
              <div key={d} onMouseDown={() => pick(d)}
                style={{ padding:'10px 16px',cursor:'pointer',background:selIdx===i?'rgba(139,92,246,.1)':i%2===0?'transparent':'rgba(255,255,255,.02)',borderBottom:'1px solid rgba(255,255,255,.04)',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'background .15s' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(139,92,246,.1)'}
                onMouseOut={e=>e.currentTarget.style.background=selIdx===i?'rgba(139,92,246,.1)':i%2===0?'transparent':'rgba(255,255,255,.02)'}>
                <span style={{ fontSize:13,fontWeight:600,color:'var(--w)' }}>📍 {d}</span>
                <span style={{ fontSize:10,color:'var(--w4)',fontWeight:500,maxWidth:160,textAlign:'right' }}>{prov.split('(')[0].trim()}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Show all 77 on focus if empty */}
      {focused && !query.trim() && (
        <div style={{ position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'var(--bg2)',border:'1px solid rgba(255,255,255,.1)',borderRadius:14,zIndex:100,maxHeight:280,overflowY:'auto',boxShadow:'0 16px 48px rgba(0,0,0,.5)' }}>
          <div style={{ padding:'10px 16px',fontSize:10,fontWeight:800,letterSpacing:'.16em',textTransform:'uppercase',color:'var(--w4)',borderBottom:'1px solid rgba(255,255,255,.05)',position:'sticky',top:0,background:'var(--bg2)' }}>
            All 77 Districts of Nepal
          </div>
          {NEPAL_DISTRICTS_BY_PROVINCE.map(prov => (
            <div key={prov.province}>
              <div style={{ padding:'8px 14px 4px',fontSize:9.5,fontWeight:800,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--pink)',background:'rgba(139,92,246,.04)' }}>
                {prov.province}
              </div>
              {prov.districts.map(d => (
                <div key={d} onMouseDown={() => pick(d)}
                  style={{ padding:'8px 16px',cursor:'pointer',fontSize:13,color:'var(--w2)',borderBottom:'1px solid rgba(255,255,255,.03)',display:'flex',alignItems:'center',gap:6 }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(139,92,246,.08)'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{ color:'var(--w4)',fontSize:10 }}>📍</span> {d}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const { data: session, status } = useSession();
  const [form, setForm]   = useState({ title:'', description:'', type:'', district:'', location:'', isAnonymous:false });
  const [step, setStep]   = useState(1); // 1=type, 2=details, 3=done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim())       { setError('Report title is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (form.description.trim().length < 20) { setError('Description must be at least 20 characters'); return; }
    if (!form.district)           { setError('Please enter a valid Nepal district'); return; }
    if (!isValidDistrict(form.district)) { setError(`"${form.district}" is not a valid Nepal district`); return; }

    setLoading(true); setError('');
    try {
      const res = await fetch('/api/reports', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { setSubmitted(data.report); setStep(3); }
      else setError(data.error || 'Submission failed');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  // Loading auth
  if (status === 'loading') return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)' }}>
      <div style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:18,fontWeight:800,background:'linear-gradient(135deg,var(--red),var(--pink))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>Loading...</div>
    </div>
  );

  // Not logged in — show sign-in wall
  if (!session) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:'0 24px' }}>
      <div style={{ position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden' }}>
        <div style={{ position:'absolute',width:400,height:400,borderRadius:'50%',background:'rgba(255,10,22,.07)',top:-80,right:-80,filter:'blur(80px)' }} />
        <div style={{ position:'absolute',width:300,height:300,borderRadius:'50%',background:'rgba(199,125,255,.06)',bottom:'10%',left:-60,filter:'blur(80px)' }} />
      </div>
      <div style={{ maxWidth:460,width:'100%',textAlign:'center',position:'relative',zIndex:1 }}>
        <div style={{ width:64,height:64,borderRadius:20,background:'linear-gradient(135deg,var(--red),var(--pink))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 20px',boxShadow:'0 8px 32px rgba(255,10,22,.22)' }}>✊</div>
        <h1 style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:'clamp(28px,5vw,40px)',fontWeight:900,letterSpacing:'-.02em',lineHeight:1.05,marginBottom:12 }}>
          Sign in to<br /><span style={{ background:'linear-gradient(135deg,var(--red),var(--pink))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>Report an Issue</span>
        </h1>
        <p style={{ fontFamily:'var(--font-playfair,serif)',fontStyle:'italic',fontSize:15,color:'var(--w3)',lineHeight:1.7,marginBottom:28 }}>
          Your identity is protected. Your report reaches journalists and authorities directly. But you need an account to submit.
        </p>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          <Link href="/login?from=report" style={{ padding:'15px',background:'linear-gradient(135deg,var(--red),var(--pink))',borderRadius:100,fontFamily:'var(--font-unbounded,sans-serif)',fontSize:13,fontWeight:800,color:'white',textDecoration:'none',boxShadow:'0 4px 20px rgba(255,10,22,.22)',transition:'all .25s' }}>
            Sign In to Report ✊
          </Link>
          <Link href="/register" style={{ padding:'13px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:100,fontSize:13,fontWeight:700,color:'var(--w2)',textDecoration:'none' }}>
            Create Free Account
          </Link>
        </div>
        <div style={{ marginTop:20,display:'flex',justifyContent:'center',gap:16,flexWrap:'wrap' }}>
          {['🔒 Anonymous option','⚡ 24h review','📍 Location tracked','🗞 Reaches journalists'].map(t=>(
            <span key={t} style={{ fontSize:11,fontWeight:600,color:'var(--w4)' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // Success screen
  if (step === 3 && submitted) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:'0 24px' }}>
      <div style={{ maxWidth:480,width:'100%',textAlign:'center' }}>
        <div style={{ width:72,height:72,borderRadius:'50%',background:'rgba(0,230,118,.12)',border:'2px solid rgba(0,230,118,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 20px' }}>✅</div>
        <h1 style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:32,fontWeight:900,letterSpacing:'-.02em',marginBottom:10,color:'var(--green)' }}>Report Submitted!</h1>
        <p style={{ fontFamily:'var(--font-playfair,serif)',fontStyle:'italic',fontSize:15,color:'var(--w3)',lineHeight:1.7,marginBottom:24 }}>
          Your report has been received. Our team will review it within 24 hours. You can track its status in your profile.
        </p>
        <div style={{ background:'var(--bg2)',border:'1px solid rgba(0,230,118,.15)',borderRadius:16,padding:'16px 20px',marginBottom:24,textAlign:'left' }}>
          <div style={{ fontSize:10,fontWeight:800,letterSpacing:'.16em',textTransform:'uppercase',color:'var(--green)',marginBottom:8 }}>Report Summary</div>
          <div style={{ fontSize:13,fontWeight:700,color:'var(--w)',marginBottom:4 }}>{submitted.title}</div>
          <div style={{ fontSize:12,color:'var(--w4)' }}>📍 {submitted.district} · {submitted.type} · {form.isAnonymous ? '🔒 Anonymous' : `Submitted as ${session.user.name}`}</div>
        </div>
        <div style={{ display:'flex',gap:10,justifyContent:'center' }}>
          <button onClick={() => { setForm({title:'',description:'',type:'',district:'',location:'',isAnonymous:false}); setStep(1); setSubmitted(null); }}
            style={{ padding:'12px 24px',background:'linear-gradient(135deg,var(--red),var(--pink))',border:'none',borderRadius:100,fontFamily:'var(--font-unbounded,sans-serif)',fontSize:12,fontWeight:800,color:'white',cursor:'pointer' }}>
            Submit Another
          </button>
          <Link href="/" style={{ padding:'12px 24px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:100,fontSize:12,fontWeight:700,color:'var(--w2)',textDecoration:'none' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:'var(--bg)',minHeight:'100vh',paddingTop:88,position:'relative' }}>
      {/* Blobs */}
      <div style={{ position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0 }}>
        <div style={{ position:'absolute',width:500,height:500,borderRadius:'50%',background:'rgba(255,10,22,.07)',top:-80,right:-80,filter:'blur(80px)' }} />
        <div style={{ position:'absolute',width:300,height:300,borderRadius:'50%',background:'rgba(199,125,255,.05)',bottom:'20%',left:-60,filter:'blur(80px)' }} />
      </div>

      <div style={{ maxWidth:760,margin:'0 auto',padding:'40px 24px 80px',position:'relative',zIndex:1 }}>

        {/* Hero */}
        <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,10,22,.12)',borderRadius:24,padding:'36px 40px',marginBottom:28,position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(to right,var(--red),var(--pink))' }} />
          <div style={{ position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',fontFamily:'var(--font-unbounded,sans-serif)',fontSize:130,fontWeight:900,color:'var(--red)',opacity:.04,pointerEvents:'none',lineHeight:1 }}>SPEAK</div>
          <div style={{ fontSize:10,fontWeight:800,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--pink)',marginBottom:10,display:'flex',alignItems:'center',gap:8 }}>
            <span style={{ width:16,height:2,background:'linear-gradient(to right,var(--red),var(--pink))',display:'inline-block' }} />
            Submit a Report
          </div>
          <h1 style={{ fontFamily:'var(--font-unbounded,sans-serif)',fontSize:'clamp(28px,5vw,42px)',fontWeight:900,letterSpacing:'-.02em',marginBottom:10,lineHeight:1.05 }}>
            Report an Issue ✊
          </h1>
          <p style={{ fontFamily:'var(--font-playfair,serif)',fontStyle:'italic',fontSize:14,color:'var(--w3)',lineHeight:1.7,marginBottom:16,maxWidth:500,position:'relative' }}>
            Every credible report is investigated and escalated to relevant authorities. Your identity is fully protected.
          </p>
          <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
            <div style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(0,230,118,.08)',border:'1px solid rgba(0,230,118,.2)',borderRadius:100,padding:'5px 12px',fontSize:11,fontWeight:700,color:'var(--green)' }}>
              ● Signed in as {session.user.name}
            </div>
            <span style={{ fontSize:11,color:'var(--w4)' }}>({session.user.role?.replace('_',' ')})</span>
          </div>
        </div>

        <form onSubmit={submit}>
          {/* Step 1 — Issue Type */}
          <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.06)',borderRadius:20,padding:'24px',marginBottom:12 }}>
            <div style={{ fontSize:10,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--pink)',marginBottom:4,display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ width:12,height:2,background:'var(--grad1)',display:'inline-block' }} /> Step 1
            </div>
            <div style={{ fontSize:15,fontWeight:700,color:'var(--w)',marginBottom:16 }}>What type of issue are you reporting? <span style={{ color:'var(--red)' }}>*</span></div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:8 }}>
              {TYPES.map(t => (
                <div key={t.key} onClick={() => set('type', t.key)}
                  style={{ padding:'14px',borderRadius:14,border:`1.5px solid ${form.type===t.key?'var(--pink)':'rgba(255,255,255,.07)'}`,background:form.type===t.key?'rgba(139,92,246,.08)':'var(--bg3)',cursor:'pointer',transition:'all .18s' }}
                  onMouseOver={e=>{ if(form.type!==t.key){ e.currentTarget.style.borderColor='rgba(139,92,246,.3)'; } }}
                  onMouseOut={e=>{ if(form.type!==t.key){ e.currentTarget.style.borderColor='rgba(255,255,255,.07)'; } }}>
                  <div style={{ fontSize:22,marginBottom:6 }}>{t.icon}</div>
                  <div style={{ fontSize:11,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:form.type===t.key?'var(--pink)':'var(--w3)',marginBottom:3 }}>{t.key}</div>
                  <div style={{ fontSize:10,color:'var(--w4)',lineHeight:1.4 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 — Details */}
          <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.06)',borderRadius:20,padding:'24px',marginBottom:12 }}>
            <div style={{ fontSize:10,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--pink)',marginBottom:4,display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ width:12,height:2,background:'var(--grad1)',display:'inline-block' }} /> Step 2
            </div>
            <div style={{ fontSize:15,fontWeight:700,color:'var(--w)',marginBottom:20 }}>Describe the issue</div>

            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block',fontSize:10,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--w3)',marginBottom:8 }}>
                Issue Title <span style={{ color:'var(--red)' }}>*</span>
              </label>
              <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Broken streetlights on Baneshwor Main Road"
                style={{ width:'100%',padding:'12px 14px',background:'var(--bg3)',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,color:'var(--w)',fontSize:14,outline:'none',fontFamily:'var(--font-outfit,sans-serif)',transition:'border-color .2s' }}
                onFocus={e=>e.target.style.borderColor='var(--pink)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.08)'} />
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block',fontSize:10,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--w3)',marginBottom:8 }}>
                Full Description <span style={{ color:'var(--red)' }}>*</span>
                <span style={{ fontSize:10,fontWeight:600,color:'var(--w4)',marginLeft:6,textTransform:'none',letterSpacing:'normal' }}>
                  (min 20 characters — {form.description.length} typed)
                </span>
              </label>
              <textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={5}
                placeholder="Describe what you witnessed, when it happened, who is involved, and any evidence you have. More detail = faster investigation."
                style={{ width:'100%',padding:'12px 14px',background:'var(--bg3)',border:`1px solid ${form.description.length>0&&form.description.length<20?'var(--red)':'rgba(255,255,255,.08)'}`,borderRadius:12,color:'var(--w)',fontSize:13,outline:'none',resize:'vertical',lineHeight:1.65,fontFamily:'var(--font-outfit,sans-serif)',transition:'border-color .2s' }}
                onFocus={e=>e.target.style.borderColor='var(--pink)'} onBlur={e=>e.target.style.borderColor=form.description.length<20&&form.description.length>0?'var(--red)':'rgba(255,255,255,.08)'} />
              {form.description.length > 0 && form.description.length < 20 && (
                <div style={{ fontSize:11,color:'var(--red)',marginTop:4,fontWeight:600 }}>⚠ {20-form.description.length} more characters needed</div>
              )}
            </div>
          </div>

          {/* Step 3 — Location */}
          <div style={{ background:'var(--bg2)',border:'1px solid rgba(255,255,255,.06)',borderRadius:20,padding:'24px',marginBottom:12 }}>
            <div style={{ fontSize:10,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--pink)',marginBottom:4,display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ width:12,height:2,background:'var(--grad1)',display:'inline-block' }} /> Step 3
            </div>
            <div style={{ fontSize:15,fontWeight:700,color:'var(--w)',marginBottom:20 }}>Where did this happen?</div>

            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block',fontSize:10,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--w3)',marginBottom:8 }}>
                District <span style={{ color:'var(--red)' }}>*</span>
                <span style={{ fontSize:10,fontWeight:600,color:'var(--w4)',marginLeft:6,textTransform:'none',letterSpacing:'normal' }}>
                  — must be one of Nepal's 77 official districts
                </span>
              </label>
              <DistrictInput value={form.district} onChange={v => set('district', v)} />

              {/* Province reference */}
              {form.district && isValidDistrict(form.district) && (
                <div style={{ marginTop:8,fontSize:11,color:'var(--cyan)',fontWeight:600 }}>
                  📍 {NEPAL_DISTRICTS_BY_PROVINCE.find(p => p.districts.map(d=>d.toLowerCase()).includes(form.district.toLowerCase()))?.province}
                </div>
              )}
            </div>

            <div>
              <label style={{ display:'block',fontSize:10,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--w3)',marginBottom:8 }}>
                Specific Location <span style={{ fontSize:10,fontWeight:600,color:'var(--w4)',textTransform:'none',letterSpacing:'normal' }}>(optional — ward, street, landmark)</span>
              </label>
              <input value={form.location} onChange={e=>set('location',e.target.value)} placeholder="e.g. Ward 10, near Baneshwor Chowk"
                style={{ width:'100%',padding:'12px 14px',background:'var(--bg3)',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,color:'var(--w)',fontSize:14,outline:'none',fontFamily:'var(--font-outfit,sans-serif)',transition:'border-color .2s' }}
                onFocus={e=>e.target.style.borderColor='var(--pink)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.08)'} />
            </div>
          </div>

          {/* Step 4 — Anonymous option */}
          <div style={{ background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.06)',borderRadius:16,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'flex-start',gap:12 }}>
            <div style={{ marginTop:1 }}>
              <input type="checkbox" id="anon" checked={form.isAnonymous} onChange={e=>set('isAnonymous',e.target.checked)}
                style={{ width:16,height:16,accentColor:'var(--pink)',cursor:'pointer' }} />
            </div>
            <label htmlFor="anon" style={{ cursor:'pointer',flex:1 }}>
              <div style={{ fontSize:13,fontWeight:700,color:'var(--w)',marginBottom:3 }}>🔒 Submit anonymously</div>
              <div style={{ fontSize:12,color:'var(--w4)',lineHeight:1.55 }}>
                Your name will be hidden from the public report. Only super admins can see who submitted — your identity is never shared without your consent.
              </div>
            </label>
          </div>

          {error && (
            <div style={{ background:'rgba(255,10,22,.08)',border:'1px solid rgba(255,10,22,.2)',borderRadius:12,padding:'12px 16px',fontSize:13,color:'var(--red)',fontWeight:600,marginBottom:18 }}>
              ⚠ {error}
            </div>
          )}

          <button type="submit" disabled={loading || !form.type || !form.title || !form.description || !form.district}
            style={{ width:'100%',padding:'16px',background:'linear-gradient(135deg,var(--red),var(--pink))',border:'none',borderRadius:100,fontFamily:'var(--font-unbounded,sans-serif)',fontSize:15,fontWeight:800,color:'white',cursor:'pointer',boxShadow:'0 8px 32px rgba(255,10,22,.22)',opacity: loading||!form.type||!form.title||!form.description||!form.district ? .5 : 1,transition:'all .25s' }}>
            {loading ? 'Submitting...' : 'Submit Report ✊'}
          </button>

          <div style={{ marginTop:12,textAlign:'center',fontSize:11,color:'var(--w4)' }}>
            Reports are reviewed by our editorial team. False reports may result in account suspension.
          </div>
        </form>
      </div>
    </div>
  );
}

