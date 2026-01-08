"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Video,
  UploadCloud,
  Trash2,
  Plus,
  X,
  Type,
  RefreshCw,
  Mic2,
  PlayCircle,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TriangleAlert
} from "lucide-react";

export default function PodcastAdminPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const BUCKET_NAME = "podcasts";

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPodcasts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("podcast_videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setVideos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPodcasts(); }, []);

  const openAddModal = () => {
    setEditingPodcast(null);
    setTitle("");
    setFile(null);
    setShowModal(true);
  };

  const openEditModal = (podcast: any) => {
    setEditingPodcast(podcast);
    setTitle(podcast.title);
    setFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return showToast("Title is required", "error");
    if (!editingPodcast && !file) return showToast("Please select a video file", "error");
    
    setActionLoading(true);

    try {
      let finalUrl = editingPodcast?.video_url || "";

      // 1. Handle File Upload if a new file is provided
      if (file) {
        const fileExt = file.name.split(".").pop();
        const cleanTitle = title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').toLowerCase();
        const fileName = `episodes/${Date.now()}_${cleanTitle}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        finalUrl = publicUrlData.publicUrl;
      }

      // 2. Persist to Database
      if (editingPodcast) {
        const { error: updateError } = await supabase
          .from("podcast_videos")
          .update({
            title: title.trim(),
            video_url: finalUrl
          })
          .eq("id", editingPodcast.id);

        if (updateError) throw updateError;
        showToast("Episode updated successfully", "success");
      } else {
        const { error: insertError } = await supabase
          .from("podcast_videos")
          .insert([{ title: title.trim(), video_url: finalUrl }]);

        if (insertError) throw insertError;
        showToast("Episode published to feed", "success");
      }

      setShowModal(false);
      setFile(null);
      setEditingPodcast(null);
      fetchPodcasts();
    } catch (err: any) {
      console.error("Save Error:", err);
      showToast(err.message || "Failed to save", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const processDelete = async () => {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      const videoToDelete = videos.find(v => v.id === deleteConfirm);

      if (videoToDelete?.video_url) {
        const urlParts = videoToDelete.video_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const folder = urlParts[urlParts.length - 2];
        
        // Only attempt storage deletion if it looks like a Supabase URL
        if (videoToDelete.video_url.includes(BUCKET_NAME)) {
          await supabase.storage
            .from(BUCKET_NAME)
            .remove([`${folder}/${fileName}`]);
        }
      }

      const { error } = await supabase
        .from("podcast_videos")
        .delete()
        .eq("id", deleteConfirm);

      if (error) throw error;
      showToast("Episode removed", "success");
      fetchPodcasts();
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setActionLoading(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">

      {/* TOAST NOTIFICATION */}
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
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Studio Uploads</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                Podcast <span className="text-[#e11d48]">Manager</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[120px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Total Episodes</p>
                <p className="text-3xl font-black text-[#e11d48]">{videos.length}</p>
              </div>
              <button onClick={openAddModal} className="bg-red-600 hover:bg-black text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 group">
                <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                Upload Episode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-xl">
            <RefreshCw className="animate-spin text-red-600" size={40} />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Feed...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div key={video.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative h-56 bg-slate-900 overflow-hidden">
                  <video src={video.video_url} className="w-full h-full object-cover opacity-60" muted />
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => openEditModal(video)} className="w-12 h-12 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-black hover:text-white shadow-xl transition-all">
                      <Edit3 size={20} />
                    </button>
                    <button onClick={() => setDeleteConfirm(video.id)} className="w-12 h-12 bg-white text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-red-600 rounded-lg text-[9px] text-white font-black uppercase flex items-center gap-2">
                    <Mic2 size={10} /> Native Audio
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter truncate">{video.title}</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Recorded: {new Date(video.created_at).toLocaleDateString()}</p>
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
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-red-600 p-8 flex flex-col items-center text-white text-center">
              <TriangleAlert size={40} className="mb-4" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Discard Episode?</h3>
            </div>
            <div className="p-8 flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
              <button onClick={processDelete} className="flex-1 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2">
                {actionLoading && <RefreshCw size={14} className="animate-spin" />} Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-yellow-300 p-8 flex items-center justify-between border-b border-yellow-400 text-black">
              <div>
                <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Broadcasting Console</p>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{editingPodcast ? "Edit Episode" : "Publish Broadcast"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center"><X size={20} /></button>
            </div>

            <div className="p-10 space-y-8">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  <Type size={12} className="text-red-600" /> Episode Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Future of Growth"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-600 outline-none font-bold text-slate-700"
                />
              </div>

              <div
                onClick={() => document.getElementById('podFile')?.click()}
                className={`relative h-48 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                  ${file ? 'border-red-600 bg-red-50' : 'border-slate-100 bg-slate-50 hover:bg-yellow-50'}`}
              >
                {file ? (
                  <div className="text-center">
                    <PlayCircle size={32} className="mx-auto text-red-600 mb-2" />
                    <p className="text-[11px] font-black text-red-700 px-4 uppercase tracking-tighter">{file.name}</p>
                    <p className="text-[9px] text-red-400 font-bold mt-1">Ready for upload</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud size={40} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Video File</p>
                    <p className="text-[8px] text-slate-300 mt-1 uppercase font-bold">MP4, MOV up to 50MB</p>
                  </div>
                )}
                <input id="podFile" type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]">Discard</button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading && <RefreshCw className="animate-spin" size={14} />}
                  {editingPodcast ? "Update Episode" : "Push to Feed"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}