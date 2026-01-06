"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Video, 
  UploadCloud, 
  Trash2, 
  Play, 
  Plus, 
  X, 
  Film,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  TriangleAlert,
  ShieldCheck
} from "lucide-react";

export default function DigitalBranding() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVideos = async () => {
    setFetchLoading(true);
    const { data, error } = await supabase
      .from("digital_branding_videos")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) showToast("Failed to sync video assets", "error");
    setVideos(data || []);
    setFetchLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      if (video.videoWidth < video.videoHeight) {
        showToast("Only horizontal (landscape) videos allowed", "error");
        setFile(null);
        setPreviewUrl(null);
        e.target.value = "";
      } else {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
      }
    };
    video.src = URL.createObjectURL(selectedFile);
  };

  const openAddModal = () => {
    setEditingVideo(null);
    setTitle("");
    setFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { showToast("Title is required", "error"); return; }
    if (!editingVideo && !file) { showToast("Please select a horizontal video", "error"); return; }

    setLoading(true);
    try {
      let finalVideoUrl = editingVideo?.video_url || "";
      if (file) {
        const fileName = `branding-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from("branding-videos")
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("branding-videos").getPublicUrl(fileName);
        finalVideoUrl = data.publicUrl;
      }

      const payload = { title: title.trim(), video_url: finalVideoUrl };
      if (editingVideo) {
        await supabase.from("digital_branding_videos").update(payload).eq("id", editingVideo.id);
        showToast("Asset updated", "success");
      } else {
        await supabase.from("digital_branding_videos").insert(payload);
        showToast("Asset published", "success");
      }
      setShowModal(false);
      fetchVideos();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const processDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      await supabase.from("digital_branding_videos").delete().eq("id", deleteConfirm);
      showToast("Asset removed", "success");
      fetchVideos();
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
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
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Cinematic Identity</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                Digital <span className="text-[#e11d48]">Branding</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed italic">
                Manage high-definition motion assets. Only horizontal 16:9 formats are processed by the branding engine.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[120px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Total Assets</p>
                <p className="text-3xl font-black text-[#e11d48]">{videos.length}</p>
              </div>
              <button onClick={openAddModal} className="bg-red-600 hover:bg-black text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 group">
                <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                New Video
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((v) => (
              <div key={v.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-video bg-black overflow-hidden">
                  <video src={v.video_url} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()}/>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => { setEditingVideo(v); setTitle(v.title); setPreviewUrl(v.video_url); setShowModal(true); }} className="w-14 h-14 bg-white text-black rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 duration-300"><Video size={20} /></button>
                    <button onClick={() => setDeleteConfirm(v.id)} className="w-14 h-14 bg-white text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"><Trash2 size={20} /></button>
                  </div>
                </div>
                <div className="p-8">
                   <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter truncate">{v.title}</h3>
                   <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                        <Calendar size={14} className="text-red-600" /> {new Date(v.created_at).toLocaleDateString()}
                      </div>
                      <Film size={16} className="text-slate-200" />
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
              <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Remove Asset?</h3>
              <p className="text-red-100 text-[10px] font-bold uppercase mt-2 tracking-widest opacity-80">This action is permanent.</p>
            </div>
            <div className="p-8 flex gap-3">
               <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
               <button onClick={processDelete} className="flex-1 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-yellow-300 p-8 flex items-center justify-between border-b border-yellow-400 text-black">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">{editingVideo ? "Modify Clip" : "New Video Asset"}</h3>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Asset Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cinematic Reveal..." className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-600 outline-none font-bold text-slate-700" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Video File (Horizontal 16:9)</label>
                <div onClick={() => document.getElementById('videoFile')?.click()} className={`relative aspect-video border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${file ? 'border-red-600 bg-red-50' : 'border-slate-100 bg-slate-50 hover:bg-yellow-50'}`}>
                  {previewUrl ? (
                    <video src={previewUrl} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <UploadCloud className="text-slate-300 mx-auto mb-2" size={32} />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Landscape Video</p>
                    </div>
                  )}
                  <input id="videoFile" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Discard</button>
                <button onClick={handleSave} disabled={loading} className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                  {loading && <RefreshCw className="animate-spin" size={14} />}
                  {editingVideo ? "Update Asset" : "Deploy Video"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}