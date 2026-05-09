'use client';
// src/app/news/new/page.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const CATEGORIES = ['Politics', 'Governance', 'Investigation', 'Local Issues', 'Environment', 'Education', 'Health', 'Economy', 'Opinion'];

export default function NewArticlePage() {
  const { data: session, status } = useSession({ required: true });
  const router = useRouter();
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', category: 'Governance', tags: '', coverImage: '', status: 'draft', featured: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (status === 'loading') return <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--w3)' }}>Loading...</div>;

  async function submit(articleStatus) {
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required'); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: articleStatus, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }) });
      const d = await res.json();
      if (res.ok) router.push(`/news/${d.article.slug}`);
      else setError(d.error || 'Failed to publish');
    } catch { setError('Network error'); } finally { setSaving(false); }
  }

  const F = ({ label, children }) => (
    <div style={{ marginBottom: 22 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--w3)', marginBottom: 9 }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 88 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 2, background: 'linear-gradient(to right,var(--red),var(--pink))', display: 'inline-block' }} />
            Write & Publish
          </div>
          <h1 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, letterSpacing: '-.02em', lineHeight: 1 }}>
            New <span style={{ background: 'var(--grad1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Article ✍️</span>
          </h1>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 24, padding: '36px 40px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to right,var(--red),var(--pink))', borderRadius: '24px 24px 0 0' }} />

          <F label="Article Title *">
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="form-input" placeholder="Make it compelling..." style={{ fontSize: 18, fontWeight: 700 }} />
          </F>

          <F label="Short Excerpt *">
            <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} className="form-input" rows={2} placeholder="A brief summary that draws readers in (shown in cards)" style={{ resize: 'vertical' }} />
          </F>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
            <F label="Category *">
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="form-input">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </F>
            <F label="Tags (comma-separated)">
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="form-input" placeholder="corruption, kathmandu, roads" />
            </F>
          </div>

          <F label="Cover Image URL">
            <input value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))} className="form-input" placeholder="https://..." type="url" />
          </F>

          <F label="Article Content *">
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="form-input" rows={18} placeholder="Write your full article here. Markdown is supported. Be thorough, be fair, be fearless." style={{ resize: 'vertical', lineHeight: 1.7 }} />
          </F>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '14px 18px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12 }}>
            <input type="checkbox" id="feat" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--pink)' }} />
            <label htmlFor="feat" style={{ fontSize: 13, fontWeight: 600, color: 'var(--w2)', cursor: 'pointer' }}>Feature this article on the homepage</label>
          </div>

          {error && <div style={{ padding: '10px 16px', background: 'rgba(255,10,22,.08)', border: '1px solid rgba(255,10,22,.2)', borderRadius: 10, fontSize: 13, color: 'var(--red)', marginBottom: 18 }}>⚠ {error}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => submit('published')} disabled={saving}
              style={{ padding: '14px 32px', background: 'linear-gradient(135deg,var(--red),var(--pink))', border: 'none', borderRadius: 100, fontFamily: 'var(--font-unbounded)', fontSize: 14, fontWeight: 800, color: 'white', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,10,22,.22)', opacity: saving ? .7 : 1, transition: 'all .25s' }}>
              {saving ? 'Publishing...' : 'Publish Now ↗'}
            </button>
            <button onClick={() => submit('draft')} disabled={saving}
              style={{ padding: '14px 24px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 100, fontSize: 13, fontWeight: 700, color: 'var(--w2)', cursor: 'pointer', opacity: saving ? .7 : 1 }}>
              Save Draft
            </button>
            <button onClick={() => router.back()}
              style={{ padding: '14px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,.06)', borderRadius: 100, fontSize: 13, fontWeight: 700, color: 'var(--w4)', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
