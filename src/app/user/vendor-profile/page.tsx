"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Phone, MapPin, ShieldCheck, Globe, Building2,
  User, Info, Layers, AlertCircle, Loader2,
  Film, Edit3, X, Save, Plus, Trash2,
  Image as ImageIcon, Briefcase, CreditCard,
  Calendar, Activity, Tag, Smartphone, ExternalLink, Zap,
  Play, Video, Link as LinkIcon, Navigation, Store
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorProfileDetail() {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProfileBySession = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please log in to view your profile.");

      const { data, error: dbError } = await supabase
        .from("vendor_register")
        .select(`
    *,
    subscription_plans (
      id,
      name,
      base_price,
      tax_percent,
      duration_months
    )
  `)
        .eq("email", user.email)
        .single();


      if (dbError) throw dbError;
      setVendor(data);
      setEditForm(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfileBySession(); }, [fetchProfileBySession]);

  // --- MEDIA HANDLERS ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' = 'image') => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // Basic validation
      if (type === 'video' && file.size > 50 * 1024 * 1024) { // 50MB Limit example
        alert("Video is too large. Please upload a file under 50MB.");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `portfolio/${vendor.id}/${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vendor-assets') // Ensure this matches the dashboard name exactly
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-assets')
        .getPublicUrl(filePath);

      if (type === 'video') {
        // Adding it to video_files array as an object consistent with your current structure
        setEditForm({
          ...editForm,
          video_files: [...(editForm.video_files || []), { url: publicUrl, title: file.name, type: 'upload' }]
        });
      } else {
        setEditForm({
          ...editForm,
          media_files: [...(editForm.media_files || []), publicUrl]
        });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const updated = editForm.media_files.filter((_: any, i: number) => i !== index);
    setEditForm({ ...editForm, media_files: updated });
  };

  const addVideoLink = () => {
    const url = prompt("Enter YouTube or Vimeo URL:");
    if (url) {
      const updatedVideos = [...(editForm.video_files || []), { url, title: "New Video" }];
      setEditForm({ ...editForm, video_files: updatedVideos });
    }
  };

  const removeVideo = (index: number) => {
    const updated = editForm.video_files.filter((_: any, i: number) => i !== index);
    setEditForm({ ...editForm, video_files: updated });
  };

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      const { error: updateError } = await supabase
        .from("vendor_register")
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          owner_name: editForm.owner_name,
          company_name: editForm.company_name,
          mobile_number: editForm.mobile_number,
          websites: editForm.websites,
          profile_info: editForm.profile_info,
          flat_no: editForm.flat_no,
          floor: editForm.floor,
          building: editForm.building,
          street: editForm.street,
          area: editForm.area,
          landmark: editForm.landmark,
          city: editForm.city,
          state: editForm.state,
          pincode: editForm.pincode,
          gst_number: editForm.gst_number,
          business_keywords: editForm.business_keywords,
          sector: editForm.sector,
          media_files: editForm.media_files,
          video_files: editForm.video_files,
        })
        .eq("id", vendor.id);

      if (updateError) throw updateError;
      setVendor(editForm);
      setIsEditing(false);
    } catch (err: any) { alert("Update failed: " + err.message); } finally { setIsSaving(false); }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
    }
    return url;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-yellow-500" size={40} /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold"><AlertCircle className="mr-2" /> {error}</div>;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-yellow-100 text-slate-900">

      {/* ================= EDIT MODAL (COMMAND CENTER) ================= */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-black/10"
            >
              <div className="p-6 bg-yellow-400 text-black flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black rounded-xl text-yellow-400"><Edit3 size={20} /></div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Command Center</h2>
                </div>
                <button onClick={() => setIsEditing(false)} className="bg-black text-white p-2 rounded-xl hover:scale-105 transition-all"><X size={20} /></button>
              </div>

              <div className="p-8 overflow-y-auto bg-slate-50 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* COL 1: IDENTITY */}
                <div className="space-y-6">
                  <SectionTitle icon={<User size={14} />} title="Identity & Contact" />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="First Name" value={editForm.first_name} onChange={(v: any) => setEditForm({ ...editForm, first_name: v })} />
                    <InputField label="Last Name" value={editForm.last_name} onChange={(v: any) => setEditForm({ ...editForm, last_name: v })} />
                  </div>
                  <InputField label="Mobile" value={editForm.mobile_number} onChange={(v: any) => setEditForm({ ...editForm, mobile_number: v })} />

                  <div className="pt-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between mb-2">Websites <button onClick={() => setEditForm({ ...editForm, websites: [...(editForm.websites || []), ""] })} className="text-yellow-600"><Plus size={14} /></button></label>
                    <div className="space-y-2">
                      {editForm.websites?.map((site: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input value={site} onChange={(e) => { const n = [...editForm.websites]; n[i] = e.target.value; setEditForm({ ...editForm, websites: n }) }} className="flex-1 bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold" placeholder="https://" />
                          <button onClick={() => setEditForm({ ...editForm, websites: editForm.websites.filter((_: any, idx: number) => idx !== i) })} className="text-red-500"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* COL 2: ADDRESS */}
                <div className="space-y-6">
                  <SectionTitle icon={<MapPin size={14} />} title="Location" />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Flat/Shop" value={editForm.flat_no} onChange={(v: any) => setEditForm({ ...editForm, flat_no: v })} />
                    <InputField label="Floor" value={editForm.floor} onChange={(v: any) => setEditForm({ ...editForm, floor: v })} />
                  </div>
                  <InputField label="Building" value={editForm.building} onChange={(v: any) => setEditForm({ ...editForm, building: v })} />
                  <InputField label="Street/Area" value={editForm.street} onChange={(v: any) => setEditForm({ ...editForm, street: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="City" value={editForm.city} onChange={(v: any) => setEditForm({ ...editForm, city: v })} />
                    <InputField label="Pincode" value={editForm.pincode} onChange={(v: any) => setEditForm({ ...editForm, pincode: v })} />
                  </div>
                </div>

                {/* COL 3: MEDIA (VIDEOS & IMAGES) */}
                <div className="space-y-6">
                  <SectionTitle icon={<Layers size={14} />} title="Media Portfolio" />

                  {/* Image Upload */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between items-center mb-3">Portfolio Images <label className="bg-yellow-400 p-1.5 rounded-lg cursor-pointer"><Plus size={14} /><input type="file" hidden onChange={handleFileUpload} accept="image/*" /></label></label>
                    <div className="grid grid-cols-4 gap-2">
                      {editForm.media_files?.map((img: string, i: number) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                          <img src={img} className="w-full h-full object-cover" />
                          <button onClick={() => removePhoto(i)} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Links */}
                  {/* Video Links & Uploads */}
                  <div className="pt-4 border-t border-slate-200">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between items-center mb-3">
                      Video Portfolio
                      <div className="flex gap-2">
                        {/* Existing Link Button */}
                        <button onClick={addVideoLink} className="bg-slate-200 text-slate-700 p-1.5 rounded-lg hover:bg-black hover:text-yellow-400 transition-colors">
                          <LinkIcon size={14} />
                        </button>

                        {/* NEW Upload Video Button */}
                        <label className="bg-black text-yellow-400 p-1.5 rounded-lg cursor-pointer hover:scale-105 transition-transform flex items-center justify-center">
                          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'video')}
                            accept="video/mp4,video/x-m4v,video/*"
                          />
                        </label>
                      </div>
                    </label>

                    <div className="space-y-2">
                      {editForm.video_files?.map((vid: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl">
                          {/* Distinguish between Link and Uploaded File */}
                          {vid.type === 'upload' ? <Film size={12} className="text-red-500" /> : <Play size={12} className="text-yellow-500" />}
                          <span className="text-[10px] font-bold truncate flex-1">
                            {vid.title || (vid.url || vid)}
                          </span>
                          <button onClick={() => removeVideo(i)} className="text-red-500 hover:bg-red-50 p-1 rounded-md">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {uploading && <p className="text-[9px] text-yellow-600 animate-pulse font-bold uppercase">Uploading high-quality media...</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t flex gap-3">
                <button onClick={handleUpdate} disabled={isSaving} className="flex-1 bg-black text-yellow-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={16} />} Update Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- VENDOR PROFILE HEADER (Registry Style) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-32 px-6 relative overflow-hidden border-b border-yellow-200">
        {/* Dot Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">

          <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-end flex-1">
            {/* 1. Tilted Logo Card (Left Side) */}
            <motion.div
              initial={{ opacity: 0, rotate: -3, scale: 0.9 }}
              animate={{ opacity: 1, rotate: -2, scale: 1 }}
              className="relative group flex-shrink-0"
            >
              <div className="w-48 h-48 bg-white rounded-[2.5rem] p-6 shadow-2xl border-2 border-yellow-100 flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-0 duration-500">
                {vendor.company_logo ? (
                  <img src={vendor.company_logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={70} className="text-yellow-100" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2 rounded-xl shadow-lg border-4 border-[#FEF3C7]">
                <ShieldCheck size={24} fill="currentColor" />
              </div>
            </motion.div>

            {/* 2. Vendor Info Section */}
            <div className="text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                <span className="bg-yellow-800 text-[#FFD700] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm">
                  {vendor.status || "Verified Vendor"}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/50 backdrop-blur-md border border-yellow-300 hover:border-yellow-500 hover:bg-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
                >
                  <Edit3 size={14} className="text-red-600" /> Edit Profile
                </button>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[0.85] uppercase mb-6"
              >
                {vendor.company_name.split(' ')[0]} <br />
                <span className="text-red-600 italic">
                  {vendor.company_name.split(' ').slice(1).join(' ') || "Enterprise"}
                </span>
              </motion.h1>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 bg-white/40 px-4 py-2 rounded-2xl border border-yellow-200/50">
                  <MapPin size={16} className="text-yellow-700" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">
                    {vendor.city}, {vendor.state}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/40 px-4 py-2 rounded-2xl border border-yellow-200/50">
                  <Zap size={16} className="text-red-600" fill="currentColor" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">
                    GST: {vendor.gst_number || "Verified"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --- 3. THE RIGHT SIDE ICON CARD --- */}
          <motion.div
            initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
            animate={{ opacity: 1, rotate: 5, scale: 1 }}
            className="hidden lg:block bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-yellow-100 relative"
          >
            {/* Decorative Badge on Right Icon */}
            <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
              Official Store
            </div>

            <div className="text-yellow-600">
              <Store size={80} strokeWidth={1.5} />
            </div>

            {/* Subtle bottom text for the card */}
            <div className="mt-4 text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Partner ID: {vendor.id?.slice(0, 8) || "Q-VENDOR"}</p>
            </div>
          </motion.div>

        </div>
      </div>
      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 pb-20 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT SIDE */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Sector" value={vendor.sector} icon={<Zap size={16} />} />
            <StatCard
              label="Account Type"
              value={
                Array.isArray(vendor.user_type) && vendor.user_type.length > 0 ? (
                  <div className="flex flex-col">
                    {vendor.user_type.map((type: string, i: number) => (
                      <span key={i}>{type}</span>
                    ))}
                  </div>
                ) : (
                  "Standard"
                )
              }
              icon={<User size={16} />}
            />


            <StatCard label="Established" value={new Date(vendor.created_at).getFullYear()} icon={<Calendar size={16} />} />
            <StatCard label="Status" value={vendor.status} icon={<Activity size={16} />} />
          </div>

          {/* Overview */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-400 rounded-2xl"><Info size={20} /></div>
              <h2 className="text-xl font-black uppercase italic">Executive Summary</h2>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed font-medium mb-8 whitespace-pre-line">{vendor.profile_info || "Premium business profile under review."}</p>
            {vendor.business_keywords && (
              <div className="flex flex-wrap gap-2 border-t pt-8">
                {vendor.business_keywords.split(',').map((tag: string, i: number) => (
                  <span key={i} className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest">#{tag.trim()}</span>
                ))}
              </div>
            )}
          </div>

          {/* VIDEO SHOWCASE */}
          {vendor.video_files && vendor.video_files.length > 0 && (
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-black rounded-2xl text-yellow-400"><Video size={20} /></div>
                <h2 className="text-xl font-black uppercase italic">Video Portfolio</h2>
              </div>
              {/* Updated Video Showcase in Main Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendor.video_files.map((video: any, i: number) => {
                  const videoUrl = video.url || video;
                  const isUploaded = videoUrl.includes('supabase.co'); // Simple check if it's your storage

                  return (
                    <div key={i} className="rounded-3xl overflow-hidden bg-black aspect-video shadow-lg border border-slate-100">
                      {isUploaded ? (
                        <video
                          src={videoUrl}
                          controls
                          className="w-full h-full"
                        />
                      ) : (
                        <iframe
                          className="w-full h-full"
                          src={getEmbedUrl(videoUrl)}
                          title={`Video ${i}`}
                          allowFullScreen
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* IMAGE SHOWCASE */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-slate-100 rounded-2xl"><ImageIcon size={20} /></div>
              <h2 className="text-xl font-black uppercase italic">Work Gallery</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {vendor.media_files?.map((img: string, i: number) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                  <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl space-y-8 border-t-[8px] border-yellow-400">
            <SidebarItem icon={<User size={20} />} label="Decision Maker" value={vendor.owner_name} />
            <SidebarItem icon={<Smartphone size={20} />} label="Contact Line" value={vendor.mobile_number} />

            {vendor.websites && vendor.websites.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Digital Presence</p>
                {vendor.websites.map((url: string, idx: number) => (
                  <a key={idx} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl hover:bg-yellow-400 hover:text-black transition-all group overflow-hidden">
                    <Globe size={18} className="text-yellow-400 group-hover:text-black" />
                    <span className="text-xs font-black truncate">{url.replace(/(^\w+:|^)\/\//, '')}</span>
                  </a>
                ))}
              </div>
            )}

            <div className="pt-8 border-t border-white/5">
              <p className="text-[10px] font-black text-yellow-400/50 uppercase tracking-widest mb-4">Location Details</p>
              <address className="not-italic text-sm font-bold text-white/80 leading-relaxed uppercase">
                {[vendor.flat_no, vendor.building].filter(Boolean).join(", ")}<br />
                {[vendor.street, vendor.area].filter(Boolean).join(", ")}<br />
                <span className="text-yellow-400 block mt-2 font-black text-lg">{vendor.city}, {vendor.state}</span>
                <span className="text-white/30 block tracking-widest">{vendor.pincode}</span>
              </address>
              <a href={`http://maps.google.com/?q=${encodeURIComponent(`${vendor.company_name} ${vendor.city}`)}`} target="_blank" className="mt-4 inline-flex items-center gap-2 text-[10px] font-black text-yellow-400 uppercase tracking-widest">
                <Navigation size={14} /> Get Directions
              </a>
            </div>

            <a href={`tel:${vendor.mobile_number}`} className="flex w-full bg-yellow-400 text-black py-5 rounded-2xl items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl">
              <Phone size={18} /> Call Now
            </a>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><ShieldCheck size={16} className="text-yellow-500" /> Trust Verification</h3>
            <AccountRow label="Verification" value={vendor.status} color={vendor.status === 'active' ? 'text-emerald-500' : 'text-orange-500'} />
            <AccountRow
              label="Plan"
              value={vendor.subscription_plans?.name || "Free"}
            />
            <AccountRow
              label="Renewal"
              value={vendor.subscription_expiry || "—"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function SectionTitle({ icon, title }: any) {
  return (
    <h3 className="text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border-b-2 border-yellow-400 pb-2">
      {icon} {title}
    </h3>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center md:text-left">
      <div className="text-yellow-500 mb-2 flex justify-center md:justify-start">
        {icon}
      </div>

      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
        {label}
      </p>

      {/* MUST be div, not p */}
      <div className="text-xs font-black text-black uppercase">
        {value || "---"}
      </div>
    </div>
  );
}


function SidebarItem({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-white/5 rounded-xl text-yellow-400 shrink-0">{icon}</div>
      <div className="overflow-hidden">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xs font-black truncate">{value || "Confidential"}</p>
      </div>
    </div>
  );
}

function AccountRow({ label, value, color = "text-black" }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="text-[10px] font-black text-slate-400 uppercase">{label}</div>
      <div className={`${color} text-[10px] font-black uppercase tracking-widest`}>{value || "N/A"}</div>
    </div>
  );
}

function InputField({ label, value, onChange }: any) {
  return (
    <div className="w-full">
      <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block ml-1">{label}</label>
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs focus:ring-2 focus:ring-yellow-400 outline-none transition-all" />
    </div>
  );
}