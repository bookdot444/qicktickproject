"use client";

import { useEffect, useState } from "react";
import { Search, ListPlus, Send, Star, Award, Users, MapPin, Briefcase } from "lucide-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react"; 
import { useRef } from "react"; // Add useRef here
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    const [showResults, setShowResults] = useState(false);

    const [podcasts, setPodcasts] = useState([]);
    const [influencers, setInfluencers] = useState([]);
    const [certificates, setCertificates] = useState([]);

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
        const loadCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name");

            if (!error) setCategories(data);
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
            let query = supabase
                .from("vendor_products")
                .select("id, product_name, price")
                .eq("is_active", true)
                .ilike("product_name", `%${find}%`)
                .limit(5);

            if (near) {
                query = query.eq("city", near);
            }

            const { data, error } = await query;

            if (!error) {
                setSearchResults(data || []);
                setShowResults(true);
            }
        };

        fetchSearchResults();
    }, [find, near]);

    const handleSearch = () => {
        setShowResults(false);

        const params = new URLSearchParams();
        if (find) params.append("q", find);
        if (near) params.append("city", near);
        if (businessType) params.append("type", businessType);

        router.push(`/user/search?${params.toString()}`);
    };

const scrollRef = useRef(null);

const scroll = (direction) => {
    if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        // Adjust scroll distance based on container width
        const scrollTo = direction === 'left' 
            ? scrollLeft - clientWidth 
            : scrollLeft + clientWidth;
        
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
};


    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50 text-black">
            {/* HERO SECTION */}
            <div className="relative w-full min-h-[600px] flex items-center justify-center overflow-hidden">
                {/* Video Background with Darker Overlay for better readability */}
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
                    {/* Dual layer overlay: Gradient + subtle pattern */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-12">
                    {/* Text Content */}
                    <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <h1 className="text-white text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                            Find Trusted Local Services <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                Instantly
                            </span>
                        </h1>
                        <p className="text-gray-100 max-w-2xl mx-auto text-lg md:text-xl font-medium opacity-90 leading-relaxed">
                            Search from <span className="text-yellow-400">AC Repair</span>, Plumbing, Transport, and more.
                            The easiest way to get connected with experts.
                        </p>
                    </div>

                    {/* MODERN SEARCH BAR WIDGET */}
                    <div className="max-w-5xl mx-auto">
                        <div className="relative bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-3 md:p-4 rounded-[2rem] border border-white/20">
                            <div className="flex flex-col md:flex-row items-center gap-2">

                                {/* FIND INPUT */}
                                <div className="flex-1 flex items-center px-6 py-3 hover:bg-gray-50 rounded-2xl transition-colors group w-full">
                                    <div className="mr-4 text-yellow-500 group-focus-within:scale-110 transition-transform">
                                        <Search size={20} strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">What are you looking for?</span>
                                        <input
                                            className="bg-transparent border-none outline-none text-gray-900 font-bold placeholder:text-gray-400 w-full"
                                            placeholder="AC, Plumbing, Transport..."
                                            value={find}
                                            onChange={(e) => setFind(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleSearch();
                                                }
                                            }}
                                        />

                                    </div>
                                </div>

                                <div className="hidden md:block h-10 w-[1px] bg-gray-200"></div>

                                {/* NEAR SELECT */}
                                <div className="flex-1 flex items-center px-6 py-3 hover:bg-gray-50 rounded-2xl transition-colors group w-full">
                                    <div className="mr-4 text-red-500 group-focus-within:scale-110 transition-transform">
                                        <MapPin size={20} strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Location</span>
                                        <select
                                            className="bg-transparent border-none outline-none text-gray-900 font-bold appearance-none cursor-pointer"
                                            value={near}
                                            onChange={(e) => setNear(e.target.value)}
                                        >
                                            <option value="">Select City</option>
                                            <option>Delhi</option>
                                            <option>Mumbai</option>
                                            <option>Bangalore</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="hidden md:block h-10 w-[1px] bg-gray-200"></div>

                                {/* TYPE SELECT */}
                                <div className="flex-1 flex items-center px-6 py-3 hover:bg-gray-50 rounded-2xl transition-colors group w-full">
                                    <div className="mr-4 text-blue-500 group-focus-within:scale-110 transition-transform">
                                        <Briefcase size={20} strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Business Type</span>
                                        <select
                                            className="bg-transparent border-none outline-none text-gray-900 font-bold appearance-none cursor-pointer"
                                            value={businessType}
                                            onChange={(e) => setBusinessType(e.target.value)}
                                        >
                                            <option value="">All Types</option>
                                            <option value="Distributer">Distributor</option>
                                            <option value="Manufacturer">Manufacturer</option>
                                            <option value="Retailers">Retailers</option>
                                            <option value="Service Sector">Service Sector</option>
                                        </select>
                                    </div>
                                </div>

                                {/* SEARCH BUTTON */}
                                <button
                                    onClick={handleSearch}
                                    className="bg-black text-white hover:bg-gray-800 px-10 py-5 rounded-[1.5rem] font-bold transition-all"
                                >
                                    Search
                                </button>

                                {/* SEARCH RESULTS DROPDOWN */}
                                {showResults && searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden">
                                        {searchResults.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    handleSearch();
                                                }}


                                                className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                                            >
                                                <div>
                                                    <p className="font-bold text-gray-900">
                                                        {item.product_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        ₹{item.price}
                                                    </p>
                                                </div>

                                                <span className="text-xs font-bold text-red-600">
                                                    View →
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Quick Tags below search */}
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {['Electrician', 'Plumber', 'Packers', 'Cleaning'].map((tag) => (
                                <button key={tag} className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-semibold hover:bg-white hover:text-black transition-all">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* HOW IT WORKS */}
            <section className="py-20 bg-white relative overflow-hidden">
                {/* Soft Background Glow */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-72 h-72 bg-red-600 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-yellow-400 rounded-full blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                            How <span className="text-red-600">QickTick</span> Works
                        </h2>
                        <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-red-500 to-yellow-400" />
                    </div>

                    {/* Steps */}
                    <div className="relative flex flex-col md:flex-row justify-center items-center gap-16 md:gap-10">

                        {/* Connector Line */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px]
        bg-[linear-gradient(to_right,#e5e7eb_50%,transparent_0%)]
        bg-[length:20px_2px]"
                        />

                        {[
                            {
                                icon: Search,
                                step: "01",
                                title: "Search Services",
                                desc: "Find verified providers near you instantly.",
                                color: "bg-yellow-50 text-yellow-600 border-yellow-200",
                            },
                            {
                                icon: ListPlus,
                                step: "02",
                                title: "Compare Providers",
                                desc: "Check pricing, reviews & portfolios.",
                                color: "bg-red-50 text-red-600 border-red-200",
                            },
                            {
                                icon: Send,
                                step: "03",
                                title: "Connect & Hire",
                                desc: "Contact businesses & get the job done.",
                                color: "bg-orange-50 text-orange-600 border-orange-200",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="relative z-10 flex flex-col items-center text-center max-w-xs"
                            >
                                {/* Icon */}
                                <div className="relative mb-6">
                                    <div className={`w-20 h-20 rounded-2xl border-2 ${item.color}
              flex items-center justify-center shadow-md
              transition-transform duration-500 hover:rotate-6 hover:scale-105`}
                                    >
                                        <item.icon className="w-8 h-8" strokeWidth={2.5} />
                                    </div>

                                    <span className="absolute -top-3 -right-3 bg-black text-white text-[11px]
              font-black px-2 py-1 rounded-md shadow-lg">
                                        {item.step}
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 mb-2">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


{/* POPULAR CATEGORIES - 4 COLUMN SCROLLING */}
{/* POPULAR CATEGORIES - CENTERED & SCROLLING */}
<section className="py-24 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
        
        {/* Centered Header */}
        <div className="flex flex-col items-center text-center mb-16">
            <span className="text-red-600 font-bold tracking-widest uppercase text-xs mb-3">
                Discover Excellence
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                Popular <span className="text-red-600">Categories</span>
            </h2>
            <div className="h-1.5 w-20 bg-red-600 rounded-full mt-6"></div>
        </div>

        {/* Scroll Container Wrapper */}
        <div className="relative group">
            
            {/* Arrows - Positioned on sides */}
            <button 
                onClick={() => scroll('left')}
                className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded-full shadow-xl border border-gray-100 hover:bg-red-600 hover:text-white transition-all hidden lg:flex items-center justify-center"
            >
                <ChevronLeft size={24} />
            </button>
            
            <button 
                onClick={() => scroll('right')}
                className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded-full shadow-xl border border-gray-100 hover:bg-red-600 hover:text-white transition-all hidden lg:flex items-center justify-center"
            >
                <ChevronRight size={24} />
            </button>

            {/* Scrolling Grid */}
            <div 
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-10 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="min-w-[calc(100%-1rem)] sm:min-w-[calc(50%-1rem)] lg:min-w-[calc(25%-1.2rem)] h-64 bg-gray-100 animate-pulse rounded-[2.5rem]" />
                    ))
                ) : (
                    categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => (window.location.href = `/user/services/${cat.id}`)}
                            className="snap-center min-w-[calc(100%-1rem)] sm:min-w-[calc(50%-1rem)] lg:min-w-[calc(25%-1.2rem)] 
                                       group relative cursor-pointer rounded-[2.5rem] border border-gray-100 bg-white p-10 
                                       text-center transition-all duration-500 hover:shadow-2xl hover:border-red-500/20"
                        >
                            {/* Centered Minimal Icon Replacement */}
                            <div className="mx-auto mb-8 flex items-center justify-center">
                                <div className="w-12 h-1.5 bg-gray-100 rounded-full group-hover:bg-red-600 group-hover:w-20 transition-all duration-500" />
                            </div>

                            <div className="flex flex-col items-center">
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                                    {cat.name}
                                </h3>
                                <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-[200px]">
                                    Browse verified experts for {cat.name.toLowerCase()} services.
                                </p>
                            </div>

                            {/* Center Action Link */}
                            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-red-600 transition-all">
                                <span>Explore Now</span>
                                <span className="translate-x-0 group-hover:translate-x-2 transition-transform">→</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Mobile Navigation (Visible only on small screens) */}
        <div className="flex justify-center gap-4 mt-4 lg:hidden">
            <button onClick={() => scroll('left')} className="p-3 rounded-full bg-gray-100 active:bg-red-600 active:text-white transition-colors">
                <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll('right')} className="p-3 rounded-full bg-gray-100 active:bg-red-600 active:text-white transition-colors">
                <ChevronRight size={20} />
            </button>
        </div>
    </div>
</section>

            {/* TRUST CTA - Updated with Logo Colors */}
            <section className="py-28 bg-gradient-to-br from-[#FFD700] via-[#D80000] to-[#8B0000] relative overflow-hidden">
                {/* Subtle decorative overlay to add depth */}
                <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white">
                    <h2 className="text-5xl font-extrabold mb-8 drop-shadow-lg">
                        Are You a <span className="text-yellow-200">Service Provider?</span>
                    </h2>
                    <p className="text-xl mb-12 max-w-3xl mx-auto font-medium opacity-90">
                        List your business on <span className="font-black text-yellow-300">QickTick</span> and reach customers looking for your services today.
                        <br />
                        <span className="font-bold border-b-2 border-yellow-400">Join the Network!</span>
                    </p>

                    {/* Button updated to feel like the logo's gold finish */}
                    <button className="bg-white text-[#D80000] px-12 py-5 rounded-2xl font-black text-xl 
            hover:bg-yellow-50 hover:text-[#8B0000] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] 
            hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] transform hover:scale-105 active:scale-95 uppercase tracking-wide">
                        List Your Business
                    </button>
                </div>
            </section>

            {/* DIGITAL BRANDING - Centered & Premium Scroll */}
            <section className="py-24 bg-[#fafafa] overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Centered Heading with Logo Colors */}
                    <div className="text-center mb-4">
                        <h2 className="text-5xl font-black text-gray-900 tracking-tight">
                            Digital <span className="text-[#D80000]">Branding</span>
                        </h2>
                        <div className="w-24 h-1.5 bg-[#FFD700] mx-auto mt-4 rounded-full"></div>
                        <p className="text-gray-500 mt-6 text-xl max-w-2xl mx-auto">
                            Elevate your presence. Showcase your business with high-impact video storytelling.
                        </p>
                    </div>

                    {/* Horizontal Scroll Container */}
                    <div className="relative group">
                        <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-10 px-4">
                            {brandingVideos.length === 0 ? (
                                <div className="w-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 italic">
                                    No videos uploaded yet
                                </div>
                            ) : (
                                brandingVideos.map((video) => (
                                    <div
                                        key={video.id}
                                        className="min-w-[300px] md:min-w-[380px] h-[500px] snap-center rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-black group/card"
                                    >
                                        <div className="relative w-full h-full">
                                            <video
                                                src={video.video_url}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 transition-opacity duration-500"
                                            />
                                            {/* Elegant Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover/card:opacity-30 transition-opacity"></div>

                                            {/* Corner Accent using Logo Gold */}
                                            <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-[#FFD700] rounded-tr-lg"></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Visual Scroll Indicators (Pure CSS) */}
                        <div className="flex justify-center gap-2 mt-4">
                            <div className="w-8 h-1 bg-[#D80000] rounded-full"></div>
                            <div className="w-2 h-1 bg-gray-300 rounded-full"></div>
                            <div className="w-2 h-1 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DIGITAL BANNER */}
            <section className="pt-4 pb-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Digital <span className="text-red-600">Banners</span>
                        </h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
                            Check out our latest promotional banners and visuals. <span className="text-yellow-600 font-semibold">Eye-catching Designs!</span>
                        </p>
                    </div>

                    <div className="overflow-hidden relative">
                        <div className="flex gap-8 animate-slide">
                            {imageBanners.concat(imageBanners).map((banner, idx) => (
                                <div key={idx} className="min-w-[350px] h-[220px] rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 flex-shrink-0 hover:border-yellow-300 transition">
                                    <Image
                                        src={banner.image_url}
                                        alt="Digital Banner"
                                        width={350}
                                        height={220}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* TRANSPORT BANNER */}
            <section className="py-24 bg-gradient-to-r from-red-50 to-yellow-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Transport <span className="text-yellow-600">Banner</span>
                        </h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
                            Explore our latest transport-related promotions. <span className="text-red-600 font-semibold">Get Moving!</span>
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-8">
                        <div className="w-full max-w-5xl h-[280px] relative rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200">
                            <Image
                                src="/transport_banner.jpg"
                                alt="Transport Banner"
                                width={1200}
                                height={280}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <button
                            onClick={() => router.push("/user/transport")}
                            className="bg-gradient-to-r from-red-500 to-yellow-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-red-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Go to Transport Services
                        </button>
                    </div>
                </div>
            </section>

            {/* HELP & EARN - Modern Minimalist Design */}
            <section className="pt-10 pb-24 bg-white"> {/* Adjusted pt-24 to pt-10 to fix top space */}
                <div className="max-w-7xl mx-auto px-6">

                    {/* Centered Heading with Logo Colors */}
                    <div className="mb-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                            Help & <span className="text-[#D80000]">Earn</span>
                        </h2>
                        <div className="w-16 h-1 bg-[#FFD700] mx-auto mt-4 rounded-full"></div>
                        <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
                            Contribute to local initiatives and earn rewards.
                            <span className="text-[#D80000] font-bold block mt-1">Make a Difference in your community!</span>
                        </p>
                    </div>

                    {/* Grid Container */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                        {helpAndEarn.length === 0 ? (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 italic">
                                No entries available right now.
                            </div>
                        ) : (
                            helpAndEarn.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => router.push(`/user/help`)}
                                    className="group relative flex flex-col items-center cursor-pointer"
                                >
                                    {/* Image Container with Custom Shape */}
                                    <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-[#D80000]/10 transition-all duration-500 ease-out">
                                        {item.image_url ? (
                                            <Image
                                                src={item.image_url}
                                                alt={item.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                                                <span className="text-xs uppercase tracking-widest font-bold">No Image</span>
                                            </div>
                                        )}

                                        {/* Hover Overlay using Brand Red */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#D80000]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                                            <span className="text-white font-bold text-sm uppercase tracking-tighter bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                                                Contribute →
                                            </span>
                                        </div>
                                    </div>

                                    {/* Title Styling */}
                                    <div className="mt-5 text-center px-2">
                                        <p className="text-gray-900 font-bold text-lg group-hover:text-[#D80000] transition-colors duration-300">
                                            {item.name}
                                        </p>
                                        <div className="w-0 group-hover:w-8 h-1 bg-[#FFD700] mx-auto mt-1 transition-all duration-300 rounded-full"></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* CERTIFICATES SECTION - Premium Gallery Design */}
            <section className="pt-10 pb-24 bg-[#FCF9F2]"> {/* Warm, gold-tinted background for a "Certificate" feel */}
                <div className="max-w-7xl mx-auto px-6">

                    {/* Centered Heading */}
                    <div className="mb-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                            Our <span className="text-[#D80000]">Certificates</span>
                        </h2>
                        <div className="w-24 h-1.5 bg-[#FFD700] mx-auto mt-4 rounded-full"></div>
                        <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
                            Celebrating our achievements and recognitions over the years.
                            <span className="text-[#D80000] font-bold block mt-1 underline decoration-[#FFD700] decoration-2 underline-offset-4">
                                Excellence Recognized!
                            </span>
                        </p>
                    </div>

                    {/* Responsive Grid with Snap-Scroll for Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {certificates.length === 0 ? (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-[#D80000]/20 rounded-3xl text-gray-400 italic">
                                No certificates available yet.
                            </div>
                        ) : (
                            certificates.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative bg-white p-3 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-[#FFD700]"
                                >
                                    {/* Certificate Image Container */}
                                    <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-gray-50">
                                        {item.image_url ? (
                                            <Image
                                                src={item.image_url}
                                                alt={item.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#FFD700]/10 to-[#D80000]/10 text-gray-400">
                                                No Image
                                            </div>
                                        )}

                                        {/* Gold Brand Seal Overlay */}
                                        <div className="absolute top-4 right-4 w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform">
                                            <span className="text-[10px] font-black text-[#D80000]">QICK</span>
                                        </div>
                                    </div>

                                    {/* Certificate Title */}
                                    <div className="pt-5 pb-3 px-2 text-center">
                                        <h3 className="text-gray-900 font-black text-lg group-hover:text-[#D80000] transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Verified Achievement
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* PODCASTS SECTION */}
            <section className="pt-6 pb-24 bg-white"> {/* Fixed top space by changing pt-24 to pt-6 */}
                <div className="max-w-7xl mx-auto px-6">

                    {/* Centered Heading with Brand Colors */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                            Latest <span className="text-[#D80000]">Podcasts</span>
                        </h2>
                        <div className="w-20 h-1.5 bg-[#FFD700] mx-auto mt-4 rounded-full"></div>
                        <p className="text-gray-600 mt-6 text-lg max-w-2xl mx-auto">
                            Insights from industry experts.
                            <span className="text-[#D80000] font-bold ml-1">Tune In & Level Up!</span>
                        </p>
                    </div>

                    {/* Horizontal Scroll with Snap-Alignment */}
                    <div className="relative group">
                        <div className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 px-2">
                            {podcasts.length === 0 ? (
                                <div className="w-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 italic">
                                    No podcasts available yet
                                </div>
                            ) : (
                                podcasts.map((podcast) => (
                                    <div key={podcast.id} className="min-w-[320px] md:min-w-[400px] group/card snap-center">
                                        {/* Video Container */}
                                        <div className="h-[250px] rounded-[2.5rem] overflow-hidden shadow-lg border-2 border-transparent hover:border-[#FFD700] bg-black transition-all duration-500 relative">
                                            <video
                                                src={podcast.video_url}
                                                controls
                                                muted
                                                className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 transition-opacity"
                                            />
                                            {/* Brand Accent - Gold Play Indicator Decor */}
                                            <div className="absolute top-4 left-4 bg-[#FFD700] p-2 rounded-full shadow-md transform -rotate-12 group-hover/card:rotate-0 transition-transform">
                                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-[#D80000] border-b-[6px] border-b-transparent ml-0.5"></div>
                                            </div>
                                        </div>

                                        {/* Podcast Info */}
                                        <div className="mt-6 text-center">
                                            <h3 className="font-black text-xl text-gray-800 group-hover/card:text-[#D80000] transition-colors line-clamp-2 px-2">
                                                {podcast.title || podcast.name}
                                            </h3>
                                            <div className="w-0 group-hover/card:w-12 h-1 bg-[#FFD700] mx-auto mt-2 transition-all duration-300 rounded-full"></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Visual Indicator (Optional Navigation Arrow) */}
                        <div className="flex justify-center mt-4">
                            <span className="text-[#D80000] animate-bounce cursor-default text-sm font-bold uppercase tracking-widest">
                                Scroll for more →
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* INFLUENCERS SECTION */}
            <section className="pt-6 pb-24 bg-gradient-to-b from-[#FFFDF5] to-white"> {/* Subtle Gold tint background */}
                <div className="max-w-7xl mx-auto px-6">

                    {/* Centered Heading with Logo Colors */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                            Our <span className="text-[#D80000]">Influencers</span>
                        </h2>
                        <div className="w-20 h-1.5 bg-[#FFD700] mx-auto mt-4 rounded-full"></div>
                        <p className="text-gray-600 mt-6 text-lg max-w-2xl mx-auto">
                            See what the community is saying.
                            <span className="text-[#D80000] font-bold block mt-1">Real Voices, Real Impact!</span>
                        </p>
                    </div>

                    {/* Horizontal Scroll with Snap functionality */}
                    <div className="relative overflow-hidden">
                        <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-10 px-4">
                            {influencers.length === 0 ? (
                                <div className="w-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 italic">
                                    No influencer videos yet
                                </div>
                            ) : (
                                influencers.map((inf) => (
                                    <div key={inf.id} className="min-w-[280px] md:min-w-[320px] group snap-center">
                                        <div className="h-[480px] rounded-[3rem] overflow-hidden shadow-xl border-4 border-white bg-gray-900 relative transition-all duration-500 hover:shadow-2xl hover:shadow-[#D80000]/20 hover:-translate-y-2">
                                            <video
                                                src={inf.video_url}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            />

                                            {/* Bottom Info Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                                                <p className="text-white font-black text-2xl tracking-tight drop-shadow-md">
                                                    {inf.name}
                                                </p>
                                                <div className="w-8 h-1 bg-[#FFD700] mt-2 rounded-full group-hover:w-full transition-all duration-500"></div>
                                            </div>

                                            {/* Floating Logo/Badge Accent */}
                                            <div className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                                <span className="text-[#FFD700] font-bold text-xs uppercase tracking-tighter">Qick</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Hint for more content */}
                        <div className="text-center mt-4">
                            <p className="text-[#D80000] text-xs font-black uppercase tracking-[0.3em] opacity-50 group-hover:opacity-100 transition-opacity">
                                Swipe to explore
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}