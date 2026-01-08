"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Phone,
  Building2,
  Search,
  Award,
  Gem,
  Factory,
  Mail,
  Zap,
  Activity,
  ArrowRight,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ServiceCategoryPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [vendors, setVendors] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("Industrial Services");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: cat } = await supabase
        .from("categories")
        .select("name")
        .eq("id", id)
        .single();

      if (cat?.name) setCategoryName(cat.name);

      const { data } = await supabase
        .from("vendor_products")
        .select(`vendor_register:vendor_id (*)`)
        .eq("category_id", id);

      if (data) {
        const cleaned = data.map((d: any) => d.vendor_register).filter(Boolean);
        const unique = Array.from(
          new Map(cleaned.map((v: any) => [v.id, v])).values()
        );
        setVendors(unique);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const filteredVendors = vendors.filter((v) =>
    v.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanStyles = (plan: string) => {
    const p = plan?.toLowerCase() || "";
    if (p.includes("diamond"))
      return { color: "text-cyan-500", bg: "bg-cyan-500/10", icon: <Gem size={14} /> };
    if (p.includes("gold"))
      return { color: "text-yellow-500", bg: "bg-yellow-500/10", icon: <Award size={14} /> };
    return { color: "text-red-600", bg: "bg-red-600/10", icon: <Zap size={14} /> };
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFDF5]">
        <Activity className="animate-pulse text-red-600" size={48} />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans pb-24 selection:bg-yellow-200">
      
      {/* --- HEADER --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-44 px-6 relative overflow-hidden border-b border-yellow-100">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-yellow-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">Sector Directory Active</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85] uppercase">
              {categoryName} <br/>
              <span className="text-red-600 italic">HUB</span>
            </h1>
          </div>
          
          <div className="hidden lg:block bg-white p-10 rounded-[3.5rem] -rotate-3 shadow-2xl border-2 border-yellow-100 relative">
             <div className="absolute -top-3 -right-3 bg-gray-900 text-yellow-400 p-4 rounded-3xl animate-bounce">
                <Factory size={32} />
             </div>
             <div className="text-right">
                <p className="text-[40px] font-black text-gray-900 leading-none">{vendors.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verified Units</p>
             </div>
          </div>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-30">
        <div className="bg-gray-900 p-4 rounded-[2.5rem] shadow-2xl flex items-center gap-4 border border-white/10">
          <div className="pl-6 text-yellow-400"><Search size={20} /></div>
          <input 
            type="text" 
            placeholder="FILTER BY COMPANY NAME..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white font-black italic uppercase tracking-widest text-xs placeholder:text-gray-500"
          />
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <Filter size={12} className="text-gray-400" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Live Filter</span>
          </div>
        </div>
      </div>

      {/* --- VENDOR GRID --- */}
      <div className="max-w-7xl mx-auto px-6 mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor, idx) => {
                const style = getPlanStyles(vendor.subscription_plan);

                return (
                  <motion.div
                    key={vendor.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-[3rem] border-2 border-transparent hover:border-yellow-400 shadow-xl transition-all duration-500 overflow-hidden flex flex-col"
                  >
                    {/* Header: Logo & Badge */}
                    <div className="p-8 pb-0 flex justify-between items-start">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                        {vendor.company_logo ? (
                          <img src={vendor.company_logo} alt="logo" className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="text-gray-200" size={28} />
                        )}
                      </div>
                      <div className={`${style.bg} ${style.color} p-3 rounded-2xl`}>
                        {style.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Registered Partner</span>
                      </div>
                      
                      <h2 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-red-600 transition-colors tracking-tighter uppercase leading-tight italic">
                        {vendor.company_name}
                      </h2>

                      <div className="space-y-3 border-t border-gray-50 pt-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <MapPin size={14} className="text-red-600" />
                          <span className="text-[10px] font-black uppercase italic">{vendor.city}, {vendor.state}</span>
                        </div>
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-tight leading-relaxed line-clamp-2 italic">
                          Technical solutions & industrial support specialized in {categoryName}.
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-gray-50/50 mt-auto border-t border-gray-50 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => router.push(`/vendor/view/${vendor.id}`)}
                        className="col-span-2 bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest italic flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg active:scale-95"
                      >
                        Access Profile <ArrowRight size={14} />
                      </button>
                      <a
                        href={`tel:${vendor.mobile_number}`}
                        className="bg-white border-2 border-gray-100 text-gray-900 py-3 rounded-2xl font-black flex items-center justify-center hover:border-yellow-400 transition-all shadow-sm"
                      >
                        <Phone size={16} />
                      </a>
                      <button
                        className="bg-white border-2 border-gray-100 text-gray-900 py-3 rounded-2xl font-black flex items-center justify-center hover:border-yellow-400 transition-all shadow-sm"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center">
                <div className="bg-white p-12 rounded-[4rem] border-4 border-dashed border-yellow-100 text-center">
                  <Search size={64} className="mx-auto text-yellow-200 mb-6" />
                  <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">No Units Detected</h3>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Try adjusting your signal filters</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- CTA FOOTER --- */}
      <div className="max-w-7xl mx-auto px-6 mt-32">
        <div className="bg-gray-900 rounded-[4rem] p-12 md:p-20 relative overflow-hidden text-center">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
           <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-8 relative z-10">
             Can't find the <span className="text-yellow-400">Right Provider?</span>
           </h2>
           <button 
             onClick={() => router.push('/enquiry')}
             className="bg-yellow-400 text-black px-12 py-6 rounded-full font-black uppercase italic tracking-widest hover:bg-white transition-all shadow-2xl relative z-10 active:scale-95"
           >
             Broadcast Your Requirement
           </button>
        </div>
      </div>
    </div>
  );
}
