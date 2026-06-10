import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GripVertical, Terminal, Save, PlusCircle, CheckCircle, FolderPlus,
  Trash2, Link2, AlertCircle, RefreshCw, Eye, X, Globe, LayoutGrid,
  Pencil, ShieldAlert
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const styles = {
    success: { bar: 'from-emerald-400 to-teal-400', icon: <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" /> },
    error:   { bar: 'from-red-400 to-rose-500',     icon: <AlertCircle  size={16} className="text-red-400 flex-shrink-0"     /> },
    info:    { bar: 'from-blue-400 to-indigo-400',  icon: <AlertCircle  size={16} className="text-blue-400 flex-shrink-0"    /> },
  };
  const s = styles[type] || styles.info;
  return (
    <div className="fixed bottom-6 right-4 z-50 max-w-sm w-full"
      style={{ animation: 'fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
      <div className="bg-[#1e2d45] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className={`h-0.5 bg-gradient-to-r ${s.bar}`} />
        <div className="flex items-center gap-3 px-4 py-3.5">
          {s.icon}
          <p className="text-sm text-gray-200 font-medium flex-1 leading-snug">{message}</p>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0 ml-1">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Custom Confirm Dialog ─────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel = 'ยืนยัน', danger = true, onConfirm, onCancel }) {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    cancelBtnRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const fn = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', fn);
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="bg-[#161b22] border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        style={{ animation: 'fadeUp 0.22s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        {/* Gradient top bar */}
        <div className={`h-1 w-full ${danger
          ? 'bg-gradient-to-r from-red-500 to-rose-500'
          : 'bg-gradient-to-r from-amber-400 to-orange-500'
        }`} />

        <div className="p-6">
          {/* Icon + Text */}
          <div className="flex items-start gap-4 mb-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              danger
                ? 'bg-red-500/10 border border-red-500/25'
                : 'bg-amber-400/10 border border-amber-400/25'
            }`}>
              <ShieldAlert size={20} className={danger ? 'text-red-400' : 'text-amber-400'} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm leading-snug">{title}</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 mb-4" />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              ref={cancelBtnRef}
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-gray-200 hover:bg-white/[0.03] transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ${
                danger
                  ? 'bg-red-600 hover:bg-red-500 shadow-[0_4px_20px_rgba(239,68,68,0.4)]'
                  : 'bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-[0_4px_20px_rgba(245,158,11,0.4)]'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── useConfirm hook ───────────────────────────────────────────────────────────
function useConfirm() {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback(({ title, message, confirmLabel = 'ยืนยัน', danger = true }) =>
    new Promise(resolve => {
      setDialog({
        title, message, confirmLabel, danger,
        onConfirm: () => { setDialog(null); resolve(true); },
        onCancel:  () => { setDialog(null); resolve(false); },
      });
    }), []);

  const DialogNode = dialog ? <ConfirmDialog {...dialog} /> : null;
  return { confirm, DialogNode };
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
const inp = "w-full bg-[#0d1117] text-gray-200 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all";

function EditModal({ link, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:         link.title         || '',
    url:           link.url           || '',
    description:   link.description   || '',
    category_id:   link.category_id   || '',
    logo_url:      link.logo_url      || '',
    facebook_url:  link.facebook_url  || '',
    instagram_url: link.instagram_url || '',
    tiktok_url:    link.tiktok_url    || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onClose]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.url || !form.category_id) {
      setError('กรุณากรอก ชื่อ / URL / หมวดหมู่'); return;
    }
    setSaving(true);
    const payload = {
      title:         form.title.trim(),
      url:           form.url.trim(),
      description:   form.description.trim(),
      category_id:   form.category_id,
      logo_url:      form.logo_url.trim()      || null,
      facebook_url:  form.facebook_url.trim()  || null,
      instagram_url: form.instagram_url.trim() || null,
      tiktok_url:    form.tiktok_url.trim()    || null,
    };
    const { data, error: err } = await supabase
      .from('links').update(payload).eq('id', link.id)
      .select('*, categories(name)').single();
    setSaving(false);
    if (err) { setError('บันทึกไม่สำเร็จ: ' + err.message); return; }
    onSaved(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-[#161b22] border border-gray-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ animation: 'fadeUp 0.25s cubic-bezier(0.22,1,0.36,1) both' }}
      >
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
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-200 hover:bg-white/5 transition-all">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2.5">
              <AlertCircle size={13} className="flex-shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ชื่อองค์กร *</label>
              <input required type="text" name="title" value={form.title} onChange={handleChange} className={inp} placeholder="เช่น สำนักทะเบียน" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">หมวดหมู่ *</label>
              <select required name="category_id" value={form.category_id} onChange={handleChange} className={inp}>
                <option value="">-- เลือกหมวดหมู่ --</option>
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

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">คำอธิบาย</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className={`${inp} resize-none`} placeholder="อธิบายสั้นๆ..." />
          </div>

          <div className="rounded-xl border border-gray-800 bg-[#0d1117] p-4">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">📱 ช่องทาง Social</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'facebook_url',  label: 'Facebook',  prefix: 'f',  color: '#1877F2', ph: 'facebook.com/...' },
                { name: 'instagram_url', label: 'Instagram', prefix: 'ig', color: '#E1306C', ph: 'instagram.com/...' },
                { name: 'tiktok_url',    label: 'TikTok',    prefix: 'tt', color: '#888',    ph: 'tiktok.com/@...' },
              ].map(s => (
                <div key={s.name} className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: s.color }}>{s.prefix}</span>
                    <input type="url" name={s.name} value={form[s.name]} onChange={handleChange} className={`${inp} pl-7`} placeholder={s.ph} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-800 hover:border-gray-600 hover:text-gray-300 transition-all">
              ยกเลิก
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(37,99,235,0.3)]">
              {saving ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75"/></svg> กำลังบันทึก...</>
              ) : (
                <><Save size={14} /> บันทึกการแก้ไข</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sortable Category Row ─────────────────────────────────────────────────────
function SortableCategoryItem({ id, name, count, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 10 : 'auto' }}
      className={`flex items-center gap-3 bg-[#0d1117] border rounded-xl px-3 py-2.5 mb-2 transition-all ${
        isDragging ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-gray-800 hover:border-gray-600'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded-lg">
        <GripVertical size={16} className="text-gray-600" />
      </div>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-gray-300 text-sm font-medium truncate">{name}</span>
        <span className="flex-shrink-0 text-[10px] font-semibold text-gray-600 bg-white/5 px-1.5 py-0.5 rounded-full">{count}</span>
      </div>
      <button onClick={() => onDelete(id, name)} className="flex-shrink-0 p-1.5 text-gray-700 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ── Form Field ────────────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {hint && <p className="text-[11px] text-gray-700 -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────
function Section({ title, icon, accent = 'blue', children }) {
  const accents = {
    yellow: 'text-amber-400 border-amber-400/20',
    blue:   'text-blue-400 border-blue-400/20',
    green:  'text-emerald-400 border-emerald-400/20',
    purple: 'text-violet-400 border-violet-400/20',
  };
  return (
    <div className="bg-[#161b22] rounded-2xl border border-gray-800/80 overflow-hidden">
      <div className={`flex items-center gap-2.5 px-5 py-4 border-b ${accents[accent]}`}>
        <span className={accents[accent].split(' ')[0]}>{icon}</span>
        <h2 className={`text-xs font-bold uppercase tracking-widest ${accents[accent].split(' ')[0]}`}>{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [categories, setCategories]       = useState([]);
  const [links, setLinks]                 = useState([]);
  const [toast, setToast]                 = useState(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [editingLink, setEditingLink]     = useState(null);
  const { confirm, DialogNode }           = useConfirm();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [linkForm, setLinkForm] = useState({
    title: '', url: '', description: '', category_id: '',
    logo_url: '', facebook_url: '', instagram_url: '', tiktok_url: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    const [catRes, linkRes] = await Promise.all([
      supabase.from('categories').select('*').order('order_index'),
      supabase.from('links').select('*, categories(name)').order('created_at', { ascending: false }),
    ]);
    if (!catRes.error)  setCategories(catRes.data  ?? []);
    if (!linkRes.error) setLinks(linkRes.data ?? []);
    setIsLoading(false);
  };

  // Create category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const nextOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order_index)) + 1 : 1;
    const { data, error } = await supabase
      .from('categories').insert([{ name: newCategoryName.trim(), order_index: nextOrder }]).select();
    if (error) { showToast('เกิดข้อผิดพลาด: ' + error.message, 'error'); return; }
    setCategories(prev => [...prev, data[0]]);
    setNewCategoryName('');
    showToast(`สร้างหมวดหมู่ "${data[0].name}" สำเร็จ`);
  };

  // Delete category — ใช้ custom confirm
  const handleDeleteCategory = async (id, name) => {
    const ok = await confirm({
      title: `ลบหมวดหมู่ "${name}"`,
      message: 'หมวดหมู่นี้จะถูกลบถาวร ลิงก์ที่อยู่ภายในอาจสูญเสียการจัดหมวดหมู่',
      confirmLabel: 'ลบออก',
      danger: true,
    });
    if (!ok) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { showToast('ลบไม่สำเร็จ: ' + error.message, 'error'); return; }
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast(`ลบหมวดหมู่ "${name}" แล้ว`, 'info');
  };

  // Drag & Drop → save order
  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = categories.findIndex(c => c.id === active.id);
    const newIdx = categories.findIndex(c => c.id === over.id);
    const reordered = arrayMove(categories, oldIdx, newIdx);
    setCategories(reordered);
    setIsSavingOrder(true);
    await Promise.all(reordered.map((cat, i) =>
      supabase.from('categories').update({ order_index: i + 1 }).eq('id', cat.id)
    ));
    setIsSavingOrder(false);
    showToast('บันทึกลำดับเรียบร้อย ✓');
  };

  // Add link
  const handleLinkChange = e => setLinkForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSaveLink = async (e) => {
    e.preventDefault();
    if (!linkForm.title || !linkForm.url || !linkForm.category_id) {
      showToast('กรุณากรอก ชื่อ / URL / หมวดหมู่', 'error'); return;
    }
    const payload = {
      title:         linkForm.title.trim(),
      url:           linkForm.url.trim(),
      description:   linkForm.description.trim(),
      category_id:   linkForm.category_id,
      logo_url:      linkForm.logo_url.trim()      || null,
      facebook_url:  linkForm.facebook_url.trim()  || null,
      instagram_url: linkForm.instagram_url.trim() || null,
      tiktok_url:    linkForm.tiktok_url.trim()    || null,
    };
    const { data, error } = await supabase.from('links').insert([payload]).select('*, categories(name)');
    if (error) { showToast('เพิ่มไม่สำเร็จ: ' + error.message, 'error'); return; }
    setLinks(prev => [data[0], ...prev]);
    setLinkForm({ title: '', url: '', description: '', category_id: '', logo_url: '', facebook_url: '', instagram_url: '', tiktok_url: '' });
    showToast(`เพิ่ม "${data[0].title}" สำเร็จ ✓`);
  };

  // Delete link — ใช้ custom confirm
  const handleDeleteLink = async (id, title) => {
    const ok = await confirm({
      title: `ลบลิงก์ "${title}"`,
      message: 'ลิงก์นี้จะถูกลบออกจากระบบถาวร ไม่สามารถกู้คืนได้',
      confirmLabel: 'ลบออก',
      danger: true,
    });
    if (!ok) return;
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (error) { showToast('ลบไม่สำเร็จ: ' + error.message, 'error'); return; }
    setLinks(prev => prev.filter(l => l.id !== id));
    showToast(`ลบ "${title}" แล้ว`, 'info');
  };

  // Update link after edit
  const handleLinkSaved = (updated) => {
    setLinks(prev => prev.map(l => l.id === updated.id ? updated : l));
    showToast(`อัปเดต "${updated.title}" สำเร็จ ✓`);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] font-mono">
      {/* Toast notification */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Custom Confirm Dialog */}
      {DialogNode}

      {/* Edit Modal */}
      {editingLink && (
        <EditModal
          link={editingLink}
          categories={categories}
          onClose={() => setEditingLink(null)}
          onSaved={handleLinkSaved}
        />
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-gray-800"
        style={{ background: 'rgba(13,17,23,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Terminal size={16} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-100 leading-none">Admin Console</h1>
              <p className="text-[10px] text-gray-600 mt-0.5">UBU Hub Manager</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-gray-600">
            <span><span className="text-gray-300 font-bold">{categories.length}</span> หมวดหมู่</span>
            <span><span className="text-gray-300 font-bold">{links.length}</span> ลิงก์</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={fetchAll} disabled={isLoading}
              className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-800 hover:border-gray-600 transition-all">
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-800 hover:border-gray-600 transition-all">
              <Eye size={12} />
              <span className="hidden sm:inline">หน้า User</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left column */}
        <div className="lg:col-span-7 space-y-5">

          {/* 1. Create Category */}
          <Section title="1 · Create Directory" icon={<FolderPlus size={14} />} accent="yellow">
            <form onSubmit={handleCreateCategory} className="flex gap-3">
              <input required type="text" placeholder="ชื่อหมวดหมู่ เช่น ระบบการศึกษา"
                value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                className={`${inp} flex-1`} />
              <button type="submit"
                className="flex-shrink-0 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95">
                <PlusCircle size={14} /> Mkdir
              </button>
            </form>
          </Section>

          {/* 2. Add Link */}
          <Section title="2 · Deploy Link" icon={<Link2 size={14} />} accent="blue">
            <form onSubmit={handleSaveLink} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="ชื่อองค์กร / เว็บไซต์ *">
                  <input required type="text" name="title" value={linkForm.title} onChange={handleLinkChange}
                    className={inp} placeholder="เช่น สำนักทะเบียน" />
                </Field>
                <Field label="หมวดหมู่ *">
                  <select required name="category_id" value={linkForm.category_id} onChange={handleLinkChange} className={inp}>
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="URL หลัก (เว็บไซต์) *">
                  <input required type="url" name="url" value={linkForm.url} onChange={handleLinkChange}
                    className={inp} placeholder="https://..." />
                </Field>
                <Field label="URL โลโก้" hint="เว้นว่าง = ดึง Favicon อัตโนมัติ">
                  <input type="url" name="logo_url" value={linkForm.logo_url} onChange={handleLinkChange}
                    className={inp} placeholder="https://.../logo.png" />
                </Field>
              </div>

              <Field label="คำอธิบาย">
                <textarea name="description" value={linkForm.description} onChange={handleLinkChange}
                  rows={2} className={`${inp} resize-none`} placeholder="อธิบายสั้นๆ..." />
              </Field>

              <div className="rounded-xl border border-gray-800 bg-[#0d1117] p-4">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">📱 ช่องทาง Social (ไม่บังคับ)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'facebook_url',  label: 'Facebook',  prefix: 'f',  color: '#1877F2', ph: 'facebook.com/...' },
                    { name: 'instagram_url', label: 'Instagram', prefix: 'ig', color: '#E1306C', ph: 'instagram.com/...' },
                    { name: 'tiktok_url',    label: 'TikTok',    prefix: 'tt', color: '#888',    ph: 'tiktok.com/@...' },
                  ].map(s => (
                    <Field key={s.name} label={s.label}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: s.color }}>{s.prefix}</span>
                        <input type="url" name={s.name} value={linkForm[s.name]} onChange={handleLinkChange}
                          className={`${inp} pl-7`} placeholder={s.ph} />
                      </div>
                    </Field>
                  ))}
                </div>
              </div>

              <button type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 rounded-xl transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(37,99,235,0.3)]">
                <Save size={15} /> Deploy Link Data
              </button>
            </form>
          </Section>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-5">

          {/* 3. Category Order */}
          <Section title={`3 · Drawer Order${isSavingOrder ? ' — saving...' : ''}`} icon={<GripVertical size={14} />} accent="green">
            {categories.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-gray-800 rounded-xl">
                <FolderPlus size={28} className="mx-auto mb-2 text-gray-800" />
                <p className="text-xs text-gray-700">ยังไม่มีหมวดหมู่</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {categories.map(cat => (
                    <SortableCategoryItem key={cat.id} id={cat.id} name={cat.name}
                      count={links.filter(l => l.category_id === cat.id).length}
                      onDelete={handleDeleteCategory} />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </Section>

          {/* 4. Links List */}
          <Section title={`4 · All Links (${links.length})`} icon={<LayoutGrid size={14} />} accent="purple">
            {links.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-gray-800 rounded-xl">
                <Globe size={28} className="mx-auto mb-2 text-gray-800" />
                <p className="text-xs text-gray-700">ยังไม่มีลิงก์</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-0.5">
                {links.map(link => (
                  <div key={link.id}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-gray-700 hover:bg-white/[0.02] transition-all">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-500 opacity-60" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-300 truncate">{link.title}</p>
                      <p className="text-[10px] text-gray-700 truncate">{link.categories?.name || '—'}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {link.facebook_url  && <span className="text-[9px] font-bold text-[#1877F2] bg-blue-500/10 px-1.5 py-0.5 rounded">f</span>}
                      {link.instagram_url && <span className="text-[9px] font-bold text-[#E1306C] bg-pink-500/10 px-1.5 py-0.5 rounded">ig</span>}
                      {link.tiktok_url    && <span className="text-[9px] font-bold text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">tt</span>}
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" title="เปิดเว็บไซต์"
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-blue-400 rounded-lg hover:bg-blue-400/10 transition-all">
                        <Eye size={12} />
                      </a>
                      <button onClick={() => setEditingLink(link)} title="แก้ไข"
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-amber-400 rounded-lg hover:bg-amber-400/10 transition-all">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDeleteLink(link.id, link.title)} title="ลบ"
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}