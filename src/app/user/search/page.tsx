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
    Briefcase,
    Building
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
    const [searchSuggestions, setSearchSuggestions] = useState<{ products: string[], companies: string[], categories: string[], locations: string[], sectors: string[] }>({ products: [], companies: [], categories: [], locations: [], sectors: [] });
    const [showResults, setShowResults] = useState(false);
    const [locationAvailability, setLocationAvailability] = useState<{ locations: string[] }>({ locations: [] });

    useEffect(() => {
        if (!find || find.length < 2) {
            setSearchSuggestions({ products: [], companies: [], categories: [], locations: [], sectors: [] });
            setShowResults(false);
            return;
        }

        const fetchSearchSuggestions = async () => {
            // Fetch products
            const { data: productData, error: productError } = await supabase
                .from("vendor_products")
                .select("product_name")
                .ilike("product_name", `%${find}%`)
                .eq("is_active", true)
                .limit(5);

            // Fetch companies
            const { data: companyData, error: companyError } = await supabase
                .from("vendor_register")
                .select("company_name")
                .ilike("company_name", `%${find}%`)
                .limit(5);

            // Fetch categories
            const { data: categoryData, error: categoryError } = await supabase
                .from("categories")
                .select("name")
                .ilike("name", `%${find}%`)
                .eq("is_active", true)
                .limit(5);

            // Fetch locations (cities)
            const { data: locationData, error: locationError } = await supabase
                .from("vendor_register")
                .select("city")
                .ilike("city", `%${find}%`)
                .limit(5);

            // Fetch sectors
            const { data: sectorData, error: sectorError } = await supabase
                .from("vendor_register")
                .select("sector")
                .ilike("sector", `%${find}%`)
                .limit(5);

            if (productError) console.error("Product Fetch Error:", productError);
            if (companyError) console.error("Company Fetch Error:", companyError);
            if (categoryError) console.error("Category Fetch Error:", categoryError);
            if (locationError) console.error("Location Fetch Error:", locationError);
            if (sectorError) console.error("Sector Fetch Error:", sectorError);

            const products = Array.from(
                new Set(
                    (productData || []).map(item => item.product_name?.toLowerCase().trim()).filter(Boolean)
                )
            );

            const companies = Array.from(
                new Set(
                    (companyData || []).map(item => item.company_name?.toLowerCase().trim()).filter(Boolean)
                )
            );

            const categories = Array.from(
                new Set(
                    (categoryData || []).map(item => item.name?.toLowerCase().trim()).filter(Boolean)
                )
            );

            const locations = Array.from(
                new Set(
                    (locationData || []).map(item => item.city?.toLowerCase().trim()).filter(Boolean)
                )
            );

            const sectors = Array.from(
                new Set(
                    (sectorData || []).map(item => item.sector?.toLowerCase().trim()).filter(Boolean)
                )
            );

            setSearchSuggestions({ products, companies, categories, locations, sectors });
            setShowResults(true);
        };

        fetchSearchSuggestions();
    }, [find]);

    useEffect(() => {
        if (!find || find.length < 2 || !near || near.length < 2) {
            setLocationAvailability({ locations: [] });
            return;
        }

        const checkLocationAvailability = async () => {
            // First, find vendors that match the search term in products, companies, or categories
            let vendorIds: string[] = [];

            // From products
            const { data: productVendors } = await supabase
                .from("vendor_products")
                .select("vendor_id")
                .ilike("product_name", `%${find}%`)
                .eq("is_active", true);

            // From companies
            const { data: companyVendors } = await supabase
                .from("vendor_register")
                .select("id")
                .ilike("company_name", `%${find}%`);

            // From categories (via products)
            const { data: categoryVendors } = await supabase
                .from("vendor_products")
                .select("vendor_id")
                .eq("is_active", true)
                .not("category_id", "is", null)
                .in("category_id",
                    (await supabase.from("categories").select("id").ilike("name", `%${find}%`).eq("is_active", true)).data?.map(c => c.id) || []
                );

            // From categories in vendor_register
            const { data: categoryVendorsRegister } = await supabase
                .from("vendor_register")
                .select("id")
                .ilike("categories::text", `%${find}%`);

            vendorIds = [...new Set([
                ...(productVendors || []).map(p => p.vendor_id),
                ...(companyVendors || []).map(c => c.id),
                ...(categoryVendors || []).map(c => c.vendor_id),
                ...(categoryVendorsRegister || []).map(c => c.id)
            ])];

            if (!vendorIds.length) {
                setLocationAvailability({ locations: [] });
                return;
            }

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

            let vendorIds: string[] = [];

            // Check for products
            const { data: productVendors } = await supabase
                .from("vendor_products")
                .select("vendor_id")
                .ilike("product_name", `%${q}%`)
                .eq("is_active", true);
            if (productVendors?.length) {
                vendorIds.push(...productVendors.map(p => p.vendor_id));
            }

            // Check for categories
            const { data: categoryIds } = await supabase
                .from("categories")
                .select("id")
                .ilike("name", `%${q}%`)
                .eq("is_active", true);
            if (categoryIds?.length) {
                const { data: categoryVendors } = await supabase
                    .from("vendor_products")
                    .select("vendor_id")
                    .in("category_id", categoryIds.map(c => c.id))
                    .eq("is_active", true);
                if (categoryVendors?.length) {
                    vendorIds.push(...categoryVendors.map(p => p.vendor_id));
                }
            }

            // Check for categories in vendor_register
            const { data: categoryVendorsRegister } = await supabase
                .from("vendor_register")
                .select("id")
                .ilike("categories::text", `%${q}%`);
            if (categoryVendorsRegister?.length) {
                vendorIds.push(...categoryVendorsRegister.map(c => c.id));
            }

            // Check for companies
            const { data: companyVendors } = await supabase
                .from("vendor_register")
                .select("id")
                .ilike("company_name", `%${q}%`);
            if (companyVendors?.length) {
                vendorIds.push(...companyVendors.map(c => c.id));
            }

            // Check for cities
            const { data: cityVendors } = await supabase
                .from("vendor_register")
                .select("id")
                .ilike("city", `%${q}%`);
            if (cityVendors?.length) {
                vendorIds.push(...cityVendors.map(c => c.id));
            }

            // Check for sectors
            const { data: sectorVendors } = await supabase
                .from("vendor_register")
                .select("id")
                .ilike("sector", `%${q}%`);
            if (sectorVendors?.length) {
                vendorIds.push(...sectorVendors.map(s => s.id));
            }

            vendorIds = [...new Set(vendorIds)];

            if (!vendorIds.length) {
                setResults([]);
                setLoading(false);
                return;
            }

            // Build query with AND conditions
            let query = supabase.from("vendor_register").select("*").in("id", vendorIds);
            if (city) query = query.eq("city", city);
            if (type) query = query.contains("user_type", [type]);

            const { data, error } = await query;

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
            alert("Please enter what you need (e.g., Electrician, Plumber, Company Name, Category).");
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
                            Search{" "}
                            <span className="text-black">Registry</span>
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
                                            placeholder="e.g., Electrician, Plumber, Company Name, Category..."
                                            value={find}
                                            onChange={(e) => setFind(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleFullSearch()}
                                        />
                                    </div>
                                </div>
                                {showResults && (searchSuggestions.products.length > 0 || searchSuggestions.companies.length > 0 || searchSuggestions.categories.length > 0 || searchSuggestions.locations.length > 0 || searchSuggestions.sectors.length > 0) && (
                                    <div className="absolute left-0 right-0 top-[110%] bg-white border border-yellow-500/30 rounded-2xl shadow-2xl z-[60] max-h-[400px] overflow-y-auto">
                                        <div className="px-6 py-4">
                                            {searchSuggestions.products.length > 0 && (
                                                <>
                                                    <p className="font-bold text-black text-base mb-2">Suggested Products</p>
                                                    <div className="flex flex-col gap-2 mb-4">
                                                        {searchSuggestions.products.map((product) => (
                                                            <span
                                                                key={product}
                                                                onClick={() => {
                                                                    setFind(product.charAt(0).toUpperCase() + product.slice(1));
                                                                    setShowResults(false);
                                                                    handleFullSearch();
                                                                }}
                                                                className="cursor-pointer bg-yellow-100 text-yellow-700 px-3 py-2 rounded-md border border-yellow-200 uppercase font-bold text-sm hover:bg-yellow-200 transition-colors"
                                                            >
                                                                {product.charAt(0).toUpperCase() + product.slice(1)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                            {searchSuggestions.companies.length > 0 && (
                                                <>
                                                    <p className="font-bold text-black text-base mb-2">Suggested Companies</p>
                                                    <div className="flex flex-col gap-2 mb-4">
                                                        {searchSuggestions.companies.map((company) => (
                                                            <span
                                                                key={company}
                                                                onClick={() => {
                                                                    setFind(company.charAt(0).toUpperCase() + company.slice(1));
                                                                    setShowResults(false);
                                                                    handleFullSearch();
                                                                }}
                                                                className="cursor-pointer bg-yellow-100 text-yellow-700 px-3 py-2 rounded-md border border-yellow-200 uppercase font-bold text-sm hover:bg-yellow-200 transition-colors"
                                                            >
                                                                {company.charAt(0).toUpperCase() + company.slice(1)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                            {searchSuggestions.sectors.length > 0 && (
                                                <>
                                                    <p className="font-bold text-black text-base mb-2">Suggested Sectors</p>
                                                    <div className="flex flex-col gap-2">
                                                        {searchSuggestions.sectors.map((sector) => (
                                                            <span
                                                                key={sector}
                                                                onClick={() => {
                                                                    setFind(sector.charAt(0).toUpperCase() + sector.slice(1));
                                                                    setShowResults(false);
                                                                    handleFullSearch();
                                                                }}
                                                                className="cursor-pointer bg-yellow-100 text-yellow-700 px-3 py-2 rounded-md border border-yellow-200 uppercase font-bold text-sm hover:bg-yellow-200 transition-colors"
                                                            >
                                                                {sector.charAt(0).toUpperCase() + sector.slice(1)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
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
                                        <option value="distributor" className="text-black">Distributor</option>
                                        <option value="manufacturer" className="text-black">Manufacturer</option>
                                        <option value="retailer" className="text-black">Retailers</option>
                                        <option value="service" className="text-black">Service Sector</option>
                                    </select>
                                </div>
                            </div>
                            <div className="hidden md:block h-8 w-px bg-yellow-500/30"></div>
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
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {results.length === 0 ? (
                                <div className="col-span-full bg-white p-20 rounded-[3rem] border-4 border-gray-900 text-center">
                                    <p className="font-black uppercase tracking-widest text-xs text-gray-400">No Results Found.</p>
                                </div>
                            ) : (
                                results.map((vendor) => (
                                    <div
                                        key={vendor.id}
                                        onClick={() => router.push(`/vendor/view/${vendor.id}`)}
                                        className="group bg-white border-2 border-gray-900 rounded-[2rem] overflow-hidden cursor-pointer shadow-[4px_4px_0px_#000] flex flex-col"
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
                                                <div className="bg-red-600 group-hover:text-white p-2 rounded-lg transition-colors"><ArrowRight size={14} /></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </AnimatePresence>
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
            <h3 className="text-lg font-black uppercase tracking-tighter text-gray-900 mb-2">{title}</h3>
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