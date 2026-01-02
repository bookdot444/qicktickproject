"use client";
import Link from "next/link";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { ChevronLeft, PlayCircle, Info, ArrowRight, Layers, ExternalLink, Sparkles } from "lucide-react";

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
};

export default function ViewMorePage() {
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
      const { data, error } = await supabase.from(table).select("*");
      if (!error) setData(data || []);
      setLoading(false);
    };

    fetchData();
  }, [type, router]);

  const pageTitle = type ? PAGE_CONFIG[type]?.title : "";

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 font-sans selection:bg-yellow-200 pb-20">
      
      {/* ---------- SEAMLESS HEADER SECTION ---------- */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/p6-mini.png")` }} />
        
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative z-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-all mb-12 group w-fit"
          >
            <div className="p-2 rounded-full border border-gray-200 group-hover:border-black transition-colors">
              <ChevronLeft size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Hub</span>
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                <Sparkles size={12} className="text-yellow-400" />
                Premium Directory
              </div>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-gray-950 uppercase leading-[0.85]">
                {pageTitle.split(' ')[0]} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-red-600">
                  {pageTitle.split(' ').slice(1).join(' ')}
                </span>
              </h1>
            </div>
            
            <div className="max-w-xs md:text-right border-l-4 md:border-l-0 md:border-r-4 border-yellow-500 pl-6 md:pl-0 md:pr-6 py-2">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 italic">Class: {type}</p>
              <p className="text-gray-600 text-sm font-semibold leading-relaxed">
                Curated intellectual assets for professional digital transformation.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- GRID SECTION ---------- */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-yellow-600 rounded-full animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] animate-pulse text-center">Decrypting Archives...</p>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="text-center py-32 rounded-[3rem] border-2 border-dashed border-gray-200">
            <Info className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-950 font-black text-xl uppercase tracking-tight">Archives Empty</p>
            <p className="text-gray-400 mt-2 text-sm font-medium">This sector is currently under maintenance.</p>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {data.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col transition-all duration-500"
              >
                {/* MODERN CARD MEDIA */}
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-200 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-yellow-900/20 group-hover:-translate-y-3">
                  {item.video_url ? (
                    <div className="w-full h-full relative">
                        <video
                          src={item.video_url}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          muted loop playsInline
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
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
                      alt={item.name || item.title || "Item"}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  )}
                  
                  {/* OVERLAY TAG */}
                  <div className="absolute top-6 left-6">
                    <span className="bg-black text-white text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                        REF_{item.id.toString().slice(-4)}
                    </span>
                  </div>
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
                    {item.name || item.title}
                  </h3>
                  
                  <div className="mb-8 min-h-[40px]">
                    {item.description ? (
                      <p className="text-sm text-gray-500 line-clamp-2 font-medium leading-relaxed max-w-[90%]">
                        {item.description}
                      </p>
                    ) : (
                      <div className="h-4" /> 
                    )}
                  </div>

           <Link
  href={`/user/services/${item.id}`}
  className="flex items-center justify-between group/link"
>
  <div className="flex items-center gap-2">
    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover/link:bg-black group-hover/link:text-white transition-all">
      <ArrowRight
        size={18}
        className="-rotate-45 group-hover/link:rotate-0 transition-transform duration-500"
      />
    </div>
    <span className="text-xs font-black uppercase tracking-widest text-gray-900">
      Explore Entry
    </span>
  </div>

  <div className="flex items-center gap-2 text-gray-300">
    <ExternalLink
      size={14}
      className="group-hover:text-yellow-600 transition-colors"
    />
  </div>
</Link>


                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* BOTTOM ACCENT */}
      <footer className="max-w-7xl mx-auto px-6 mt-32 border-t border-gray-200/50 pt-16 text-center">
        <div className="inline-block p-4 rounded-full border border-gray-100 mb-6 bg-white shadow-sm">
          <Layers className="text-yellow-600" size={24} />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[1em] ml-[1em]">END OF SESSION</p>
      </footer>
    </div>
  );
}