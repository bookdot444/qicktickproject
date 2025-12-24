"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Video, Camera, Building2, Trash2, 
  Save, UploadCloud, ShieldCheck, 
  MapPin, Briefcase, User, ExternalLink, Loader2,
  ChevronRight, Sparkles, Globe, Zap, Crown
} from "lucide-react";

export default function VendorProfile() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
const [subscriptionPlan, setSubscriptionPlan] = useState<
  "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond"
>("Bronze");

  // Profile States
  const [email, setEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [userType, setUserType] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessKeywords, setBusinessKeywords] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [videoFiles, setVideoFiles] = useState<string[]>([]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("vendor_register")
        .select("*")
        .eq("email", user.email)
        .single();

      if (error) throw error;

      if (data) {
        setVendorId(data.id);
        setEmail(data.email);
        setOwnerName(data.owner_name || "");
        setMobileNumber(data.mobile_number || "");
        setAlternateNumber(data.alternate_number || "");
        setGstNumber(data.gst_number || "");
        setCity(data.city || "");
        setState(data.state || "");
        setPincode(data.pincode || "");
        setCompanyName(data.company_name || "");
        setWebsite(data.website || "");
        setUserType(data.sector || "");
        setBusinessType(data.business_type || "");
        setBusinessKeywords(data.business_keywords || "");
        setLogo(data.company_logo);
        setMediaFiles(data.media_files || []);
        setVideoFiles(data.video_files || []);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'logo') setLogo(base64String);
      else setMediaFiles(prev => [...prev, base64String]);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    if (!vendorId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("vendor_register")
        .update({
          owner_name: ownerName,
          mobile_number: mobileNumber,
          alternate_number: alternateNumber,
          gst_number: gstNumber,
          city,
          state,
          pincode,
          company_name: companyName,
          website,
          sector: userType,
          business_type: businessType,
          business_keywords: businessKeywords,
          company_logo: logo,
          media_files: mediaFiles,
          video_files: videoFiles,
        })
        .eq("id", vendorId);

      if (error) throw error;
      alert("Profile successfully updated!");
    } catch (err: any) {
      alert("Error updating profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full p-4 bg-white/50 border border-amber-200 rounded-2xl focus:ring-4 focus:ring-red-500/5 focus:border-red-500 focus:bg-white outline-none transition-all text-slate-800 text-sm font-semibold shadow-sm shadow-amber-900/5";
  const labelClass = "block text-[10px] font-bold text-amber-700/60 mb-1.5 uppercase tracking-widest ml-1";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBEB]">
        <div className="relative">
            <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-amber-400 rounded-full animate-pulse" />
            </div>
        </div>
        <p className="font-black text-amber-900 uppercase tracking-widest text-xs mt-6">Optimizing your Workspace...</p>
      </div>
    );
  }
  const planStyles: Record<string, {
  bg: string;
  border: string;
  icon: string;
}> = {
  Bronze: {
    bg: "bg-[#CD7F32]/10",
    border: "border-[#CD7F32]",
    icon: "text-[#CD7F32]",
  },
  Silver: {
    bg: "bg-slate-200",
    border: "border-slate-400",
    icon: "text-slate-500",
  },
  Gold: {
    bg: "bg-amber-100",
    border: "border-amber-400",
    icon: "text-amber-500",
  },
  Platinum: {
    bg: "bg-cyan-100",
    border: "border-cyan-400",
    icon: "text-cyan-500",
  },
  Diamond: {
    bg: "bg-violet-100",
    border: "border-violet-500",
    icon: "text-violet-600",
  },
};
const subscriptionCardStyles: Record<string, {
  gradient: string;
  crown: string;
  zap: string;
  progress: string;
}> = {
  Bronze: {
    gradient: "from-[#CD7F32] to-[#b87333]",
    crown: "text-white/20",
    zap: "text-[#CD7F32]",
    progress: "bg-[#CD7F32]",
  },
  Silver: {
    gradient: "from-slate-300 to-slate-400",
    crown: "text-white/30",
    zap: "text-slate-600",
    progress: "bg-slate-500",
  },
  Gold: {
    gradient: "from-amber-400 to-yellow-300",
    crown: "text-white/30",
    zap: "text-amber-600",
    progress: "bg-amber-500",
  },
  Platinum: {
    gradient: "from-cyan-400 to-sky-300",
    crown: "text-white/30",
    zap: "text-cyan-700",
    progress: "bg-cyan-600",
  },
  Diamond: {
    gradient: "from-violet-500 to-fuchsia-400",
    crown: "text-white/40",
    zap: "text-violet-700",
    progress: "bg-violet-500",
  },
};
const cardStyle = subscriptionCardStyles[subscriptionPlan] ?? subscriptionCardStyles.Bronze;


const planStyle = planStyles[subscriptionPlan];

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-8 px-4 md:px-8 font-sans selection:bg-red-100 selection:text-red-700">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Navigation Bar */}
        <header className="mb-10 flex items-center justify-between bg-white/70 backdrop-blur-md p-4 rounded-[2rem] border border-amber-100 shadow-xl shadow-amber-900/5">
            <div className="flex items-center gap-4 ml-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-red-600 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                    <ShieldCheck className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="font-black text-xl tracking-tighter text-slate-900 uppercase leading-none">Vendor<span className="text-red-600">Sync</span></h2>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">Professional Panel</p>
                </div>
            </div>

            <div className="hidden md:flex gap-2">
                {["general", "business", "location", "media"].map((id) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === id ? "bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20" : "text-slate-400 hover:text-red-600 hover:bg-red-50"}`}
                    >
                        {id}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleUpdate}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50"
            >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18}/>}
                <span className="text-sm font-black uppercase tracking-tighter">{saving ? "Saving..." : "Update Profile"}</span>
            </button>
        </header>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          
          {/* Left Sidebar Info Card */}
          <aside className="space-y-6">
            {/* Main Profile Card */}
            <div className="bg-white rounded-[2.5rem] p-8 text-amber-950 shadow-2xl shadow-amber-900/5 relative overflow-hidden group border border-amber-100">
                <Sparkles className="absolute top-4 right-4 text-amber-300 w-12 h-12 opacity-50 group-hover:rotate-12 transition-transform" />
                <div className="relative z-10">
<div
  className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center shadow-xl border-4 overflow-hidden
  ${planStyle.bg} ${planStyle.border}`}
>
  {logo ? (
    <img src={logo} className="w-full h-full object-cover" />
  ) : (
    <Building2 className={`${planStyle.icon}`} size={32} />
  )}
</div>

                    <h3 className="text-2xl font-black leading-tight mb-2 truncate">{companyName || "No Name"}</h3>
                    <p className="text-amber-800/80 text-sm font-medium mb-6">Active Vendor Since 2024</p>
                    
                    <div className="space-y-4">
                        <div className="bg-amber-50 p-4 rounded-2xl flex items-center gap-3">
                            <Briefcase size={16} className="text-amber-600" />
                            <span className="text-xs font-bold uppercase">{userType || "N/A"}</span>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl flex items-center gap-3">
                            <MapPin size={16} className="text-amber-600" />
                            <span className="text-xs font-bold uppercase">{city || "Remote"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SUBSCRIPTION PLAN CARD */}
             <div
      className={`bg-gradient-to-br ${cardStyle.gradient} rounded-[2.5rem] p-6 text-white shadow-xl overflow-hidden relative`}
    >
      <Crown
        className={`absolute -bottom-4 -right-4 w-24 h-24 rotate-12 ${cardStyle.crown}`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full">
            Current Plan
          </span>
          <Zap size={16} className={cardStyle.zap} />
        </div>

        <h4 className="text-xl font-black uppercase tracking-tight mb-1">
          {subscriptionPlan} Plan
        </h4>

        <p className="text-white/70 text-[11px] font-bold mb-6">
          Renews on Oct 12, 2025
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span>Plan Usage</span>
            <span>75%</span>
          </div>

          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className={`${cardStyle.progress} h-full w-[75%] rounded-full shadow-lg`}
            />
          </div>
        </div>

        <button className="w-full bg-white text-slate-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-lg">
          Manage Subscription
        </button>
      </div>
    </div>

            {/* Navigation Tabs (Side) */}
            <nav className="bg-white rounded-[2rem] p-4 border border-amber-100 shadow-sm flex flex-col gap-2">
                {[
                    { id: "general", label: "Identity", icon: <User size={18}/> },
                    { id: "business", label: "Business", icon: <Briefcase size={18}/> },
                    { id: "location", label: "Presence", icon: <MapPin size={18}/> },
                    { id: "media", label: "Showcase", icon: <Camera size={18}/> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-red-50 text-red-600" : "text-slate-400 hover:bg-slate-50"}`}
                    >
                        <div className="flex items-center gap-3">{tab.icon} {tab.label}</div>
                        {activeTab === tab.id && <ChevronRight size={14} />}
                    </button>
                ))}
            </nav>
          </aside>

          {/* Main Edit Surface */}
          <main className="bg-white rounded-[3rem] border border-amber-100 shadow-2xl shadow-amber-900/5 p-8 md:p-12">
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              
              {activeTab === "general" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-8 p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100">
                    <div className="relative group cursor-pointer">
                      
                        <div
  className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center shadow-xl border-4 overflow-hidden
  ${planStyle.bg} ${planStyle.border}`}
>
  {logo ? (
    <img src={logo} className="w-full h-full object-cover" />
  ) : (
    <Building2 className={`${planStyle.icon}`} size={32} />
  )}
</div>

                        <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-red-700 transition-colors">
                             <Camera size={18} />
                             <input type="file" hidden onChange={(e) => handleFileUpload(e, 'logo')} accept="image/*" />
                        </label>
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900">Brand Identity</h4>
                        <p className="text-xs text-amber-700/60 font-bold uppercase tracking-widest mt-1">Recommended size: 512x512px</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Company Brand Name</label>
                      <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Owner / Manager</label>
                      <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>Contact Email (System Locked)</label>
                        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-slate-400">{email}</span>
                        </div>
                    </div>
                    <div>
                      <label className={labelClass}>Website Link</label>
                      <div className="relative">
                        <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass + " pl-12"} placeholder="https://" />
                        <Globe className="absolute left-4 top-4 text-amber-400" size={18} />
                      </div>
                    </div>
                    <div>
                        <label className={labelClass}>Public Status</label>
                        <div className="bg-red-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-red-600/10">
                            <span className="text-[10px] font-black uppercase tracking-widest">Profile Visibility</span>
                            <span className="text-xs font-black">LIVE</span>
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "business" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Expertise & Service Keywords</label>
                    <textarea value={businessKeywords} onChange={(e) => setBusinessKeywords(e.target.value)} className={inputClass + " min-h-[120px]"} />
                  </div>
                  <div>
                    <label className={labelClass}>Industry Sector</label>
                    <select value={userType} onChange={(e) => setUserType(e.target.value)} className={inputClass}>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Retailer">Retailer</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Legal Structure</label>
                    <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className={inputClass}>
                      <option value="Proprietorship">Proprietorship</option>
                      <option value="Private Ltd">Private Ltd</option>
                      <option value="Partnership">Partnership</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>GST Number</label>
                    <input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} className={inputClass + " uppercase font-mono"} />
                  </div>
                  <div>
                    <label className={labelClass}>Support Number</label>
                    <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className={inputClass} />
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 bg-amber-50 p-6 rounded-[2rem] mb-4">
                     <div className="flex items-center gap-4 text-amber-900 mb-2">
                        <MapPin size={24} />
                        <h4 className="font-black uppercase text-sm tracking-tighter">Operational Hub</h4>
                     </div>
                     <p className="text-xs text-amber-800/60 font-medium">Please ensure your city is accurate for regional search results.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Zip Code</label>
                    <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className={inputClass} />
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-8">
                  <div className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-amber-100 rounded-[3rem] bg-amber-50/30 group hover:border-red-400 transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                    <UploadCloud className="w-16 h-16 text-amber-200 group-hover:text-red-500 group-hover:scale-110 transition-all mb-4" />
                    <h5 className="text-sm font-black text-amber-900 uppercase tracking-widest">Portfolio Upload</h5>
                    <p className="text-[10px] text-amber-700/50 font-bold uppercase mt-2">Click to browse or drop images here</p>
                    <input type="file" hidden multiple onChange={(e) => handleFileUpload(e, 'gallery')} accept="image/*" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {mediaFiles.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-3xl overflow-hidden shadow-lg border-2 border-white transition-all hover:rotate-2">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== idx))} 
                          className="absolute inset-0 bg-red-600/90 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}