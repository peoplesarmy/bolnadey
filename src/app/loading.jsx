// src/app/loading.jsx
export default function Loading() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 88 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 32, fontWeight: 900, background: 'var(--grad1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12 }}>
          BOLNA DEY
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pink)', animation: 'pulseAnim 1.2s ease-in-out infinite', animationDelay: `${i * .2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
