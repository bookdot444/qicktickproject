"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { 
  Search, 
  ArrowLeft, 
  Package, 
  TrendingUp, 
  ShieldCheck, 
  Hash, 
  Award, 
  ArrowRight,
  Loader2,
  Zap
} from "lucide-react";
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

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchText) params.set("q", searchText);
        else params.delete("q");
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-[#FFFDF5] pb-20 font-sans selection:bg-yellow-200">
            
            {/* --- HERO HEADER (Inventory Style) --- */}
            <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-20 pb-32 px-6 relative overflow-hidden border-b border-yellow-200">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
                
                <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <button
                            onClick={() => router.push('/')}
                            className="mb-6 inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-gray-900 bg-white px-4 py-2 rounded-lg border-2 border-gray-900 shadow-[4px_4px_0px_#000]"
                        >
                            <ArrowLeft size={14} strokeWidth={3} /> Home
                        </button>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none uppercase">
                            Search <br/>
                            <span className="text-red-600 italic">Registry</span>
                        </h1>
                    </div>

                    <div className="hidden lg:block bg-white p-8 rounded-[2.5rem] rotate-3 shadow-xl border-2 border-yellow-100 relative">
                        <div className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-xl">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <Search size={60} className="text-yellow-600" />
                    </div>
                </div>
            </div>

            {/* --- SEARCH & RESULTS --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
                
                {/* Search Bar */}
                <div className="bg-white shadow-2xl rounded-3xl p-3 mb-12 flex flex-col md:flex-row gap-3 border border-yellow-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-yellow-600" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH DATABASE..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-6 py-4 bg-[#FEF3C7]/20 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl outline-none transition-all font-black uppercase text-xs tracking-widest"
                        />
                    </div>
                    <button 
                        onClick={handleSearch}
                        className="bg-gray-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
                    >
                        Scan Archive
                    </button>
                </div>

                {/* Results Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="bg-white p-20 rounded-[3rem] border-4 border-gray-900 text-center flex flex-col items-center">
                            <Loader2 className="animate-spin text-yellow-600 mb-4" size={40} />
                            <p className="font-black uppercase tracking-widest text-xs text-gray-400">Syncing Results...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {results.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => router.push(`/vendor/view/${item.vendor_id}`)}
                                    className="group bg-white border-2 border-gray-900 rounded-[2rem] overflow-hidden cursor-pointer shadow-[4px_4px_0px_#000] flex flex-col"
                                >
                                    {/* Small Image Area */}
                                    <div className="relative h-40 bg-gray-50 border-b-2 border-gray-900">
                                        {item.product_image ? (
                                            <Image
                                                src={item.product_image}
                                                alt={item.product_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-200">
                                                <Package size={32} />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/90 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-gray-900">
                                                {item.vendor_register?.city || 'Global'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Simple Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-black text-sm text-gray-900 uppercase italic leading-tight truncate group-hover:text-red-600 transition-colors">
                                            {item.product_name}
                                        </h3>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate mb-4">
                                            {item.vendor_register?.company_name}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                                            <span className="text-lg font-black text-gray-900 tracking-tighter">
                                                ₹{item.price.toLocaleString()}
                                            </span>
                                            <div className="bg-gray-100 group-hover:bg-red-600 group-hover:text-white p-2 rounded-lg transition-colors">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* --- TRUST FOOTER --- */}
                <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <TrustCard icon={<ShieldCheck size={18}/>} label="Secure" />
                    <TrustCard icon={<Hash size={18}/>} label="Tracked" />
                    <TrustCard icon={<Award size={18}/>} label="Verified" />
                    <TrustCard icon={<TrendingUp size={18}/>} label="Popular" />
                </div>
            </div>
        </div>
    );
}

function TrustCard({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex flex-col items-center gap-2 opacity-20 hover:opacity-100 transition-opacity">
            <div className="text-yellow-600">{icon}</div>
            <span className="font-black uppercase tracking-[0.2em] text-[9px] text-gray-900">{label}</span>
        </div>
    )
}