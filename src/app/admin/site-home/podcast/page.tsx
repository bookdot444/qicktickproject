"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Video, 
  UploadCloud, 
  Trash2, 
  Plus, 
  X, 
  Link,
  Type,
  RefreshCw,
  Mic2,
  PlayCircle,
  ExternalLink,
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
  const [videoUrl, setVideoUrl] = useState(""); 
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
    setVideoUrl("");
    setFile(null);
    setShowModal(true);
  };

const openEditModal = (podcast: any) => {
  console.log("Opening Modal for ID:", podcast.id); // Check console to see if ID is valid
  setEditingPodcast(podcast); 
  setTitle(podcast.title);
  setVideoUrl(podcast.video_url);
  setFile(null);
  setShowModal(true);
};

const handleSave = async () => {
  if (!title.trim()) return showToast("Title is required", "error");
  setActionLoading(true);
  
  // LOGIC: If we have a NEW file, use it. 
  // Else if we have a NEW URL in the input, use it. 
  // Otherwise, keep the OLD URL from the podcast we are editing.
  let finalUrl = videoUrl; 

  try {
    // 1. Handle File Upload (New File)
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      finalUrl = publicUrlData.publicUrl;
    }

    // 2. Double Check: If editing and finalUrl is empty (input cleared), 
    // fall back to the original URL so we don't save an empty string.
    if (editingPodcast && !finalUrl && !file) {
      finalUrl = editingPodcast.video_url;
    }

    if (!finalUrl) throw new Error("A video source (URL or File) is required");

    // 3. Persist to Database
   if (editingPodcast) {
  const targetId = editingPodcast.id; // Capture ID in a local variable
  console.log("Attempting update for ID:", targetId);

  const { data, error: updateError } = await supabase
    .from("podcast_videos")
    .update({ 
      title: title.trim(), 
      video_url: finalUrl 
    })
    .eq("id", targetId) // Use the local variable
    .select();

  if (updateError) throw updateError;
  
  // If data is empty here, it's 100% an RLS issue or the ID doesn't exist in the DB
  if (!data || data.length === 0) {
    throw new Error("Update failed: Row not found or Permission Denied (RLS).");
  }
  
  showToast("Episode updated successfully", "success");
}else {
      const { error: insertError } = await supabase
        .from("podcast_videos")
        .insert([{ title: title.trim(), video_url: finalUrl }]);

      if (insertError) throw insertError;
      showToast("Episode published to feed", "success");
    }

    // 4. Reset and Refresh
    setShowModal(false);
    setFile(null);
    setEditingPodcast(null);
    fetchPodcasts();
  } catch (err: any) {
    console.error("Supabase Save Error:", err);
    showToast(err.message || "Failed to save", "error");
  } finally {
    setActionLoading(false);
  }
};

  const processDelete = async () => {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      await supabase.from("podcast_videos").delete().eq("id", deleteConfirm);
      showToast("Episode removed", "success");
      fetchPodcasts();
    } finally {
      setActionLoading(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* TOAST NOTIFICATION */}
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
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Broadcast Studio</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                Podcast <span className="text-[#e11d48]">Manager</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed italic">
                Control the frequency. Upload studio episodes or link external sessions to the broadcast feed.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[120px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Total Episodes</p>
                <p className="text-3xl font-black text-[#e11d48]">{videos.length}</p>
              </div>
              <button onClick={openAddModal} className="bg-red-600 hover:bg-black text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 group">
                <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                New Episode
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
                  <video src={video.video_url} className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" muted />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PlayCircle className="text-white/20 group-hover:text-red-600 transition-colors" size={64} strokeWidth={1} />
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => openEditModal(video)} className="w-12 h-12 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-black hover:text-white shadow-xl transition-all">
                      <Edit3 size={20} />
                    </button>
                    <button onClick={() => setDeleteConfirm(video.id)} className="w-12 h-12 bg-white text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be') ? (
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-[#facc15] rounded-lg text-[9px] text-black font-black uppercase flex items-center gap-2">
                       <ExternalLink size={10} /> Link Origin
                    </div>
                  ) : (
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-red-600 rounded-lg text-[9px] text-white font-black uppercase flex items-center gap-2">
                       <Mic2 size={10} /> Native Audio
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter group-hover:text-red-600 transition-colors truncate">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Recorded: {new Date(video.created_at).toLocaleDateString()}
                    </p>
                    <Video size={14} className="text-slate-200" />
                  </div>
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
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Discard Episode?</h3>
              <p className="text-red-100 text-[10px] font-bold uppercase mt-2 tracking-widest opacity-80">This broadcast will be pulled from all feeds.</p>
            </div>
            <div className="p-8 flex gap-3">
               <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
               <button onClick={processDelete} className="flex-1 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                 {actionLoading && <RefreshCw size={14} className="animate-spin" />}
                 Confirm
               </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#facc15] p-8 flex items-center justify-between border-b border-yellow-400 text-black">
              <div>
                <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Broadcasting Console</p>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{editingPodcast ? "Edit Episode" : "Publish Broadcast"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors"><X size={20} /></button>
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

              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  <Link size={12} className="text-red-600" /> Source URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => { setVideoUrl(e.target.value); if (e.target.value) setFile(null); }}
                  disabled={!!file}
                  placeholder="Paste YouTube or Vimeo Link"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-600 outline-none font-bold text-slate-700 disabled:opacity-30"
                />
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase italic">Or Native Upload</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div 
                onClick={() => document.getElementById('podFile')?.click()}
                className={`relative h-32 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                  ${file ? 'border-red-600 bg-red-50' : 'border-slate-100 bg-slate-50 hover:bg-yellow-50'}`}
              >
                {file ? (
                  <div className="text-center">
                    <PlayCircle size={24} className="mx-auto text-red-600 mb-1" />
                    <p className="text-[10px] font-black text-red-700 truncate px-4 uppercase tracking-tighter">{file.name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Select Video File</p>
                  </div>
                )}
                <input id="podFile" type="file" accept="video/*" className="hidden" onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  if (e.target.files?.[0]) setVideoUrl("");
                }} />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black shadow-xl transition-all flex items-center justify-center gap-2"
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