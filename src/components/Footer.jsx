// src/components/Footer.jsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg2)', borderTop: '1px solid rgba(255,255,255,.05)', padding: '72px 28px 40px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 56, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#FF0A16,#FF4D88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-unbounded)', fontSize: 16, fontWeight: 900, color: 'white' }}>B</span>
              </div>
              <span style={{ fontFamily: 'var(--font-unbounded)', fontSize: 18, fontWeight: 800, background: 'var(--grad1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>BOLNA DEY</span>
            </div>
            <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 14, color: 'var(--w3)', marginBottom: 12, lineHeight: 1.6 }}>"Let the People Speak."</p>
            <p style={{ fontSize: 13, color: 'var(--w4)', lineHeight: 1.75 }}>Nepal's independent civic-tech and media platform. We exist to empower citizens with information, accountability tools, and a space to demand better governance.</p>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--w3)', marginBottom: 18 }}>Platform</div>
            {[['/', 'Home'], ['/tracker', 'Gov Tracker'], ['/news', 'News & Articles'], ['/report', 'Report Issue'], ['/dashboard', 'Admin Panel']].map(([href, label]) => (
              <Link key={href} href={href} style={{ display: 'block', fontSize: 13, color: 'var(--w4)', textDecoration: 'none', marginBottom: 10, transition: 'color .2s' }}>{label}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--w3)', marginBottom: 18 }}>Topics</div>
            {['Politics', 'Governance', 'Local Issues', 'Investigations', 'Opinion', 'Environment'].map((t) => (
              <Link key={t} href={`/news?category=${t}`} style={{ display: 'block', fontSize: 13, color: 'var(--w4)', textDecoration: 'none', marginBottom: 10 }}>{t}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--w3)', marginBottom: 18 }}>Connect</div>
            {['Twitter / X', 'Facebook', 'Telegram', 'About Us', 'Contact'].map((t) => (
              <span key={t} style={{ display: 'block', fontSize: 13, color: 'var(--w4)', marginBottom: 10, cursor: 'pointer', transition: 'color .2s' }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--w4)' }}>© 2025 Bolna Dey. Independent. Fearless. <span style={{ color: 'var(--pink)' }}>Free.</span></div>
          <div style={{ fontSize: 12, color: 'var(--w4)' }}>Built for Nepal's democracy 🇳🇵</div>
        </div>
      </div>
    </footer>
  );
}
