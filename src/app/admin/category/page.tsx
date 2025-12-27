"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Trash2,
  Edit2,RefreshCw ,
  Plus,
  X,
  Image as ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  MapPin,
  Layers,
  Calendar
} from "lucide-react";

// -------------------- Types --------------------
type Category = {
  id: string;
  name: string;
  description?: string | null;
  locations?: string[] | null;
  image_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  service_count?: number;
};

// -------------------- UI Helpers --------------------
const StatusBadge = ({ active }: { active?: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
      active
        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
    {active ? "Active" : "Disabled"}
  </span>
);

export default function AdminCategoriesUC() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const ITEMS_PER_PAGE = 8;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [locationsInput, setLocationsInput] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*, services(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((c: any) => ({
        ...c,
        service_count: c.services?.[0]?.count ?? 0,
      }));
      setCategories(mapped);
      setFiltered(mapped);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => {
    let list = categories;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q));
    if (onlyActive) list = list.filter(c => c.is_active);
    setFiltered(list);
    setPage(1);
  }, [search, onlyActive, categories]);

  function handleImageChange(file: File) {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function openAddModal() {
    setEditing(null); setName(""); setDescription(""); setLocationsInput("");
    setIsActive(true); setPreview(null); setImageFile(null); setShowModal(true);
  }

  function openEditModal(cat: Category) {
    setEditing(cat); setName(cat.name ?? ""); setDescription(cat.description ?? "");
    setLocationsInput((cat.locations || []).join(", ")); setIsActive(!!cat.is_active);
    setPreview(cat.image_url ? String(cat.image_url) : null); setImageFile(null); setShowModal(true);
  }

  async function uploadImage(catId: string) {
    if (!imageFile) return preview;
    const ext = imageFile.name.split(".").pop();
    const filePath = `${catId}.${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("category-images").upload(filePath, imageFile, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("category-images").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function saveCategory() {
    if (!name.trim()) return alert("Name required.");
    setSaving(true);
    const payloadBase = { name, description, locations: locationsInput.split(",").map(s => s.trim()).filter(Boolean), is_active: isActive, updated_at: new Date().toISOString() };
    try {
      let catId = editing?.id;
      if (!editing) {
        const { data, error } = await supabase.from("categories").insert([payloadBase]).select("id").single();
        if (error) throw error;
        catId = data.id;
      }
      const imageUrl = imageFile ? await uploadImage(catId!) : preview;
      const { error } = await supabase.from("categories").update({ ...payloadBase, image_url: imageUrl }).eq("id", catId!);
      if (error) throw error;
      await fetchCategories();
      setShowModal(false);
    } catch (e) { alert("Save failed"); } finally { setSaving(false); }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Are you sure?")) return;
    setDeletingId(id);
    try {
      await supabase.from("categories").delete().eq("id", id);
      fetchCategories();
    } catch (e) { console.error(e); } finally { setDeletingId(null); }
  }

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
              Categories <span className="text-red-600">Hub</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Structure your services and geographic reach.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Find category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-64 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all shadow-sm font-medium"
              />
            </div>
            <button
              onClick={openAddModal}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <Plus size={20} strokeWidth={3} />
              New Category
            </button>
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 mb-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6 px-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={() => setOnlyActive(!onlyActive)}
                className="w-5 h-5 rounded-md border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Active Only</span>
            </label>
            <div className="h-4 w-[1px] bg-slate-200" />
            <span className="text-sm font-bold text-slate-400">Total: <span className="text-slate-900">{filtered.length}</span></span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Filters Applied</span>
          </div>
        </div>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">Syncing Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginated.map((cat) => (
              <div key={cat.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={40} /></div>
                  )}
                  <div className="absolute top-4 left-4"><StatusBadge active={cat.is_active} /></div>
                  
                  <div className="absolute bottom-3 right-3 flex gap-2 translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                    <button onClick={() => openEditModal(cat)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xl hover:bg-red-600 hover:text-white transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xl hover:bg-red-500 hover:text-white transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <Layers size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.service_count} Services</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 truncate">{cat.name}</h3>
                  <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-4 flex-1">{cat.description || "No description provided."}</p>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={12} className="text-slate-300" />
                      <span className="text-[10px] font-bold truncate">
                        {cat.locations?.length ? cat.locations.join(", ") : "Global Access"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={12} className="text-slate-300" />
                      <span className="text-[10px] font-bold">Updated {cat.updated_at ? new Date(cat.updated_at).toLocaleDateString() : "Never"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-white disabled:opacity-30 transition-all"><ChevronLeft /></button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${page === i + 1 ? "bg-slate-900 text-white shadow-lg" : "hover:bg-white text-slate-400"}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-white disabled:opacity-30 transition-all"><ChevronRight /></button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <div>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Editor Mode</p>
                <h3 className="text-2xl font-black tracking-tight">{editing ? "Update Category" : "New Category"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveCategory(); }} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Category Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold" placeholder="e.g. Graphic Design" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Service Locations</label>
                    <input value={locationsInput} onChange={(e) => setLocationsInput(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold" placeholder="London, NYC, Remote" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Cover Image</label>
                  <div onClick={() => document.getElementById("fileInput")?.click()} className="h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 hover:bg-red-50 hover:border-red-200 cursor-pointer transition-all group overflow-hidden">
                    {preview ? (
                      <img src={preview} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon size={32} className="mx-auto text-slate-300 group-hover:text-red-500 mb-2 transition-colors" />
                        <p className="text-[10px] font-black uppercase text-slate-400">Upload Media</p>
                      </div>
                    )}
                  </div>
                  <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Detailed Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold resize-none" placeholder="What does this category cover?" />
              </div>

              <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-colors group">
                <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} className="w-6 h-6 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <div>
                  <p className="text-sm font-black text-slate-900 group-hover:text-emerald-700">Set as Active</p>
                  <p className="text-[10px] text-slate-400 font-medium tracking-tight">Publicly visible on the marketplace</p>
                </div>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Discard</button>
                <button type="submit" disabled={saving} className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-red-600 shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2">
                  {saving ? <RefreshCw className="animate-spin" size={18} /> : null}
                  {editing ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}