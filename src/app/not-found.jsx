// src/app/not-found.jsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,10,22,.08),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(80px,18vw,160px)', fontWeight: 900, lineHeight: 1, background: 'var(--grad1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12 }}>
          404
        </div>
        <h1 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, letterSpacing: '-.01em', marginBottom: 12 }}>
          This page doesn't exist
        </h1>
        <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 15, color: 'var(--w3)', marginBottom: 32, lineHeight: 1.7 }}>
          But the truth still does. Head back home.
        </p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: 'linear-gradient(135deg,var(--red),var(--pink))', borderRadius: 100, fontFamily: 'var(--font-unbounded)', fontSize: 13, fontWeight: 800, color: 'white', textDecoration: 'none', boxShadow: '0 8px 32px rgba(255,10,22,.22)', transition: 'all .25s' }}>
          Back to Home ↗
        </Link>
      </div>
    </div>
  );
}
