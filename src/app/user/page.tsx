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

// Define types for better type safety (adjust based on your Supabase schema)
type Podcast = {
    id: string;
    title?: string;
    name?: string;
    video_url: string;
    created_at: string;
    // Add other fields as needed
};

type Influencer = {
    id: string;
    name: string;
    media_url: string;
    media_type: "image" | "video";
    created_at: string;
    // Add other fields as needed
};

type Category = {
    id: string;
    name: string;
    image_url: string;
    description?: string;
    // Add other fields as needed
};

type BrandingVideo = {
    id: string;
    video_url: string;
    created_at: string;
    // Add other fields as needed (e.g., title, description)
};

type ImageBanner = {
    id: string;
    image_url: string;
    title?: string;
    created_at: string;
    // Add other fields as needed
};

type HelpAndEarn = {
    id: string;
    name: string;
    image_url?: string;
    // Add other fields as needed
};

type Certificate = {
    id: string;
    name: string;
    image_url: string;
    created_at: string;
    // Add other fields as needed
};

export default function Home() {
    const [find, setFind] = useState("");
    const [near, setNear] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [helpAndEarn, setHelpAndEarn] = useState<HelpAndEarn[]>([]);
    const [loading, setLoading] = useState(true);
    const [businessType, setBusinessType] = useState("");
    const [brandingVideos, setBrandingVideos] = useState<BrandingVideo[]>([]);
    const [imageBanners, setImageBanners] = useState<ImageBanner[]>([]);
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const bannerScrollRef = useRef<HTMLDivElement | null>(null);
    const [isBannersPaused, setIsBannersPaused] = useState(false); // Distinct from branding video pause state
    const [cities, setCities] = useState<string[]>([]);
    const [businessTypes, setBusinessTypes] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [locationAvailability, setLocationAvailability] = useState<{ locations: string[] }>({ locations: [] });
    const brandingScrollRef = useRef<HTMLDivElement | null>(null);
    const [isBrandingPaused, setIsBrandingPaused] = useState(false);

    // Update state declarations with proper types
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [influencers, setInfluencers] = useState<Influencer[]>([]);

    // Update the searchFilters state to only include products
    const [searchFilters, setSearchFilters] = useState<{ products: string[] }>({ products: [] });

    // Single useEffect for searchFilters (removed duplicate)
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
    const scrollBranding = (direction: "left" | "right") => {
        if (!brandingScrollRef.current) return;

        const container = brandingScrollRef.current;
        const firstCard = container.querySelector("a") as HTMLElement;
        const gap = 20;

        const scrollAmount = firstCard
            ? firstCard.offsetWidth + gap
            : 360;

        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };


    const podcastScrollRef = useRef<HTMLDivElement | null>(null);
    const scrollPodcasts = (direction: "left" | "right") => {
        if (!podcastScrollRef.current) return;
        const container = podcastScrollRef.current;
        const scrollAmount = 400 + 32; // Card width + gap
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };
    const AUTO_SCROLL_DELAY = 2000;

    useEffect(() => {
        const slider = brandingScrollRef.current;
        if (!slider || isBrandingPaused) return;

        const autoScrollBranding = setInterval(() => {
            const firstCard = slider.querySelector("a") as HTMLElement;
            const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 360;
            const maxScroll = slider.scrollWidth - slider.clientWidth;

            if (slider.scrollLeft >= maxScroll - 10) {
                slider.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                slider.scrollBy({ left: cardWidth, behavior: "smooth" });
            }
        }, AUTO_SCROLL_DELAY);

        return () => clearInterval(autoScrollBranding);
    }, [isBrandingPaused, brandingVideos]);

    useEffect(() => {
        const slider = bannerScrollRef.current;
        if (!slider || isBannersPaused) return;

        const autoScrollBanners = setInterval(() => {
            // Calculate the width of one banner card plus the gap (gap-6 = 24px)
            const firstCard = slider.querySelector('div');
            const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 450;
            const maxScroll = slider.scrollWidth - slider.clientWidth;

            if (slider.scrollLeft >= maxScroll - 10) {
                // Smoothly slide back to the beginning
                slider.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                // Move to the next banner
                slider.scrollBy({ left: cardWidth, behavior: "smooth" });
            }
        }, 1500); // Banners move every 4 seconds

        return () => clearInterval(autoScrollBanners);
    }, [isBannersPaused, imageBanners]);

    // Add this specific scroll handler for banners
    const scrollBanners = (direction: "left" | "right") => {
        if (!bannerScrollRef.current) return;
        const container = bannerScrollRef.current;
        // Adjust scroll amount based on banner width (approx 480px + gap)
        const scrollAmount = 500;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const [isPaused, setIsPaused] = useState(false);

    const helpScrollRef = useRef<HTMLDivElement | null>(null);
    const [isHelpPaused, setIsHelpPaused] = useState(false);
    useEffect(() => {
        const slider = helpScrollRef.current;
        if (!slider || isHelpPaused) return;

        const autoScrollHelp = setInterval(() => {
            const firstCard = slider.querySelector('div');
            const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 200;
            const maxScroll = slider.scrollWidth - slider.clientWidth;

            if (slider.scrollLeft >= maxScroll - 10) {
                slider.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                slider.scrollBy({ left: cardWidth, behavior: "smooth" });
            }
        }, 1500);

        return () => clearInterval(autoScrollHelp);
    }, [isHelpPaused, helpAndEarn]);

    const [isPodcastsPaused, setIsPodcastsPaused] = useState(false);
    const certificatesScrollRef = useRef<HTMLDivElement | null>(null);
    const [isCertificatesPaused, setIsCertificatesPaused] = useState(false);
    useEffect(() => {
        const slider = podcastScrollRef.current;
        if (!slider || isPodcastsPaused) return;

        const autoScrollPodcasts = setInterval(() => {
            const firstCard = slider.querySelector('div');
            const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 360;
            const maxScroll = slider.scrollWidth - slider.clientWidth;

            if (slider.scrollLeft >= maxScroll - 10) {
                slider.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                slider.scrollBy({ left: cardWidth, behavior: "smooth" });
            }
        }, 1500); // Scrolls every 4.5 seconds

        return () => clearInterval(autoScrollPodcasts);
    }, [isPodcastsPaused, podcasts]);
    useEffect(() => {
        const slider = certificatesScrollRef.current;
        if (!slider || isCertificatesPaused) return;

        const autoScrollCertificates = setInterval(() => {
            const firstCard = slider.querySelector('div');
            const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 220; // Approximate card width + gap (adjust if needed)
            const maxScroll = slider.scrollWidth - slider.clientWidth;

            if (slider.scrollLeft >= maxScroll - 10) {
                slider.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                slider.scrollBy({ left: cardWidth, behavior: "smooth" });
            }
        }, 2000); // Scrolls every 3 seconds

        return () => clearInterval(autoScrollCertificates);
    }, [isCertificatesPaused, certificates]);
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
            <section className="pt-6 pb-6 sm:pt-8 sm:pb-8 bg-white relative z-0 overflow-hidden">
                {/* Soft background accents */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-24 left-1/4 w-56 sm:w-72 h-56 sm:h-72 bg-yellow-200/40 rounded-full blur-3xl" />
                    <div className="absolute bottom-24 right-1/4 w-56 sm:w-72 h-56 sm:h-72 bg-red-200/40 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

                    {/* Section Header - REDUCED MARGIN BOTTOM HERE */}
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-5xl sm:text-5xl md:text-5xl font-black text-gray-900">
                            How <span className="text-yellow-500">QickTick</span> Works
                        </h2>

                        <p className="mt-2 sm:mt-3 text-gray-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                            Find trusted local services in just a few simple steps — fast, reliable, and hassle-free.
                        </p>

                        <div className="mx-auto mt-4 sm:mt-5 h-1.5 w-20 sm:w-28 rounded-full bg-gradient-to-r from-yellow-500 to-red-500" />
                    </div>

                    {/* Steps Grid */}
                    <div className="
            flex gap-4 overflow-x-auto pb-4
            sm:grid sm:grid-cols-2
            lg:grid-cols-5
            sm:gap-6        {/* Reduced gap between cards */}
            snap-x snap-mandatory
            scrollbar-hide
        ">
                        {[
                            {
                                icon: Search,
                                step: "01",
                                title: "Search Your Need",
                                desc: "Search for services like electricians, plumbers, and more.",
                                accent: "text-yellow-500",
                                bg: "bg-yellow-50",
                            },
                            {
                                icon: MapPin,
                                step: "02",
                                title: "Choose Location",
                                desc: "Select your city to view verified professionals near you.",
                                accent: "text-red-500",
                                bg: "bg-red-50",
                            },
                            {
                                icon: ListPlus,
                                step: "03",
                                title: "Compare Providers",
                                desc: "Check prices, ratings, and reviews to shortlist the best.",
                                accent: "text-yellow-500",
                                bg: "bg-yellow-50",
                            },
                            {
                                icon: Send,
                                step: "04",
                                title: "Connect Instantly",
                                desc: "Contact providers directly to discuss details and pricing.",
                                accent: "text-red-500",
                                bg: "bg-red-50",
                            },
                            {
                                icon: Award,
                                step: "05",
                                title: "Get It Done",
                                desc: "Hire professionals, complete the job, and leave feedback.",
                                accent: "text-yellow-500",
                                bg: "bg-yellow-50",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="
                        group relative bg-white border border-gray-100
                        rounded-2xl 
                        p-5 sm:p-6    {/* Reduced internal card padding */}
                        text-center shadow-sm hover:shadow-lg
                        transition-all duration-500
                        min-w-[240px] sm:min-w-0
                        snap-start
                    "
                            >
                                {/* Icon - Slightly smaller margin */}
                                <div
                                    className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl ${item.bg}
                        flex items-center justify-center group-hover:scale-110 transition-transform`}
                                >
                                    <item.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${item.accent}`} strokeWidth={2} />
                                </div>

                                {/* Content */}
                                <h3 className="text-md sm:text-lg font-bold text-gray-900 mb-2">
                                    {item.title}
                                </h3>

                                <p className="text-gray-500 text-xs sm:text-sm leading-snug">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* POPULAR CATEGORIES GRID - MOBILE FRIENDLY */}
            <section className="py-8 md:py-10 bg-[#FFFBEB]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">

                    {/* --- HEADER --- */}
                    <div className="mb-6 text-center">
                        <h2 className="text-5xl sm:text-5xl md:text-5xl font-extrabold text-gray-900">
                            Popular <span className="text-red-600">Categories</span>
                        </h2>
                        <p className="mt-2 text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
                            Select a category below to quickly find services you need.
                        </p>
                    </div>

                    {/* --- RESPONSIVE GRID --- */}
                    <div className="
    grid 
    grid-cols-4          {/* 4 columns on mobile */}
    lg:grid-cols-10      {/* 10 columns on desktop */}
    gap-4 
    justify-items-center
">
                        {loading ? (
                            // Skeleton should match the 40 items
                            [...Array(40)].map((_, i) => (
                                <div key={i} className="flex flex-col items-center animate-pulse">
                                    <div className="w-16 h-16 sm:w-20 rounded-xl bg-gray-200 mb-2" />
                                    <div className="h-3 w-12 bg-gray-200 rounded" />
                                </div>
                            ))
                        ) : (
                            // Limit to 40 items to ensure exactly 4 rows (desktop) or 10 rows (mobile)
                            categories?.slice(0, 40).map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex flex-col items-center cursor-pointer active:scale-95 transition group w-full"
                                    onClick={() => router.push(`/user/services/${cat.id}`)}
                                >
                                    {/* --- IMAGE BOX --- */}
                                    <div className="
                    relative 
                    overflow-hidden
                    w-16 h-16          {/* Fixed square size */}
                    sm:w-20 sm:h-20 
                    rounded-xl 
                    bg-white 
                    border border-gray-100 
                    shadow-sm 
                    group-hover:shadow-md
                ">
                                        {cat.image_url ? (
                                            <Image
                                                src={cat.image_url}
                                                alt={cat.name}
                                                fill // This makes the image fill the container
                                                sizes="(max-width: 768px) 64px, 80px"
                                                className="object-cover" // Ensures the photo fits perfectly into the box
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 font-bold">
                                                {cat.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* --- LABEL --- */}
                                    <p className="
                    mt-1.5 
                    text-[10px] 
                    sm:text-xs 
                    font-medium 
                    text-gray-700 
                    text-center 
                    truncate 
                    w-full
                ">
                                        {cat.name}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* --- VIEW ALL BUTTON --- */}
                    <div className="mt-6 flex justify-center">
                        <Link
                            href="/user/ViewAllCategories"
                            className="
          group 
          flex items-center gap-2 
          text-red-600 
          font-bold 
          text-sm 
          bg-red-50 
          px-6 py-2 
          rounded-full 
          hover:bg-red-600 hover:text-white 
          transition
        "
                        >
                            View all categories
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>

                </div>
            </section>

            {/* TRUST CTA - Redesigned & Compact with 3 Buttons */}
            <section className=" pt-6 pb-8 py-10  bg-[#FEF3C7] relative overflow-hidden border-y border-yellow-200">
                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

                        {/* Text Content - Left Aligned for better flow */}
                        <div className="text-center lg:text-left flex-1">
                            <h2 className="text-5xl md:text-5xl font-black text-gray-900 mb-3">
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


                        </div>
                    </div>
                </div>
            </section>

            {/* DIGITAL BRANDING - Compact Studio Slider */}
<section className="pt-6 pb-8 md:py-8 bg-[#FCF9F1] overflow-hidden relative border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="mb-6">
                            <span className="text-red-600 font-bold tracking-[0.2em] uppercase text-[10px] mb-2 block">
                                Creative Studio
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter">
                                Digital <span className="text-yellow-600">Branding</span>
                            </h2>
                            <div className="w-12 h-1 bg-red-600 mx-auto mt-3 rounded-full" />
                            <p className="text-gray-500 mt-4 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                                High-impact video storytelling to elevate your digital presence.
                            </p>
                        </div>

                        {/* Compact Control Pill */}
                        <div className="flex items-center gap-4 bg-white px-5 py-2 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => scrollBranding("left")}
                                    className="p-2 rounded-full border border-gray-200 hover:bg-yellow-500 hover:border-yellow-500 transition-all"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={() => scrollBranding("right")}
                                    className="p-2 rounded-full bg-black text-white hover:bg-red-600 transition-all"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                            <span className="h-4 w-px bg-gray-200"></span>
                            <Link
                                href="/user/view-more?type=branding"
                                className="text-[10px] font-black uppercase tracking-widest text-gray-900 hover:text-red-600 transition flex items-center gap-1"
                            >
                                View More <ArrowRight size={12} />
                            </Link>
                        </div>
                    </div>

                    {/* --- VIDEO SLIDER --- */}
                    <div
                        ref={brandingScrollRef}
                        onMouseEnter={() => setIsBrandingPaused(true)}
                        onMouseLeave={() => setIsBrandingPaused(false)}

                        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 
                                scrollbar-none ms-overflow-style-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {brandingVideos.map((video) => (
                            <Link
                                key={video.id}
                                href="/user/view-more?type=branding"
                                className="min-w-[280px] md:min-w-[340px] group/card snap-start block"
                            >
                                <div className="relative h-[200px] md:h-[240px] rounded-[2rem] overflow-hidden shadow-lg bg-gray-200 border-4 border-white transition-all duration-500 group-hover/card:border-yellow-400 group-hover/card:shadow-2xl">
                                    <video
                                        src={video.video_url}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity" />

                                    <div className="absolute bottom-5 left-5 right-5">
                                        <div className="bg-white/10 backdrop-blur-md border border-white/20 py-2.5 px-4 rounded-xl transform translate-y-2 group-hover/card:translate-y-0 transition-all duration-500 flex justify-between items-center">
                                            <p className="text-white font-bold tracking-wide uppercase text-[10px]">
                                                Premium Showcase
                                            </p>
                                            <ArrowRight size={14} className="text-white group-hover/card:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* --- COMPACT PAGINATION --- */}
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <div className="h-1 w-8 bg-yellow-500 rounded-full" />
                        <div className="h-1 w-1 bg-gray-300 rounded-full" />
                        <div className="h-1 w-1 bg-gray-300 rounded-full" />
                    </div>
                </div>
            </section>

            {/* DIGITAL BANNERS - Premium Scrolling Layout */}
            <section className="pt-6 pb-8 py-18 md:py-8 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">

                    {/* --- CENTERED HEADER & CONTROLS --- */}
                    <div className="flex flex-col items-center text-center mb-10">
                        {/* Title Section */}
                        <div className="mb-6">
                            <h2 className="text-5xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter">
                                Digital <span className="text-yellow-500">Banners</span>
                            </h2>
                            {/* Centered Decorative Line */}
                            <div className="w-16 h-1 bg-yellow-500 mt-3 mb-4 rounded-full mx-auto" />
                            <p className="text-gray-500 font-medium text-sm md:text-base max-w-lg mx-auto">
                                Professional curated assets for your digital presence.
                            </p>
                        </div>

                        {/* NEW CENTERED ARROW & ACTION CONTROLS */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            {/* Arrows Group */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => scrollBanners("left")}
                                    className="p-2.5 rounded-full border border-gray-200 text-gray-400 hover:bg-yellow-500 hover:border-yellow-500 hover:text-black transition-all shadow-sm active:scale-90"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => scrollBanners("right")}
                                    className="p-2.5 rounded-full border border-gray-200 text-gray-400 hover:bg-yellow-500 hover:border-yellow-500 hover:text-black transition-all shadow-sm active:scale-90"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Divider - Hidden on very small screens */}
                            <span className="hidden sm:block h-6 w-px bg-gray-200 mx-1"></span>

                            {/* View All Button */}
                            <Link href="/user/view-more?type=banners">
                                <button className="flex items-center gap-2 bg-gray-900 text-white hover:bg-yellow-500 hover:text-black transition-all px-6 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-wider shadow-md">
                                    View All <ArrowRight size={14} />
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* ---------- SCROLLING SECTION ---------- */}
                    {/* ---------- SCROLLING SECTION ---------- */}
                    <div className="relative -mx-4">
                        <div
                            ref={bannerScrollRef}
                            onMouseEnter={() => setIsBannersPaused(true)}  // STOP when mouse enters
                            onMouseLeave={() => setIsBannersPaused(false)} // START when mouse leaves
                            className="
            flex gap-6 overflow-x-auto
            snap-x snap-mandatory
            px-4
            /* This line hides the scrollbar completely */
            scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        "
                            style={{
                                paddingBottom: '30px',
                                marginBottom: '-30px'
                            }}
                        >
                            {imageBanners.map((banner: any) => (
                                <div
                                    key={banner.id}
                                    onClick={() => router.push("/user/view-more?type=banners")}
                                    className="
    group relative aspect-video
    min-w-[280px] md:min-w-[400px] lg:min-w-[480px]
    rounded-3xl overflow-hidden
    border border-gray-100 shadow-sm
    hover:shadow-2xl hover:-translate-y-3
    transition-all duration-500
    snap-center
    cursor-pointer
  "
                                >


                                    <img
                                        src={banner.image_url}
                                        alt={banner.title || "Banner"}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
                                    />


                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-left">
                                        <p className="text-yellow-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                                            Premium Asset
                                        </p>
                                        <h3 className="text-white font-bold text-xl leading-tight">
                                            {banner.title || 'Untitled Banner'}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* COMPACT TRANSPORT BANNER */}
            <section className="pt-6 pb-8 py-18 md:py-8 bg-[#FEF3C7] relative overflow-hidden border-y border-yellow-200">
                {/* Decorative Elements - Scaled down */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" />

                <div className="max-w-5xl mx-auto px-6 relative z-10">

                    {/* --- COMPACT HEADER --- */}
                    <div className="mb-8 text-center">
                        <span className="inline-block px-3 py-0.5 mb-3 bg-white/50 border border-yellow-300 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                            Logistics
                        </span>
                        <h2 className="text-5xl md:text-5xl font-black text-gray-900 tracking-tight">
                            Transport <span className="text-red-600">Services</span>
                        </h2>
                        <p className="text-gray-600 mt-2 text-xs md:text-sm font-medium">
                            Reliable • Fast • Secure Movement
                        </p>
                    </div>

                    {/* --- SMALLER BANNER FRAME --- */}
                    <div className="flex flex-col items-center">
                        <div className="w-full max-w-3xl group relative">
                            {/* Shadow Glow */}
                            <div className="absolute inset-0 bg-black/5 rounded-3xl blur-lg translate-y-2 group-hover:translate-y-4 transition-transform duration-500" />

                            <div className="relative h-[150px] md:h-[200px] rounded-3xl overflow-hidden shadow-xl border-4 border-white transition-all duration-500">
                                <Image
                                    src="/transport_banner.jpg"
                                    alt="Transport Banner"
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                            </div>
                        </div>

                        {/* --- COMPACT ACTION BUTTON --- */}
                        <div className="-mt-6 relative z-20">
                            <button
                                onClick={() => router.push("/user/transport")}
                                className="group flex items-center gap-3 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl hover:-translate-y-0.5 active:scale-95"
                            >
                                <span>Explore Services</span>
                                <div className="bg-red-600 p-1.5 rounded-md group-hover:translate-x-1 transition-transform">
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* HELP & EARN - Compact Community Grid */}
            <section className="pt-6 pb-8 py-18 md:py-8 pt-8 bg-[#FFFDF5] relative overflow-hidden">
                {/* Decorative Elements - Reduced */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-30" />
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-200/20 rounded-full blur-[60px]" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">

                    {/* --- COMPACT CENTERED HEADER --- */}
                    <div className="mb-10 text-center">
                        <span className="inline-block px-3 py-1 mb-3 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                            Community Impact
                        </span>
                        <h2 className="text-5xl md:text-5xl font-black text-gray-900 tracking-tight">
                            Help & <span className="text-red-600">Earn</span>
                        </h2>
                        <div className="w-12 h-1 bg-red-600 mx-auto mt-3 rounded-full" />
                        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                            Contribute to local initiatives and earn rewards.
                            <span className="font-bold text-yellow-600 ml-1">Make a difference today.</span>
                        </p>
                    </div>

                    {/* --- GRID CONTAINER --- */}
                    {/* --- SCROLLING CONTAINER --- */}
                    <div className="relative -mx-4">
                        <div
                            ref={helpScrollRef}
                            onMouseEnter={() => setIsHelpPaused(true)}
                            onMouseLeave={() => setIsHelpPaused(false)}
                            className="
            flex gap-6 overflow-x-auto
            snap-x snap-mandatory
            px-4
            scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        "
                        >
                            {helpAndEarn.length === 0 ? (
                                <div className="w-full py-10 text-center border-2 border-dashed border-yellow-200 rounded-3xl bg-yellow-50/50 text-gray-400  text-sm">
                                    No community initiatives available.
                                </div>
                            ) : (
                                helpAndEarn.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => router.push(`/user/help`)}
                                        className="group relative flex flex-col items-center cursor-pointer min-w-[160px] md:min-w-[200px] snap-center"
                                    >
                                        {/* BOX FRAME */}
                                        <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden bg-white shadow-md border-4 border-white group-hover:shadow-xl group-hover:border-red-400/20 transition-all duration-500">
                                            {item.image_url ? (
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50 text-[8px] uppercase font-bold">Design Pending</div>
                                            )}

                                            {/* JOIN OVERLAY */}
                                            <div className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                                <span className="text-white font-black text-[10px] uppercase tracking-widest bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                                                    Join Now
                                                </span>
                                            </div>
                                        </div>

                                        {/* NAME */}
                                        <div className="mt-4 text-center">
                                            <p className="text-gray-900 font-bold text-sm group-hover:text-red-600 transition-colors">
                                                {item.name}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* --- COMPACT VIEW MORE BUTTON --- */}
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => router.push('/user/view-more?type=help')}
                            className="group flex items-center gap-3 bg-white border border-gray-100 text-black px-8 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            <span>View All Details</span>
                            <div className="bg-red-600 p-1.5 rounded-lg group-hover:translate-x-1 transition-transform">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </section>

            {/* CERTIFICATES SECTION - Compact Amber Gallery */}
            <section className="pt-6 pb-8 py-18 md:py-5 pt-8 bg-[#FEF3C7] border-y border-yellow-200">
                <div className="max-w-6xl mx-auto px-6">

                    {/* --- COMPACT HEADER --- */}
                    <div className="mb-10 text-center">
                        <span className="text-red-600 font-bold tracking-[0.2em] uppercase text-[10px]">
                            Verified Excellence
                        </span>
                        <h2 className="text-5xl md:text-5xl font-black text-gray-900 mt-2 tracking-tight">
                            Our <span className="text-yellow-600 drop-shadow-sm">Certificates</span>
                        </h2>
                        <div className="w-12 h-1 bg-yellow-500 mx-auto mt-3 rounded-full opacity-50" />
                        <p className="text-yellow-900/70 mt-4 max-w-xl mx-auto text-sm md:text-base font-medium">
                            Celebrating our achievements and recognitions over the years.
                        </p>
                    </div>

                    {/* --- COMPACT GRID --- */}
                    <div
                        ref={certificatesScrollRef}
                        onMouseEnter={() => setIsCertificatesPaused(true)}
                        onMouseLeave={() => setIsCertificatesPaused(false)}
                        className="flex gap-5 overflow-x-auto pb-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 snap-x snap-mandatory hide-scrollbar"
                    >
                        {certificates.slice(0, 4).map((item) => (
                            <div
                                key={item.id}
                                onClick={() => router.push("/user/view-more?type=certificates")}
                                className="
    group bg-white p-3
    rounded-[2rem] shadow-lg
    hover:-translate-y-1.5 transition-all duration-500
    min-w-[220px] sm:min-w-0
    snap-start border border-yellow-100
    cursor-pointer
  "
                            >

                                <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-gray-50">
                                    <Image
                                        src={item.image_url}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                                    />

                                </div>
                                <h3
                                    onClick={() => router.push("/user/view-more?type=certificates")}
                                    className="text-gray-900 font-bold text-sm mt-4 text-center px-2 line-clamp-1 cursor-pointer"
                                >
                                    {item.name}
                                </h3>
                            </div>
                        ))}
                    </div>

                    {/* --- COMPACT ACTION BUTTON --- */}
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => router.push('/user/view-more?type=certificates')}
                            className="group flex items-center gap-3 bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                        >
                            <span className="border-r border-white/10 pr-3">View All</span>
                            <div className="bg-red-600 p-1.5 rounded-md group-hover:rotate-90 transition-transform duration-300">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </section>

            {/* PODCASTS SECTION - Compact Version */}
            <section className="pt-6 pb-8 py-18 md:py-8 bg-[#FFFDF5] relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6">

                    {/* --- COMPACT HEADER --- */}
                    <div className="text-center mb-10">
                        <h2 className="text-5xl md:text-5xl font-black text-gray-900 tracking-tight">
                            Latest <span className="text-red-600">Podcasts</span>
                        </h2>
                        <div className="w-10 h-1 bg-yellow-500 mx-auto mt-3 rounded-full"></div>
                        <p className="text-gray-500 text-sm mt-3">Watch and listen to our latest episodes.</p>
                    </div>

                    {/* --- ARROW & SLIDER WRAPPER --- */}
                    <div className="relative mb-4 group/slider">

                        {/* SCROLLABLE CONTAINER */}
                        <div
                            ref={podcastScrollRef}
                            onMouseEnter={() => setIsPodcastsPaused(true)}
                            onMouseLeave={() => setIsPodcastsPaused(false)}
                            className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-6 px-1 scroll-smooth scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {podcasts.length > 0 ? (
                                podcasts.slice(0, 6).map((podcast) => (
                                    <div
                                        key={podcast.id}
                                        onClick={() => router.push("/user/view-more?type=podcasts")}
                                        className="min-w-[280px] md:min-w-[340px] snap-center group cursor-pointer"
                                    >
                                        {/* Video Thumbnail Frame */}
                                        <div className="h-[180px] md:h-[220px] rounded-[2rem] overflow-hidden shadow-md border-4 border-white relative group-hover:shadow-xl transition-all duration-500 bg-black">
                                            <video
                                                src={podcast.video_url}
                                                autoPlay
                                                muted
                                                playsInline
                                                loop
                                                preload="metadata"
                                                onMouseEnter={(e) => e.currentTarget.pause()}
                                                onMouseLeave={(e) => e.currentTarget.play()}
                                                className="w-full h-full object-cover pointer-events-none"
                                            />



                                            {/* Play Button Overlay - Fades out on mouse over */}
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:opacity-0 transition-all duration-300 pointer-events-none">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
                                                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[12px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="mt-4 text-base md:text-lg font-bold text-gray-900 text-center line-clamp-1 group-hover:text-red-600 transition-colors">
                                            {podcast.title || podcast.name || "Untitled Episode"}
                                        </h3>
                                    </div>
                                ))
                            ) : (
                                /* Loading State Skeleton */
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="min-w-[280px] md:min-w-[340px] h-[220px] bg-gray-200 animate-pulse rounded-[2rem]" />
                                ))
                            )}
                        </div>

                    </div>

                    {/* --- VIEW MORE BUTTON --- */}
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => router.push('/user/view-more?type=podcasts')}
                            className="group flex items-center gap-3 bg-white border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-md active:scale-95"
                        >
                            <span>Explore Podcasts</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* INFLUENCERS SECTION - Split Media Design (Image & Video) */}
            <section className="pt-6 pb-8 py-18 md:py-8 bg-[#FEF3C7] border-t border-yellow-200 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FDE68A]/30 -skew-x-12 translate-x-20 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {/* HEADER */}
                    <div className="text-center mb-2 md:mb-8">
                        <span className="text-red-600 font-black tracking-[0.4em] uppercase text-xs">
                            Community Voices
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 mt-4 tracking-tighter">
                            Our <span className="text-yellow-600">Influencers</span>
                        </h2>
                        <div className="w-16 h-2 bg-red-600 mx-auto mt-6 rounded-full" />
                    </div>

                    {/* DUAL MEDIA GRID */}
                    <div className="grid grid-cols-1 mb-4 lg:grid-cols-2 gap-12 items-start">

                        {/* LEFT SIDE — IMAGES (Brand Ambassadors) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-px flex-1 bg-yellow-400/50"></div>
                                <span className="text-yellow-800 font-black text-sm uppercase tracking-widest">
                                    Brand Ambassadors
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 lg:gap-6">
                                {influencers
                                    .filter(inf => inf.media_type === "image")
                                    .slice(0, 2)
                                    .map((inf) => (
                                        <div
                                            key={inf.id}
                                            onClick={() => router.push("/user/view-more?type=influencers")}
                                            className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                                        >

                                            <Image
                                                src={inf.media_url}
                                                alt={inf.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 flex flex-col justify-end">
                                                <p className="text-white font-black text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    {inf.name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* RIGHT SIDE — VIDEOS (Live Stories) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-yellow-800 font-black text-sm uppercase tracking-widest">
                                    Live Stories
                                </span>
                                <div className="h-px flex-1 bg-yellow-400/50"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 lg:gap-6">
                                {influencers
                                    .filter(inf => inf.media_type === "video")
                                    .slice(0, 2)
                                    .map((inf) => (
                                        <div
                                            key={inf.id}
                                            onClick={() => router.push("/user/view-more?type=influencers")}
                                            className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-xl border-[6px] border-white bg-black cursor-pointer transition-all duration-700 hover:shadow-red-500/20"
                                        >

                                            <video
                                                src={inf.media_url}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                            />


                                            {/* CONTENT OVERLAY */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                                                <p className="text-white font-black text-xl mb-2">
                                                    {inf.name}
                                                </p>
                                                <div className="w-8 h-1 bg-red-600 rounded-full group-hover:w-full transition-all duration-500" />
                                            </div>

                                            {/* PLAY BADGE */}
                                            <div className="absolute top-5 right-5 w-10 h-10 bg-red-600/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* VIEW MORE BUTTON */}
                    <div className="mt-5 flex justify-center">
                        <button
                            onClick={() => router.push("/user/view-more?type=influencers")}
                            className="group flex items-center gap-4 bg-gray-900 text-white pl-6 pr-3 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-[0_12px_30px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:scale-95"
                        >
                            <span>View All Stories</span>

                            <div className="bg-red-600 w-9 h-9 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                                <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                        </button>
                    </div>

                </div>
            </section>
        </div>
    );
}