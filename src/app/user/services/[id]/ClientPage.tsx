"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import {
  Search,
  Factory,
  ArrowRight,
  Building,
  ChevronLeft,
  ChevronRight,
  Activity,
  Package,
  Zap,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const VENDORS_PER_PAGE = 32;

export default function ServiceCategoryPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [vendors, setVendors] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      const from = (currentPage - 1) * VENDORS_PER_PAGE;
      const to = from + VENDORS_PER_PAGE - 1;

      /* 1. Get Category Details */
      const { data: cat } = await supabase
        .from("categories")
        .select("name")
        .eq("id", id)
        .single();

      if (cat?.name) setCategoryName(cat.name);

      /* 2. Fetch Latest Products for the top slider */
      const { data: prodData } = await supabase
        .from("products")
        .select("*, vendor_register(company_name)")
        .order("created_at", { ascending: false })
        .limit(10);
      if (prodData) setLatestProducts(prodData);

      /* 3. Fetch Approved Vendors (ORDERED BY CREATED_AT FOR LATEST ON TOP) */
      const { data: vendorData, error, count } = await supabase
        .from("vendor_register")
        .select("*", { count: 'exact' })
        .eq("status", "approved")
        .or(`categories.ilike.%${id}%,categories.ilike.%${cat?.name}%`)
        .order("created_at", { ascending: false }) // <--- LATEST PROFILE ON TOP
        .range(from, to);

      if (!error && vendorData) {
        setVendors(vendorData);
        if (count) setTotalCount(count);
      }

      setLoading(false);
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, currentPage]);

  const totalPages = Math.ceil(totalCount / VENDORS_PER_PAGE);

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

      {/* --- HEADER --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-20 px-6 relative overflow-hidden border-b border-yellow-100">
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
              {categoryName || "INDUSTRIAL"} <br />
              <span className="text-red-600">HUB</span>
            </h1>
          </div>

          <div className="hidden lg:block bg-white p-10 rounded-[3.5rem] -rotate-3 shadow-2xl border-2 border-yellow-100 relative">
            <div className="absolute -top-3 -right-3 bg-gray-900 text-yellow-400 p-4 rounded-3xl animate-bounce">
              <Factory size={32} />
            </div>
            <div className="text-right">
              <p className="text-[40px] font-black text-gray-900 leading-none">{totalCount}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Units</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-30">
        <div className="bg-gray-900 p-4 rounded-[2.5rem] shadow-2xl flex items-center gap-4 border border-white/10">
          <div className="pl-6 text-yellow-400"><Search size={20} /></div>
          <input
            type="text"
            placeholder="FILTER CURRENT PAGE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white font-black uppercase tracking-widest text-xs placeholder:text-gray-500"
          />
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>

      {/* --- VENDOR GRID (32 Items per page) --- */}
      {/* --- VENDOR GRID (32 Items per page) --- */}
      <div className="max-w-7xl mx-auto px-6 mt-16 relative z-20">
        {/* Changed grid-cols-1 to grid-cols-2 for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <motion.div
                  key={vendor.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white border-2 border-gray-900 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden cursor-pointer shadow-[3px_3px_0px_#000] md:shadow-[4px_4px_0px_#000] hover:shadow-[8px_8px_0px_#000] transition-all flex flex-col"
                  onClick={() => router.push(`/vendor/view/${vendor.id}`)}
                >
                  {/* Reduced height for mobile images to keep cards compact */}
                  <div className="relative h-32 md:h-44 bg-gray-50 border-b-2 border-gray-900">
                    {vendor.company_logo ? (
                      <Image src={vendor.company_logo} alt={vendor.company_name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-200"><Building size={32} /></div>
                    )}
                    <div className="absolute top-2 left-2 md:top-3 md:left-3">
                      <span className="bg-yellow-400 text-black px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[7px] md:text-[9px] font-black uppercase border-2 border-black shadow-[1px_1px_0px_#000]">
                        {vendor.city || "Global"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 md:p-6 flex flex-col flex-1">
                    <h3 className="font-black text-[10px] md:text-base text-gray-900 uppercase leading-tight truncate group-hover:text-red-600 transition-colors">
                      {vendor.company_name}
                    </h3>
                    <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate mb-3 md:mb-6 mt-1">
                      {vendor.user_type?.join(", ") || "Business"}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-2 md:pt-4 border-t-2 border-gray-900">
                      <div className="flex flex-col">
                        <span className="text-[6px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest">Base Area</span>
                        <span className="text-[10px] md:text-sm font-black text-gray-900 tracking-tighter uppercase truncate max-w-[50px] md:max-w-none">
                          {vendor.area || "N/A"}
                        </span>
                      </div>
                      <div className="bg-red-600 text-white p-1.5 md:p-3 rounded-lg md:rounded-xl transition-colors shadow-[1px_1px_0px_rgba(0,0,0,0.2)]">
                        <ArrowRight size={14} className="md:w-[18px] md:h-[18px]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))

            ) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center">
                <div className="bg-white p-12 rounded-[4rem] border-4 border-dashed border-yellow-100 text-center">
                  <Search size={64} className="mx-auto text-yellow-200 mb-6" />
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">No Units Detected</h3>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Try adjusting your filters or page</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* --- PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
          <div className="mt-20 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-4 rounded-2xl border-2 border-gray-900 bg-white shadow-[4px_4px_0px_#000] disabled:opacity-30 disabled:cursor-not-allowed active:translate-y-1 active:shadow-none transition-all"
              >
                <ChevronLeft size={24} className="text-gray-900" />
              </button>

              <div className="flex items-center gap-2 bg-yellow-200 p-2 rounded-2xl shadow-xl">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Only show first, last, and pages around current
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-12 h-12 rounded-xl font-black text-xs transition-all ${currentPage === pageNum
                          ? "bg-red-600 text-white scale-110 shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="text-gray-600 px-1">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-4 rounded-2xl border-2 border-gray-900 bg-white shadow-[4px_4px_0px_#000] disabled:opacity-30 disabled:cursor-not-allowed active:translate-y-1 active:shadow-none transition-all"
              >
                <ChevronRight size={24} className="text-gray-900" />
              </button>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              Showing {vendors.length} of {totalCount} verified units
            </p>
          </div>
        )}
      </div>
    </div>
  );
}