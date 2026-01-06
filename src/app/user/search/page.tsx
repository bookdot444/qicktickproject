"use client";

import { useEffect, useState, Suspense } from "react";
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
    Zap,
    MapPin,
    Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- SUB-COMPONENT: Actual Search Logic ---
function SearchSearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const q = searchParams.get("q");
    const city = searchParams.get("city");
    const type = searchParams.get("type");

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState(q || "");

    const [find, setFind] = useState(q || "");
    const [near, setNear] = useState(city || "");
    const [businessType, setBusinessType] = useState(type || "");
    const [searchFilters, setSearchFilters] = useState<{ products: string[] }>({ products: [] });
    const [showResults, setShowResults] = useState(false);
    const [locationAvailability, setLocationAvailability] = useState<{ locations: string[] }>({ locations: [] });

    useEffect(() => {
        if (!find || find.length < 2) {
            setSearchFilters({ products: [] });
            setShowResults(false);
            return;
        }

        const fetchSearchFilters = async () => {
            const { data, error } = await supabase
                .from("vendor_products")
                .select("product_name")
                .ilike("product_name", `%${find}%`)
                .eq("is_active", true)
                .limit(10);

            if (error) {
                console.error("Filter Fetch Error:", error);
                setSearchFilters({ products: [] });
                return;
            }

            const products = Array.from(
                new Set(
                    data.map(item => item.product_name?.toLowerCase().trim()).filter(Boolean)
                )
            );

            setSearchFilters({ products });
            setShowResults(true);
        };

        fetchSearchFilters();
    }, [find]);

    useEffect(() => {
        if (!find || find.length < 2 || !near || near.length < 2) {
            setLocationAvailability({ locations: [] });
            return;
        }

        const checkLocationAvailability = async () => {
            const { data, error } = await supabase
                .from("vendor_products")
                .select("vendor_id")
                .ilike("product_name", `%${find}%`)
                .eq("is_active", true);

            if (error || !data?.length) {
                setLocationAvailability({ locations: [] });
                return;
            }

            const vendorIds = [...new Set(data.map(p => p.vendor_id))];

            const { data: vendors, error: vendorError } = await supabase
                .from("vendor_register")
                .select("area")
                .in("id", vendorIds)
                .ilike("area", `%${near}%`);

            if (vendorError) {
                console.error("Location Check Error:", vendorError);
                setLocationAvailability({ locations: [] });
                return;
            }

            const locations = Array.from(
                new Set(
                    vendors.map(v => v.area?.toLowerCase().trim()).filter(Boolean)
                )
            );

            setLocationAvailability({ locations });
        };

        checkLocationAvailability();
    }, [find, near]);

    useEffect(() => {
        if (!q) {
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            const vendorConditions: string[] = [];

            if (city) vendorConditions.push(`city.eq.${city}`);
            if (type) vendorConditions.push(`user_type.cs.{${type}}`);

            const join =
                vendorConditions.length > 0
                    ? `vendor_register!inner(${vendorConditions.join(",")})`
                    : `vendor_register!inner`;

            const { data, error } = await supabase
                .from("vendor_products")
                .select(`
                id,
                vendor_id,
                product_name,
                price,
                product_image,
                ${join} (
                    id,
                    company_name,
                    city,
                    user_type
                )
            `)
                .eq("is_active", true)
                .ilike("product_name", `%${q}%`);

            if (error) {
                console.error("Search Error:", error);
                setResults([]);
            } else {
                setResults(data ?? []);
            }
            setLoading(false);
        };

        fetchResults();
    }, [q, city, type]);

    const handleFullSearch = () => {
        if (!find.trim()) {
            alert("Please enter what you need (e.g., Electrician, Plumber).");
            return;
        }
        setShowResults(false);
        setLocationAvailability({ locations: [] });

        const params = new URLSearchParams();
        if (find) params.append("q", find);
        if (near) params.append("city", near);
        if (businessType) params.append("type", businessType);

        router.push(`/user/search?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-[#FFFDF5] pb-20 font-sans selection:bg-yellow-200">
            {/* --- HERO HEADER --- */}
            <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-20 pb-32 px-6 relative overflow-hidden border-b border-yellow-200">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
                <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <button
                            onClick={() => router.push('/')}
                            className="mb-12 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800 hover:text-black transition group"
                        >
                            <div className="p-2 rounded-full border border-yellow-300 bg-white/50 backdrop-blur-md group-hover:border-yellow-500 transition-colors">
                                <ArrowLeft size={16} />
                            </div>
                            <span>Home</span>
                        </button>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none uppercase">
                            Search <br />
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
                <div className="max-w-6xl mx-auto mb-12 relative z-50">
                    <div className="bg-black/40 backdrop-blur-2xl shadow-2xl p-6 md:p-8 rounded-3xl border border-yellow-500/30">
                        <div className="flex flex-col md:flex-row items-center gap-4 relative">
                            <div className="flex-1 relative group w-full">
                                <div className="flex items-center px-6 py-4 hover:bg-black/20 rounded-2xl transition-all w-full">
                                    <Search size={24} strokeWidth={2} className="text-yellow-400 mr-4 group-focus-within:scale-110 transition-transform" />
                                    <div className="flex flex-col w-full">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">What do you need?</span>
                                        <input
                                            className="bg-transparent border-none outline-none text-white font-semibold placeholder:text-gray-300 w-full"
                                            placeholder="e.g., Electrician, Plumber..."
                                            value={find}
                                            onChange={(e) => setFind(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleFullSearch()}
                                        />
                                    </div>
                                </div>
                                {showResults && searchFilters.products.length > 0 && (
                                    <div className="absolute left-0 right-0 top-[110%] bg-white border border-yellow-500/30 rounded-2xl shadow-2xl z-[60] max-h-[300px] overflow-y-auto">
                                        <div className="px-6 py-4">
                                            <p className="font-bold text-black text-base mb-2">Suggested Products</p>
                                            <div className="flex flex-col gap-2">
                                                {searchFilters.products.map((product) => (
                                                    <span
                                                        key={product}
                                                        onClick={() => {
                                                            setFind(product.charAt(0).toUpperCase() + product.slice(1));
                                                            setShowResults(false);
                                                        }}
                                                        className="cursor-pointer bg-yellow-100 text-yellow-700 px-3 py-2 rounded-md border border-yellow-200 uppercase font-bold text-sm hover:bg-yellow-200 transition-colors"
                                                    >
                                                        {product.charAt(0).toUpperCase() + product.slice(1)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="hidden md:block h-8 w-px bg-yellow-500/30"></div>
                            <div className="flex-1 relative group w-full">
                                <div className="flex items-center px-6 py-4 hover:bg-black/20 rounded-2xl transition-all w-full">
                                    <MapPin size={24} strokeWidth={2} className="text-red-400 mr-4" />
                                    <div className="flex flex-col w-full">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Location</span>
                                        <input
                                            className="bg-transparent border-none outline-none text-white font-semibold placeholder:text-gray-300 w-full"
                                            placeholder="e.g., Mumbai, Delhi..."
                                            value={near}
                                            onChange={(e) => setNear(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {locationAvailability.locations.length > 0 && (
                                    <div className="absolute left-0 right-0 top-[110%] bg-white border border-yellow-500/30 rounded-2xl shadow-2xl z-[60] max-h-[200px] overflow-y-auto">
                                        <div className="px-6 py-4">
                                            <p className="font-bold text-black text-base mb-2">Available Locations</p>
                                            <div className="flex flex-col gap-2">
                                                {locationAvailability.locations.map((location) => (
                                                    <span
                                                        key={location}
                                                        onClick={() => {
                                                            setNear(location.charAt(0).toUpperCase() + location.slice(1));
                                                            setLocationAvailability({ locations: [] });
                                                        }}
                                                        className="cursor-pointer bg-yellow-100 text-yellow-700 px-3 py-2 rounded-md border border-yellow-200 uppercase font-bold text-sm hover:bg-yellow-200 transition-colors"
                                                    >
                                                        {location.charAt(0).toUpperCase() + location.slice(1)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="hidden md:block h-8 w-px bg-yellow-500/30"></div>
                            <div className="flex-1 flex items-center px-6 py-4 hover:bg-black/20 rounded-2xl transition-all group w-full">
                                <Briefcase size={24} strokeWidth={2} className="text-yellow-400 mr-4" />
                                <div className="flex flex-col w-full">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Business Type</span>
                                    <select
                                        className="bg-transparent border-none outline-none text-white font-semibold appearance-none cursor-pointer w-full"
                                        value={businessType}
                                        onChange={(e) => setBusinessType(e.target.value)}
                                    >
                                        <option value="" className="text-black">All Types</option>
                                        <option value="Distributer" className="text-black">Distributor</option>
                                        <option value="Manufacturer" className="text-black">Manufacturer</option>
                                        <option value="Retailers" className="text-black">Retailers</option>
                                        <option value="Service Sector" className="text-black">Service Sector</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleFullSearch}
                                className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-red-600 text-black px-10 py-5 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                Refine Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RESULTS GRID --- */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="bg-white p-20 rounded-[3rem] border-4 border-gray-900 text-center flex flex-col items-center">
                            <Loader2 className="animate-spin text-yellow-600 mb-4" size={40} />
                            <p className="font-black uppercase tracking-widest text-xs text-gray-400">Syncing Results...</p>
                        </div>
                    ) : !q ? (
                        <div className="bg-white p-20 rounded-[3rem] border-4 border-gray-900 text-center">
                            <p className="font-black uppercase tracking-widest text-xs text-gray-400">Please enter what you need to search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {results.length === 0 ? (
                                <div className="col-span-full bg-white p-20 rounded-[3rem] border-4 border-gray-900 text-center">
                                    <p className="font-black uppercase tracking-widest text-xs text-gray-400">No Results Found.</p>
                                </div>
                            ) : (
                                results.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => router.push(`/vendor/view/${item.vendor_id}`)}
                                        className="group bg-white border-2 border-gray-900 rounded-[2rem] overflow-hidden cursor-pointer shadow-[4px_4px_0px_#000] flex flex-col"
                                    >
                                        <div className="relative h-40 bg-gray-50 border-b-2 border-gray-900">
                                            {item.product_image ? (
                                                <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-gray-200"><Package size={32} /></div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-white/90 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-gray-900">
                                                    {item.vendor_register?.city || "Global"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-black text-sm text-gray-900 uppercase italic leading-tight truncate group-hover:text-red-600 transition-colors">{item.product_name}</h3>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate mb-4">{item.vendor_register?.company_name}</p>
                                            <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                                                <span className="text-lg font-black text-gray-900 tracking-tighter">₹{item.price.toLocaleString()}</span>
                                                <div className="bg-gray-100 group-hover:bg-red-600 group-hover:text-white p-2 rounded-lg transition-colors"><ArrowRight size={14} /></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </AnimatePresence>

                {/* --- TRUST SECTION --- */}
                <section className="py-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-[4rem] p-12 md:p-20 border border-yellow-100 shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:40px_40px]" />
                            <div className="flex justify-center mb-8 relative z-10">
                                <span className="bg-[#0F172A] text-yellow-400 text-[9px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full shadow-lg">Trust & Verification</span>
                            </div>
                            <h2 className="text-center mb-24 relative z-10">
                                <span className="text-4xl md:text-7xl font-black italic text-[#0F172A] tracking-tighter uppercase leading-[0.85] block">SECURE ASSETS,</span>
                                <span className="text-4xl md:text-7xl font-black italic text-red-600 tracking-tighter uppercase leading-[0.85] block">VERIFIED VENDORS.</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                                <TrustCardItem num="01" color="bg-yellow-400" icon={<ShieldCheck size={28} />} title="Secure" desc="Military-grade encryption protecting every digital asset." />
                                <TrustCardItem num="02" color="bg-red-600" icon={<Hash size={28} className="text-white" />} title="Tracked" desc="Real-time activity monitoring for transparency." />
                                <TrustCardItem num="03" color="bg-[#0F172A]" icon={<Award size={28} className="text-yellow-400" />} title="Verified" desc="Multi-step background checks before listing." />
                                <TrustCardItem num="04" color="bg-yellow-50" icon={<TrendingUp size={28} className="text-yellow-600" />} title="Popular" desc="Join the fastest growing network of professionals." />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

// --- HELPERS ---
function TrustCardItem({ num, color, icon, title, desc }: { num: string, color: string, icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="relative group">
            <span className="absolute -top-12 -left-4 text-[8rem] font-black text-gray-50/80 select-none -z-10 transition-colors duration-500">{num}</span>
            <div className={`w-16 h-16 ${color} rounded-[1.5rem] flex items-center justify-center shadow-xl mb-6 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                {icon}
            </div>
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-400 text-[10px] font-bold leading-relaxed uppercase tracking-wide">{desc}</p>
        </div>
    );
}

// --- MAIN EXPORT: Wraps everything in Suspense to fix Netlify Error ---
export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-yellow-600 mb-4" size={48} />
                <h2 className="font-black uppercase tracking-widest text-sm text-gray-400">Loading Registry...</h2>
            </div>
        }>
            <SearchSearchResults />
        </Suspense>
    );
}