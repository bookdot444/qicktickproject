"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Phone,
  Building2,
  ShieldCheck,
  Search,
  Award,
  Gem,
  CheckCircle2,
  Factory,
  ArrowUpRight,
  ExternalLink,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ServiceCategoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("Industrial Services");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: cat } = await supabase.from("categories").select("name").eq("id", id).single();
      if (cat) setCategoryName(cat.name);

      const { data } = await supabase
        .from("vendor_products")
        .select(`vendor_register:vendor_id (*)`)
        .eq("category_id", id);

      if (data) {
        const cleaned = data.map((d: any) => d.vendor_register).filter(Boolean);
        const unique = Array.from(new Map(cleaned.map((v: any) => [v.id, v])).values());
        setVendors(unique);
      }
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  const filteredVendors = vendors.filter((v) =>
    v.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanStyles = (plan: string) => {
    const p = plan?.toLowerCase() || "";
    if (p.includes("diamond")) return { text: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200", icon: <Gem size={14} /> };
    if (p.includes("gold")) return { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: <Award size={14} /> };
    return { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: <CheckCircle2 size={14} /> };
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-[#D80000] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      
      {/* ================= DYNAMIC RED HERO BANNER ================= */}
      <div className="relative bg-[#D80000] pt-24 pb-40 px-6 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L100 0 L100 100 Z" fill="black" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6"
          >
            <Factory size={14} className="text-[#FFD700]" />
            <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Authorized Industry Directory</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter"
          >
            {categoryName.toUpperCase()} <span className="text-[#FFD700]">HUB</span>
          </motion.h1>
          
          <p className="text-white/80 max-w-xl mx-auto font-medium text-lg mb-10">
            Connecting you with verified {categoryName} experts and manufacturing partners.
          </p>

          {/* Integrated Search Container */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-[#FFD700]/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
              <Search className="ml-6 text-slate-400" size={20} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company name or keyword..."
                className="w-full py-6 px-4 outline-none font-bold text-slate-800 placeholder:text-slate-400"
              />
              <div className="hidden md:block pr-6">
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-md uppercase">
                  {filteredVendors.length} Results
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= VENDOR CARDS SECTION ================= */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor, idx) => {
                const style = getPlanStyles(vendor.subscription_plan);

                return (
                  <motion.div
                    key={vendor.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row min-h-[220px]">
                      
                      {/* 1. Logo Section */}
                      <div className="md:w-60 bg-slate-50 flex items-center justify-center p-8 relative border-r border-slate-100">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D80000] opacity-0 group-hover:opacity-100 transition-opacity" />
                        {vendor.company_logo ? (
                          <img 
                            src={vendor.company_logo} 
                            alt="Logo" 
                            className="w-full h-32 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" 
                          />
                        ) : (
                          <div className="bg-white w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner">
                            <Building2 size={40} className="text-slate-200" />
                          </div>
                        )}
                      </div>

                      {/* 2. Main Details */}
                      <div className="flex-1 p-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${style.bg} ${style.text} ${style.border} text-[10px] font-black uppercase tracking-widest`}>
                            {style.icon} {vendor.subscription_plan || "Standard"}
                          </span>
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={14} /> Verified Business
                          </span>
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 mb-2 group-hover:text-[#D80000] transition-colors tracking-tight">
                          {vendor.company_name}
                        </h2>

                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin size={16} className="text-[#D80000]" />
                            <span className="text-sm font-bold uppercase tracking-tight italic">{vendor.city}, {vendor.state}</span>
                          </div>
                          <p className="text-slate-400 text-sm line-clamp-1 font-medium">
                            Professional industrial solutions and technical support for {categoryName}.
                          </p>
                        </div>
                      </div>

                      {/* 3. Quick Actions */}
                      <div className="bg-slate-50/50 p-6 md:w-72 flex flex-col justify-center gap-3 border-l border-slate-100">
                        <button
                          onClick={() => router.push(`/vendor/view/${vendor.id}`)}
                          className="w-full h-12 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all"
                        >
                          View Details <ArrowUpRight size={14} />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`tel:${vendor.mobile_number}`}
                            className="h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-[#D80000] hover:border-[#D80000] transition-all"
                          >
                            <Phone size={18} />
                          </a>
                          <button
                            className="h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-[#D80000] hover:border-[#D80000] transition-all"
                          >
                            <Mail size={18} />
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 py-32 text-center">
                <Search size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Vendors Found</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}