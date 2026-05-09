// src/components/Navbar.jsx
'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const TICKER_ITEMS = [
  'Parliament Budget Debate Underway 🔴',
  'Ring Road Delayed Again — 6 More Months',
  'Supreme Court Hearing on Electoral Reform Today',
  'Melamchi Water Project Corruption Case Intensifies',
  'Teachers Strike Over 15% Education Budget Cut',
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      {/* Ticker */}
      <div style={{ height: 30, background: 'linear-gradient(to right,#FF0A16,#FF4D88,#C77DFF,#00F0FF,#FF0A16)', backgroundSize: '400%', animation: 'shimmer 8s linear infinite', display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, zIndex: 2, background: 'var(--bg)', color: 'var(--pink)', fontFamily: 'var(--font-unbounded)', fontSize: 9, letterSpacing: '.2em', padding: '0 14px', height: '100%', display: 'flex', alignItems: 'center' }}>NOW</div>
        <div style={{ paddingLeft: 80, overflow: 'hidden', flex: 1 }}>
          <div className="animate-ticker" style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, color: 'white', marginRight: 52, letterSpacing: '.04em' }}>◆ {item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div style={{ margin: '8px 20px', background: scrolled ? 'rgba(8,8,15,.96)' : 'rgba(8,8,15,.82)', backdropFilter: 'blur(28px) saturate(1.6)', border: `1px solid ${scrolled ? 'rgba(255,77,136,.15)' : 'rgba(255,255,255,.07)'}`, borderRadius: 100, display: 'flex', alignItems: 'center', height: 52, padding: '0 8px 0 16px', transition: 'all .3s', boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,.5)' : 'none' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 32, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#FF0A16,#FF4D88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-unbounded)', fontSize: 16, fontWeight: 900, color: 'white' }}>B</span>
          </div>
          <span style={{ fontFamily: 'var(--font-unbounded)', fontSize: 14, fontWeight: 800, background: 'linear-gradient(135deg,#FF0A16,#FF4D88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '.06em' }}>BOLNA DEY</span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/tracker', label: 'Gov Tracker' },
            { href: '/news', label: 'News' },
            { href: '/report', label: 'Report Issue' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ padding: '7px 14px', fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 600, color: isActive(href) && href !== '/' ? 'var(--pink)' : pathname === href && href === '/' ? 'var(--pink)' : 'var(--w3)', cursor: 'pointer', borderRadius: 100, transition: 'all .2s', textDecoration: 'none', whiteSpace: 'nowrap' }}>{label}</Link>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {session ? (
            <>
              <Link href="/dashboard" style={{ padding: '7px 14px', fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 600, color: 'var(--w3)', borderRadius: 100, textDecoration: 'none', transition: 'color .2s' }}>Dashboard</Link>
              <Link href={`/profile/${session.user.id}`} style={{ padding: '7px 14px', fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 600, color: 'var(--w3)', borderRadius: 100, textDecoration: 'none' }}>Profile</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} style={{ padding: '8px 18px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 700, color: 'var(--w3)', cursor: 'pointer', transition: 'all .2s' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding: '8px 18px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 700, color: 'var(--w3)', cursor: 'pointer', transition: 'all .2s', textDecoration: 'none' }}>Sign In</Link>
              <Link href="/register" style={{ padding: '8px 20px', background: 'linear-gradient(135deg,#FF0A16,#FF4D88)', border: 'none', borderRadius: 100, fontFamily: 'var(--font-outfit)', fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer', transition: 'all .25s', textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,10,22,.22)' }}>Join Free ✦</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
