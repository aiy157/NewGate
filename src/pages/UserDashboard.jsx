import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, ExternalLink, ChevronRight, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';

// ── Brand Colors for Avatar Fallback ─────────────────────────────────────────
const AVATAR_COLORS = [
  ['#3B82F6', '#1D4ED8'], ['#8B5CF6', '#6D28D9'], ['#EC4899', '#BE185D'],
  ['#F59E0B', '#D97706'], ['#10B981', '#047857'], ['#EF4444', '#B91C1C'],
  ['#06B6D4', '#0E7490'], ['#F97316', '#C2410C'],
];

function getAvatarColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Social Icons (SVG) ────────────────────────────────────────────────────────
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
);

// ── Org Avatar ────────────────────────────────────────────────────────────────
function OrgAvatar({ title, logoUrl, websiteUrl, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const [from, to] = getAvatarColor(title);

  let faviconUrl = null;
  try { faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${new URL(websiteUrl).hostname}`; } catch {}

  const src = logoUrl || faviconUrl;
  const sizeClass = size === 'lg' ? 'w-14 h-14 text-2xl' : 'w-11 h-11 text-lg';

  if (src && !imgError) {
    return (
      <div className={`${sizeClass} rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-black/5 bg-gray-50 flex items-center justify-center`}>
        <img
          src={src}
          alt={title}
          className="w-8 h-8 object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-white shadow-sm`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {(title || '?')[0].toUpperCase()}
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl skeleton flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 skeleton rounded-lg w-3/4" />
          <div className="h-3 skeleton rounded-lg w-1/3" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 skeleton rounded-lg w-full" />
        <div className="h-3 skeleton rounded-lg w-4/5" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="h-6 skeleton rounded-full w-20" />
        <div className="flex gap-2">
          <div className="w-7 h-7 skeleton rounded-full" />
          <div className="w-7 h-7 skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Link Card ─────────────────────────────────────────────────────────────────
function LinkCard({ link, index }) {
  const socials = [
    link.facebook_url  && { key: 'fb',  href: link.facebook_url,  label: 'Facebook',  icon: <FacebookIcon />,  color: '#1877F2', bg: '#EFF6FF' },
    link.instagram_url && { key: 'ig',  href: link.instagram_url, label: 'Instagram', icon: <InstagramIcon />, color: '#E1306C', bg: '#FDF2F8' },
    link.tiktok_url    && { key: 'tt',  href: link.tiktok_url,    label: 'TikTok',    icon: <TikTokIcon />,   color: '#010101', bg: '#F8F8F8' },
  ].filter(Boolean);

  return (
    <article
      className="animate-fade-in-up group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] transition-all duration-300 flex flex-col overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 0.06, 0.48)}s` }}
    >
      {/* Top accent bar — appears on hover */}
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <OrgAvatar title={link.title} logoUrl={link.logo_url} websiteUrl={link.url} />
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
              {link.title}
            </h3>
            {link.categories?.name && (
              <span className="inline-block mt-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {link.categories.name}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-4">
          {link.description || 'คลิกเพื่อเข้าสู่เว็บไซต์'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          {/* Social Icons */}
          <div className="flex items-center gap-1.5">
            {socials.length > 0 ? socials.map(s => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                onClick={e => e.stopPropagation()}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
                style={{ color: s.color, backgroundColor: s.bg }}
              >
                <span className="w-3.5 h-3.5 block">{s.icon}</span>
              </a>
            )) : (
              <span className="text-[11px] text-gray-300">—</span>
            )}
          </div>

          {/* Open Link */}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-full transition-all duration-200 active:scale-95"
          >
            เปิดเว็บ <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </article>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ categoryName }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-4">
        <Globe size={36} className="text-gray-200" />
      </div>
      <p className="text-gray-400 font-semibold text-sm">
        {categoryName ? `ยังไม่มีลิงก์ใน "${categoryName}"` : 'ยังไม่มีข้อมูล'}
      </p>
      <p className="text-gray-300 text-xs mt-1">Admin สามารถเพิ่มลิงก์ได้จากหน้าจัดการ</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const [isDrawerOpen, setIsDrawerOpen]       = useState(false);
  const [categories, setCategories]           = useState([]);
  const [links, setLinks]                     = useState([]);
  const [selectedCatId, setSelectedCatId]     = useState(null);
  const [searchQuery, setSearchQuery]         = useState('');
  const [isLoading, setIsLoading]             = useState(true);
  const [scrolled, setScrolled]               = useState(false);
  const searchRef                             = useRef(null);

  // Scroll detection for navbar shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setIsDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [catRes, linkRes] = await Promise.all([
      supabase.from('categories').select('*').order('order_index', { ascending: true }),
      supabase.from('links').select('*, categories(name)').order('created_at', { ascending: false }),
    ]);
    if (!catRes.error)  setCategories(catRes.data  ?? []);
    if (!linkRes.error) setLinks(linkRes.data ?? []);
    setIsLoading(false);
  };

  // Filter logic
  const filteredLinks = links.filter(l => {
    const matchCat    = !selectedCatId || l.category_id === selectedCatId;
    const q           = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      l.title?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const selectedCatName = categories.find(c => c.id === selectedCatId)?.name;

  const handleCategoryClick = (id) => {
    setSelectedCatId(prev => prev === id ? null : id);
    setIsDrawerOpen(false);
    setSearchQuery('');
  };

  const clearFilters = () => { setSelectedCatId(null); setSearchQuery(''); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg,#f0f6ff 0%,#f8fafc 40%,#f0f4ff 100%)' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'shadow-[0_2px_20px_rgba(0,0,0,0.12)] glass'
            : ''
        }`}
        style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#2563eb 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Hamburger */}
          <button
            id="hamburger-btn"
            onClick={() => setIsDrawerOpen(v => !v)}
            aria-label="เปิดเมนูหมวดหมู่"
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-95"
          >
            <span className={`transition-transform duration-300 ${isDrawerOpen ? 'rotate-90' : ''}`}>
              {isDrawerOpen ? <X size={22} /> : <Menu size={22} />}
            </span>
          </button>

          {/* Brand */}
          <div className="flex-shrink-0">
            <div className="text-white font-bold text-base leading-none tracking-tight">UBU Student Portal</div>
            <div className="text-blue-200 text-[11px] mt-0.5 font-medium">มหาวิทยาลัยอุบลราชธานี</div>
          </div>

          {/* Search Bar (hidden on very small screens, shown md+) */}
          <div className="flex-1 mx-4 hidden sm:block">
            <div className="relative max-w-sm mx-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
              <input
                ref={searchRef}
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ค้นหาเว็บไซต์..."
                className="w-full bg-white/10 text-white placeholder-blue-300 border border-white/20 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
              />
            </div>
          </div>

          {/* Active filter badge */}
          {(selectedCatId || searchQuery) && (
            <button
              onClick={clearFilters}
              className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold bg-amber-400 text-blue-900 hover:bg-amber-300 px-3 py-1.5 rounded-full transition-all active:scale-95"
            >
              <X size={11} /> ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาเว็บไซต์..."
              className="w-full bg-white/10 text-white placeholder-blue-300 border border-white/20 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-white/20 transition-all"
            />
          </div>
        </div>
      </nav>

      {/* ── Overlay ─────────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-30 transition-all duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* ── Navigation Drawer ────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(.25,.46,.45,.94)] ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)' }}
      >
        {/* Drawer Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-bold text-sm tracking-wide">หมวดหมู่</span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-slate-500 text-[11px]">เลือกเพื่อกรองเนื้อหา</p>
        </div>

        {/* Category List */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {/* All */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200 ${
              !selectedCatId
                ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.4)]'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-base">🏠</span> ทั้งหมด
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${!selectedCatId ? 'bg-blue-500 text-blue-100' : 'bg-white/10 text-slate-400'}`}>
              {links.length}
            </span>
          </button>

          {categories.map(cat => {
            const count = links.filter(l => l.category_id === cat.id).length;
            const isActive = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.4)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <ChevronRight size={14} className={`flex-shrink-0 transition-transform ${isActive ? 'rotate-90 text-blue-200' : 'text-slate-600'}`} />
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-500 text-blue-100' : 'bg-white/10 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="px-5 py-4 border-t border-white/5">
          <p className="text-slate-600 text-[10px] text-center">UBU Student Portal</p>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:px-6 md:py-8">

        {/* Page Header */}
        <header className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            {selectedCatName ?? 'ศูนย์รวมเว็บไซต์'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isLoading ? 'กำลังโหลด...' : `${filteredLinks.length} รายการ${searchQuery ? ` · ค้นหา "${searchQuery}"` : ''}`}
          </p>
        </header>

        {/* Grid */}
        <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${!isLoading ? 'card-stagger' : ''}`}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredLinks.length === 0
              ? <EmptyState categoryName={selectedCatName} />
              : filteredLinks.map((link, i) => <LinkCard key={link.id} link={link} index={i} />)
          }
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-6 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} มหาวิทยาลัยอุบลราชธานี · UBU Student Portal
        </p>
      </footer>
    </div>
  );
}