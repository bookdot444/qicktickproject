"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Play, 
  X, 
  Film, 
  Clock, 
  Sparkles, 
  Search, 
  ChevronRight, 
  Video,
  MonitorPlay,
  Building2,
  ShieldCheck
} from "lucide-react";

export default function VideoPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("vendor_register")
        .select("id, company_name, video_files")
        .not("video_files", "is", null);

      if (data) {
        const allVideos = data.flatMap((vendor: any) => {
          if (!Array.isArray(vendor.video_files)) return [];
          return vendor.video_files.map((video: any, index: number) => ({
            ...video,
            uniqueId: `${vendor.id}-${index}`,
            vendorId: vendor.id,
            vendorName: vendor.company_name,
            duration: video.duration || "Premium",
            category: video.category || "Showcase",
          }));
        });
        setVideos(allVideos);
      }
      setLoading(false);
    };

    fetchVideos();
  }, []);

  const filteredVideos = videos.filter(v => 
    v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.vendorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` 
      : url;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 pb-20 font-sans selection:bg-yellow-200">
      
      {/* --- HEADER (Cream/Amber Gradient) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-40 px-6 relative overflow-hidden border-b border-yellow-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
            <span className="inline-block px-4 py-1.5 bg-white/80 backdrop-blur-md border border-yellow-300 text-yellow-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-sm">
                Verified Tutorials
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-none mb-6">
            EXPERT <span className="text-red-600">GUIDES</span>
          </motion.h1>
          <p className="text-gray-600 font-bold text-lg max-w-xl mx-auto flex items-center justify-center gap-2">
            <Sparkles size={20} className="text-yellow-600" />
            Master your equipment with guides from verified partners.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
        {/* --- SEARCH BAR --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-yellow-100 mb-16 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-yellow-600" size={20} />
            <input 
              type="text"
              placeholder="SEARCH BY TUTORIAL OR COMPANY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-[#FEF3C7]/30 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl outline-none transition-all font-black uppercase text-sm tracking-widest placeholder:text-yellow-800/40"
            />
          </div>
          <div className="flex items-center gap-3 px-8 py-5 bg-gray-900 rounded-2xl text-yellow-400">
            <Video size={18} />
            <span className="text-xs font-black uppercase tracking-widest">{filteredVideos.length} Tutorials</span>
          </div>
        </motion.div>

        {/* --- VIDEOS GRID (Centered) --- */}
        {loading ? (
          <div className="flex flex-wrap justify-center gap-8">
            {[1, 2, 3].map(i => <div key={i} className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] h-96 bg-yellow-100/50 rounded-[3rem] animate-pulse" />)}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video, idx) => (
                <motion.div
                  key={video.uniqueId}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] max-w-[400px] group bg-white rounded-[3rem] overflow-hidden border-2 border-transparent hover:border-yellow-400 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                >
                  {/* Thumbnail Section */}
                  <div className="relative h-56 w-full overflow-hidden bg-gray-900 cursor-pointer" onClick={() => setSelectedVideo(video)}>
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300">
                        <Play size={28} className="text-white fill-white ml-1" />
                      </div>
                    </div>
                    {video.thumbnail ? (
                      <img src={video.thumbnail} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="thumb" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-yellow-600/30 bg-[#FEF3C7]/20">
                        <MonitorPlay size={48} />
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                        <span className="bg-gray-900/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                            {video.category}
                        </span>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-10 flex flex-col flex-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-4 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {video.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-yellow-100 p-2 rounded-xl">
                        <Building2 size={16} className="text-yellow-700" />
                      </div>
                      <span className="text-gray-500 text-[11px] font-black uppercase tracking-widest">{video.vendorName}</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-tighter">
                        <Clock size={16} className="text-yellow-600" /> {video.duration}
                      </div>
                      
                      <Link 
                        href={`/vendor/view/${video.vendorId}`}
                        className="bg-gray-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:-rotate-12 transition-all shadow-lg"
                      >
                        <ChevronRight size={20} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- THEATER MODAL (Premium Dark Style) --- */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-950/95 backdrop-blur-2xl flex items-center justify-center z-[999] p-4 md:p-10" onClick={() => setSelectedVideo(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-6xl bg-black rounded-[4rem] overflow-hidden shadow-2xl relative border border-white/10" onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-8 right-8 z-10 bg-white text-black p-4 rounded-3xl hover:bg-red-600 hover:text-white transition-all shadow-2xl" onClick={() => setSelectedVideo(null)}>
                <X size={24} strokeWidth={3} />
              </button>

              <div className="aspect-video w-full bg-gray-900">
                {selectedVideo.url?.includes('youtube.com') || selectedVideo.url?.includes('youtu.be') ? (
                  <iframe className="w-full h-full" src={getEmbedUrl(selectedVideo.url)} allow="autoplay; encrypted-media" allowFullScreen />
                ) : (
                  <video src={selectedVideo.url} controls autoPlay className="w-full h-full" />
                )}
              </div>

              <div className="p-10 md:p-16 bg-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck size={18} className="text-yellow-600" />
                        <span className="text-yellow-600 text-[10px] font-black uppercase tracking-[0.3em] block">Verified Partner Content</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">{selectedVideo.title}</h3>
                    <p className="mt-4 text-gray-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                        <Building2 size={14} /> Presented by {selectedVideo.vendorName}
                    </p>
                  </div>
                  
                  <Link 
                    href={`/vendor/view/${selectedVideo.vendorId}`}
                    className="bg-gray-900 text-white px-10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-red-600 transition-all shadow-xl"
                  >
                    View Full Profile
                    <ChevronRight size={18} />
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