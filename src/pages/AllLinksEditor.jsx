import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Trash2, X, AlertCircle, CheckCircle,
  Globe, Search, ShieldAlert, ExternalLink
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const SECRET_ADMIN_URL = import.meta.env.VITE_ADMIN_SECRET_PATH || '/14082507';
const inp = 'w-full bg-[#0d1117] text-gray-200 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all';
const UBU_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/8/87/Ubon_Ratchathani_Univ_Emblem.svg';
const GRAD = ['from-blue-500 to-indigo-600','from-violet-500 to-purple-600','from-pink-500 to-rose-600','from-amber-400 to-orange-500','from-emerald-500 to-teal-600','from-cyan-500 to-blue-600'];

// ── Toast ─────────────────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const color = type === 'success' ? 'from-emerald-400 to-teal-400' : 'from-red-400 to-rose-500';
  const icon = type === 'success' ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-red-400" />;
  return (
    <div className="fixed bottom-6 right-4 z-50 max-w-sm w-full" style={{ animation: 'toastIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
      <div className="bg-[#1e2d45] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className={`h-0.5 bg-gradient-to-r ${color}`} />
        <div className="flex items-center gap-3 px-4 py-3.5">
          {icon}
          <p className="text-sm text-gray-200 font-medium flex-1">{message}</p>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300"><X size={14} /></button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Dialog ──────────────────────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel = 'ยืนยัน', onConfirm, onCancel }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const fn = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', fn);
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-[#161b22] border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        style={{ animation: 'dialogIn 0.45s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/25 flex-shrink-0">
              <ShieldAlert size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">{title}</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mb-4" />
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-gray-200 transition-all active:scale-95">ยกเลิก</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-all active:scale-95">{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────────────────────────
function EditModal({ link, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: link.title || '', url: link.url || '', description: link.description || '',
    category_id: link.category_id || '', logo_url: link.logo_url || '',
    facebook_url: link.facebook_url || '', instagram_url: link.instagram_url || '',
    tiktok_url: link.tiktok_url || '', order_index: link.order_index ?? 999,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onClose]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.url || !form.category_id) { setError('กรุณากรอก ชื่อ / URL / หมวดหมู่'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(), url: form.url.trim(), description: form.description.trim(),
      category_id: form.category_id,
      logo_url: form.logo_url.trim() || null, facebook_url: form.facebook_url.trim() || null,
      instagram_url: form.instagram_url.trim() || null, tiktok_url: form.tiktok_url.trim() || null,
      order_index: parseInt(form.order_index) || 999,
    };
    const { data, error: err } = await supabase.from('links').update(payload).eq('id', link.id)
      .select('*, categories(name)').single();
    setSaving(false);
    if (err) { setError('บันทึกไม่สำเร็จ: ' + err.message); return; }
    onSaved(data); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#161b22] border border-gray-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ animation: 'dialogIn 0.45s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Pencil size={13} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100">แก้ไขลิงก์</h2>
              <p className="text-[10px] text-gray-600 truncate max-w-[280px]">{link.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-200 hover:bg-white/5 transition-all"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2.5"><AlertCircle size={13} /> {error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ชื่อองค์กร *</label>
              <input required type="text" name="title" value={form.title} onChange={handleChange} className={inp} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">หมวดหมู่ *</label>
              <select required name="category_id" value={form.category_id} onChange={handleChange} className={inp}>
                <option value="">— เลือกหมวดหมู่ —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">URL หลัก *</label>
              <input required type="url" name="url" value={form.url} onChange={handleChange} className={inp} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">URL โลโก้</label>
              <input type="url" name="logo_url" value={form.logo_url} onChange={handleChange} className={inp} placeholder="https://.../logo.png" />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0"><span className="text-amber-400 text-sm font-bold">#</span></div>
            <div className="flex-1">
              <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">ลำดับการแสดงผล</label>
              <p className="text-[10px] text-gray-600">ตัวเลขน้อย = ขึ้นก่อน | 1 = สำคัญสุด | 999 = ท้ายสุด</p>
            </div>
            <input type="number" name="order_index" value={form.order_index} onChange={handleChange} min={1} max={9999}
              className="w-20 text-center bg-[#0d1117] border border-gray-700 rounded-xl px-2 py-2 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">คำอธิบาย</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className={`${inp} resize-none`} placeholder="อธิบายสั้นๆ..." />
          </div>
          <div className="rounded-xl border border-gray-800 bg-[#0d1117] p-4">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">📱 Social</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[{name:'facebook_url',label:'Facebook',prefix:'f',color:'#1877F2',ph:'facebook.com/...'},
                {name:'instagram_url',label:'Instagram',prefix:'ig',color:'#E1306C',ph:'instagram.com/...'},
                {name:'tiktok_url',label:'TikTok',prefix:'tt',color:'#888',ph:'tiktok.com/@...'}].map(s => (
                <div key={s.name} className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{color:s.color}}>{s.prefix}</span>
                    <input type="url" name={s.name} value={form[s.name]} onChange={handleChange} className={`${inp} pl-7`} placeholder={s.ph} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-800 hover:border-gray-600 hover:text-gray-300 transition-all">ยกเลิก</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all active:scale-95">
              {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Logo component ───────────────────────────────────────────────────────────────────────────────
function LinkLogo({ url, logoUrl, title }) {
  const [idx, setIdx] = useState(0);
  let hostname = null;
  try { hostname = new URL(url).hostname; } catch {}
  const sources = useMemo(() => {
    const list = [];
    if (logoUrl) list.push(logoUrl);
    if (hostname) {
      list.push(`https://logo.clearbit.com/${hostname}`);
      list.push(`https://icons.duckduckgo.com/ip3/${hostname}.ico`);
      const parts = hostname.split('.');
      if (parts.length > 2) {
        const root = parts.slice(-2).join('.');
        list.push(`https://logo.clearbit.com/${root}`);
        list.push(`https://icons.duckduckgo.com/ip3/${root}.ico`);
      }
      if (hostname.endsWith('.ubu.ac.th') || hostname === 'ubu.ac.th') list.push(UBU_LOGO);
    }
    return list;
  }, [logoUrl, hostname]);
  useEffect(() => { setIdx(0); }, [logoUrl, url]);
  const src = sources[idx];
  const hash = title.split('').reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
  const grad = GRAD[Math.abs(hash) % GRAD.length];
  if (src) return (
    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
      <img key={src} src={src} alt="" className="w-full h-full object-contain p-1" onError={() => setIdx(i => i + 1)} />
    </div>
  );
  return (
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 text-white font-bold text-base select-none`}>
      {title.trim()[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

// ── Link Card ─────────────────────────────────────────────────────────────────────────────────
function LinkCard({ link, onEdit, onDelete }) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/4 hover:bg-white/7 hover:border-white/15 transition-all duration-200 overflow-hidden">
      {link.order_index && link.order_index < 999 && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">#{link.order_index}</span>
        </div>
      )}
      <div className="p-4 flex-1">
        <div className="flex items-start gap-3 mb-3">
          <LinkLogo url={link.url} logoUrl={link.logo_url} title={link.title} />
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-semibold text-white text-sm leading-tight line-clamp-2">{link.title}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/15 px-2 py-0.5 rounded-full">
              {link.categories?.name ?? '—'}
            </span>
          </div>
        </div>
        {link.description && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{link.description}</p>}
        <div className="flex flex-wrap gap-1.5">
          {link.facebook_url  && <span className="text-[10px] font-bold text-[#1877F2] bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">FB</span>}
          {link.instagram_url && <span className="text-[10px] font-bold text-[#E1306C] bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">IG</span>}
          {link.tiktok_url    && <span className="text-[10px] font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">TT</span>}
          {link.logo_url      && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">🖼 logo</span>}
        </div>
      </div>
      <div className="flex border-t border-white/5">
        <a href={link.url} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-300 hover:bg-white/4 transition-all">
          <ExternalLink size={12} /> เปิด
        </a>
        <div className="w-px bg-white/5" />
        <button onClick={() => onEdit(link)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all">
          <Pencil size={12} /> แก้ไข
        </button>
        <div className="w-px bg-white/5" />
        <button onClick={() => onDelete(link)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <Trash2 size={12} /> ลบ
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────────────────────
export default function AllLinksEditor() {
  const navigate = useNavigate();
  const [links,      setLinks]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [query,      setQuery]      = useState('');
  const [editLink,   setEditLink]   = useState(null);
  const [confirm,    setConfirm]    = useState(null);
  const [toast,      setToast]      = useState(null);
  const [selectedCatId, setSelectedCatId] = useState(null);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [c, l] = await Promise.all([
      supabase.from('categories').select('*').order('order_index'),
      supabase.from('links').select('*, categories(name)').order('order_index', { ascending: true }).order('created_at', { ascending: false }),
    ]);
    if (!c.error) setCategories(c.data ?? []);
    if (!l.error) setLinks(l.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return links.filter(l => {
      const catMatch = !selectedCatId || l.category_id === selectedCatId;
      const txtMatch = !q || l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q);
      return catMatch && txtMatch;
    });
  }, [links, query, selectedCatId]);

  const handleDelete = useCallback((link) => {
    setConfirm({
      title: 'ลบลิงก์',
      message: `ต้องการลบ “${link.title}” ออกจากระบบ? ไม่สามารถกู้คืนได้`,
      confirmLabel: 'ลบเลย',
      onConfirm: async () => {
        setConfirm(null);
        const { error } = await supabase.from('links').delete().eq('id', link.id);
        if (error) { showToast('ลบไม่สำเร็จ: ' + error.message, 'error'); return; }
        setLinks(prev => prev.filter(l => l.id !== link.id));
        showToast(`ลบ “${link.title}” แล้ว`);
      },
      onCancel: () => setConfirm(null),
    });
  }, [showToast]);

  const handleSaved = useCallback((updated) => {
    setLinks(prev => prev.map(l => l.id === updated.id ? updated : l));
    showToast(`บันทึก “${updated.title}” แล้ว ✓`);
  }, [showToast]);

  const activeCat = categories.find(c => c.id === selectedCatId);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f172a' }}>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#1d4ed8 100%)' }}>
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 h-16 flex items-center gap-4">
          <button onClick={() => navigate(SECRET_ADMIN_URL)}
            className="flex items-center gap-2 text-blue-300 hover:text-white text-sm font-semibold transition-all hover:bg-white/10 px-3 py-2 rounded-xl active:scale-95">
            <ArrowLeft size={16} /> Admin
          </button>
          <div className="w-px h-5 bg-white/20 flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-[15px] leading-none">จัดการลิงก์ทั้งหมด</div>
            <div className="text-blue-300 text-[11px] mt-0.5">{loading ? '...' : `${links.length} รายการ · ${categories.length} หมวดหมู่`}</div>
          </div>
          <div className="flex-1 max-w-md mx-auto hidden sm:block">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" />
              <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาลิงก์..."
                className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-blue-300 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }} />
              {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"><X size={13} /></button>}
            </div>
          </div>
          {(selectedCatId || query) && (
            <button onClick={() => { setSelectedCatId(null); setQuery(''); }}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold rounded-full px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-blue-950 transition-all active:scale-95">
              <X size={11} /> ล้าง
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">

        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-r border-white/5 py-5 px-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-3">หมวดหมู่</p>
          <nav className="space-y-0.5">
            {[{ id: null, name: 'ทั้งหมด', count: links.length }, ...categories.map(c => ({
              id: c.id, name: c.name, count: links.filter(l => l.category_id === c.id).length,
            }))].map(c => {
              const active = selectedCatId === c.id;
              return (
                <button key={c.id ?? 'all'} onClick={() => { setSelectedCatId(c.id); setQuery(''); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}>
                  <span className="truncate">{c.name}</span>
                  <span className={`flex-shrink-0 text-[11px] font-bold ml-2 px-2 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-blue-100' : 'bg-white/10 text-slate-500'
                  }`}>{c.count}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">{activeCat?.name ?? (query ? 'ผลการค้นหา' : 'ลิงก์ทั้งหมด')}</h2>
            <p className="text-sm text-slate-500 mt-1">{loading ? 'กำลังโหลด...' : `${filtered.length} รายการ${query ? ` · “${query}”` : ''}`}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-5 animate-pulse">
                  <div className="flex gap-3 mb-3"><div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0" /><div className="flex-1 space-y-2 pt-1"><div className="h-4 bg-white/10 rounded w-3/4" /><div className="h-3 bg-white/10 rounded w-1/3" /></div></div>
                  <div className="h-3 bg-white/10 rounded w-full mb-2" /><div className="h-3 bg-white/10 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4"><Globe size={36} className="text-slate-600" /></div>
              <p className="font-semibold text-slate-500">{query ? `ไม่พบ “${query}”` : 'ยังไม่มีข้อมูล'}</p>
            </div>
          ) : (!selectedCatId && !query) ? (
            <div className="space-y-10">
              {categories.map(cat => {
                const catLinks = filtered.filter(l => l.category_id === cat.id);
                if (catLinks.length === 0) return null;
                return (
                  <section key={cat.id}>
                    <div className="flex items-center gap-3 mb-4 cursor-pointer group" onClick={() => setSelectedCatId(cat.id)}>
                      <h3 className="font-bold text-slate-300 text-[15px] group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                      <span className="text-[11px] font-bold text-slate-500 bg-white/5 px-2.5 py-0.5 rounded-full">{catLinks.length}</span>
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-[11px] text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0">กรองดู →</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {catLinks.map(link => <LinkCard key={link.id} link={link} onEdit={setEditLink} onDelete={handleDelete} />)}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(link => <LinkCard key={link.id} link={link} onEdit={setEditLink} onDelete={handleDelete} />)}
            </div>
          )}
        </main>
      </div>

      {editLink && <EditModal link={editLink} categories={categories} onClose={() => setEditLink(null)} onSaved={handleSaved} />}
      {confirm  && <ConfirmDialog {...confirm} />}
      {toast    && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
