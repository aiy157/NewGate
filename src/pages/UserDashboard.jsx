import React, { useState, useEffect } from 'react';
import { Menu, X, Search, ExternalLink, Globe } from 'lucide-react';
import { supabase } from '../supabaseClient';

// ── Social Icons ──────────────────────────────────────────────────────────────
const FbIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const IgIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const TtIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
  </svg>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
const COLORS = [
  'from-blue-500 to-blue-700', 'from-violet-500 to-violet-700',
  'from-pink-500 to-rose-600', 'from-amber-400 to-orange-500',
  'from-emerald-500 to-teal-600', 'from-red-500 to-rose-700',
  'from-cyan-500 to-blue-600', 'from-indigo-500 to-purple-600',
];
function pickColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}
function Avatar({ title = '', logoUrl, websiteUrl }) {
  const [err, setErr] = useState(false);
  const grad = pickColor(title);
  let fav = null;
  try { fav = `https://www.google.com/s2/favicons?sz=64&domain=${new URL(websiteUrl).hostname}`; } catch {}
  const src = logoUrl || fav;
  if (src && !err) {
    return (
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
        <img src={src} alt={title} className="w-9 h-9 object-contain" onError={() => setErr(true)} />
      </div>
    );
  }
  return (
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 text-white text-xl font-bold shadow-sm select-none`}>
      {title[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex gap-4 mb-4">
        <div className="skeleton-box w-14 h-14 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="skeleton-box h-4 w-3/4" />
          <div className="skeleton-box h-3 w-1/3 rounded-full" />
        </div>
      </div>
      <div className="skeleton-box h-3 w-full mb-2" />
      <div className="skeleton-box h-3 w-4/5 mb-5" />
      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
        <div className="flex gap-2">
          <div className="skeleton-box w-8 h-8 rounded-full" />
          <div className="skeleton-box w-8 h-8 rounded-full" />
        </div>
        <div className="skeleton-box h-7 w-20 rounded-full" />
      </div>
    </div>
  );
}

// ── Link Card ─────────────────────────────────────────────────────────────────
function Card({ link, idx }) {
  const socials = [
    link.facebook_url  && { key: 'fb', href: link.facebook_url,  label: 'Facebook',  Icon: FbIcon, cls: 'text-[#1877F2] bg-blue-50   hover:bg-blue-100'  },
    link.instagram_url && { key: 'ig', href: link.instagram_url, label: 'Instagram', Icon: IgIcon, cls: 'text-[#E1306C] bg-pink-50   hover:bg-pink-100'  },
    link.tiktok_url    && { key: 'tt', href: link.tiktok_url,    label: 'TikTok',    Icon: TtIcon, cls: 'text-slate-800 bg-slate-100 hover:bg-slate-200' },
  ].filter(Boolean);

  return (
    <article
      className="link-card card-in relative bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden"
      style={{ animationDelay: `${Math.min(idx * 0.06, 0.42)}s` }}
    >
      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar title={link.title} logoUrl={link.logo_url} websiteUrl={link.url} />
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-bold text-slate-900 text-[15px] leading-snug line-clamp-2">
              {link.title}
            </h3>
            {link.categories?.name && (
              <span className="inline-block mt-2 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                {link.categories.name}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 flex-1">
          {link.description || 'คลิกเพื่อเข้าสู่เว็บไซต์หน่วยงานนี้'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50 gap-2">
          <div className="flex gap-2">
            {socials.map(({ key, href, label, Icon, cls }) => (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                title={label} onClick={e => e.stopPropagation()}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 ${cls}`}
              >
                <span className="w-3.5 h-3.5 block"><Icon /></span>
              </a>
            ))}
            {socials.length === 0 && <span className="text-xs text-slate-300">—</span>}
          </div>
          <a href={link.url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-700 hover:text-white border border-blue-100 hover:border-blue-700 px-3.5 py-2 rounded-full transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            เปิดเว็บไซต์ <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </article>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const [categories, setCategories]       = useState([]);
  const [links, setLinks]                 = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [query, setQuery]                 = useState('');
  const [loading, setLoading]             = useState(true);
  const [drawerOpen, setDrawerOpen]       = useState(false);

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [c, l] = await Promise.all([
      supabase.from('categories').select('*').order('order_index'),
      supabase.from('links').select('*, categories(name)').order('created_at', { ascending: false }),
    ]);
    if (!c.error) setCategories(c.data ?? []);
    if (!l.error) setLinks(l.data ?? []);
    setLoading(false);
  };

  const filtered = links.filter(l => {
    const cat = !selectedCatId || l.category_id === selectedCatId;
    const q = query.toLowerCase().trim();
    const txt = !q || l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q);
    return cat && txt;
  });

  const activeCat = categories.find(c => c.id === selectedCatId);

  const selectCat = id => {
    setSelectedCatId(p => p === id ? null : id);
    setDrawerOpen(false);
    setQuery('');
  };

  // ── Sidebar Nav Item ──────────────────────────────────────────────────────
  const NavItem = ({ id, name, count }) => {
    const active = selectedCatId === id;
    return (
      <button
        onClick={() => selectCat(id)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left group ${
          active
            ? 'bg-blue-700 text-white shadow-lg shadow-blue-700/30'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <span className="truncate">{name}</span>
        <span className={`flex-shrink-0 text-[11px] font-bold ml-2 px-2 py-0.5 rounded-full ${
          active ? 'bg-white/20 text-blue-100' : 'bg-slate-200 text-slate-500'
        }`}>{count}</span>
      </button>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* ══════════════════════ NAVBAR ════════════════════════════════════ */}
      <header className="sticky top-0 z-40 shadow-xl" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
      }}>
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 h-16 flex items-center gap-4">

          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white/80 hover:bg-white/10 transition-all active:scale-95"
            onClick={() => setDrawerOpen(v => !v)}
            aria-label="เมนู"
          >
            <Menu size={22} />
          </button>

          {/* Brand */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Globe size={18} className="text-blue-200" />
            </div>
            <div>
              <div className="text-white font-bold text-[15px] leading-none">UBU Student Portal</div>
              <div className="text-blue-300 text-[11px] mt-0.5">มหาวิทยาลัยอุบลราชธานี</div>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-auto hidden sm:block">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" />
              <input
                type="search" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="ค้นหาชื่อเว็บไซต์หรือหน่วยงาน..."
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-blue-300 focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}
                onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.18)'; e.target.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Clear filter */}
          {(selectedCatId || query) && (
            <button
              onClick={() => { setSelectedCatId(null); setQuery(''); }}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold rounded-full px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-blue-950 transition-all active:scale-95"
            >
              <X size={11} /> ล้างตัวกรอง
            </button>
          )}

          <span className="hidden lg:block ml-auto text-blue-300 text-xs flex-shrink-0">
            {loading ? '...' : `${links.length} รายการ`}
          </span>
        </div>

        {/* Mobile search bar */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" />
            <input
              type="search" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="ค้นหาเว็บไซต์..."
              className="w-full rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-blue-300 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}
            />
          </div>
        </div>
      </header>

      {/* ══════════════════════ MOBILE DRAWER ════════════════════════════ */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="relative z-10 w-72 flex flex-col shadow-2xl" style={{
            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            animation: 'slideInLeft 0.28s cubic-bezier(0.22,1,0.36,1)',
          }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <p className="text-white font-bold text-sm">หมวดหมู่</p>
              <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <button onClick={() => selectCat(null)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  !selectedCatId ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}>
                <span>ทั้งหมด</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${!selectedCatId ? 'bg-white/20 text-blue-100' : 'bg-white/10 text-slate-500'}`}>{links.length}</span>
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => selectCat(cat.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    selectedCatId === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}>
                  <span className="truncate">{cat.name}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ml-2 flex-shrink-0 ${selectedCatId === cat.id ? 'bg-white/20 text-blue-100' : 'bg-white/10 text-slate-500'}`}>
                    {links.filter(l => l.category_id === cat.id).length}
                  </span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ══════════════════════ BODY ══════════════════════════════════════ */}
      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-r border-slate-200 bg-white py-5 px-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">หมวดหมู่</p>
          <nav className="space-y-0.5">
            <NavItem id={null} name="ทั้งหมด" count={links.length} />
            {categories.map(cat => (
              <NavItem key={cat.id} id={cat.id} name={cat.name}
                count={links.filter(l => l.category_id === cat.id).length} />
            ))}
          </nav>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 lg:py-8">

          {/* Mobile category chips */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
            {[{ id: null, name: 'ทั้งหมด', cnt: links.length }, ...categories.map(c => ({ id: c.id, name: c.name, cnt: links.filter(l => l.category_id === c.id).length }))].map(c => (
              <button key={c.id ?? 'all'} onClick={() => selectCat(c.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                  selectedCatId === c.id
                    ? 'bg-blue-700 text-white border-blue-700 shadow-md shadow-blue-700/25'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}>
                {c.name} <span className="opacity-60">{c.cnt}</span>
              </button>
            ))}
          </div>

          {/* Page title */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {activeCat?.name ?? (query ? 'ผลการค้นหา' : 'เว็บไซต์ทั้งหมด')}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {loading ? 'กำลังโหลด...' : `${filtered.length} รายการ${query ? ` · "${query}"` : ''}`}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
              : filtered.length === 0
                ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
                      <Globe size={36} className="text-slate-300" />
                    </div>
                    <p className="font-semibold text-slate-400">{query ? `ไม่พบ "${query}"` : 'ยังไม่มีข้อมูล'}</p>
                  </div>
                )
                : filtered.map((link, i) => <Card key={link.id} link={link} idx={i} />)
            }
          </div>
        </main>
      </div>

      {/* ══════════════════════ FOOTER ════════════════════════════════════ */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} มหาวิทยาลัยอุบลราชธานี · UBU Student Portal
      </footer>
    </div>
  );
}