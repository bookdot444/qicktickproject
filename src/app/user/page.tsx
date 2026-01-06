"use client";

import { useEffect, useState } from "react";
import { Search, ListPlus, Send, Star, Award, ArrowRight, Users, MapPin, Briefcase } from "lucide-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react"; // Add useRef here
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
    const [find, setFind] = useState("");
    const [near, setNear] = useState("");
    const [categories, setCategories] = useState([]);
    const [helpAndEarn, setHelpAndEarn] = useState([]);
    const [loading, setLoading] = useState(true);
    const [businessType, setBusinessType] = useState("");
    const [brandingVideos, setBrandingVideos] = useState([]);
    const [imageBanners, setImageBanners] = useState([]);
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const [podcasts, setPodcasts] = useState([]);
    const [influencers, setInfluencers] = useState([]);
    const [certificates, setCertificates] = useState([]);

    // ... (keep existing imports and other states)

    const [cities, setCities] = useState<string[]>([]);
    const [businessTypes, setBusinessTypes] = useState<string[]>([]);
    const [searchFilters, setSearchFilters] = useState<{ locations: string[], types: string[] }>({ locations: [], types: [] }); // New state for dropdown data
    const [showResults, setShowResults] = useState(false);
    const [locationAvailability, setLocationAvailability] = useState<{ locations: string[] }>({ locations: [] });

    // Keep this useEffect as-is (it populates cities and businessTypes based on find)
    useEffect(() => {
        if (!find || find.length < 2) {
            setCities([]);
            setBusinessTypes([]);
            return;
        }

        const loadFiltersByProduct = async () => {
            const { data: products, error: productError } = await supabase
                .from("vendor_products")
                .select("vendor_id")
                .ilike("product_name", `%${find}%`)
                .eq("is_active", true);

            if (productError || !products?.length) {
                setCities([]);
                setBusinessTypes([]);
                return;
            }

            const vendorIds = [...new Set(products.map(p => p.vendor_id))];

            const { data: vendors, error: vendorError } = await supabase
                .from("vendor_register")
                .select("area, user_type")
                .in("id", vendorIds);

            if (vendorError || !vendors) return;

            const uniqueCities = Array.from(
                new Set(
                    vendors
                        .map(v => v.area?.toLowerCase().trim())
                        .filter(Boolean)
                )
            );

            const uniqueBusinessTypes = Array.from(
                new Set(
                    vendors.flatMap(v =>
                        Array.isArray(v.user_type)
                            ? v.user_type
                            : [v.user_type]
                    ).map(t => t?.toLowerCase().trim())
                )
            );

            setCities(uniqueCities);
            setBusinessTypes(uniqueBusinessTypes);
        };

        loadFiltersByProduct();
    }, [find]);

    // Replace the existing useEffect for searchResults with this (fetches unique locations and types for dropdown)
    // Replace the existing useEffect for searchFilters with this (fetches matching product names for autocomplete)
    useEffect(() => {
        if (!find || find.length < 2) {
            setSearchFilters({ products: [] });
            setShowResults(false);
            return;
        }

        const fetchSearchFilters = async () => {
            // Fetch matching product names from vendor_products
            const { data, error } = await supabase
                .from("vendor_products")
                .select("product_name")
                .ilike("product_name", `%${find}%`)
                .eq("is_active", true)
                .limit(10); // Limit to 10 suggestions for performance

            if (error) {
                console.error("Filter Fetch Error:", error);
                setSearchFilters({ products: [] });
                return;
            }

            // Extract unique product names
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

    // Check available locations for the selected product when typing in near
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
                .ilike("area", `%${near}%`); // Filter areas that match the typed location

            if (vendorError) {
                console.error("Location Check Error:", vendorError);
                setLocationAvailability({ locations: [] });
                return;
            }

            // Extract unique matching areas
            const locations = Array.from(
                new Set(
                    vendors.map(v => v.area?.toLowerCase().trim()).filter(Boolean)
                )
            );

            setLocationAvailability({ locations });
        };

        checkLocationAvailability();
    }, [find, near]);

    // Fetch Podcasts & Influencers
    useEffect(() => {
        const loadExtraMedia = async () => {
            const { data: podcastData } = await supabase
                .from("podcast_videos")
                .select("*")
                .order("created_at", { ascending: false });

            const { data: influencerData } = await supabase
                .from("influencers_videos")
                .select("*")
                .order("created_at", { ascending: false });

            setPodcasts(podcastData || []);
            setInfluencers(influencerData || []);
        };

        loadExtraMedia();
    }, []);

    useEffect(() => {
        if (!find || find.length < 2) {
            setCities([]);
            setBusinessTypes([]);
            return;
        }

        const loadFiltersByProduct = async () => {
            // 1️⃣ Get vendors selling this product
            const { data: products, error: productError } = await supabase
                .from("vendor_products")
                .select("vendor_id")
                .ilike("product_name", `%${find}%`)
                .eq("is_active", true);

            if (productError || !products?.length) {
                setCities([]);
                setBusinessTypes([]);
                return;
            }

            const vendorIds = [...new Set(products.map(p => p.vendor_id))];

            // 2️⃣ Fetch vendor details
            const { data: vendors, error: vendorError } = await supabase
                .from("vendor_register")
                .select("city, user_type")
                .in("id", vendorIds);

            if (vendorError || !vendors) return;

            // 3️⃣ Extract unique cities
            const uniqueCities = Array.from(
                new Set(
                    vendors
                        .map(v => v.city?.toLowerCase().trim())
                        .filter(Boolean)
                )
            );

            // 4️⃣ Extract unique business types
            const uniqueBusinessTypes = Array.from(
                new Set(
                    vendors.flatMap(v =>
                        Array.isArray(v.user_type)
                            ? v.user_type
                            : [v.user_type]
                    ).map(t => t?.toLowerCase().trim())
                )
            );

            setCities(uniqueCities);
            setBusinessTypes(uniqueBusinessTypes);
        };

        loadFiltersByProduct();
    }, [find]);

    useEffect(() => {
        const loadCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .not("image_url", "is", null) // SQL level filter
                .order("name");

            if (!error && data) {
                // Frontend level filter: ensure image_url isn't an empty string
                const validCategories = data.filter(cat => cat.image_url && cat.image_url.trim() !== "");
                setCategories(validCategories);
            }
            setLoading(false);
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const loadHomeMedia = async () => {
            const { data: videos } = await supabase
                .from("digital_branding_videos")
                .select("*")
                .order("created_at", { ascending: false });

            const { data: banners } = await supabase
                .from("digital_banners")
                .select("*")
                .order("created_at", { ascending: false });

            setBrandingVideos(videos || []);
            setImageBanners(banners || []);
        };

        loadHomeMedia();
    }, []);

    // Fetch Help & Earn
    useEffect(() => {
        const loadHelpAndEarn = async () => {
            const { data, error } = await supabase
                .from("help_and_earn")
                .select("*")
                .order("id", { ascending: true });

            if (!error) setHelpAndEarn(data || []);
        };
        loadHelpAndEarn();
    }, []);

    useEffect(() => {
        const loadCertificates = async () => {
            const { data, error } = await supabase
                .from("certificates")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error) setCertificates(data || []);
        };

        loadCertificates();
    }, []);

    useEffect(() => {
        if (!find || find.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const fetchSearchResults = async () => {
            // We select product details AND join with vendor_register (aliased via vendor_id)
            // to get city and user_type
            let query = supabase
                .from("vendor_products")
                .select(`
            id, 
            product_name, 
            price,
            vendor_id (
                area,
                user_type
            )
        `)
                .eq("is_active", true)
                .ilike("product_name", `%${find}%`)
                .limit(5);

            // If a city is selected, we filter by the city field in the JOINED table
            if (near) {
                query = query.filter("vendor_id.area", "eq", near);
            }

            const { data, error } = await query;

            if (!error) {
                setSearchResults(data || []);
                setShowResults(true);
            } else {
                console.error("Search Error:", error);
            }
        };

        fetchSearchResults();
    }, [find, near]);

    const handleSearch = () => {
        if (!find.trim()) {
            alert("Please enter what you need (e.g., Electrician, Plumber)."); // Or use a toast notification
            return;
        }

        setShowResults(false);
        setLocationAvailability({ locations: [] }); // Close any open dropdowns

        const params = new URLSearchParams();
        if (find) params.append("q", find);
        if (near) params.append("city", near); // Location is optional
        if (businessType) params.append("type", businessType); // Business type is optional

        router.push(`/user/search?${params.toString()}`);
    };

    const scrollRef = useRef<HTMLDivElement | null>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const card = container.querySelector(".category-card") as HTMLElement;

        if (!card) return;

        const gap = 32; // gap-8
        const scrollAmount = card.offsetWidth + gap;

        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white">
            {/* HERO SECTION - Redesigned with yellow/red/black theme */}
            <div className="relative w-full min-h-[280px] md:min-h-[460px] flex items-center justify-center">
                {/* Background Video with Enhanced Overlay */}
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="/home_video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-red-900/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-14 pb-10">
                    {/* Hero Text - More concise and impactful */}
                    <div className="text-center mb-10 animate-fade-in">
                        <h1 className="text-white text-4xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
                            Find Local <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
                                Experts Instantly
                            </span>
                        </h1>
                        <p className="text-gray-200 max-w-3xl mx-auto text-xl md:text-2xl font-light leading-relaxed">
                            Connect with trusted professionals for AC repair, plumbing, transport, and more.
                            <span className="font-semibold text-yellow-300">Your go-to platform for reliable services.</span>
                        </p>
                    </div>
                    <div className="max-w-6xl mx-auto relative z-50">
                        <div className="bg-black/40 backdrop-blur-2xl shadow-2xl p-6 md:p-8 rounded-3xl border border-yellow-500/30">
                            <div className="flex flex-col md:flex-row items-center gap-4 relative">

                                {/* Find Input Wrapper */}
                                {/* Find Input Wrapper */}
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
                                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                            />
                                        </div>
                                    </div>

                                    {/* Search Results Dropdown - Shows product suggestions */}
                                    {showResults && searchFilters.products.length > 0 && (
                                        <div className="absolute left-0 right-0 top-[110%] bg-white border border-yellow-500/30 rounded-2xl shadow-2xl z-[60] max-h-[300px] overflow-y-auto overscroll-contain">
                                            <div className="px-6 py-4">
                                                <p className="font-bold text-black text-base mb-2">Suggested Products</p>
                                                <div className="flex flex-col gap-2">
                                                    {searchFilters.products.map((product) => (
                                                        <span
                                                            key={product}
                                                            onClick={() => {
                                                                setFind(product.charAt(0).toUpperCase() + product.slice(1)); // Fixed: Set product input and capitalize
                                                                setShowResults(false); // Close dropdown
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

                                {/* Near Input - Changed from select to input */}
                                {/* Near Input - Changed from select to input */}
                                <div className="flex-1 relative group w-full"> {/* Added relative for dropdown positioning */}
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

                                    {/* Location Suggestions Dropdown */}
                                    {locationAvailability.locations.length > 0 && (
                                        <div className="absolute left-0 right-0 top-[110%] bg-white border border-yellow-500/30 rounded-2xl shadow-2xl z-[60] max-h-[200px] overflow-y-auto overscroll-contain">
                                            <div className="px-6 py-4">
                                                <p className="font-bold text-black text-base mb-2">Available Locations</p>
                                                <div className="flex flex-col gap-2">
                                                    {locationAvailability.locations.map((location) => (
                                                        <span
                                                            key={location}
                                                            onClick={() => {
                                                                setNear(location.charAt(0).toUpperCase() + location.slice(1)); // Correct: Set the location input
                                                                setLocationAvailability({ locations: [] }); // Close the location dropdown
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

                                {/* Business Type - Keep as select */}
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

                                {/* Search Button */}
                                <button
                                    onClick={handleSearch}
                                    className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-red-600 text-black px-10 py-5 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS – Clean White Background Design */}
            {/* HOW IT WORKS – Clean White Background Design */}
            <section className="py-24 bg-white relative z-0 overflow-hidden">                {/* Soft background accents */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-24 left-1/4 w-72 h-72 bg-yellow-200/40 rounded-full blur-3xl" />
                    <div className="absolute bottom-24 right-1/4 w-72 h-72 bg-red-200/40 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                            How <span className="text-yellow-500">QickTick</span> Works
                        </h2>
                        <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                            Find trusted local services in just a few simple steps — fast, reliable, and hassle-free.
                        </p>
                        <div className="mx-auto mt-6 h-1.5 w-28 rounded-full bg-gradient-to-r from-yellow-500 to-red-500" />
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
                        {[
                            {
                                icon: Search,
                                step: "01",
                                title: "Search Your Need",
                                desc: "Search for services like electricians, plumbers, transport, and more based on your requirement.",
                                accent: "text-yellow-500",
                                bg: "bg-yellow-50",
                            },
                            {
                                icon: MapPin,
                                step: "02",
                                title: "Choose Location",
                                desc: "Select your city to view verified professionals available near you for faster service.",
                                accent: "text-red-500",
                                bg: "bg-red-50",
                            },
                            {
                                icon: ListPlus,
                                step: "03",
                                title: "Compare Providers",
                                desc: "Check prices, ratings, experience, and reviews to confidently shortlist the best provider.",
                                accent: "text-yellow-500",
                                bg: "bg-yellow-50",
                            },
                            {
                                icon: Send,
                                step: "04",
                                title: "Connect Instantly",
                                desc: "Contact service providers directly to discuss availability, pricing, and service details.",
                                accent: "text-red-500",
                                bg: "bg-red-50",
                            },
                            {
                                icon: Award,
                                step: "05",
                                title: "Get It Done",
                                desc: "Hire verified professionals, complete your job smoothly, and leave feedback.",
                                accent: "text-yellow-500",
                                bg: "bg-yellow-50",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="group relative bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-sm hover:shadow-xl transition-all duration-500"
                            >
                                {/* Step number */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-sm font-black px-4 py-1 rounded-full shadow-md">
                                    {item.step}
                                </div>

                                {/* Icon */}
                                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`w-9 h-9 ${item.accent}`} strokeWidth={2} />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* POPULAR CATEGORIES - Redesigned with Light Yellow Theme */}
            <section className="py-24 bg-[#FFFBEB] overflow-hidden relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/50 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-100/50 rounded-full blur-3xl -ml-48 -mb-48" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-16">
                        <span className="text-red-600 font-bold tracking-[0.2em] uppercase text-xs mb-3">
                            Premium Services
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                            Popular <span className="text-red-600">Categories</span>
                        </h2>
                        <div className="h-1.5 w-20 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full mt-5" />
                    </div>

                    {/* Slider Container */}
                    <div className="relative group">
                        {/* Navigation Arrows - Only visible on hover/desktop */}
                        <button
                            onClick={() => scroll("left")}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex bg-white shadow-xl border border-gray-100 p-4 rounded-full text-gray-800 hover:bg-red-600 hover:text-white transition-all duration-300"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <button
                            onClick={() => scroll("right")}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex bg-white shadow-xl border border-gray-100 p-4 rounded-full text-gray-800 hover:bg-red-600 hover:text-white transition-all duration-300"
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* Cards Scroll Area */}
                        <div
                            ref={scrollRef}
                            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 px-2"
                        >
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className="min-w-[85%] md:min-w-[30%] h-80 bg-gray-200 rounded-3xl animate-pulse" />
                                ))
                            ) : (
                                categories.map((cat) => (
                                    cat.image_url && (
                                        <div
                                            key={cat.id}
                                            onClick={() => router.push(`/user/services/${cat.id}`)}
                                            className="category-card snap-center min-w-[85%] sm:min-w-[45%] lg:min-w-[31%] cursor-pointer group/item"
                                        >
                                            <div className="relative h-96 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white group-hover/item:shadow-2xl transition-all duration-500 transform group-hover/item:-translate-y-2">
                                                <Image
                                                    src={cat.image_url}
                                                    alt={cat.name}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover/item:scale-110"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />

                                                {/* Elegant Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover/item:opacity-90 transition-opacity duration-500" />

                                                {/* Text Content */}
                                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                                                            {cat.description && (
                                                                <p className="text-white text-sm mb-2 leading-relaxed">{cat.description}</p>
                                                            )}
                                                            <p className="text-yellow-400 text-sm font-medium tracking-wide">Explore Services →</p>
                                                        </div>
                                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover/item:bg-yellow-500 transition-colors duration-300">
                                                            <ChevronRight className="text-white group-hover/item:text-black" size={20} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))
                            )}
                        </div>
                    </div>

                    {/* View More Button */}
                    <div className="flex justify-center mt-12">
                        <Link
                            href="/user/view-more?type=categories"
                            className="group relative px-12 py-4 bg-gray-900 rounded-2xl overflow-hidden shadow-xl"
                        >
                            <div className="absolute inset-0 w-0 bg-red-600 transition-all duration-300 ease-out group-hover:w-full" />
                            <span className="relative z-10 text-white font-bold uppercase tracking-wider text-sm transition-colors duration-300">
                                View All Categories
                            </span>
                        </Link>
                    </div>
                </div>
            </section>
            {/* TRUST CTA - Redesigned & Compact with 3 Buttons */}
            <section className="py-16 bg-[#FEF3C7] relative overflow-hidden border-y border-yellow-200">
                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

                        {/* Text Content - Left Aligned for better flow */}
                        <div className="text-center lg:text-left flex-1">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                                Grow Your <span className="text-red-600">Business</span> with QickTick
                            </h2>
                            <p className="text-gray-700 text-lg font-medium max-w-xl">
                                Whether you're looking for expert services or want to reach more customers, we've got you covered.
                            </p>
                        </div>

                        {/* Action Buttons - 3 Button Layout */}
                        <div className="flex flex-wrap justify-center lg:justify-end gap-4 shrink-0">

                            {/* Post Requirements Button */}
                            <button
                                onClick={() => router.push('/user/enquiry')}
                                className="px-6 py-4 bg-white border-2 border-red-600 text-red-600 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-red-50 transition-all shadow-md active:scale-95"
                            >
                                Post Your Requirements
                            </button>

                            {/* View Enquiry Button */}
                            <button
                                onClick={() => router.push('/user/enquiry')}
                                className="px-6 py-4 bg-gray-900 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-black transition-all shadow-md active:scale-95"
                            >
                                View Enquiry
                            </button>

                            {/* Add Business Button */}
                            <button
                                onClick={() => router.push('/provider/register')}
                                className="px-6 py-4 bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95 flex items-center gap-2"
                            >
                                <span>Add Business</span>
                                <svg size={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                            </button>

                        </div>
                    </div>
                </div>
            </section>

            {/* DIGITAL BRANDING - Premium scroll with yellow/red/black accents */}
            <section className="py-24 bg-[#FCF9F1] overflow-hidden relative">
                {/* Decorative Background Text */}
                <div className="absolute top-10 left-10 text-9xl font-black text-black/[0.02] select-none pointer-events-none">
                    STUDIO
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-14">

                        {/* Tag */}
                        <span className="inline-block px-4 py-1.5 bg-red-100 text-red-600 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                            Visual Storytelling
                        </span>

                        {/* Title */}
                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
                            Digital <span className="text-yellow-600">Branding</span>
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 max-w-3xl mx-auto mt-6 text-lg leading-relaxed">
                            Elevate your presence. Showcase your business with high-impact video storytelling
                            that captures attention instantly.
                        </p>

                        {/* Controls Row (Arrows + View More) */}
                        <div className="mt-10 flex items-center justify-center gap-6">
                            {/* Arrows */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => scroll("left")}
                                    className="p-4 rounded-full border border-gray-200
        hover:bg-yellow-500 hover:border-yellow-500 transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <button
                                    onClick={() => scroll("right")}
                                    className="p-4 rounded-full bg-black text-white
        hover:bg-red-600 transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Divider */}
                            <span className="h-6 w-px bg-gray-300"></span>

                            {/* View More (Top) */}
                            <Link
                                href="/user/view-more?type=branding"
                                className="text-sm font-black uppercase tracking-widest
      text-gray-900 hover:text-yellow-600 transition"
                            >
                                View More →
                            </Link>
                        </div>
                    </div>


                    {/* Video Slider Container */}
                    <div className="relative">
                        <div
                            ref={scrollRef}
                            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                        >
                            {brandingVideos.length === 0 ? (
                                <div className="w-full py-32 text-center border-2 border-dashed border-yellow-200 rounded-[3rem] bg-yellow-50/50 text-gray-400 italic">
                                    No branding videos available yet.
                                </div>
                            ) : (
                                brandingVideos.map((video) => (
                                    <div
                                        key={video.id}
                                        className="min-w-[300px] md:min-w-[380px] group/card snap-start"
                                    >
                                        {/* The "Video Frame" */}
                                        <div className="relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-200 border-[8px] border-white transition-transform duration-500 group-hover/card:scale-[0.98]">
                                            <video
                                                src={video.video_url}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Overlay with subtle color tint */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/card:opacity-30 transition-opacity" />

                                            {/* Corner Accents */}
                                            <div className="absolute top-6 right-6 flex flex-col gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-bold text-white uppercase">Live</span>
                                            </div>

                                            {/* Floating Label */}
                                            <div className="absolute bottom-8 left-8 right-8">
                                                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500">
                                                    <p className="text-white font-bold tracking-wide uppercase text-sm">
                                                        Premium Showcase
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Custom Pagination Dots */}
                    <div className="flex justify-center items-center gap-3 mt-12">
                        <div className="h-1.5 w-12 bg-yellow-500 rounded-full" />
                        <div className="h-1.5 w-2 bg-gray-300 rounded-full" />
                        <div className="h-1.5 w-2 bg-gray-300 rounded-full" />
                    </div>
                </div>
            </section>

            {/* DIGITAL BANNERS - Fixed Image Layout */}
     <section className="py-24 bg-white relative">
    <div className="max-w-7xl mx-auto px-6 text-center">
        {/* ---------- CENTERED HEADER ---------- */}
        <div className="flex flex-col items-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter">
                Digital <span className="text-yellow-500 italic">Banners</span>
            </h2>
            <div className="w-20 h-1.5 bg-yellow-500 mt-4 mb-4 rounded-full" />
            <p className="text-gray-500 font-medium">
                Professional curated assets for your digital presence.
            </p>
            
            {/* Desktop View More - Centered below text */}
            <Link
                href="/user/view-more?type=banners"
                className="mt-8 hidden md:block"
            >
                <button
                    className="flex items-center gap-2 bg-gray-900 text-white hover:bg-yellow-500 hover:text-black transition-all px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:shadow-yellow-500/20"
                >
                    View All Banners <ArrowRight size={18} />
                </button>
            </Link>
        </div>

        {/* ---------- GRID SECTION ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imageBanners.slice(0, 3).map((banner: any) => (
                <div 
                    key={banner.id} 
                    className="group relative aspect-video rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                    <img 
                        src={banner.image_url} 
                        alt={banner.title || "Banner"} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    {/* Subtle Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                        <p className="text-white font-bold uppercase tracking-widest text-xs">
                            {banner.title || 'Premium Asset'}
                        </p>
                    </div>
                </div>
            ))}
        </div>

        {/* ---------- MOBILE VIEW MORE ---------- */}
        <div className="mt-12 md:hidden">
            <Link
                href="/user/view-more?type=banners"
                className="block w-full"
            >
                <button className="w-full py-4 bg-yellow-500 text-black font-black rounded-2xl shadow-lg hover:bg-yellow-600 transition-colors uppercase tracking-[0.2em] text-xs">
                    View More Banners
                </button>
            </Link>
        </div>
    </div>
</section>


            {/* TRANSPORT BANNER - Amber Premium Design */}
            <section className="py-20 bg-[#FEF3C7] relative overflow-hidden border-y border-yellow-200">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-red-400/10 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">

                    {/* Header Section */}
                    <div className="mb-12 text-center">
                        <span className="inline-block px-4 py-1 mb-4 bg-white/50 border border-yellow-300 text-red-600 text-xs font-bold uppercase tracking-[0.2em] rounded-full">
                            Logistics & Movement
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                            Transport <span className="text-red-600">Services</span>
                        </h2>
                        <p className="text-gray-700 mt-4 max-w-xl mx-auto text-lg font-medium leading-relaxed">
                            Explore our latest transport-related promotions.
                            <span className="block text-yellow-700 font-bold mt-1">Reliable • Fast • Secure</span>
                        </p>
                    </div>

                    {/* Banner and Button Container */}
                    <div className="flex flex-col items-center">
                        {/* The "Floating" Banner Frame */}
                        <div className="w-full max-w-5xl group relative">
                            {/* Shadow Glow behind the banner */}
                            <div className="absolute inset-0 bg-black/5 rounded-[2.5rem] blur-xl translate-y-4 group-hover:translate-y-6 transition-transform duration-500" />

                            <div className="relative h-[220px] md:h-[300px] rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white group-hover:border-yellow-100 transition-all duration-500">
                                <Image
                                    src="/transport_banner.jpg"
                                    alt="Transport Banner"
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    sizes="(max-width: 1200px) 100vw, 1200px"
                                />

                                {/* Glassmorphism Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
                            </div>
                        </div>

                        {/* Overlapping Action Button */}
                        <div className="-mt-10 relative z-20">
                            <button
                                onClick={() => router.push("/user/transport")}
                                className="group flex items-center gap-4 bg-gray-900 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] transform hover:-translate-y-1 active:scale-95"
                            >
                                <span className="border-r border-white/20 pr-4">Go to Transport Services</span>
                                <div className="bg-red-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* HELP & EARN - Premium Light Community Grid with View More */}
            <section className="py-24 bg-[#FFFDF5] relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-50" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-200/20 rounded-full blur-[100px]" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {/* Header Section */}
                    <div className="mb-20 text-center">
                        <span className="inline-block px-4 py-1.5 mb-4 bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-[0.2em] rounded-full">
                            Community Impact
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
                            Help & <span className="text-red-600">Earn</span>
                        </h2>
                        <div className="w-16 h-1 bg-red-600 mx-auto mt-6 rounded-full" />
                        <p className="text-gray-600 mt-8 max-w-2xl mx-auto text-xl leading-relaxed">
                            Contribute to local initiatives and earn rewards.
                            <span className="block text-yellow-600 font-bold mt-1">Make a difference in your community today.</span>
                        </p>
                    </div>

                    {/* Grid Container */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                        {helpAndEarn.length === 0 ? (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-yellow-200 rounded-[3rem] bg-yellow-50/50 text-gray-400 italic">
                                No community initiatives available at the moment.
                            </div>
                        ) : (
                            helpAndEarn.slice(0, 10).map((item) => ( // Show only first 10 on the main feed
                                <div
                                    key={item.id}
                                    onClick={() => router.push(`/user/help`)}
                                    className="group relative flex flex-col items-center cursor-pointer"
                                >
                                    <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden bg-white shadow-lg border-[6px] border-white group-hover:shadow-2xl group-hover:border-yellow-400/20 transition-all duration-500 ease-in-out">
                                        {item.image_url ? (
                                            <Image
                                                src={item.image_url}
                                                alt={item.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50">
                                                <span className="text-[10px] uppercase tracking-widest font-black">Design Pending</span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-red-600/90 via-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                <span className="text-white font-black text-xs uppercase tracking-widest bg-black/30 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/20">
                                                    Join Now
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <p className="text-gray-900 font-black text-lg group-hover:text-red-600 transition-colors duration-300">
                                            {item.name}
                                        </p>
                                        <div className="w-0 group-hover:w-8 h-1 bg-yellow-500 mx-auto mt-2 transition-all duration-500 rounded-full" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* VIEW MORE DETAILS BUTTON */}
                    <div className="mt-20 flex flex-col items-center">
                        <button
                            onClick={() => router.push('/user/view-more?type=help')}
                            className="group flex items-center gap-4 bg-White text-black px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
                        >
                            <span className="border-r border-white/20 pr-4">View More Details</span>
                            <div className="bg-red-600 p-2 rounded-lg group-hover:rotate-45 transition-transform duration-300">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                        </button>

                        {/* Visual indicator */}
                        <div className="mt-8 flex gap-1.5">
                            <div className="w-8 h-1.5 bg-red-600 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CERTIFICATES SECTION - Amber Gallery */}
            <section className="py-24 bg-[#FEF3C7] border-y border-yellow-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-16 text-center">
                        <span className="text-red-600 font-bold tracking-widest uppercase text-xs">Verified Excellence</span>
                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 mt-2">
                            Our <span className="text-yellow-600 drop-shadow-sm">Certificates</span>
                        </h2>
                        <p className="text-yellow-900/70 mt-6 max-w-2xl mx-auto text-xl font-medium">
                            Celebrating our achievements and recognitions over the years.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {certificates.slice(0, 4).map((item) => (
                            <div key={item.id} className="group bg-white p-4 rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-all duration-500">
                                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100">
                                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                </div>
                                <h3 className="text-gray-900 font-black text-lg mt-5 text-center px-2">{item.name}</h3>
                            </div>
                        ))}
                    </div>

                    {/* VIEW MORE BUTTON */}
                    <div className="mt-16 flex justify-center">
                        <button onClick={() => router.push('/user/view-more?type=certificates')} className="group flex items-center gap-4 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl hover:shadow-2xl">
                            <span className="border-r border-white/20 pr-4">View All Certificates</span>
                            <div className="bg-red-600 p-2 rounded-lg group-hover:rotate-90 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                            </div>
                        </button>
                    </div>
                </div>
            </section>

            {/* PODCASTS SECTION - Light Cream Background */}
            <section className="py-24 bg-[#FFFDF5]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-black text-gray-900">
                            Latest <span className="text-red-600">Podcasts</span>
                        </h2>
                        <div className="w-12 h-1.5 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
                    </div>

                    <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-8 px-2">
                        {podcasts.slice(0, 6).map((podcast) => (
                            <div key={podcast.id} className="min-w-[320px] md:min-w-[400px] group">
                                <div className="h-[240px] rounded-[2.5rem] overflow-hidden shadow-lg border-4 border-white relative">
                                    <video src={podcast.video_url} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-all">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[15px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="mt-6 text-xl font-black text-gray-900 text-center">{podcast.title || podcast.name}</h3>
                            </div>
                        ))}
                    </div>

                    {/* VIEW MORE BUTTON */}
                    <div className="mt-12 flex justify-center">
                        <button onClick={() => router.push('/user/view-more?type=podcasts')} className="group flex items-center gap-4 bg-white border-2 border-gray-900 text-gray-900 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-lg">
                            <span>Explore Podcasts</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                </div>
            </section>
            {/* INFLUENCERS SECTION - Split Media Design (Image & Video) */}
            <section className="py-24 bg-[#FEF3C7] border-t border-yellow-200 relative overflow-hidden">
                {/* Background Decorative Element */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FDE68A]/30 -skew-x-12 translate-x-20 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {/* HEADER */}
                    <div className="text-center mb-16">
                        <span className="text-red-600 font-black tracking-[0.4em] uppercase text-xs">
                            Community Voices
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 mt-4">
                            Our <span className="text-yellow-600">Influencers</span>
                        </h2>
                        <div className="w-16 h-2 bg-red-600 mx-auto mt-6 rounded-full" />
                    </div>

                    {/* DUAL MEDIA GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                        {/* LEFT SIDE — IMAGES ONLY */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-px flex-1 bg-yellow-400/50"></div>
                                <span className="text-yellow-800 font-black text-sm uppercase tracking-widest">
                                    Brand Ambassadors
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {influencers
                                    .filter(inf => inf.media_type === "image")
                                    .slice(0, 4)
                                    .map((inf) => (
                                        <div
                                            key={inf.id}
                                            className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-white transition-all duration-500 hover:-rotate-2"
                                        >
                                            <Image
                                                src={inf.media_url}
                                                alt={inf.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                                                <p className="text-white font-bold text-lg">{inf.name}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* RIGHT SIDE — VIDEOS ONLY */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-yellow-800 font-black text-sm uppercase tracking-widest">
                                    Live Stories
                                </span>
                                <div className="h-px flex-1 bg-yellow-400/50"></div>
                            </div>

                            <div className="flex gap-4 overflow-x-auto lg:overflow-visible lg:grid lg:grid-cols-2 scrollbar-hide">
                                {influencers
                                    .filter(inf => inf.media_type === "video")
                                    .slice(0, 2)
                                    .map((inf) => (
                                        <div
                                            key={inf.id}
                                            className="min-w-[240px] group relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl border-[6px] border-white bg-black transition-all duration-700 hover:shadow-red-500/20"
                                        >
                                            <video
                                                src={inf.media_url}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
                                            />

                                            {/* CONTENT OVERLAY */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 flex flex-col justify-end">
                                                <p className="text-white font-black text-2xl mb-1">
                                                    {inf.name}
                                                </p>
                                                <div className="w-8 h-1 bg-red-600 rounded-full group-hover:w-full transition-all duration-500" />
                                            </div>

                                            {/* PLAY BADGE */}
                                            <div className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[10px] border-l-white border-b-[5px] border-b-transparent ml-1" />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                    </div>

                    {/* VIEW MORE BUTTON */}
                    <div className="mt-20 flex justify-center">
                        <button
                            onClick={() => router.push("/user/view-more?type=influencers")}
                            className="group flex items-center gap-5 bg-gray-900 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1"
                        >
                            <span className="border-r border-white/10 pr-5">
                                View All Stories
                            </span>
                            <div className="bg-red-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
}