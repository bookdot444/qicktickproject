"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Phone, MapPin, ShieldCheck, Star, Globe, Building2,
  User, Hash, ArrowLeft, Mail, Info, Layers,
  FileText, MessageSquare, Award, AlertCircle, Loader2, Film,
} from "lucide-react";

export default function VendorProfileDetail() {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileBySession = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Get the logged-in user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in to view your profile.");
      }

      // 2. Fetch from vendor_register using the logged-in user's email
      const { data, error: dbError } = await supabase
        .from("vendor_register")
        .select("*")
        .eq("email", user.email) // <--- This matches your provided method
        .single();

      if (dbError) throw dbError;
      if (!data) throw new Error("No vendor record found for this account.");

      setVendor(data);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileBySession();
  }, [fetchProfileBySession]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF5]">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
        <p className="font-black text-amber-900 uppercase tracking-widest text-xs">Loading Profile...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-6 max-w-sm">{error}</p>
        <button onClick={() => window.location.href = "/login"} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs">Log In</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-20">
      {/* HEADER SECTION */}
      <div className="bg-[#D80000] pt-12 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-black/5 -skew-x-12 translate-x-20" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Logo */}
            <div className="w-40 h-40 bg-white rounded-3xl p-4 shadow-2xl border-4 border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
              {vendor.company_logo ? (
                <img src={vendor.company_logo} className="w-full h-full object-contain" alt="Logo" />
              ) : (
                <Building2 size={50} className="text-slate-200" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4">
                <span className="bg-[#FFD700] text-black text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider">{vendor.subscription_plan || "Bronze"} Plan</span>
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-emerald-400" /> {vendor.status}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-none uppercase">{vendor.company_name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-white/80 text-sm font-bold uppercase tracking-wide">
                <div className="flex items-center gap-2"><MapPin size={18} className="text-[#FFD700]" /> {vendor.city}, {vendor.state}</div>
                <div className="flex items-center gap-2"><Award size={18} className="text-[#FFD700]" /> {vendor.sector}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: INFO */}
          {/* LEFT: INFO */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
              <SummaryItem label="Business" value={vendor.user_type} />
              <SummaryItem label="Sector" value={vendor.sector} />
              <SummaryItem label="GSTIN" value={vendor.gst_number || "N/A"} />
              <SummaryItem label="Zip" value={vendor.pincode} />
            </div>

            {/* Company Profile Section */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3"><Info className="text-[#D80000]" /> Company Profile</h2>
              <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-line mb-8">{vendor.profile_info || "No description provided."}</p>

              {/* Media Files Gallery */}
              {vendor.media_files && vendor.media_files.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <Layers size={14} className="text-[#D80000]" /> Portfolio Assets
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {vendor.media_files.map((img: string, idx: number) => (
                      <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group">
                        <img
                          src={img}
                          alt={`Media ${idx}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Files Section */}
              {vendor.video_files && vendor.video_files.length > 0 && (
                <div className="mt-10 pt-10 border-t border-slate-50">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <Film size={14} className="text-[#D80000]" /> Video Presentation
                  </h3>
                  <div className="space-y-3">
                    {vendor.video_files.map((vid: any, idx: number) => (
                      <a
                        key={idx}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#D80000] transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#D80000] group-hover:text-white transition-colors">
                            <Film size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase italic">Watch Video {idx + 1}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">External Link</p>
                          </div>
                        </div>
                        <div className="text-slate-300 group-hover:text-[#D80000] transition-colors">
                          <Globe size={16} />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {vendor.business_keywords && (
                <div className="mt-8 pt-8 border-t border-slate-50 flex flex-wrap gap-2">
                  {vendor.business_keywords.split(',').map((tag: string, i: number) => (
                    <span key={i} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider">#{tag.trim()}</span>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: CONTACT CARD */}
          {/* RIGHT: CONTACT CARD */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D80000] blur-[80px] opacity-40" />
              <h3 className="text-xl font-black mb-8 relative z-10 uppercase">Connect</h3>
              <div className="space-y-4 relative z-10">
                <a href={`tel:${vendor.mobile_number}`} className="w-full bg-[#D80000] hover:bg-white hover:text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3">
                  <Phone size={18} /> Call Now
                </a>
                <button onClick={() => window.location.href = `mailto:${vendor.email}`} className="w-full bg-white/10 border border-white/10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-white/20">
                  <MessageSquare size={18} /> Send Enquiry
                </button>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10 space-y-5 relative z-10">
                <SidebarItem icon={<User size={16} />} label="Owner" value={vendor.owner_name} />
                <SidebarItem icon={<Globe size={16} />} label="Website" value={vendor.website} isLink />

                {/* ADDED: Complete Address Section */}
                <div className="flex items-start gap-4">
                  <div className="text-[#FFD700] shrink-0 mt-1"><MapPin size={16} /></div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Complete Address</p>
                    <p className="text-xs font-black text-white leading-relaxed italic">
                      {vendor.address ? `${vendor.address}, ` : ""}
                      {vendor.city}, {vendor.state} - {vendor.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: any) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">{label}</p>
      <p className="text-xs font-black text-slate-800 truncate">{value || "N/A"}</p>
    </div>
  );
}

function SidebarItem({ icon, label, value, isLink }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-[#FFD700] shrink-0">{icon}</div>
      <div className="overflow-hidden">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" className="text-xs font-black text-white hover:text-[#FFD700] truncate block italic underline underline-offset-2">{value || "Visit Site"}</a>
        ) : (
          <p className="text-xs font-black text-white truncate">{value || "N/A"}</p>
        )}
      </div>
    </div>
  );
}