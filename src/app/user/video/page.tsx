"use client";

import { useEffect, useState, useRef } from "react";

import { supabase } from "@/lib/supabaseClient";

import { motion, AnimatePresence } from "framer-motion";

import Link from "next/link";

import {

  Play,

  X,

  Clock,

  Sparkles,

  Search,

  ChevronRight,

  Video,

  MonitorPlay,

  Building2,

  ShieldCheck,

  MapPin,

  Briefcase,

  Users

} from "lucide-react";

export default function VideoPage() {

  const [videos, setVideos] = useState<any[]>([]);

  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  // Filter States

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedSector, setSelectedSector] = useState("All Sectors");

  const [selectedArea, setSelectedArea] = useState("All Areas");

  const [selectedUserType, setSelectedUserType] = useState("All Types");

  useEffect(() => {

    const fetchVideos = async () => {

      setLoading(true);

      const { data, error } = await supabase

        .from("vendor_register")

        .select("id, company_name, video_files, sector, area, user_type")

        .not("video_files", "is", null);

      if (data) {

        const allVideos = data.flatMap((vendor: any) => {

          if (!Array.isArray(vendor.video_files)) return [];

          return vendor.video_files.map((video: any, index: number) => {

            const ytMatch = video.url?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);

            const ytId = (ytMatch && ytMatch[2].length === 11) ? ytMatch[2] : null;

            let thumb = video.thumbnail;

            if (!thumb) {

              thumb = ytId

                ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`

                : "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?q=80&w=1000&auto=format&fit=crop";

            }

            return {

              ...video,

              thumbnail: thumb,

              isYouTube: !!ytId,

              ytId: ytId,

              uniqueId: `${vendor.id}-${index}`,

              vendorId: vendor.id,

              vendorName: vendor.company_name,

              duration: video.duration || (ytId ? "YouTube" : "0:00"),

              sector: vendor.sector || "General",

              area: vendor.area || "N/A",

              // FIX: Explicitly mapping user_type from DB to userType for the UI

              userType: vendor.user_type || [],

              category: video.category || "Tutorial",

            };

          });

        });

        setVideos(allVideos);

      }

      setLoading(false);

    };

    fetchVideos();

  }, []);

  // Updated Filter Logic

  const filteredVideos = videos.filter(v => {

    const matchesSearch = v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||

      v.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSector = selectedSector === "All Sectors" || v.sector === selectedSector;

    const matchesArea = selectedArea === "All Areas" || v.area === selectedArea;

    // FIX: Check if userType exists and is an array before calling .includes

    const matchesUserType = selectedUserType === "All Types" ||

      (Array.isArray(v.userType) && v.userType.includes(selectedUserType)) ||

      (typeof v.userType === 'string' && v.userType === selectedUserType);

    return matchesSearch && matchesSector && matchesArea && matchesUserType;

  });

  // Extract unique options for dropdowns

  const sectors = ["All Sectors", ...new Set(videos.map(v => v.sector).filter(Boolean))];

  const areas = ["All Areas", ...new Set(videos.map(v => v.area).filter(Boolean))];

  // FIX: Properly flatMap the userType array to get unique individual types

  const userTypes = ["All Types", ...new Set(videos.flatMap(v => {

    if (Array.isArray(v.userType)) return v.userType;

    if (typeof v.userType === 'string') return [v.userType];

    return [];

  }).filter(Boolean))];

  const getEmbedUrl = (url: string) => {

    if (!url) return "";

    // Regular expression to extract the Video ID

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

    const match = url.match(regExp);

    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) {

      // Adding origin parameter helps with some connection issues

      // 'enablejsapi=1' and 'origin' are recommended for better compatibility

      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

    }

    return url;

  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);

  }, []);

  // --- MOBILE REELS VIEW ---

  if (isMobile && !loading) {

    return (

      <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide">

        {filteredVideos.map((video) => (

          <div

            key={video.uniqueId}

            className="h-screen w-full snap-start relative flex items-center justify-center bg-black"

          >

            {/* 1. Video Background */}

            <div className="absolute inset-0 z-0">

              {video.isYouTube ? (

                <iframe

                  src={`https://www.youtube-nocookie.com/embed/${video.ytId}?autoplay=1&controls=0&modestbranding=1&loop=1&playlist=${video.ytId}`}

                  className="w-full h-full pointer-events-none"

                  allow="autoplay"

                />

              ) : (

                <video

                  src={video.url}

                  autoPlay

                  loop

                  muted

                  playsInline

                  className="w-full h-full object-cover"

                />

              )}

            </div>

            {/* 2. Dark Overlay for Text Readability */}

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 z-10" />

            {/* 3. Interaction Sidebar (Right) */}

            <div className="absolute right-4 bottom-32 z-20 flex flex-col gap-6 items-center">

              <Link href={`/vendor/view/${video.vendorId}`} className="flex flex-col items-center gap-1">

                <div className="w-12 h-12 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center shadow-lg overflow-hidden">

                  <Building2 className="text-black" size={20} />

                </div>

                <span className="text-[10px] text-white font-black uppercase">Profile</span>

              </Link>

              <button className="flex flex-col items-center gap-1">

                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">

                  <Sparkles className="text-yellow-400" size={20} />

                </div>

                <span className="text-[10px] text-white font-black uppercase">Save</span>

              </button>

            </div>

            {/* 4. Content Overlay (Bottom) */}

            <div className="absolute bottom-10 left-4 right-16 z-20">

              <div className="flex items-center gap-2 mb-2">

                <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">

                  {video.sector}

                </span>

                <span className="text-white/60 text-[10px] font-bold flex items-center gap-1">

                  <MapPin size={10} /> {video.area}

                </span>

              </div>

              <h3 className="text-white font-black text-lg leading-tight mb-1 uppercase tracking-tight">

                @{video.vendorName}

              </h3>

              <p className="text-white/90 text-sm line-clamp-2 font-medium">

                {video.title}

              </p>

            </div>

            {/* 5. Top Bar (Search/Filter access) */}

            <div className="absolute top-10 left-4 z-20 flex items-center gap-3">

              <button

                onClick={() => setIsMobile(false)} // Toggle back to grid view

                className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white"

              >

                <Search size={20} />

              </button>

              <span className="text-white font-black tracking-widest text-xs">REELS MODE</span>

            </div>

          </div>

        ))}

        {filteredVideos.length === 0 && (

          <div className="h-screen flex flex-col items-center justify-center text-white p-10 text-center">

            <Video size={48} className="text-yellow-400 mb-4" />

            <h2 className="font-black text-xl uppercase">No Videos Found</h2>

            <button onClick={() => setSearchQuery("")} className="mt-4 text-red-500 font-bold uppercase underline">Clear Filters</button>

          </div>

        )}

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 pb-20 font-sans selection:bg-yellow-200">

      {/* --- HEADER --- */}

      {/* --- UPDATED HEADER (SMART TRANSPORT STYLE) --- */}

      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-40 px-6 relative overflow-hidden border-b border-yellow-200">

        {/* Background Pattern */}

        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Left Column: Text Content */}

          <div className="text-left">

            <motion.div

              initial={{ opacity: 0, x: -20 }}

              animate={{ opacity: 1, x: 0 }}

              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-yellow-300"

            >

              <span className="relative flex h-2 w-2">

                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>

                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>

              </span>

              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">Verified Tutorials</span>

            </motion.div>

            <motion.h1

              initial={{ opacity: 0, y: 10 }}

              animate={{ opacity: 1, y: 0 }}

              className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85]"

            >

              Video <br />

              <span className="text-red-600 italic">Hub</span>

            </motion.h1>

            <motion.p

              initial={{ opacity: 0 }}

              animate={{ opacity: 1 }}

              transition={{ delay: 0.2 }}

              className="mt-6 text-gray-600 font-bold text-lg max-w-md flex items-center gap-2"

            >

              <Sparkles size={20} className="text-yellow-600 shrink-0" />

              Watch simple guides from verified experts to master your gear and grow your business.            </motion.p>

          </div>

          {/* Right Column: Floating Visual Card */}

          <motion.div

            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}

            animate={{ opacity: 1, scale: 1, rotate: 3 }}

            transition={{ type: "spring", stiffness: 100 }}

            className="hidden lg:block bg-white p-12 rounded-[4rem] shadow-2xl border-2 border-yellow-100 relative"

          >

            <div className="absolute -top-4 -right-4 bg-red-600 text-white p-4 rounded-3xl animate-bounce shadow-xl">

              <Video size={32} strokeWidth={2.5} />

            </div>

            <div className="bg-yellow-50 p-6 rounded-[2.5rem]">

              <MonitorPlay size={100} className="text-yellow-600" strokeWidth={1.5} />

            </div>

            {/* Decorative tag for the card */}

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full whitespace-nowrap">

              PRO LEARNING HUB

            </div>

          </motion.div>

        </div>

      </div>

      {/* --- GRID TRANSITION --- */}

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">

        {/* --- MULTI-FILTER SEARCH BAR --- */}

        {/* --- MULTI-FILTER SEARCH BAR --- */}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-yellow-100 mb-16 flex flex-col gap-4">

          <div className="flex flex-col lg:flex-row gap-4 items-center">

            {/* Main Search Input */}

            <div className="relative flex-1 w-full group">

              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-yellow-600" size={20} />

              <input

                type="text"

                placeholder="SEARCH BY TUTORIAL OR COMPANY..."

                value={searchQuery}

                onChange={(e) => setSearchQuery(e.target.value)}

                className="w-full pl-14 pr-12 py-5 bg-[#FEF3C7]/30 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl outline-none transition-all font-black uppercase text-sm tracking-widest placeholder:text-yellow-800/40"

              />

              {searchQuery && (

                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">

                  <X size={18} />

                </button>

              )}

            </div>

            {/* Tutorial Count Badge */}

            <div className="flex items-center gap-3 px-8 py-5 bg-gray-900 rounded-2xl text-yellow-400 min-w-fit">

              <Video size={18} />

              <span className="text-xs font-black uppercase tracking-widest">{filteredVideos.length} Tutorials</span>

            </div>

          </div>

          {/* Sub-Filters: Sector, Area, User Type + Clear Button */}

          <div className="flex flex-col md:flex-row gap-4">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">

              <div className="relative">

                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600" size={16} />

                <select

                  value={selectedSector}

                  onChange={(e) => setSelectedSector(e.target.value)}

                  className="w-full pl-12 pr-4 py-4 bg-[#FEF3C7]/20 border-2 border-transparent focus:border-yellow-400 rounded-xl outline-none font-bold text-[11px] uppercase tracking-widest cursor-pointer appearance-none"

                >

                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}

                </select>

              </div>

              <div className="relative">

                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600" size={16} />

                <select

                  value={selectedArea}

                  onChange={(e) => setSelectedArea(e.target.value)}

                  className="w-full pl-12 pr-4 py-4 bg-[#FEF3C7]/20 border-2 border-transparent focus:border-yellow-400 rounded-xl outline-none font-bold text-[11px] uppercase tracking-widest cursor-pointer appearance-none"

                >

                  {areas.map(a => <option key={a} value={a}>{a}</option>)}

                </select>

              </div>

              <div className="relative">

                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600" size={16} />

                <select

                  value={selectedUserType}

                  onChange={(e) => setSelectedUserType(e.target.value)}

                  className="w-full pl-12 pr-4 py-4 bg-[#FEF3C7]/20 border-2 border-transparent focus:border-yellow-400 rounded-xl outline-none font-bold text-[11px] uppercase tracking-widest cursor-pointer appearance-none"

                >

                  {userTypes.map(u => <option key={u} value={u}>{u}</option>)}

                </select>

              </div>

            </div>

            {/* CLEAR ALL FILTERS BUTTON */}

            <AnimatePresence>

              {(searchQuery || selectedSector !== "All Sectors" || selectedArea !== "All Areas" || selectedUserType !== "All Types") && (

                <motion.button

                  initial={{ opacity: 0, x: 20 }}

                  animate={{ opacity: 1, x: 0 }}

                  exit={{ opacity: 0, x: 20 }}

                                    onClick={() => {
                    setSearchQuery("");
                    setSelectedSector("All Sectors");
                    setSelectedArea("All Areas");
                    setSelectedUserType("All Types");
                  }}
                  className="px-6 py-4 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-red-100 group"
                >
                  <X size={16} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Clear All</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* --- VIDEOS GRID --- */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-full h-[450px] bg-yellow-100/30 rounded-[2.5rem] animate-pulse border border-yellow-100/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video, idx) => (
                <motion.div
                  key={video.uniqueId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group relative bg-white rounded-[2.5rem] border border-yellow-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(220,38,38,0.1)] transition-all duration-500 flex flex-col h-full overflow-hidden"
                >
                  {/* --- TOP VISUAL SECTION --- */}
                  <div
                    className="relative h-60 w-full overflow-hidden cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    {/* Category Tag (Floating) */}
                    <div className="absolute top-5 left-5 z-20">
                      <span className="bg-white/90 backdrop-blur-md text-gray-900 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-yellow-100">
                        {video.category}
                      </span>
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/0 group-hover:bg-red-600/20 transition-all duration-500">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500"
                      >
                        <Play size={24} className="fill-current ml-1" />
                      </motion.div>

                      {/* Add this helpful text */}
                      <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] mt-3 opacity-0 group-hover:opacity-100 transition-all duration-700">
                        Play Video
                      </span>
                    </div>

                    <div className="relative h-60 w-full overflow-hidden cursor-pointer">
                      {/* Category Tag */}
                      <div className="absolute top-5 left-5 z-20">
                        <span className="bg-white/90 backdrop-blur-md text-gray-900 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-yellow-100">
                          {video.category}
                        </span>
                      </div>

                      {/* Video Player Section */}
                      <div className="aspect-video w-full bg-black">
                        {/* Add the '?' after selectedVideo */}
                        {selectedVideo?.isYouTube ? (
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${selectedVideo.ytId}?autoplay=1&rel=0`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={selectedVideo.title}
                          />
                        ) : (
                          <video
                            key={selectedVideo?.url}
                            src={selectedVideo?.url}
                            controls
                            autoPlay
                            className="w-full h-full"
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>

                      {/* Duration Badge (Bottom Right) */}
                      <div className="absolute bottom-4 right-4 z-20">
                        <div className="flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-bold">
                          <Clock size={12} className="text-yellow-400" />
                          {video.duration}
                        </div>
                      </div>
                    </div>

                    {/* Duration Badge (Bottom Right) */}
                    <div className="absolute bottom-4 right-4 z-10">
                      <div className="flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-bold">
                        <Clock size={12} className="text-yellow-400" />
                        {video.duration}
                      </div>
                    </div>
                  </div>

                  {/* --- CONTENT SECTION --- */}
                  {/* --- CONTENT SECTION --- */}
                  <div className="p-6 flex flex-col flex-1 bg-white">
                    {/* Sub-label for context */}
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">
                      Verified Partner
                    </span>

                    <div className="flex items-start justify-between gap-4">
                      {/* Company Name Container */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black text-gray-900 leading-tight truncate group-hover:text-red-600 transition-colors duration-300">
                          {video.vendorName}
                        </h3>

                        {/* Visual indicator of "View Profile" - visible on hover */}
                        <div className="flex items-center gap-1 mt-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            View Profile
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={`/vendor/view/${video.vendorId}`}
                        className="relative shrink-0 w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 hover:bg-red-600 hover:shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)] group/btn"
                      >
                        {/* Decorative background element for the button icon */}
                        <div className="absolute inset-0 bg-white/10 scale-0 rounded-full group-hover/btn:scale-150 transition-transform duration-700" />

                        <ChevronRight
                          size={20}
                          className="relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300"
                        />
                      </Link>
                    </div>

                    {/* Bottom border accent that grows on hover */}
                    <div className="mt-6 h-px w-full bg-gray-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-red-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    </div>
                  </div>

                  {/* Decorative Corner Accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- COMPACT THEATER MODAL (Brought Downward) --- */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // CHANGED: items-start + pt-24 brings the modal toward the top/center instead of dead center
            className="fixed inset-0 bg-gray-950/80 backdrop-blur-md flex items-start justify-center z-[999] p-6 pt-24 overflow-y-auto"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.98, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: -20, opacity: 0 }}
              // CHANGED: max-w-3xl makes the actual player/card smaller
              className="w-full max-w-3xl bg-white rounded-[1.5rem] overflow-hidden shadow-2xl relative mb-12"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Compact Close Button */}
              <button
                className="absolute top-3 right-3 z-20 bg-black/40 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-md transition-all"
                onClick={() => setSelectedVideo(null)}
              >
                <X size={16} />
              </button>

              {/* Video Player */}
              {/* Video Player */}
              <div className="aspect-video w-full bg-black">
                {/* We keep the check just in case, but usually this will only hit the <video> tag now */}
                {selectedVideo.isYouTube ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${selectedVideo.ytId}?autoplay=1&rel=0&modestbranding=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                ) : (
                  <video
                    src={selectedVideo.url}
                    controls
                    autoPlay
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              {/* Refined Info Bar (More Compact) */}
              <div className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="bg-yellow-100 text-yellow-700 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                        {selectedVideo.category}
                      </span>
                      <span className="text-gray-400 text-[8px] font-bold uppercase tracking-tight flex items-center gap-1">
                        <Clock size={9} /> {selectedVideo.duration}
                      </span>
                    </div>

                    <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight uppercase leading-tight">
                      {selectedVideo.title}
                    </h3>

                    <div className="flex items-center gap-3 pt-0.5">
                      <div className="flex items-center gap-1">
                        <Building2 size={10} className="text-red-600" />
                        <span className="text-[9px] font-bold text-gray-500 uppercase">{selectedVideo.vendorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={10} className="text-gray-400" />
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{selectedVideo.area}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/vendor/view/${selectedVideo.vendorId}`}
                    className="shrink-0 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all shadow-sm"
                  >
                    View Partner
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}