"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Eye, X, Calendar, Mail, MessageSquare,
  Search, RefreshCw, Loader2, Hash, User,
  ShieldCheck, ArrowRight, FileText, Layout
} from "lucide-react";

type VendorEnquiry = {
  id: string;
  vendor_id: string | null;
  vendor_email: string | null;
  subject: string;
  message: string;
  status: string | null;
  created_at: string | null;
};

export default function VendorEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<VendorEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VendorEnquiry | null>(null);
  const [search, setSearch] = useState("");

  const fetchEnquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendor_enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setEnquiries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEnquiries(); }, []);

  const filtered = useMemo(() => {
    return enquiries.filter(e =>
      (e.vendor_email || "").toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase())
    );
  }, [enquiries, search]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">

      {/* --- MASTER YELLOW BANNER --- */}
      <div className="bg-yellow-300 pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-300 rounded-full opacity-40 blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#e11d48]" size={20} />
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Vendor Relations Command</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                Supplier <span className="text-[#e11d48]">Briefs</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed italic">
                Active procurement signals. Auditing vendor communications and supply-chain inquiries.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[140px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Total Signals</p>
                <p className="text-3xl font-black text-[#e11d48]">{enquiries.length}</p>
              </div>
              <button 
                onClick={fetchEnquiries} 
                className="bg-black hover:bg-red-600 text-white p-5 rounded-2xl transition-all shadow-2xl active:scale-95 group"
              >
                <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        
        {/* SEARCH BAR */}
        <div className="mb-10">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={20} />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="DECODE VENDOR EMAIL OR SUBJECT LINE..."
                className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-red-600 outline-none shadow-xl shadow-slate-200/50 font-black text-xs uppercase tracking-[0.2em] transition-all"
              />
           </div>
        </div>

        {/* DATA TABLE CONTAINER */}
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendor Identity</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Inquiry Subject</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Logged On</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-32 text-center">
                      <Loader2 className="animate-spin text-red-600 mx-auto mb-4" size={40} />
                      <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-300">Syncing Supplier Data...</p>
                    </td>
                  </tr>
                ) : filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-yellow-400 font-black text-lg italic shadow-lg group-hover:scale-110 transition-transform">
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 leading-none mb-1 text-base uppercase italic tracking-tighter truncate max-w-[200px]">
                            {e.vendor_email || "Anonymous Vendor"}
                          </h4>
                          <span className="text-[10px] font-black text-red-600/60 uppercase tracking-tighter italic">External Partner</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Topic</span>
                        <span className="text-xs font-black text-slate-700 uppercase italic truncate max-w-[250px]">{e.subject}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Arrival Date</span>
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs italic">
                          <Calendar size={14} className="text-red-600" />
                          {e.created_at ? new Date(e.created_at).toLocaleDateString() : "PENDING"}
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-right">
                      <button 
                        onClick={() => setSelected(e)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-yellow-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
                      >
                        <Eye size={14} /> Open Brief
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- INSPECTION MODAL (DOSSIER VIEW) --- */}
      {selected && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300 flex flex-col md:flex-row h-[85vh] md:h-auto min-h-[500px]">
            
            {/* SIDE PANEL: VENDOR PROFILE */}
            <div className="md:w-1/3 bg-yellow-300 p-10 flex flex-col border-r border-black/5">
              <div className="mb-10">
                <div className="flex items-center gap-2 text-red-900/60 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                  <Hash size={14} /> {selected.id.slice(0, 8).toUpperCase()}
                </div>
                <h2 className="text-4xl font-black text-black uppercase italic leading-[0.8] tracking-tighter mb-4">
                  Vendor <br/><span className="text-[#e11d48]">Brief</span>
                </h2>
                <div className="w-12 h-1.5 bg-black rounded-full" />
              </div>

              <div className="space-y-8 mt-auto">
                <div className="bg-black/5 p-6 rounded-[2rem] border border-black/5">
                  <p className="text-[9px] font-black text-red-900 uppercase tracking-widest mb-2">Partner Channel</p>
                  <p className="text-lg font-black text-black italic tracking-tighter break-all leading-tight">{selected.vendor_email || "N/A"}</p>
                </div>
                
                <div className="flex items-center gap-4 px-2">
                  <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-yellow-400">
                    <Layout size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-red-900 uppercase tracking-widest">Database Status</p>
                    <p className="text-sm font-black text-black italic leading-none">{selected.status || "UNPROCESSED"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT: ENQUIRY DETAILS */}
            <div className="flex-1 p-12 overflow-y-auto bg-white flex flex-col">
              <button 
                className="absolute top-8 right-8 p-3 bg-slate-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all z-10"
                onClick={() => setSelected(null)}
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                  <FileText className="absolute -right-4 -bottom-4 text-slate-100 w-24 h-24 -rotate-12" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Mail size={16} className="text-red-600"/> Signal Meta
                  </h4>
                  <div className="space-y-4 relative z-10">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Subject Heading</p>
                      <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{selected.subject}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Scheduling Info</h4>
                  <div className="flex items-center gap-4">
                    <Calendar className="text-red-600" size={32} />
                    <div>
                      <p className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none">
                        {selected.created_at ? new Date(selected.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "PENDING"}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Arrival Confirmation</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-12 flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2 italic">Vendor Message Payload</h4>
                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl">
                  <div className="flex items-start gap-4 mb-4">
                    <MessageSquare className="text-yellow-400 shrink-0" size={20} />
                    <p className="text-slate-100 text-sm font-bold leading-relaxed italic uppercase tracking-tight">
                      "{selected.message}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                   onClick={() => setSelected(null)}
                   className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all italic active:scale-95"
                >
                  Dismiss
                </button>
                <button 
                  className="flex-2 px-10 py-5 bg-black text-yellow-400 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 italic"
                  onClick={() => window.location.href = `mailto:${selected.vendor_email}`}
                >
                  Initiate Response <ArrowRight size={16}/>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}