"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Award, 
  UploadCloud, 
  Trash2, 
  Plus, 
  X, 
  Type,
  Edit3,
  RefreshCw,
  FileBadge,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TriangleAlert
} from "lucide-react";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingCert, setEditingCert] = useState<any | null>(null);
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

  const fetchCertificates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .order("id", { ascending: false });
    setCertificates(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCertificates(); }, []);

  const openAddModal = () => {
    setEditingCert(null);
    setName("");
    setFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEditModal = (cert: any) => {
    setEditingCert(cert);
    setName(cert.name);
    setFile(null);
    setPreviewUrl(cert.image_url);
    setShowModal(true);
  };

  const handleSave = async () => {
  if (!name.trim()) { showToast("Name is required", "error"); return; }
  if (!editingCert && !file) { showToast("Certificate image is required", "error"); return; }
  
  setActionLoading(true);

  try {
    let finalImageUrl = editingCert?.image_url || "";

    if (file) {
      // Create a unique path: vault/17123456789-award.png
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${name.replace(/\s+/g, '_').toLowerCase()}.${fileExt}`;
      const filePath = `vault/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("certificates")
        .getPublicUrl(filePath);
        
      finalImageUrl = urlData.publicUrl;
    }

    // Database Payload
    const payload = { name: name.trim(), image_url: finalImageUrl };
    
    if (editingCert) {
      await supabase.from("certificates").update(payload).eq("id", editingCert.id);
      showToast("Certificate updated", "success");
    } else {
      await supabase.from("certificates").insert(payload);
      showToast("Certificate published", "success");
    }

    setShowModal(false);
    fetchCertificates();
  } catch (error: any) {
    showToast(error.message || "Operation failed", "error");
  } finally {
    setActionLoading(false);
  }
};

  const commitToDatabase = async (imageUrl: string) => {
    if (editingCert) {
      await supabase.from("certificates").update({ name: name.trim(), image_url: imageUrl }).eq("id", editingCert.id);
      showToast("Certificate updated", "success");
    } else {
      if (!imageUrl) throw new Error("Image asset is required");
      await supabase.from("certificates").insert({ name: name.trim(), image_url: imageUrl });
      showToast("Certificate published", "success");
    }
    setShowModal(false);
    fetchCertificates();
    setActionLoading(false);
  };

  const processDelete = async () => {
  if (!deleteConfirm) return;
  setActionLoading(true);
  try {
    const cert = certificates.find(c => c.id === deleteConfirm);
    
    if (cert?.image_url) {
      // Extract fileName from URL
      const fileName = cert.image_url.split('/').pop();
      await supabase.storage.from("certificates").remove([`vault/${fileName}`]);
    }

    await supabase.from("certificates").delete().eq("id", deleteConfirm);
    showToast("Removed from vault", "success");
    fetchCertificates();
  } catch (error) {
    showToast("Delete failed", "error");
  } finally {
    setActionLoading(false);
    setDeleteConfirm(null);
  }
};
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* TOAST SYSTEM */}
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
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Credential System</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                Official <span className="text-[#e11d48]">Certificates</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed italic">
                Manage brand-authorized digital credentials. Changes published here affect the public verification portal.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[120px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Vault Assets</p>
                <p className="text-3xl font-black text-[#e11d48]">{certificates.length}</p>
              </div>
              <button onClick={openAddModal} className="bg-red-600 hover:bg-black text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 group">
                <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                Add Certificate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DATA GRID */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-xl">
            <RefreshCw className="animate-spin text-red-600" size={40} />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Vault...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {certificates.map((cert) => (
              <div key={cert.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative h-64 bg-slate-50 overflow-hidden flex items-center justify-center">
                  {cert.image_url ? (
                    <img src={cert.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={cert.name} />
                  ) : (
                    <FileBadge size={48} className="text-slate-200" />
                  )}
                  
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button onClick={() => openEditModal(cert)} className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-xl active:scale-90">
                      <Edit3 size={20} />
                    </button>
                    <button onClick={() => setDeleteConfirm(cert.id)} className="w-12 h-12 bg-white text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-90">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3 bg-red-600 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vault ID: {cert.id}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight uppercase italic tracking-tighter group-hover:text-red-600 transition-colors">
                    {cert.name}
                  </h3>
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
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Remove Asset?</h3>
              <p className="text-red-100 text-[10px] font-bold uppercase mt-2 tracking-widest opacity-80">This certificate will no longer be verifiable.</p>
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

      {/* CREATION/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-yellow-300 p-8 flex items-center justify-between border-b border-yellow-400 text-black">
              <div>
                <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Asset Manager</p>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{editingCert ? "Modify Certificate" : "New Credential"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-10 space-y-8">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  <Type size={12} className="text-red-600" /> Certificate Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Master Distributor Award 2024"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-600 outline-none font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Visual Asset</label>
                <div 
                  onClick={() => document.getElementById('certFile')?.click()}
                  className={`relative h-56 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                    ${file ? 'border-red-600 bg-red-50' : 'border-slate-100 bg-slate-50 hover:bg-yellow-50'}`}
                >
                  {previewUrl ? (
                    <img src={previewUrl} className="h-full w-full object-contain p-6" alt="Preview" />
                  ) : (
                    <div className="text-center">
                      <UploadCloud size={40} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Certificate File</p>
                    </div>
                  )}
                  <input id="certFile" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const selected = e.target.files?.[0] || null;
                    setFile(selected);
                    if (selected) setPreviewUrl(URL.createObjectURL(selected));
                  }} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading && <RefreshCw className="animate-spin" size={14} />}
                  {editingCert ? "Update Changes" : "Publish Asset"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}