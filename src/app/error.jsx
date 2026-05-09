'use client';
// src/app/error.jsx
export default function Error({ error, reset }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
      <div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 28, fontWeight: 900, letterSpacing: '-.01em', marginBottom: 10 }}>Something went wrong</h2>
        <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 14, color: 'var(--w3)', marginBottom: 28 }}>{error?.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} style={{ padding: '12px 28px', background: 'linear-gradient(135deg,var(--red),var(--pink))', border: 'none', borderRadius: 100, fontFamily: 'var(--font-unbounded)', fontSize: 13, fontWeight: 800, color: 'white', cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    </div>
  );
}
