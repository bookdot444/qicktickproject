"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  UploadCloud,
  Trash2,
  Plus,
  X,
  RefreshCw,
  Edit3,
  Video,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon,
  FileVideo,
  FileCheck
} from "lucide-react";

export default function InfluencerUploadPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal & Form States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [name, setName] = useState("");
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
    setFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return showToast("Name is required", "error");
    if (!file && !editingItem) return showToast("Please select a file to upload", "error");

    setActionLoading(true);

    try {
      let finalUrl = editingItem?.media_url;
      let mediaType = editingItem?.media_type || "video";

      // FILE UPLOAD LOGIC
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${name.replace(/\s+/g, '_')}.${fileExt}`;
        mediaType = file.type.startsWith("image") ? "image" : "video";

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(fileName);

        finalUrl = publicData.publicUrl;
      }

      const payload = {
        name: name.trim(),
        media_url: finalUrl,
        media_type: mediaType,
        video_url: finalUrl // duplicate for compatibility
      };

      if (editingItem) {
        const { error } = await supabase.from("influencers_videos").update(payload).eq("id", editingItem.id);
        if (error) throw error;
        showToast("Updated successfully", "success");
      } else {
        const { error } = await supabase.from("influencers_videos").insert([payload]);
        if (error) throw error;
        showToast("Uploaded successfully", "success");
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = async (item: any) => {
    if (!confirm(`Permanently delete ${item.name}?`)) return;
    
    if (item.media_url.includes(BUCKET)) {
      const fileName = item.media_url.split('/').pop();
      await supabase.storage.from(BUCKET).remove([fileName]);
    }

    const { error } = await supabase.from("influencers_videos").delete().eq("id", item.id);
    if (!error) {
      showToast("Deleted", "success");
      fetchData();
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

      {/* HEADER */}
      <div className="bg-yellow-300 pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-red-900/60 font-black uppercase text-[10px] tracking-[0.3em]">
              <ShieldCheck size={20} className="text-[#e11d48]" />
              Secure Storage
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
              Influencer <span className="text-[#e11d48]">Uploads</span>
            </h1>
          </div>
          <button onClick={openAddModal} className="bg-black hover:bg-red-600 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 group">
            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
            Upload File
          </button>
        </div>
      </div>

      {/* MEDIA GRID */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-xl">
            <RefreshCw className="animate-spin text-red-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((item) => (
              <div key={item.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-square bg-slate-900 overflow-hidden">
                  {item.media_type === "image" ? (
                    <img src={item.media_url} className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                  ) : (
                    <video src={item.media_url} muted loop autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                  )}
                  
                  <div className="absolute top-4 left-4">
                     <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-2">
                        {item.media_type === "image" ? <ImageIcon size={12}/> : <Video size={12}/>}
                        {item.media_type}
                     </span>
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => deleteItem(item)} className="w-10 h-10 bg-white text-red-600 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-slate-900 uppercase italic truncate">{item.name}</h3>
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
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="bg-yellow-300 p-8 flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Native File Upload</h3>
              <button onClick={() => setShowModal(false)} className="bg-black text-white p-2 rounded-xl hover:bg-red-600 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-10 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Influencer Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-600 outline-none font-bold"
                />
              </div>

              <div
                onClick={() => document.getElementById('nativeUpload')?.click()}
                className={`h-52 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-red-600 bg-red-50' : 'border-slate-100 bg-slate-50 hover:bg-yellow-50'}`}
              >
                {file ? (
                   <div className="flex flex-col items-center text-center p-4">
                      <FileCheck className="text-green-600 mb-3" size={40}/>
                      <p className="text-[11px] font-black uppercase text-slate-700 truncate max-w-[250px]">{file.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB Ready</p>
                   </div>
                ) : (
                   <div className="text-center">
                      <UploadCloud size={50} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-[11px] font-black uppercase text-slate-400">Tap to browse files</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">Video or Image only</p>
                   </div>
                )}
                <input id="nativeUpload" type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>

              <button
                onClick={handleSave}
                disabled={actionLoading}
                className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                {actionLoading && <RefreshCw className="animate-spin" size={18} />}
                {actionLoading ? "Uploading to Bucket..." : "Start Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}