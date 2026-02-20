"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Video, Plus, Trash2, Pencil, X, Upload, RefreshCw,
  ShieldCheck, Globe, Briefcase, CheckCircle2,
  AlertCircle, TriangleAlert, Play
} from "lucide-react";

/* =======================
   TYPES
======================= */
type VendorVideo = {
  id: string; // For vendor, this is "vendor_id-index"
  real_id: string; // The actual DB UUID
  video_url: string;
  video_title: string;
  business_sector: string[];
  area?: string | null;
  legal_type?: string | null;
  source: "admin" | "vendor";
  vendor_name?: string | null;
  index?: number; // Used for vendor array manipulation
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VendorVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "admin" | "vendor">("all");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VendorVideo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VendorVideo | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    video_title: "",
    business_sector: [] as string[],
    area: "",
    legal_type: "",
  });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* =======================
      FETCH LOGIC
  ======================= */
  const fetchVideos = async () => {
    setFetchLoading(true);
    try {
      const { data: adminData } = await supabase.from("vendor_videos").select("*").order("created_at", { ascending: false });
      const { data: vendorData } = await supabase.from("vendor_register").select("id, company_name, video_files").not("video_files", "is", null);

      const adminVideos: VendorVideo[] = (adminData || []).map(v => ({
        ...v,
        real_id: v.id,
        source: "admin",
        business_sector: v.business_sector || []
      }));

      const vendorVideos: VendorVideo[] = [];
      vendorData?.forEach((vendor) => {
        (vendor.video_files || []).forEach((v: any, index: number) => {
          vendorVideos.push({
            id: `${vendor.id}-${index}`,
            real_id: vendor.id,
            index: index,
            video_url: v.url,
            video_title: v.title || "Company Showcase",
            business_sector: ["Vendor Upload"],
            vendor_name: vendor.company_name,
            source: "vendor",
          });
        });
      });

      let combined = [...adminVideos, ...vendorVideos];
      if (filter === "admin") combined = adminVideos;
      if (filter === "vendor") combined = vendorVideos;

      setVideos(combined);
    } catch (err) {
      showToast("Failed to fetch videos", "error");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, [filter]);

  /* =======================
      DELETE LOGIC (The Fix)
  ======================= */
  const processDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);

    try {
      // 1. DELETE FROM STORAGE
      // We extract the path after 'vendor-videos/'
      if (deleteTarget.video_url.includes("vendor-videos")) {
        const urlParts = deleteTarget.video_url.split("vendor-videos/");
        const filePath = urlParts[1]; // This is the actual filename in the bucket

        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("vendor-videos")
            .remove([filePath]);

          if (storageError) {
            console.error("Storage Deletion Error:", storageError);
            // We continue anyway; if the file is missing, we still want to clean the DB
          }
        }
      }

      // 2. DELETE FROM DATABASE
      if (deleteTarget.source === "admin") {
        // Direct deletion from the dedicated admin table
        const { error: dbError } = await supabase
          .from("vendor_videos")
          .delete()
          .eq("id", deleteTarget.real_id);

        if (dbError) throw dbError;
      } else {
        // Vendor logic: Update the array in vendor_register
        const { data: currentVendor, error: fetchError } = await supabase
          .from("vendor_register")
          .select("video_files")
          .eq("id", deleteTarget.real_id)
          .single();

        if (fetchError) throw fetchError;

        if (currentVendor?.video_files) {
          const updatedFiles = currentVendor.video_files.filter(
            (_: any, i: number) => i !== deleteTarget.index
          );

          const { error: updateError } = await supabase
            .from("vendor_register")
            .update({ video_files: updatedFiles.length > 0 ? updatedFiles : null })
            .eq("id", deleteTarget.real_id);

          if (updateError) throw updateError;
        }
      }

      showToast("Asset purged successfully", "success");
      fetchVideos(); // Refresh the list
    } catch (err: any) {
      console.error("Deletion Process Failed:", err);
      showToast(err.message || "Deletion failed. Check console.", "error");
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  /* =======================
      MODAL CONTROL
  ======================= */
  const openAddModal = () => {
    setEditing(null);
    setForm({
      video_title: "",
      business_sector: [],
      area: "",
      legal_type: "",
    });
    setFile(null);
    setShowModal(true);
  };

  /* =======================
      SAVE LOGIC
  ======================= */
  const handleSave = async () => {
    if (!form.video_title.trim()) { showToast("Title required", "error"); return; }
    setLoading(true);
    try {
      let videoUrl = editing?.video_url || "";
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        await supabase.storage.from("vendor-videos").upload(fileName, file);
        videoUrl = supabase.storage.from("vendor-videos").getPublicUrl(fileName).data.publicUrl;
      }

      const payload = {
        video_title: form.video_title,
        business_sector: form.business_sector,
        area: form.area || null,
        legal_type: form.legal_type || null,
        video_url: videoUrl,
      };

      if (editing) {
        await supabase.from("vendor_videos").update(payload).eq("id", editing.real_id);
      } else {
        await supabase.from("vendor_videos").insert([payload]);
      }

      setShowModal(false);
      fetchVideos();
      showToast("Saved successfully", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleSector = (s: string) => {
    setForm(prev => ({
      ...prev,
      business_sector: prev.business_sector.includes(s)
        ? prev.business_sector.filter(i => i !== s)
        : [...prev.business_sector, s]
    }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // 50 MB max
    if (selected.size > 50 * 1024 * 1024) {
      showToast(`File ${selected.name} is too large. Max size is 50MB.`, 'error');
      return;
    }

    setFile(selected);
  };
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-white border-green-500 text-slate-800' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="text-green-600" size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold uppercase">{toast.msg}</span>
        </div>
      )}


      {/* --- MASTER YELLOW BANNER --- */}
      <div className="bg-yellow-300 pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-400 rounded-full opacity-20 blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#e11d48]" size={20} />
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Asset Manager</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase  tracking-tighter leading-none">
                Vendor <span className="text-[#e11d48]">Videos</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed ">
                Broadcast and curate high-impact video assets. Filter through admin-uploaded or vendor-submitted media.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* SOURCE FILTER TABS */}
              <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-full border border-white/50 flex gap-1">
                {["all", "admin", "vendor"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${filter === f ? "bg-black text-white shadow-lg" : "text-red-900/60 hover:text-red-900"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button onClick={openAddModal} className="bg-red-600 hover:bg-black text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 group">
                <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                Add Video
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        {fetchLoading ? (
          <div className="flex justify-center py-32 bg-white rounded-[3rem] shadow-xl"><RefreshCw className="animate-spin text-red-600" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((v) => (
              <div key={v.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all">
                <div className="relative h-56 bg-black">
                  <video src={v.video_url} className="w-full h-full object-cover opacity-80" />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black uppercase border backdrop-blur-md ${v.source === 'admin' ? 'bg-blue-500/20 border-blue-400 text-blue-600' : 'bg-green-500/20 border-green-400 text-green-600'}`}>
                    {v.source}
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {v.source === 'admin' && (
                      <button onClick={() => { setEditing(v); setForm({ ...v, area: v.area || "", legal_type: v.legal_type || "" }); setShowModal(true); }} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                        <Pencil size={18} />
                      </button>
                    )}
                    <button onClick={() => setDeleteTarget(v)} className="w-10 h-10 bg-white text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black uppercase truncate">{v.video_title}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase mb-4">{v.vendor_name || "Admin Asset"}</p>
                  <div className="flex flex-wrap gap-2">
                    {v.business_sector.map(s => <span key={s} className="bg-slate-100 text-slate-500 text-[9px] px-3 py-1 rounded-lg font-black uppercase">{s}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden text-center">
            <div className="bg-red-600 p-10 text-white">
              <TriangleAlert size={48} className="mx-auto mb-4" />
              <h3 className="text-3xl font-black uppercase">Delete Asset?</h3>
              <p className="text-[10px] font-bold uppercase mt-2">{deleteTarget.video_title}</p>
            </div>
            <div className="p-8 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
              <button onClick={processDelete} disabled={loading} className="flex-1 py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center">
                {loading ? <RefreshCw className="animate-spin" size={16} /> : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="bg-yellow-300 p-8 flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase">{editing ? "Update Asset" : "New Asset"}</h3>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="p-10 space-y-6 overflow-y-auto max-h-[75vh]">
              <input type="text" value={form.video_title} onChange={(e) => setForm({ ...form, video_title: e.target.value })} placeholder="Video Title" className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold" />

              <div onClick={() => document.getElementById('videoFile')?.click()} className="h-44 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer bg-slate-50">
                {file ? <p className="text-xs font-black text-red-600">{file.name}</p> : <p className="text-[9px] font-black uppercase">Click to Upload Video</p>}
                <input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />              </div>

              <div className="flex flex-wrap gap-2">
                {["Manufacturer", "Industrial", "Distributor", "Retailer", "Service Provider"].map(s => (
                  <button key={s} onClick={() => toggleSector(s)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${form.business_sector.includes(s) ? "bg-black border-black text-white" : "bg-white border-slate-100 text-slate-400"}`}>
                    {s}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none" placeholder="Location" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
                <select className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none" value={form.legal_type} onChange={e => setForm({ ...form, legal_type: e.target.value })}>
                  <option value="">STANDARD</option>
                  <option value="llp">LLP</option>
                  <option value="private_ltd">PRIVATE LIMITED</option>
                </select>
              </div>

              <button onClick={handleSave} disabled={loading} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3">
                {loading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />} Save Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
