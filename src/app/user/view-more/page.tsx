"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { 
  ChevronLeft, 
  PlayCircle, 
  Info, 
  ArrowRight, 
  Layers, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck,
  Loader2
} from "lucide-react";

type PageConfig = {
  title: string;
  table: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  help: { title: "Help & Earn", table: "help_and_earn" },
  categories: { title: "All Categories", table: "categories" },
  branding: { title: "Digital Branding", table: "digital_branding_videos" },
  podcasts: { title: "Podcasts", table: "podcast_videos" },
  influencers: { title: "Influencers", table: "influencers_videos" },
  certificates: { title: "Certificates", table: "certificates" },
  banners: { title: "Digital Banners", table: "digital_banners" }, 
};

// --- SUB-COMPONENT: The actual page content ---
function ViewMoreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type || !PAGE_CONFIG[type]) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const { table } = PAGE_CONFIG[type];

      let query = supabase.from(table).select("*");

      if (type === "categories" || type === "banners") {
        query = query.not("image_url", "is", null);
      }

      const { data, error } = await query;

      if (!error) setData(data || []);
      setLoading(false);
    };

    fetchData();
  }, [type, router]);

  const pageTitle = type ? PAGE_CONFIG[type]?.title : "";

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 font-sans selection:bg-yellow-200 pb-20">
      {/* ---------- SEAMLESS HEADER SECTION ---------- */}
      <header className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-40 px-6 relative overflow-hidden border-b border-yellow-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-yellow-800 hover:text-black transition-all mb-12 group w-fit"
          >
            <div className="p-2 rounded-full border border-yellow-300 bg-white/50 backdrop-blur-md group-hover:border-yellow-500 transition-colors">
              <ChevronLeft size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Hub</span>
          </button>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="text-left flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-8 shadow-sm border border-yellow-300"
              >
                <Sparkles size={14} className="text-yellow-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">
                  Premium Directory
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85] uppercase"
              >
                {pageTitle.split(' ')[0]} <br />
                <span className="text-red-600 italic">
                  {pageTitle.split(' ').slice(1).join(' ')}
                </span>
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8 max-w-md border-l-4 border-yellow-500 pl-6 py-2"
              >
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                  Class: {type}
                </p>
                <p className="text-gray-600 text-lg font-bold leading-tight">
                  Curated intellectual assets for professional digital transformation.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="hidden lg:block bg-white p-12 rounded-[4rem] shadow-2xl border-2 border-yellow-100 relative"
            >
              <div className="absolute -top-4 -right-4 bg-red-600 text-white p-4 rounded-3xl animate-bounce shadow-xl">
                <ShieldCheck size={32} strokeWidth={2.5} />
              </div>
              <div className="bg-yellow-50 p-6 rounded-[2.5rem]">
                <Layers size={100} className="text-yellow-600" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full whitespace-nowrap">
                VERIFIED PARTNER ASSETS
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ---------- GRID SECTION ---------- */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <Loader2 className="w-10 h-10 text-yellow-600 animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] animate-pulse text-center">Decrypting Archives...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-32 rounded-[3rem] border-2 border-dashed border-gray-200">
            <Info className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-950 font-black text-xl uppercase tracking-tight">Archives Empty</p>
            <p className="text-gray-400 mt-2 text-sm font-medium">This sector is currently under maintenance.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {data.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col transition-all duration-500"
              >
                {/* MODERN CARD MEDIA */}
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-200 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-yellow-900/20 group-hover:-translate-y-3">
                  {(type === "branding" || type === "podcasts" || type === "influencers") && item.video_url ? (
                    <div className="w-full h-full relative">
                      <video
                        src={item.video_url}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        autoPlay muted loop playsInline
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500" />
                      <div className="absolute bottom-6 right-6">
                        <div className="p-3 bg-white/10 backdrop-blur-2xl rounded-xl border border-white/20 opacity-100 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                          <PlayCircle size={24} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={item.image_url || "/placeholder.jpg"}
                      alt={item.title || item.name || "Item"}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  )}
                </div>

                {/* EDITORIAL CARD BODY */}
                <div className="mt-8 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="h-[2px] w-8 bg-yellow-500 group-hover:w-16 transition-all duration-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                      {type}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black text-gray-950 group-hover:tracking-tight transition-all leading-none uppercase mb-4">
                    {item.title || item.name}
                  </h3>

                  <div className="mb-8 min-h-[40px]">
                    {item.description ? (
                      <p className="text-sm text-gray-500 line-clamp-2 font-medium leading-relaxed max-w-[90%]">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Asset ID: {item.id?.toString().slice(0, 8)}
                      </p>
                    )}
                  </div>

                  {type === "categories" && (
                    <Link
                      href={`/user/services/${item.id}`}
                      className="flex items-center justify-between group/link"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover/link:bg-black group-hover/link:text-white transition-all">
                          <ArrowRight size={18} className="-rotate-45 group-hover/link:rotate-0 transition-transform duration-500" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-900">Explore Entry</span>
                      </div>
                      <ExternalLink size={14} className="text-gray-300 group-hover:text-yellow-600 transition-colors" />
                    </Link>
                  )}
                  
                  {type === "banners" && (
                    <div className="flex items-center gap-2 text-yellow-600 font-black text-[10px] uppercase tracking-widest">
                       <Sparkles size={14} /> Ready for Download
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 mt-32 border-t border-gray-200/50 pt-16 text-center">
        <div className="inline-block p-4 rounded-full border border-gray-100 mb-6 bg-white shadow-sm">
          <Layers className="text-yellow-600" size={24} />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[1em] ml-[1em]">END OF SESSION</p>
      </footer>
    </div>
  );
}

// --- MAIN EXPORT: The fix for Netlify/Next.js Build ---
export default function ViewMorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-yellow-600 mb-4" size={48} />
        <h2 className="font-black uppercase tracking-widest text-sm text-gray-400 italic">Initializing Directory...</h2>
      </div>
    }>
      <ViewMoreContent />
    </Suspense>
  );
}