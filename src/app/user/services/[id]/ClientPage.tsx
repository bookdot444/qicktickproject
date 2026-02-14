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
  Building
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function ServiceCategoryPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [vendors, setVendors] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      /* 1. Get Category Details */
      const { data: cat } = await supabase
        .from("categories")
        .select("name")
        .eq("id", id)
        .single();

      if (cat?.name) setCategoryName(cat.name);

      /* 2. Fetch Approved Vendors for this Category using your specific logic */
      const { data: vendorData, error } = await supabase
        .from("vendor_register")
        .select("*")
        .eq("status", "approved")
        .or(`categories.ilike.%${id}%,categories.ilike.%${cat?.name}%`);

      if (!error && vendorData) {
        setVendors(vendorData);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const filteredVendors = vendors.filter((v) =>
    v.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFDF5]">
        <Activity className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans pb-24 selection:bg-yellow-200 overflow-x-hidden">
      
      {/* --- EXACT HEADER DESIGN --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-20 px-6 relative overflow-hidden border-b border-yellow-100">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            {/* Sector Hub Active Pill */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-yellow-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">Sector Directory Active</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85] uppercase">
              {categoryName || "INDUSTRIAL"} <br/>
              <span className="text-red-600">HUB</span>
            </h1>
          </div>
          
          {/* Verified Units Box */}
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

      {/* --- EXACT SEARCH BAR DESIGN --- */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-30">
        <div className="bg-gray-900 p-4 rounded-[2.5rem] shadow-2xl flex items-center gap-4 border border-white/10">
          <div className="pl-6 text-yellow-400"><Search size={20} /></div>
          <input 
            type="text" 
            placeholder="FILTER BY COMPANY NAME..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white font-black uppercase tracking-widest text-xs placeholder:text-gray-500"
          />
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <Filter size={12} className="text-gray-400" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Live Filter</span>
          </div>
        </div>
      </div>

      {/* --- VENDOR GRID --- */}
      <div className="max-w-7xl mx-auto px-6 mt-16 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor, idx) => (
                <motion.div
                  key={vendor.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white border-2 border-gray-900 rounded-[2rem] overflow-hidden cursor-pointer shadow-[4px_4px_0px_#000] flex flex-col"
                  onClick={() => router.push(`/vendor/view/${vendor.id}`)}
                >
                  <div className="relative h-40 bg-gray-50 border-b-2 border-gray-900">
                    {vendor.company_logo ? (
                      <Image src={vendor.company_logo} alt={vendor.company_name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-200"><Building size={32} /></div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-black px-2 py-0.5 rounded text-[8px] font-black uppercase border border-gray-900">
                        {vendor.city || "Global"}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-black text-sm text-gray-900 uppercase leading-tight truncate group-hover:text-red-600 transition-colors">{vendor.company_name}</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate mb-4">{vendor.user_type?.join(", ") || "Business"}</p>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-lg font-black text-gray-900 tracking-tighter">{vendor.area || "Location"}</span>
                      <div className="bg-black group-hover:bg-red-600 group-hover:text-white p-2 rounded-lg transition-colors"><ArrowRight size={14} /></div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center">
                <div className="bg-white p-12 rounded-[4rem] border-4 border-dashed border-yellow-100 text-center">
                  <Search size={64} className="mx-auto text-yellow-200 mb-6" />
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">No Units Detected</h3>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Try adjusting your filters</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}