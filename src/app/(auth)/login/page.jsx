// src/app/(auth)/login/page.jsx
'use client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('credentials', { ...form, redirect: false });
    if (res?.ok) router.push('/');
    else setError('Invalid email or password');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: 88 }}>
      {/* Left */}
      <div style={{ background: 'var(--bg2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 25% 65%,rgba(255,10,22,.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: -20, bottom: -20, fontFamily: 'var(--font-unbounded)', fontSize: 200, fontWeight: 900, color: 'var(--red)', opacity: .03, lineHeight: 1, pointerEvents: 'none' }}>BD</div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(52px,8vw,80px)', fontWeight: 900, lineHeight: .9, letterSpacing: '-.02em', marginBottom: 20 }}>
            BOLNA<br /><span className="gt">DEY</span>
          </div>
          <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 16, color: 'var(--w3)', lineHeight: 1.7 }}>"Let the People Speak." Nepal's platform for civic accountability and investigative journalism.</p>
          <div style={{ display: 'flex', gap: 28, marginTop: 32 }}>
            {[['12.4K', 'Members'], ['847', 'Articles'], ['318', 'Reports']].map(([n, l]) => (
              <div key={l}><div className="gt" style={{ fontFamily: 'var(--font-unbounded)', fontSize: 32, fontWeight: 900 }}>{n}</div><div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--w4)', marginTop: 3 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>
      {/* Right */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 64px' }}>
        <div style={{ maxWidth: 380 }}>
          <h1 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 36, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 6 }}>Welcome back 👋</h1>
          <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 15, color: 'var(--w3)', marginBottom: 36 }}>Sign in to your account</p>
          {error && <div style={{ background: 'rgba(255,10,22,.06)', border: '1px solid rgba(255,10,22,.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--red)' }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--w3)', display: 'block', marginBottom: 9 }}>Email Address</label>
              <input className="form-input" style={{ borderRadius: 100 }} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" autoFocus />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--w3)', display: 'block', marginBottom: 9 }}>Password</label>
              <input className="form-input" style={{ borderRadius: 100 }} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 24 }}><span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pink)', cursor: 'pointer', letterSpacing: '.06em', textTransform: 'uppercase' }}>Forgot Password?</span></div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, background: loading ? 'var(--bg5)' : 'linear-gradient(135deg,#FF0A16,#FF4D88)', border: 'none', borderRadius: 100, fontFamily: 'var(--font-unbounded)', fontSize: 16, fontWeight: 800, color: 'white', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .3s', boxShadow: '0 8px 32px rgba(255,10,22,.22)', letterSpacing: '.08em' }}>
              {loading ? 'SIGNING IN...' : 'SIGN IN →'}
            </button>
          </form>
          <div style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'var(--w4)' }}>No account? <Link href="/register" style={{ color: 'var(--pink)', fontWeight: 700, textDecoration: 'none' }}>Create one free →</Link></div>
        </div>
      </div>
    </div>
  );
}
