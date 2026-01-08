"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Trash2,
  Edit2,
  RefreshCw,
  Plus,
  X,
  Image as ImageIcon,
  Search,
  Zap,
  AlertCircle,
  CheckCircle2,
  Layers
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  service_count?: number;
};

export default function AdminCategoriesUC() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  async function fetchCategories() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select(`*, vendor_products(count)`)
        .order("name", { ascending: true });
      if (error) throw error;
      const mapped = data.map((cat: any) => ({
        ...cat,
        service_count: cat.vendor_products?.[0]?.count ?? 0
      }));
      setCategories(mapped);
      setFiltered(mapped);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally { setLoading(false); }
  }

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(categories.filter(c => c.name.toLowerCase().includes(q)));
  }, [search, categories]);

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIsActive(cat.is_active ?? true);
    setPreview(cat.image_url || null);
    setImageFile(null); // Reset file input
    setShowModal(true);
  };

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", deleteId);
      if (error) throw error;
      showToast("Category deleted successfully", "success");
      setCategories(categories.filter(c => c.id !== deleteId));
      setDeleteId(null);
    } catch (e: any) {
      showToast(e.message, "error");
    }
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // --- VALIDATION: COMPULSORY FIELDS ---
      if (!name.trim() || !description.trim() || (!preview && !imageFile)) {
        showToast("All fields (Name, Description, Image) are required", "error");
        setSaving(false);
        return;
      }

      // 1. Check for duplicate name
      const { data: existing, error: checkError } = await supabase
        .from("categories")
        .select("id, name")
        .ilike("name", name.trim());

      if (checkError) throw checkError;

      const isDuplicate = existing.some(cat => editing ? cat.id !== editing.id : true);
      if (isDuplicate) {
        showToast(`"${name}" already exists!`, "error");
        setSaving(false);
        return;
      }

      // 2. Handle Image Upload
      let finalImageUrl = preview;
      if (imageFile) {
        const filePath = `categories/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('category-images').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('category-images').getPublicUrl(filePath);
finalImageUrl = urlData.publicUrl;
      }

      // 3. Save to Database
      const payload = { 
        name: name.trim(), 
        description: description.trim(), 
        is_active: isActive, 
        image_url: finalImageUrl 
      };

      const { error: saveError } = editing 
        ? await supabase.from("categories").update(payload).eq("id", editing.id) 
        : await supabase.from("categories").insert([payload]);
      
      if (saveError) throw saveError;

      showToast("Category Saved Successfully", 'success');
      fetchCategories(); 
      setShowModal(false);
    } catch (error: any) { 
      showToast(error.message, 'error'); 
    } finally { 
      setSaving(false); 
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      
      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border animate-in fade-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-white border-yellow-400 text-slate-800' : 'bg-red-600 border-red-700 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="text-yellow-500" size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold uppercase tracking-tight">{toast.msg}</span>
        </div>
      )}

      {/* --- MASTER YELLOW BANNER --- */}
      <div className="bg-yellow-300 pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-300 rounded-full opacity-40 blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="text-[#e11d48]" size={20} />
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Master Catalog</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter">
                Service <span className="text-[#e11d48]">Categories</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed">
                Configure taxonomy and structural navigation for your marketplace.
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[120px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Total</p>
                <p className="text-3xl font-black text-[#e11d48]">{categories.length}</p>
              </div>
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[120px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Live</p>
                <p className="text-3xl font-black text-black">{categories.filter(c => c.is_active).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEARCH & CREATE BAR --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-10 relative z-30">
        <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-4 items-center border border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Filter categories..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:border-[#facc15] focus:bg-white outline-none text-sm font-bold text-black transition-all"            />
          </div>
          <button 
            onClick={() => { setEditing(null); setName(""); setDescription(""); setPreview(null); setImageFile(null); setShowModal(true); }}
            className="w-full md:w-auto bg-[#e11d48] hover:bg-black text-white px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> New Category
          </button>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw className="animate-spin text-[#e11d48]" size={48} />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Loading Database</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((cat) => (
              <div key={cat.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all group flex flex-col">
                <div className="bg-yellow-300/10 p-6 flex items-center gap-5 border-b border-yellow-100">
                  <div className="w-20 h-20 rounded-2xl bg-white flex-shrink-0 border border-yellow-200 overflow-hidden shadow-inner relative group-hover:border-yellow-400 transition-colors">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={28} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{cat.is_active ? 'Live' : 'Draft'}</span>
                    </div>
                    <h3 className="font-black text-slate-900 uppercase italic truncate text-xl tracking-tight leading-none">{cat.name}</h3>
                    <div className="flex items-center gap-1.5 mt-2.5 text-[#e11d48] bg-red-50 w-fit px-3 py-1 rounded-full border border-red-100">
                      <Zap size={10} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{cat.service_count} Products</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex gap-3 mt-auto">
                  <button onClick={() => handleEdit(cat)} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-50 hover:bg-yellow-300  text-slate-500 hover:text-black rounded-[1.25rem] text-[10px] font-black uppercase transition-all shadow-sm">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => setDeleteId(cat.id)} className="w-14 flex items-center justify-center py-3.5 bg-slate-50 hover:bg-red-600 text-slate-400 hover:text-white rounded-[1.25rem] transition-all shadow-sm">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="bg-yellow-300 px-10 py-7 flex items-center justify-between border-b border-yellow-400">
              <div>
                <p className="text-red-900/60 text-[10px] font-black uppercase tracking-widest mb-1">Category Editor</p>
                <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter">{editing ? "Modify Entry" : "Add New Entry"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors text-black"><X size={24} /></button>
            </div>
            
            <form onSubmit={saveCategory} className="p-10 space-y-6">
              <div className="flex items-center gap-8">
                <div 
                  onClick={() => document.getElementById('fileIn')?.click()}
                  className={`w-32 h-32 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-50 hover:border-[#facc15] transition-all overflow-hidden bg-slate-50 shadow-inner ${(!preview && !imageFile) ? 'border-red-300' : 'border-slate-200'}`}
                >
                  {preview ? <img src={preview} className="w-full h-full object-cover" alt="preview" /> : <div className="text-center p-2"><ImageIcon className="text-slate-300 mx-auto" size={24} /><p className="text-[8px] font-bold text-red-500 uppercase mt-1">Image Required *</p></div>}
                  <input id="fileIn" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && (setPreview(URL.createObjectURL(e.target.files[0])), setImageFile(e.target.files[0]))} />
                </div>
                <div className="flex-1 space-y-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Display Name <span className="text-red-500">*</span></label>
                    <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#facc15] focus:bg-white outline-none text-sm font-bold text-black transition-all shadow-sm" placeholder="e.g. Plumbing" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-yellow-200 transition-all">
                    <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} className="w-5 h-5 accent-[#e11d48] rounded-lg" />
                    <span className="text-[10px] font-black text-slate-700 uppercase">Visible to Public</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Description / Notes <span className="text-red-500">*</span></label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#facc15] focus:bg-white outline-none text-sm font-bold text-black resize-none transition-all shadow-sm" placeholder="Please provide a brief description..." />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
                <button type="submit" disabled={saving} className="flex-[2] py-4 bg-[#e11d48] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-500/20">
                  {saving ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><Trash2 size={32} /></div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none">Confirm Delete?</h3>
            <p className="text-slate-500 text-xs mt-3 font-bold uppercase tracking-tight leading-relaxed">This action is irreversible.</p>
            <div className="flex flex-col gap-3 mt-10">
              <button 
                onClick={handleDelete}
                className="w-full py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-black transition-all"
              >
                Permanently Erase
              </button>
              <button onClick={() => setDeleteId(null)} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
                Keep Category
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}