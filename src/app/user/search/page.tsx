"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Search, Factory } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const q = searchParams.get("q");
    const city = searchParams.get("city");
    const type = searchParams.get("type");

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState(q || "");

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);

            let query = supabase
                .from("vendor_products")
                .select(`
    id,
    vendor_id,
    product_name,
    price,
    product_image,
    vendor_register (
      id,
      company_name,
      owner_name,
      city,
      business_type
    )
  `)
                .eq("is_active", true);


            if (q) query = query.ilike("product_name", `%${q}%`);
            if (city) query = query.eq("vendor_register.city", city);
            if (type) query = query.eq("vendor_register.business_type", type);

            const { data, error } = await query;

            if (!error) setResults(data || []);
            setLoading(false);
        };

        fetchResults();
    }, [q, city, type]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">

            {/* ================= HERO HEADER ================= */}
            <div className="relative bg-[#D80000] pt-16 pb-20 px-6 overflow-hidden mb-5"> {/* Added mb-5 here */}
                {/* Subtle Abstract Background Overlay */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="black" />
                    </svg>
                </div>

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    {/* Compact Verified Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">
                            Verified Search
                        </span>
                    </div>

                    {/* Scaled Heading */}
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                        SEARCH <span className="text-[#FFD700]">RESULTS</span>
                    </h1>

                    <p className="text-white/70 max-w-lg mx-auto font-medium text-base md:text-lg">
                        {results.length} trusted professionals found
                    </p>

                    {/* Compact Search Bar - Added mb-5 to ensure internal spacing */}
                    <div className="max-w-xl mx-auto mt-8 relative group mb-5">
                        <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-transparent focus-within:border-[#FFD700] transition-all">
                            {/* Search Icon */}
                            <Search className="ml-5 text-gray-400" size={18} />

                            <input
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder="Search services..."
                                className="w-full py-4 px-4 outline-none font-bold text-gray-800 placeholder:text-gray-400"
                            />

                            <button className="bg-[#FFD700] text-black font-black text-xs px-6 py-4 hover:bg-yellow-400 transition-colors uppercase">
                                Find
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= RESULTS ================= */}
            <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
                <AnimatePresence>
                    {loading ? (
                        <p className="text-slate-400">Loading services...</p>
                    ) : results.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 py-32 text-center">
                            <Search size={48} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">
                                No Services Found
                            </h3>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => router.push(`/vendor/view/${item.vendor_id}`)}
                                    className="group bg-white rounded-3xl shadow hover:shadow-2xl transition cursor-pointer overflow-hidden"
                                >
                                    <div className="relative h-48 bg-gray-100">
                                        {item.product_image ? (
                                            <Image
                                                src={item.product_image}
                                                alt={item.product_name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <h3 className="font-black text-lg text-slate-900 truncate">
                                            {item.product_name}
                                        </h3>

                                        <p className="text-sm font-semibold text-slate-700 mt-1">
                                            {item.vendor_register?.company_name
                                                || item.vendor_register?.owner_name}
                                        </p>



                                        <p className="text-sm text-slate-500 mt-1">
                                            {item.vendor_register?.city} · {item.vendor_register?.business_type}
                                        </p>

                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-xl font-extrabold text-[#D80000]">
                                                ₹{item.price}
                                            </span>
                                            <span className="text-xs font-black uppercase tracking-widest text-[#D80000]">
                                                View →
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
