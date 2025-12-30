"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { 
  Loader2, RefreshCw, Search, X, Mail, Phone, MapPin, Tag,
  Briefcase, Globe, FileText, CheckCircle2, AlertCircle, 
  Building2, Hash, ExternalLink, Calendar, ShieldCheck, Activity
} from "lucide-react";

// --- Types ---
type Vendor = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  mobile_number: string | null;
  alternate_number: string | null;
  profile_info: string | null;
  company_name: string | null;
  business_type: string | null;
  media_files: string[] | null;
  status: string;
  subscription_plan: string | null;
  subscription_expiry: string | null;
  owner_name: string | null;
  gst_number: string | null;
  website: string | null;
  business_keywords: string | null;
  sector: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  company_logo: string | null;
  payment_id: string | null;
};

// --- Custom Hook ---
const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendor_register")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setVendors(data || []);
    setLoading(false);
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("vendor_register").update({ status: newStatus }).eq("id", id);
    if (!error) setVendors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
  };

  useEffect(() => { fetchVendors(); }, [fetchVendors]);
  return { vendors, loading, fetchVendors, updateStatus };
};

export default function VendorsPage() {
  const { vendors, loading, fetchVendors, updateStatus } = useVendors();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => vendors.filter(v => 
    `${v.company_name} ${v.email} ${v.gst_number} ${v.city}`.toLowerCase().includes(query.toLowerCase())
  ), [vendors, query]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* --- MASTER YELLOW BANNER --- */}
      <div className="bg-[#facc15] pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-300 rounded-full opacity-40 blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#e11d48]" size={20} />
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Administrative Portal</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                Vendor <span className="text-[#e11d48]">Database</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed italic">
                Strategic partner oversight. Auditing business compliance and marketplace integration.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[140px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Total Partners</p>
                <p className="text-3xl font-black text-[#e11d48]">{vendors.length}</p>
              </div>
              <button 
                onClick={fetchVendors} 
                className="bg-black hover:bg-red-600 text-white p-5 rounded-2xl transition-all shadow-2xl active:scale-95 group"
              >
                <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        
        {/* SEARCH BAR */}
        <div className="mb-10">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="SEARCH BY COMPANY, GST, OR REGION..."
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-red-600 outline-none shadow-xl shadow-slate-200/50 font-black text-xs uppercase tracking-[0.2em] transition-all"
              />
           </div>
        </div>

        {/* DATA GRID */}
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-300">Syncing database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(vendor => (
              <div key={vendor.id} className="bg-white rounded-[3rem] border border-slate-200 p-8 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-black rounded-2xl overflow-hidden relative border-4 border-slate-50 shadow-lg group-hover:scale-110 transition-transform">
                    <Image src={vendor.company_logo || "/placeholder-logo.png"} alt="Logo" fill className="object-cover" />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                    vendor.status === 'approved' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {vendor.status}
                  </div>
                </div>
                
                <h3 className="font-black text-slate-900 uppercase italic tracking-tighter text-xl mb-1 truncate">
                  {vendor.company_name || "Unidentified Corp"}
                </h3>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-1 w-1 rounded-full bg-red-600" />
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                    {vendor.sector || "General Sector"}
                  </p>
                </div>
                
                <div className="space-y-3 mb-8 text-slate-500 font-bold text-[11px] uppercase tracking-wide">
                   <div className="flex items-center gap-2 italic">
                     <MapPin size={14} className="text-slate-300" /> {vendor.city || 'GLOBAL'}, {vendor.state || 'IN'}
                   </div>
                   <div className="flex items-center gap-2 italic">
                     <Hash size={14} className="text-slate-300" /> {vendor.gst_number || 'GST NOT FILED'}
                   </div>
                </div>

                <button 
                  onClick={() => setSelectedVendor(vendor)}
                  className="mt-auto w-full py-4 bg-slate-900 text-[#facc15] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
                >
                  View Full Dossier
                </button>
              </div>
            ))}
          </div>
        )}

        {/* INSPECTION MODAL */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row relative shadow-2xl animate-in zoom-in duration-300">
              <button 
                onClick={() => setSelectedVendor(null)} 
                className="absolute right-8 top-8 z-20 p-3 bg-slate-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
              >
                <X size={24}/>
              </button>
              
              {/* SIDE PANEL: IDENTITY */}
              <div className="md:w-1/3 bg-[#facc15] p-12 flex flex-col items-center border-r border-black/5 overflow-y-auto">
                <div className="w-40 h-40 bg-white rounded-[3rem] shadow-2xl overflow-hidden mb-8 border-[6px] border-white relative">
                  <Image src={selectedVendor.company_logo || "/placeholder-logo.png"} alt="Logo" fill className="object-cover" />
                </div>
                <h2 className="text-3xl font-black text-black uppercase italic text-center leading-[0.9] mb-4 tracking-tighter">
                  {selectedVendor.company_name}
                </h2>
                <div className="px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-12 shadow-xl">
                  {selectedVendor.status}
                </div>
                
                <div className="w-full space-y-6 pt-10 border-t border-black/10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">Authorized Head</span>
                    <p className="text-sm font-black text-black uppercase italic tracking-tight">
                      {selectedVendor.first_name} {selectedVendor.last_name}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">Secure Email</span>
                    <p className="text-sm font-black text-black flex items-center gap-2">
                      <Mail size={14} className="text-red-600"/> {selectedVendor.email}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">Verified Digital Presence</span>
                    <a href={selectedVendor.website || '#'} target="_blank" className="text-sm font-black text-red-600 flex items-center gap-2 hover:underline italic">
                      <Globe size={14}/> {selectedVendor.website || "OFFLINE"}
                    </a>
                  </div>
                </div>
              </div>

              {/* MAIN PANEL: DETAILS */}
              <div className="md:w-2/3 p-12 overflow-y-auto bg-white flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-red-600"/> Compliance Registry
                    </h4>
                    <div className="space-y-5">
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Tax Identification (GST)</p>
                        <p className="text-lg font-black text-slate-900 tracking-tighter italic">
                          {selectedVendor.gst_number || "PENDING"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Industry Vertical</p>
                        <p className="text-lg font-black text-slate-900 tracking-tighter italic">
                          {selectedVendor.sector || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <MapPin size={16} className="text-red-600"/> Headquarters
                    </h4>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed mb-3 italic">{selectedVendor.address}</p>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      {selectedVendor.city}, {selectedVendor.state} <span className="text-red-600 ml-2"># {selectedVendor.pincode}</span>
                    </p>
                  </div>
                </div>

                <div className="mb-12">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-3 italic">Intellectual Tags</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedVendor.business_keywords?.split(',').map((kw, i) => (
                      <span key={i} className="px-5 py-2.5 bg-black text-[#facc15] text-[10px] font-black uppercase rounded-2xl border border-black italic">
                        {kw.trim()}
                      </span>
                    )) || <span className="text-slate-300 text-xs italic font-bold">NO KEYWORDS FILED</span>}
                  </div>
                </div>

                <div className="mb-12 flex-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-3 italic">Asset Portfolio</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedVendor.media_files?.map((img, i) => (
                      <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-sm hover:scale-105 transition-transform duration-500 bg-slate-100">
                        <img src={img} className="w-full h-full object-cover" alt="Portfolio Asset" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* STICKY ACTIONS */}
                <div className="flex gap-4 sticky bottom-0 bg-white/90 backdrop-blur-sm pt-8 border-t border-slate-100">
                  <button 
                    onClick={() => { updateStatus(selectedVendor.id, 'rejected'); setSelectedVendor(null); }} 
                    className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 italic"
                  >
                    Decline Partner
                  </button>
                  <button 
                    onClick={() => { updateStatus(selectedVendor.id, 'approved'); setSelectedVendor(null); }} 
                    className="flex-1 py-5 bg-black text-[#facc15] rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 italic"
                  >
                    <CheckCircle2 size={18}/> Authorize Partnership
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}