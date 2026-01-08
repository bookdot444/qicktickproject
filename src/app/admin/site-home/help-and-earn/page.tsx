"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Coins,
  UploadCloud,
  Trash2,
  Plus,
  X,
  Edit3,
  RefreshCw,
  ChevronRight,
  ImageIcon,
  ShieldCheck,
  Type,
  AlertCircle,
  CheckCircle2,
  TriangleAlert
} from "lucide-react";

export default function HelpAndEarnAdmin() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEntries = async () => {
    setFetchLoading(true);
    const { data } = await supabase
      .from("help_and_earn")
      .select("*")
      .order("id", { ascending: true });
    setEntries(data || []);
    setFetchLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const openAddModal = () => {
    setEditingEntry(null);
    setName("");
    setFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEditModal = (entry: any) => {
    setEditingEntry(entry);
    setName(entry.name);
    setFile(null);
    setPreviewUrl(entry.image_url);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { showToast("Category name is required", "error"); return; }
    if (!editingEntry && !file) { showToast("An icon is required", "error"); return; }

    setLoading(true);
    try {
      let finalImageUrl = editingEntry?.image_url || "";

      // If a new file is selected, upload it to the bucket
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `icons/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("help-and-earn")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("help-and-earn")
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      // Save to Database
      if (editingEntry) {
        const { error } = await supabase
          .from("help_and_earn")
          .update({ name, image_url: finalImageUrl })
          .eq("id", editingEntry.id);
        if (error) throw error;
        showToast("Category updated", "success");
      } else {
        const { error } = await supabase
          .from("help_and_earn")
          .insert({ name, image_url: finalImageUrl });
        if (error) throw error;
        showToast("Category created", "success");
      }

      setShowModal(false);
      fetchEntries();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const commitToDatabase = async (imageUrl: string) => {
    if (editingEntry) {
      await supabase.from("help_and_earn").update({ name, image_url: imageUrl }).eq("id", editingEntry.id);
      showToast("Category updated", "success");
    } else {
      if (!imageUrl) throw new Error("Please select an icon");
      await supabase.from("help_and_earn").insert({ name, image_url: imageUrl });
      showToast("Category created", "success");
    }
    setShowModal(false);
    fetchEntries();
    setLoading(false);
  };

  const processDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      const entryToDelete = entries.find(e => e.id === deleteConfirm);

      // Remove file from storage if it exists
      if (entryToDelete?.image_url) {
        const fileName = entryToDelete.image_url.split('/').pop();
        await supabase.storage.from("help-and-earn").remove([`icons/${fileName}`]);
      }

      // Remove from DB
      await supabase.from("help_and_earn").delete().eq("id", deleteConfirm);

      showToast("Category removed", "success");
      fetchEntries();
    } catch (error) {
      showToast("Delete failed", "error");
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-white border-red-500 text-slate-800' : 'bg-red-600 border-red-700 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="text-red-600" size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-black uppercase tracking-tight">{toast.msg}</span>
        </div>
      )}

      {/* --- MASTER YELLOW BANNER --- */}
      <div className="bg-yellow-300 pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-300 rounded-full opacity-40 blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#e11d48]" size={20} />
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Rewards Engine</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                Help <span className="text-[#e11d48]">& Earn</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed italic">
                Manage high-impact reward categories. Changes here reflect instantly on the user participation dashboard.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[120px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Total Categories</p>
                <p className="text-3xl font-black text-[#e11d48]">{entries.length}</p>
              </div>
              <button onClick={openAddModal} className="bg-red-600 hover:bg-black text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 group">
                <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                New Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-xl">
            <RefreshCw className="animate-spin text-red-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {entries.map((entry) => (
              <div key={entry.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative h-48 bg-slate-50 overflow-hidden flex items-center justify-center p-8">
                  <img src={entry.image_url} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" alt={entry.name} />

                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => openEditModal(entry)} className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl transition-colors">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => setDeleteConfirm(entry.id)} className="w-10 h-10 bg-white text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ref: #{entry.id}</span>
                    <ChevronRight size={14} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter truncate">{entry.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-red-600 p-8 flex flex-col items-center text-white text-center">
              <TriangleAlert size={40} className="mb-4" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Delete Reward?</h3>
              <p className="text-red-100 text-[10px] font-bold uppercase mt-2 tracking-widest opacity-80">This will remove the category from all apps.</p>
            </div>
            <div className="p-8 flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
              <button onClick={processDelete} className="flex-1 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-yellow-300 p-8 flex items-center justify-between border-b border-yellow-400 text-black">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">{editingEntry ? "Modify Category" : "New Reward Asset"}</h3>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Daily Bonus" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-600 outline-none font-bold text-slate-700" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Icon / Visual Asset</label>
                <div onClick={() => document.getElementById('entryFile')?.click()} className={`relative h-44 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${file ? 'border-red-600 bg-red-50' : 'border-slate-100 bg-slate-50 hover:bg-yellow-50'}`}>
                  {previewUrl ? (
                    <img src={previewUrl} className="h-full w-full object-contain p-6" alt="Preview" />
                  ) : (
                    <div className="text-center">
                      <UploadCloud className="text-slate-300 mx-auto mb-2" size={32} />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Visual Icon</p>
                    </div>
                  )}
                  <input id="entryFile" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setFile(f); setPreviewUrl(URL.createObjectURL(f)); }
                  }} />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</button>
                <button onClick={handleSave} disabled={loading} className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                  {loading && <RefreshCw className="animate-spin" size={14} />}
                  {editingEntry ? "Update Category" : "Confirm Entry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}