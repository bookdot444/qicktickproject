"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import {
  ChevronLeft,
  PlayCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Loader2,
  X,
  Search,
  ChevronRight,
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

const ITEMS_PER_PAGE = 30;

function ViewMoreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!type || !PAGE_CONFIG[type]) {
      router.push("/user");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const { table } = PAGE_CONFIG[type];
      const { data } = await supabase.from(table).select("*");
      setData(data || []);
      setLoading(false);
    };

    fetchData();
  }, [type, router]);

  const pageTitle = type ? PAGE_CONFIG[type]?.title : "";

  // ✅ Filtered Data
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      (item.name || item.title || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  // ✅ Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ✅ Pagination calculations
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedData = filteredData.slice(startIndex, endIndex);

  // ✅ Active item based on paginatedData
  const activeItem =
    activeIndex !== null ? paginatedData[activeIndex] : null;

  const activeUrl =
    activeItem?.media_url || activeItem?.image_url || activeItem?.video_url;

const isActiveVideo = activeUrl?.includes(".mp4");

  // ✅ Next button for modal
  const nextMedia = () => {
    if (activeIndex === null) return;
    setActiveIndex((prev) =>
      prev !== null ? (prev + 1) % paginatedData.length : 0
    );
  };

  // ✅ Prev button for modal
  const prevMedia = () => {
    if (activeIndex === null) return;
    setActiveIndex((prev) =>
      prev !== null
        ? (prev - 1 + paginatedData.length) % paginatedData.length
        : 0
    );
  };

  // ✅ Pagination Buttons Page Numbers
  const getPageNumbers = () => {
    let pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <>
      <div className="min-h-screen bg-[#FFFDF5] pb-20">
        {/* ---------- HEADER ---------- */}
        <header className="relative z-20 bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-28 px-6 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-yellow-800 mb-10"
            >
              <ChevronLeft size={16} />
              <span className="text-[10px] text-black font-extrabold tracking-widest uppercase">
                Back
              </span>
            </button>

            <div className="flex flex-col lg:flex-row gap-10 items-start justify-between">
              {/* TITLE + SEARCH */}
              <div className="flex-1">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full mb-6 border border-yellow-300">
                    <Sparkles size={14} className="text-yellow-600" />
                    <span className="text-[10px] text-black font-extrabold tracking-widest uppercase">
                      Premium Directory
                    </span>
                  </div>

                  <h1 className="text-5xl md:text-7xl text-black font-extrabold tracking-tight leading-tight">
                    {pageTitle.split(" ")[0]}{" "}
                    <span className="text-black font-extrabold tracking-tighter">
                      {pageTitle.split(" ").slice(1).join(" ")}
                    </span>
                  </h1>
                </div>

                {/* 🔍 SEARCH BAR */}
                <div className="mt-8 max-w-md relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search here..."
                    className="w-full text-black pl-12 pr-4 py-3 rounded-full bg-white/80 border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* RIGHT CARD */}
              <div className="hidden lg:block bg-white p-10 rounded-[3rem] shadow-xl border border-yellow-100">
                <ShieldCheck size={70} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </header>

        {/* ---------- GRID ---------- */}
        <main className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-40">
              <Loader2 className="animate-spin text-yellow-600" size={40} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {paginatedData.map((item, index) => {
                  const mediaUrl =
                    item.video || item.media_url || item.image_url || item.video_url;

                  console.log("MEDIA URL:", mediaUrl);
                  const isVideo =
                    mediaUrl &&
                    (mediaUrl.includes(".mp4") ||
                      mediaUrl.includes(".webm") ||
                      mediaUrl.includes(".mov"));
                  return (
                    <div key={item.id} className="group">
                      <div className="relative aspect-video rounded-3xl overflow-hidden border bg-white">
                       {mediaUrl && mediaUrl.includes(".mp4") ? (
  <div
    onClick={() => setActiveIndex(index)}
    className="cursor-pointer w-full h-full"
  >
    <video
      src={mediaUrl}
      className="w-full h-full object-cover"
      muted
      autoPlay
      loop
      playsInline
      preload="metadata"
    />
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
      <PlayCircle size={40} className="text-white" />
    </div>
  </div>
) : mediaUrl ? (
  <div
    onClick={() => setActiveIndex(index)}
    className="cursor-pointer w-full h-full"
  >
    <Image
      src={mediaUrl}
      alt=""
      fill
      className="object-cover"
      unoptimized
    />
  </div>
) : (
  <div className="flex items-center justify-center h-full text-gray-400">
    No media
  </div>
)}
                      </div>

                      <h3 className="mt-4 text-lg font-extrabold text-black uppercase">
                        {item.name || item.title}
                      </h3>

                      {type === "categories" && (
                        <Link
                          href={`/user/services/${item.id}`}
                          className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-yellow-700"
                        >
                          Explore <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ✅ PAGINATION UI */}
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-3 mt-16">
                  {/* Prev */}
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition
                      ${currentPage === 1
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-yellow-500 text-black hover:bg-yellow-600"
                      }`}
                  >
                    Prev
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full font-extrabold transition
                        ${currentPage === page
                          ? "bg-black text-white"
                          : "bg-white border border-yellow-300 text-black hover:bg-yellow-100"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition
                      ${currentPage === totalPages
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-yellow-500 text-black hover:bg-yellow-600"
                      }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ✅ MODAL FOR BOTH VIDEO + IMAGE */}
      <AnimatePresence>
        {activeIndex !== null && activeItem && (
          <motion.div
            className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center"
            onClick={() => setActiveIndex(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-5xl mx-4 bg-black rounded-3xl p-4"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setActiveIndex(null)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:text-white"
              >
                <X size={18} />
              </button>

              {/* PREV BUTTON */}
              <button
                onClick={prevMedia}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 z-20"
              >
                <ChevronLeft size={24} />
              </button>

              {/* NEXT BUTTON */}
              <button
                onClick={nextMedia}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 z-20"
              >
                <ChevronRight size={24} />
              </button>

              {/* MEDIA */}
              <div className="w-full aspect-video flex items-center justify-center">
                {isActiveVideo ? (
                  <video
                    src={activeUrl}
                    autoPlay
                    controls
                    playsInline
                    className="w-full h-full object-contain rounded-2xl"
                  />
                ) : (
                  <img
                    src={activeUrl}
                    className="w-full h-full object-contain rounded-2xl"
                    alt=""
                  />
                )}
              </div>

              {/* TITLE BELOW */}
              <p className="mt-4 text-center text-white font-bold uppercase tracking-widest text-[11px] opacity-80">
                {activeItem.name || activeItem.title}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ViewMorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-yellow-600" size={40} />
        </div>
      }
    >
      <ViewMoreContent />
    </Suspense>
  );
}