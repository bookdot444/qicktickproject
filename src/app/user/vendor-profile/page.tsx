"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Phone, MapPin, ShieldCheck, Globe, Building2,
  User, Info, Layers, MessageSquare, Award, 
  AlertCircle, Loader2, Film, Edit3, X, Save, 
  Plus, Trash2, Image as ImageIcon, Briefcase, 
  Hash, CreditCard, Calendar, Activity, Tag, Smartphone, ExternalLink
} from "lucide-react";

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
        .select("*")
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
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;
      const filePath = `portfolio/${vendor.id}/${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('vendor-assets').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('vendor-assets').getPublicUrl(filePath);
      setEditForm({ ...editForm, media_files: [...(editForm.media_files || []), publicUrl] });
    } catch (err: any) { alert(err.message); } finally { setUploading(false); }
  };

  const removePhoto = (index: number) => {
    const updated = editForm.media_files.filter((_: any, i: number) => i !== index);
    setEditForm({ ...editForm, media_files: updated });
  };

  const addVideoLink = () => {
    const url = prompt("Enter Video URL (YouTube or Vimeo):");
    if (url) {
      const updatedVideos = [...(editForm.video_files || []), { url }];
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
          alternate_number: editForm.alternate_number,
          website: editForm.website,
          profile_info: editForm.profile_info,
          address: editForm.address,
          city: editForm.city,
          state: editForm.state,
          pincode: editForm.pincode,
          gst_number: editForm.gst_number,
          business_keywords: editForm.business_keywords,
          sector: editForm.sector,
          business_type: editForm.business_type,
          user_type: editForm.user_type,
          media_files: editForm.media_files,
          video_files: editForm.video_files,
        })
        .eq("id", vendor.id);

      if (updateError) throw updateError;
      setVendor(editForm);
      setIsEditing(false);
    } catch (err: any) { alert("Update failed: " + err.message); } finally { setIsSaving(false); }
  };

  // Helper to extract YouTube Embed ID
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
    }
    return url;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]"><Loader2 className="animate-spin text-red-600" size={40} /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold"><AlertCircle className="mr-2"/> {error}</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-20">
      
      {/* ================= EDIT MODAL ================= */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
          <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-8 bg-[#D80000] text-white flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Profile Management Console</h2>
              <button onClick={() => setIsEditing(false)} className="bg-black/20 p-3 rounded-2xl hover:bg-black/40 transition-all"><X /></button>
            </div>

            <div className="p-8 md:p-12 overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* COLUMN 1: CONTACT & IDENTITY */}
                <div className="space-y-8">
                  <SectionTitle icon={<User size={14}/>} title="Owner Identity" />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="First Name" value={editForm.first_name} onChange={(v:any) => setEditForm({...editForm, first_name: v})} />
                    <InputField label="Last Name" value={editForm.last_name} onChange={(v:any) => setEditForm({...editForm, last_name: v})} />
                  </div>
                  <InputField label="Owner Public Name" value={editForm.owner_name} onChange={(v:any) => setEditForm({...editForm, owner_name: v})} />
                  <InputField label="Mobile Number" value={editForm.mobile_number} onChange={(v:any) => setEditForm({...editForm, mobile_number: v})} />
                  <InputField label="Alternate Number" value={editForm.alternate_number} onChange={(v:any) => setEditForm({...editForm, alternate_number: v})} />
                </div>

                {/* COLUMN 2: BUSINESS DETAILS */}
                <div className="space-y-8">
                  <SectionTitle icon={<Briefcase size={14}/>} title="Company Assets" />
                  <InputField label="Company Name" value={editForm.company_name} onChange={(v:any) => setEditForm({...editForm, company_name: v})} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Sector" value={editForm.sector} onChange={(v:any) => setEditForm({...editForm, sector: v})} />
                    <InputField label="Business Type" value={editForm.business_type} onChange={(v:any) => setEditForm({...editForm, business_type: v})} />
                  </div>
                  <InputField label="GST Number" value={editForm.gst_number} onChange={(v:any) => setEditForm({...editForm, gst_number: v})} />
                  <InputField label="Search Keywords" value={editForm.business_keywords} onChange={(v:any) => setEditForm({...editForm, business_keywords: v})} />
                  
                  <div className="pt-4 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-400">Location Info</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <InputField label="City" value={editForm.city} onChange={(v:any) => setEditForm({...editForm, city: v})} />
                      <InputField label="State" value={editForm.state} onChange={(v:any) => setEditForm({...editForm, state: v})} />
                      <InputField label="Zip" value={editForm.pincode} onChange={(v:any) => setEditForm({...editForm, pincode: v})} />
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: MEDIA & VIDEO */}
                <div className="space-y-8">
                  <SectionTitle icon={<ImageIcon size={14}/>} title="Media Library" />
                  
                  {/* Photo Upload */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between items-center mb-3">
                      Portfolio Photos
                      <span className="bg-red-600 text-white p-1 rounded cursor-pointer hover:bg-black">
                        <Plus size={12} /><input type="file" hidden onChange={handleFileUpload} accept="image/*" />
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {editForm.media_files?.map((img:string, i:number) => (
                        <div key={i} className="relative aspect-square group">
                          <img src={img} className="w-full h-full object-cover rounded-lg border" />
                          <button onClick={() => removePhoto(i)} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-lg transition-opacity"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Management */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between items-center mb-3">
                      Video Links
                      <button onClick={addVideoLink} className="bg-red-600 text-white p-1 rounded hover:bg-black"><Plus size={12} /></button>
                    </label>
                    <div className="space-y-2">
                      {editForm.video_files?.map((vid: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2 border rounded-lg text-[10px] font-bold">
                          <span className="truncate max-w-[150px] italic">{vid.url}</span>
                          <button onClick={() => removeVideo(i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={12}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <InputField label="Company Bio" isTextArea rows={4} value={editForm.profile_info} onChange={(v:any) => setEditForm({...editForm, profile_info: v})} />
                </div>

              </div>
            </div>

            <div className="p-8 bg-white border-t flex gap-4 shrink-0">
              <button onClick={handleUpdate} disabled={isSaving} className="flex-1 bg-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[.3em] flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save All Database Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="bg-[#D80000] pt-12 pb-32 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="w-40 h-40 bg-white rounded-3xl p-4 shadow-2xl shrink-0 flex items-center justify-center">
            {vendor.company_logo ? <img src={vendor.company_logo} className="w-full h-full object-contain" /> : <Building2 size={50} className="text-slate-200" />}
          </div>
          <div className="flex-1 text-center md:text-left text-white">
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
              <span className="bg-[#FFD700] text-black text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider">{vendor.subscription_plan || "Free"} Plan</span>
              <span className="bg-black/30 text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider">{vendor.status}</span>
              <button onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-[10px] font-black uppercase flex items-center gap-2 transition-all"><Edit3 size={12}/> Edit Profile</button>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">{vendor.company_name}</h1>
            <p className="text-white/60 font-bold uppercase text-xs mt-3 tracking-[0.2em]">{vendor.sector} • {vendor.business_type}</p>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
            <SummaryItem label="Tax ID / GST" value={vendor.gst_number} />
            <SummaryItem label="Sector" value={vendor.sector} />
            <SummaryItem label="Pincode" value={vendor.pincode} />
            <SummaryItem label="Joined" value={new Date(vendor.created_at).toLocaleDateString()} />
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 uppercase italic text-slate-900"><Info className="text-red-600" /> Company Profile</h2>
            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line mb-8">{vendor.profile_info || "No description provided."}</p>
            
            {vendor.business_keywords && (
              <div className="flex flex-wrap gap-2 pt-6 border-t">
                {vendor.business_keywords.split(',').map((tag: string, i: number) => (
                  <span key={i} className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg text-[9px] font-black border uppercase">#{tag.trim()}</span>
                ))}
              </div>
            )}
          </div>

          {/* VIDEO SHOWCASE SECTION */}
          {vendor.video_files?.length > 0 && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2"><Film size={14} className="text-red-600"/> Video Presentations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendor.video_files.map((vid: any, i: number) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                      <iframe 
                        className="w-full h-full"
                        src={getEmbedUrl(vid.url)}
                        title={`Video ${i + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <a href={vid.url} target="_blank" className="text-[10px] font-black text-slate-400 flex items-center gap-2 hover:text-red-600 transition-colors uppercase italic">
                      <ExternalLink size={12}/> View Original Source
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Media */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Layers size={14} className="text-red-600"/> Image Portfolio</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vendor.media_files?.map((img:string, i:number) => (
                  <img key={i} src={img} className="aspect-square object-cover rounded-2xl border bg-slate-50 hover:brightness-75 transition-all cursor-zoom-in" alt="Portfolio" />
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 blur-[80px] opacity-20" />
            <h3 className="text-xl font-black uppercase italic text-[#FFD700] relative z-10">Direct Contact</h3>
            
            <div className="space-y-5 relative z-10">
              <SidebarItem icon={<User size={16}/>} label="Owner / Rep" value={vendor.owner_name || `${vendor.first_name} ${vendor.last_name}`} />
              <SidebarItem icon={<Phone size={16}/>} label="Primary Line" value={vendor.mobile_number} />
              <SidebarItem icon={<Smartphone size={16}/>} label="Alternate Line" value={vendor.alternate_number} />
              <SidebarItem icon={<Globe size={16}/>} label="Corporate Web" value={vendor.website} isLink />
            </div>
            
            <div className="pt-8 border-t border-white/10 relative z-10">
               <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Headquarters</p>
               <p className="text-xs font-black italic text-white/90 leading-relaxed uppercase">
                 {vendor.address}<br/>{vendor.city}, {vendor.state} - {vendor.pincode}
               </p>
            </div>

            <a href={`tel:${vendor.mobile_number}`} className="flex w-full bg-red-600 py-4 rounded-2xl items-center justify-center gap-3 font-black uppercase text-xs tracking-[.2em] hover:bg-white hover:text-black transition-all shadow-xl">
              <Phone size={18}/> Initiate Call
            </a>
          </div>

          {/* SYSTEM INFO */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Billing & Compliance</h3>
            <AccountRow icon={<Activity size={14}/>} label="Status" value={vendor.status} color={vendor.status === 'active' ? 'text-emerald-500' : 'text-orange-500'} />
            <AccountRow icon={<Tag size={14}/>} label="Plan Tier" value={vendor.subscription_plan} />
            <AccountRow icon={<Calendar size={14}/>} label="Renewal Date" value={vendor.subscription_expiry} />
            <AccountRow icon={<CreditCard size={14}/>} label="Last Payment" value={vendor.payment_id} />
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Helper Components
function SectionTitle({ icon, title }: any) {
  return (
    <h3 className="text-red-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-2 border-red-100">
      {icon} {title}
    </h3>
  );
}

function SummaryItem({ label, value }: any) {
  return (
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xs font-black text-slate-800 uppercase truncate">{value || "---"}</p>
    </div>
  );
}

function SidebarItem({ icon, label, value, isLink }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-[#FFD700] shrink-0">{icon}</div>
      <div className="overflow-hidden">
        <p className="text-[9px] font-bold text-white/40 uppercase mb-0.5">{label}</p>
        {isLink ? (
          <a href={value?.startsWith('http') ? value : `https://${value}`} target="_blank" className="text-xs font-black hover:text-[#FFD700] underline italic truncate block decoration-red-600">{value || "None"}</a>
        ) : (
          <p className="text-xs font-black truncate">{value || "N/A"}</p>
        )}
      </div>
    </div>
  );
}

function AccountRow({ icon, label, value, color = "text-slate-800" }: any) {
  return (
    <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-50 pb-2">
      <div className="flex items-center gap-2 text-slate-400 uppercase">{icon} {label}</div>
      <div className={`${color} uppercase font-black`}>{value || "---"}</div>
    </div>
  );
}

function InputField({ label, value, onChange, isTextArea, rows = 3 }: any) {
  return (
    <div className="w-full">
      <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">{label}</label>
      {isTextArea ? (
        <textarea rows={rows} value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-red-600 outline-none shadow-sm transition-all" />
      ) : (
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-red-600 outline-none shadow-sm transition-all" />
      )}
    </div>
  );
}