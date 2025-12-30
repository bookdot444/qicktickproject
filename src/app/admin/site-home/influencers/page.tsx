"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  UploadCloud,
  Trash2,
  Plus,
  X,
  Type,
  RefreshCw,
  Users,
  PlayCircle,
  Edit3,
  Video,
  CheckCircle2,
  Link,
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";

export default function InfluencerUploadPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [videoUrl, setVideoUrl] = useState(""); // For links
  const [file, setFile] = useState<File | null>(null); // For uploads
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const BUCKET = "influencers";

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: list, error } = await supabase
      .from("influencers_videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setData(list || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName("");
    setVideoUrl("");
    setFile(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setVideoUrl(item.video_url);
    setFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return showToast("Name is required", "error");

    setActionLoading(true);
    try {
      let finalUrl = videoUrl;

      // 1. Handle File Upload Priority
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
        finalUrl = urlData.publicUrl;
      }

      // 2. Logic for Update vs Insert
      if (editingItem) {
        // Use a local variable to ensure the ID is locked in for this async call
        const targetId = editingItem.id;

        const { data, error: updateError } = await supabase
          .from("influencers_videos")
          .update({
            name: name.trim(),
            video_url: finalUrl
          })
          .eq("id", targetId)
          .select(); // Explicitly ask for the row back to confirm success

        if (updateError) throw updateError;

        // If data is empty, the RLS policy is likely missing or the ID is wrong
        if (!data || data.length === 0) {
          throw new Error("Update failed: Check Supabase RLS policies for UPDATE permission.");
        }

        showToast("Asset updated successfully", "success");
      } else {
        if (!finalUrl) throw new Error("Please provide a link or upload a file");

        const { error: insertError } = await supabase
          .from("influencers_videos")
          .insert([{ name: name.trim(), video_url: finalUrl }]);

        if (insertError) throw insertError;
        showToast("Asset published successfully", "success");
      }

      setShowModal(false);
      setFile(null);
      setEditingItem(null); // Clear the editing state
      fetchData();
    } catch (error: any) {
      console.error("Save Error:", error);
      showToast(error.message || "An unexpected error occurred", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Remove this influencer asset?")) return;
    const { error } = await supabase.from("influencers_videos").delete().eq("id", id);
    if (!error) {
      showToast("Asset deleted", "success");
      fetchData();
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
      <div className="bg-[#facc15] pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-300 rounded-full opacity-40 blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#e11d48]" size={20} />
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Talent & Partners</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                Influencer <span className="text-[#e11d48]">Assets</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide italic">
                Manage high-impact content from partner influencers. Supports direct video uploads and external social links.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[120px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Total Assets</p>
                <p className="text-3xl font-black text-[#e11d48]">{data.length}</p>
              </div>
              <button onClick={openAddModal} className="bg-black hover:bg-red-600 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 group">
                <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                Upload Content
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ASSET GRID - Horizontal Layout (16:9) */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-xl">
            <RefreshCw className="animate-spin text-red-600" size={40} />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Talent Feed...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((item) => (
              <div key={item.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                {/* Horizontal Video (16:9 Aspect) */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <video src={item.video_url} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" muted />

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PlayCircle className="text-white/30 group-hover:text-red-600 group-hover:scale-110 transition-all duration-500" size={64} strokeWidth={1} />
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => openEditModal(item)} className="w-12 h-12 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-black hover:text-white shadow-xl transition-all">
                      <Edit3 size={20} />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="w-12 h-12 bg-white text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-[#facc15] rounded-lg text-[9px] text-black font-black uppercase flex items-center gap-2">
                    <Users size={10} /> {item.name.split(' ')[0]} Showcase
                  </div>
                </div>

                <div className="p-6 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter truncate">
                    {item.name}
                  </h3>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <Video size={16} className="text-slate-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#facc15] p-8 flex items-center justify-between border-b border-yellow-400">
              <div>
                <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Partner Portal</p>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black">{editingItem ? "Edit Asset" : "New Talent Upload"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-10 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  <Type size={12} className="text-red-600" /> Influencer Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-600 outline-none font-bold text-slate-700 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  <Link size={12} className="text-red-600" /> External Video Link
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => { setVideoUrl(e.target.value); if (e.target.value) setFile(null); }}
                  disabled={!!file}
                  placeholder="Paste URL (YouTube, Vimeo, etc.)"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-600 outline-none font-bold text-slate-700 disabled:opacity-30"
                />
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase italic">Or Upload Media</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div
                onClick={() => document.getElementById('talFile')?.click()}
                className={`relative h-32 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer
                  ${file ? 'border-red-600 bg-red-50' : 'border-slate-100 bg-slate-50 hover:bg-yellow-50'}`}
              >
                {file ? (
                  <div className="text-center">
                    <CheckCircle2 size={24} className="mx-auto text-red-600 mb-1" />
                    <p className="text-[10px] font-black text-red-700 truncate px-4 uppercase tracking-tighter">{file.name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex gap-2 justify-center mb-2">
                      <Video size={24} className="text-slate-300" />
                      <ImageIcon size={24} className="text-slate-300" />
                    </div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Drag Video or Photo Asset</p>
                  </div>
                )}
                <input id="talFile" type="file" accept="video/*,image/*" className="hidden" onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  if (e.target.files?.[0]) setVideoUrl("");
                }} />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : null}
                  {editingItem ? "Update Asset" : "Confirm Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}