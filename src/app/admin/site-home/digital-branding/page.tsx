"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Video, UploadCloud, Trash2, Plus, X, Film, Calendar, 
  RefreshCw, AlertCircle, CheckCircle2, TriangleAlert, ShieldCheck 
} from "lucide-react";

export default function DigitalBranding() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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

  // --- ADDED: Missing processDelete Function ---
  const processDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      // Find the video to get its URL for storage deletion
      const videoToDelete = videos.find(v => v.id === deleteConfirm);
      
      if (videoToDelete?.video_url) {
        // Extract filename from URL to delete from Storage
        const fileName = videoToDelete.video_url.split('/').pop();
        await supabase.storage
          .from("branding-videos")
          .remove([`branding/${fileName}`]);
      }

      const { error } = await supabase
        .from("digital_branding_videos")
        .delete()
        .eq("id", deleteConfirm);

      if (error) throw error;

      showToast("Asset removed successfully", "success");
      fetchVideos();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      if (video.videoWidth < video.videoHeight) {
        showToast("Error: Only 16:9 Landscape videos allowed", "error");
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

  const handleSave = async () => {
    if (!title.trim()) return showToast("Title is required", "error");
    if (!editingVideo && !file) return showToast("Please select a video file", "error");

    setLoading(true);
    setUploadProgress(10);
    try {
      let finalVideoUrl = editingVideo?.video_url || "";

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `branding/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("branding-videos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        setUploadProgress(60);

        const { data } = supabase.storage.from("branding-videos").getPublicUrl(filePath);
        finalVideoUrl = data.publicUrl;
      }

      const payload = { title: title.trim(), video_url: finalVideoUrl };

      if (editingVideo) {
        await supabase.from("digital_branding_videos").update(payload).eq("id", editingVideo.id);
        showToast("Asset updated successfully", "success");
      } else {
        await supabase.from("digital_branding_videos").insert(payload);
        showToast("New asset published", "success");
      }

      setUploadProgress(100);
      setTimeout(() => {
        setShowModal(false);
        setUploadProgress(0);
        fetchVideos();
      }, 500);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- FIXED: Video Play/Pause Helper ---
  const handleVideoHover = (e: React.MouseEvent<HTMLVideoElement>, shouldPlay: boolean) => {
    const video = e.currentTarget;
    if (shouldPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { /* Ignore interruption errors */ });
      }
    } else {
      video.pause();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-l-4 animate-in slide-in-from-right-10 ${toast.type === 'success' ? 'bg-white border-green-500 text-slate-800' : 'bg-red-600 border-red-800 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="text-green-500" size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-black uppercase tracking-tight">{toast.msg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-yellow-300 pt-16 pb-32 px-10 rounded-b-[4rem] shadow-sm relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-4 bg-black/5 w-fit px-4 py-1 rounded-full">
              <ShieldCheck className="text-red-600" size={14} />
              <span className="text-black text-[9px] font-black uppercase tracking-widest">Brand Control Center</span>
            </div>
            <h1 className="text-6xl font-black text-black uppercase italic tracking-tighter leading-[0.8]">
              Motion <br /> <span className="text-red-600">Branding</span>
            </h1>
          </div>
          
          <button 
            onClick={() => { setEditingVideo(null); setTitle(""); setFile(null); setPreviewUrl(null); setShowModal(true); }}
            className="group bg-black text-white px-10 py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-4 hover:bg-red-600 transition-all shadow-xl active:scale-95"
          >
            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
            Upload Asset
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-10 -mt-16 relative z-20">
        {fetchLoading ? (
          <div className="h-64 bg-white rounded-[3rem] flex items-center justify-center border border-slate-100 shadow-xl">
             <RefreshCw className="animate-spin text-red-600" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((v) => (
              <div key={v.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <video 
                    src={v.video_url} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                    muted 
                    onMouseOver={e => handleVideoHover(e, true)} 
                    onMouseOut={e => handleVideoHover(e, false)}
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingVideo(v); setTitle(v.title); setPreviewUrl(v.video_url); setShowModal(true); }} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-black hover:bg-black hover:text-white transition-colors"><Film size={18} /></button>
                    <button onClick={() => setDeleteConfirm(v.id)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter truncate">{v.title}</h3>
                  <div className="flex items-center gap-2 mt-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <Calendar size={12} className="text-red-500" />
                    {new Date(v.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal & Delete Confirmation UI Remains the Same... */}
      {/* Ensure the Delete button in the confirmation modal calls processDelete */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TriangleAlert size={32} />
              </div>
              <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Decommission Asset?</h4>
              <p className="text-slate-400 text-xs font-bold uppercase mb-8">This will permanently remove the video from the branding engine.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 font-black uppercase text-[10px] text-slate-400">Cancel</button>
                <button 
                  onClick={processDelete} 
                  disabled={loading}
                  className="flex-1 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  {loading && <RefreshCw className="animate-spin" size={12} />}
                  Delete
                </button>
              </div>
           </div>
        </div>
      )}
      
    {/* Multi-Column Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row divide-x divide-slate-100">
            
            {/* Left Column: Input */}
            <div className="flex-1 p-12">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Asset <span className="text-red-600">Details</span></h3>
                <button onClick={() => setShowModal(false)} className="md:hidden"><X /></button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Video Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="e.g. Summer Collection Reveal" className="w-full px-8 py-5 bg-slate-50 border-none rounded-3xl focus:ring-4 focus:ring-yellow-400/30 outline-none font-bold text-slate-700 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Configuration</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400">Aspect Ratio</p>
                      <p className="text-xs font-bold text-slate-900">16:9 Landscape</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400">Target Resolution</p>
                      <p className="text-xs font-bold text-slate-900">1080p+ recommended</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                 <button onClick={() => setShowModal(false)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Discard</button>
                 <button onClick={handleSave} disabled={loading} className="flex-[2] py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-black transition-all flex items-center justify-center gap-3">
                   {loading ? <RefreshCw className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                   {editingVideo ? "Update System" : "Deploy Asset"}
                 </button>
              </div>
            </div>

            {/* Right Column: Preview/Upload Area */}
            <div className="flex-1 bg-slate-50/50 p-12 flex flex-col items-center justify-center relative">
              <input id="vUpload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
              
              <div 
                onClick={() => document.getElementById('vUpload')?.click()}
                className={`w-full aspect-video rounded-[2.5rem] border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group ${previewUrl ? 'border-red-600' : 'border-slate-200 hover:border-yellow-400 bg-white hover:shadow-xl'}`}
              >
                {previewUrl ? (
                  <>
                    <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white text-[10px] font-black uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full">Change Video</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-yellow-300 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3 group-hover:rotate-12 transition-transform shadow-lg">
                      <UploadCloud className="text-black" size={28} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Video File</p>
                    <p className="text-[8px] text-slate-300 uppercase mt-1">MP4, WEBM or MOV</p>
                  </div>
                )}
              </div>

              {/* Upload Progress Bar */}
              {loading && (
                <div className="w-full mt-8 space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-red-600">
                    <span>Uploading to Bucket</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation (Same as before but with your red/black theme) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TriangleAlert size={32} />
              </div>
              <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Decommission Asset?</h4>
              <p className="text-slate-400 text-xs font-bold uppercase mb-8">This will permanently remove the video from the branding engine.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 font-black uppercase text-[10px] text-slate-400">Cancel</button>
                <button onClick={processDelete} className="flex-1 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] hover:bg-red-600 transition-all">Delete</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}