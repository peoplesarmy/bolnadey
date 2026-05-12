// src/app/(auth)/register/page.jsx
'use client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const ROLES = [{ emoji: '📰', label: 'Reader', val: 'user' }, { emoji: '✍️', label: 'Writer', val: 'editor' }, { emoji: '🔎', label: 'Reporter', val: 'user' }];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      router.push('/');
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: 88 }}>
      <div style={{ background: 'var(--bg2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 75% 35%,rgba(199,125,255,.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: -20, bottom: -20, fontFamily: 'var(--font-unbounded)', fontSize: 200, fontWeight: 900, color: 'var(--purple)', opacity: .03, lineHeight: 1, pointerEvents: 'none' }}>JOIN</div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(52px,8vw,80px)', fontWeight: 900, lineHeight: .9, letterSpacing: '-.02em', marginBottom: 20 }}>
            JOIN<br />THE<br /><span className="gt2">VOICE</span>
          </div>
          <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 16, color: 'var(--w3)', lineHeight: 1.7 }}>Become part of Nepal's largest civic accountability platform. Write, report, track, and demand change.</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 64px' }}>
        <div style={{ maxWidth: 400 }}>
          <h1 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 36, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 6 }}>Create Account ✦</h1>
          <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 15, color: 'var(--w3)', marginBottom: 28 }}>Free, independent, and yours</p>
          {error && <div style={{ background: 'rgba(255,10,22,.06)', border: '1px solid rgba(255,10,22,.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--red)' }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--w3)', display: 'block', marginBottom: 10 }}>Join As</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {ROLES.map(r => (
                  <div key={r.label} onClick={() => setForm(f => ({ ...f, role: r.val }))} style={{ padding: '14px 8px', border: `1px solid ${form.role === r.val && r.label !== 'Writer' || (r.label === 'Writer' && form.role === 'editor') ? 'rgba(255,10,22,.25)' : 'rgba(255,255,255,.06)'}`, background: form.role === r.val || (r.label === 'Writer' && form.role === 'editor') ? 'rgba(255,10,22,.06)' : 'var(--bg3)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', transition: 'all .18s' }}>
                    <div style={{ fontSize: 22, marginBottom: 5 }}>{r.emoji}</div>
                    <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--w3)' }}>{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--w3)', display: 'block', marginBottom: 9 }}>Full Name</label>
              <input className="form-input" style={{ borderRadius: 100 }} type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Priya Sharma" autoFocus />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--w3)', display: 'block', marginBottom: 9 }}>Email Address</label>
              <input className="form-input" style={{ borderRadius: 100 }} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--w3)', display: 'block', marginBottom: 9 }}>Password</label>
              <input className="form-input" style={{ borderRadius: 100 }} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, background: loading ? 'var(--bg5)' : 'linear-gradient(135deg,#FF0A16,#8B5CF6)', border: 'none', borderRadius: 100, fontFamily: 'var(--font-unbounded)', fontSize: 16, fontWeight: 800, color: 'white', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .3s', boxShadow: '0 8px 32px rgba(255,10,22,.22)', letterSpacing: '.08em' }}>
              {loading ? 'CREATING...' : 'CREATE ACCOUNT ✦'}
            </button>
          </form>
          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--w4)' }}>Already a member? <Link href="/login" style={{ color: 'var(--pink)', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link></div>
        </div>
      </div>
    </div>
  );
}

