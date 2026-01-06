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
  const [videoUrl, setVideoUrl] = useState(""); 
  const [file, setFile] = useState<File | null>(null); 
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
    setVideoUrl(item.video_url || "");
    setFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return showToast("Name is required", "error");

    setActionLoading(true);
    try {
      let finalUrl = videoUrl;
      let mediaType: "image" | "video" = "video"; // Default

      // 1. DETERMINE MEDIA TYPE FROM URL IF NO FILE
      if (!file && videoUrl) {
        const isImageUrl = /\.(jpeg|jpg|gif|png|webp)$/i.test(videoUrl);
        mediaType = isImageUrl ? "image" : "video";
      }

      // 2. FILE UPLOAD LOGIC
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        // Correctly detect type from the file itself
        mediaType = file.type.startsWith("image") ? "image" : "video";

        const { error: uploadError } = await supabase
          .storage
          .from(BUCKET)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase
          .storage
          .from(BUCKET)
          .getPublicUrl(fileName);

        finalUrl = publicData.publicUrl;
      }

      if (!finalUrl) throw new Error("Provide a link or upload a file");

      const payload = {
        name: name.trim(),
        // If it's a video, put URL in video_url, else keep it for compatibility
        video_url: finalUrl, 
        media_url: finalUrl,
        media_type: mediaType
      };

      // 3. DATABASE OPERATION
      if (editingItem) {
        const { error } = await supabase
          .from("influencers_videos")
          .update(payload)
          .eq("id", editingItem.id);

        if (error) throw error;
        showToast("Asset updated successfully", "success");
      } else {
        const { error } = await supabase
          .from("influencers_videos")
          .insert([payload]);

        if (error) throw error;
        showToast("Asset published successfully", "success");
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Save failed", "error");
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
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-white border-green-500 text-slate-800' : 'bg-red-600 border-red-700 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="text-green-600" size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-black uppercase tracking-tight">{toast.msg}</span>
        </div>
      )}

      {/* BANNER */}
      <div className="bg-yellow-300 pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
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
            </div>
            <button onClick={openAddModal} className="bg-black hover:bg-red-600 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 group">
              <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
              Upload Content
            </button>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-xl">
            <RefreshCw className="animate-spin text-red-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((item) => (
              <div key={item.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  {item.media_type === "image" ? (
                    <img src={item.media_url} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-all duration-700" />
                  ) : (
                    <video src={item.media_url} muted loop autoPlay playsInline className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-all duration-700" />
                  )}
                  
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => openEditModal(item)} className="w-10 h-10 bg-white text-slate-900 rounded-lg flex items-center justify-center hover:bg-black hover:text-white transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => deleteItem(item.id)} className="w-10 h-10 bg-white text-red-600 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-slate-900 uppercase italic truncate">{item.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{item.media_type} Asset</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="bg-yellow-300 p-8 flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">{editingItem ? "Edit Asset" : "New Upload"}</h3>
              <button onClick={() => setShowModal(false)} className="bg-black text-white p-2 rounded-xl"><X size={20} /></button>
            </div>

            <div className="p-10 space-y-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Influencer Name"
                className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl focus:border-red-600 outline-none font-bold"
              />

              <input
                type="text"
                value={videoUrl}
                onChange={(e) => { setVideoUrl(e.target.value); if (e.target.value) setFile(null); }}
                disabled={!!file}
                placeholder="External Link (Video or Image)"
                className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl focus:border-red-600 outline-none font-bold disabled:opacity-30"
              />

              <div
                onClick={() => document.getElementById('talFile')?.click()}
                className={`h-32 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-red-600 bg-red-50' : 'border-slate-100 bg-slate-50'}`}
              >
                {file ? <p className="text-[10px] font-black uppercase text-red-600">{file.name}</p> : <p className="text-[10px] font-black uppercase text-slate-400">Upload Video or Photo</p>}
                <input id="talFile" type="file" accept="video/*,image/*" className="hidden" onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  if (e.target.files?.[0]) setVideoUrl("");
                }} />
              </div>

              <button
                onClick={handleSave}
                disabled={actionLoading}
                className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3"
              >
                {actionLoading && <RefreshCw className="animate-spin" size={18} />}
                {editingItem ? "Update Asset" : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}