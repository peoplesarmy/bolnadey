'use client';
// src/app/profile/[id]/ProfileClient.jsx
import { useState } from 'react';

export default function ProfileClient({ userId, user }) {
  const [tab, setTab] = useState('settings');
  const [form, setForm] = useState({ name: user.name, email: user.email, bio: user.bio || '', currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function save(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, bio: form.bio, ...(form.newPassword ? { password: form.newPassword } : {}) }) });
      const d = await res.json();
      setMsg(res.ok ? { ok: true, text: 'Profile updated!' } : { ok: false, text: d.error || 'Failed' });
    } catch { setMsg({ ok: false, text: 'Network error' }); } finally { setSaving(false); }
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex' }}>
        {[{ k: 'settings', l: 'Account Settings' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', background: 'transparent', border: 'none', borderBottom: tab === t.k ? '2px solid var(--pink)' : '2px solid transparent', color: tab === t.k ? 'var(--pink)' : 'var(--w4)', cursor: 'pointer', transition: 'all .2s', marginBottom: -1 }}>
            {t.l}
          </button>
        ))}
      </div>

      <form onSubmit={save} style={{ padding: '28px 32px', maxWidth: 480 }}>
        {[{ lbl: 'Display Name', k: 'name', type: 'text' }, { lbl: 'Email', k: 'email', type: 'email' }].map(f => (
          <div key={f.k} style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--w3)', marginBottom: 8 }}>{f.lbl}</label>
            <input type={f.type} value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
              disabled={f.k === 'email'} className="form-input"
              style={{ opacity: f.k === 'email' ? .5 : 1, borderRadius: 12 }} />
          </div>
        ))}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--w3)', marginBottom: 8 }}>Bio</label>
          <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="form-input" rows={3} style={{ borderRadius: 12, resize: 'vertical' }} placeholder="Tell the world who you are..." />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--w3)', marginBottom: 8 }}>New Password <span style={{ opacity: .5 }}>(leave blank to keep)</span></label>
          <input type="password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} className="form-input" placeholder="••••••••" style={{ borderRadius: 12 }} />
        </div>

        {msg && (
          <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16, background: msg.ok ? 'rgba(0,230,118,.08)' : 'rgba(255,10,22,.08)', border: `1px solid ${msg.ok ? 'rgba(0,230,118,.2)' : 'rgba(255,10,22,.2)'}`, color: msg.ok ? 'var(--green)' : 'var(--red)' }}>
            {msg.ok ? '✓ ' : '⚠ '}{msg.text}
          </div>
        )}

        <button type="submit" disabled={saving}
          style={{ padding: '12px 28px', background: 'linear-gradient(135deg,var(--red),var(--pink))', border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', opacity: saving ? .7 : 1, boxShadow: '0 4px 20px rgba(255,10,22,.22)' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
