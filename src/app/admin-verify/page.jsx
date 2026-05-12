'use client';
// src/app/admin-verify/page.jsx — 2nd factor for admin panel
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminVerifyPage() {
  const { data: session, update } = useSession({ required: true });
  const router = useRouter();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputs = useRef([]);

  useEffect(() => {
    if (session?.user?.adminVerified) router.replace('/dashboard');
  }, [session]);

  function handleChange(i, val) {
    if (!/^\d?$/.test(val)) return;
    const next = [...pin];
    next[i] = val;
    setPin(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (next.every(d => d !== '')) handleSubmit(next.join(''));
  }

  function handleKey(i, e) {
    if (e.key === 'Backspace' && !pin[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  async function handleSubmit(code) {
    if (attempts >= 5) { setError('Too many attempts. Please sign out and try again.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await update({ adminVerified: true });
        router.replace('/dashboard');
      } else {
        setAttempts(a => a + 1);
        setError(data.error || 'Incorrect PIN. Try again.');
        setPin(['', '', '', '', '', '']);
        setTimeout(() => inputs.current[0]?.focus(), 100);
      }
    } catch { setError('Network error. Try again.'); }
    finally { setLoading(false); }
  }

  const role = session?.user?.role;
  const roleLabel = role === 'super_admin' ? 'Super Admin' : 'Senior Editor';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,10,22,.07)', top: -80, right: -80, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(199,125,255,.06)', bottom: '10%', left: -60, filter: 'blur(80px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Card */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 24, padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to right,var(--red),var(--pink))' }} />

          {/* Icon */}
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,var(--red),var(--pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20, boxShadow: '0 8px 32px rgba(255,10,22,.22)' }}>
            🔐
          </div>

          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 8 }}>
            Admin Panel — 2nd Factor
          </div>
          <h1 style={{ fontFamily: 'var(--font-unbounded, sans-serif)', fontSize: 26, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 8 }}>
            Enter your PIN
          </h1>
          <p style={{ fontSize: 13, color: 'var(--w3)', lineHeight: 1.6, marginBottom: 28 }}>
            Signed in as <strong style={{ color: 'var(--w)' }}>{session?.user?.name}</strong>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8, background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.2)', color: 'var(--pink)', fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100 }}>
              {roleLabel}
            </span>
            <br />Enter your 6-digit admin PIN to access the dashboard.
          </p>

          {/* PIN inputs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
            {pin.map((d, i) => (
              <input key={i} ref={el => inputs.current[i] = el}
                type="password" inputMode="numeric" maxLength={1} value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                style={{ width: 48, height: 56, textAlign: 'center', fontSize: 20, fontWeight: 700, background: 'var(--bg3)', border: `1.5px solid ${d ? 'var(--pink)' : 'rgba(255,255,255,.1)'}`, borderRadius: 12, color: 'var(--w)', outline: 'none', transition: 'border-color .2s', fontFamily: 'monospace' }}
              />
            ))}
          </div>

          {error && (
            <div style={{ background: 'rgba(255,10,22,.08)', border: '1px solid rgba(255,10,22,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16, textAlign: 'center' }}>
              ⚠ {error}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--w3)', marginBottom: 16 }}>
              Verifying...
            </div>
          )}

          {attempts >= 3 && attempts < 5 && (
            <div style={{ background: 'rgba(255,109,0,.08)', border: '1px solid rgba(255,109,0,.2)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'var(--orange)', marginBottom: 12, textAlign: 'center' }}>
              ⚠ {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining before lockout
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 16, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--w4)' }}>Forgot PIN?</span>
            <button onClick={() => { window.location.href = '/api/auth/signout'; }}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.08)', borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: 'var(--w3)', cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--w4)', lineHeight: 1.6 }}>
          🔒 This extra step protects the admin panel.<br />
          After verification, you stay logged in for this session.
        </div>
      </div>
    </div>
  );
}

