"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Video,
  PlayCircle,
  User,
  Building2,
  RefreshCw,
  Youtube
} from "lucide-react";

type VendorVideo = {
  id: string;
  owner_name: string | null;
  company_name: string | null;
  video_files: any[];
};

/* =======================
   YOUTUBE HELPERS
======================= */

// ✅ FIX: this was missing
const isYouTube = (url: string) =>
  url.includes("youtube.com") || url.includes("youtu.be");

const openYouTube = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const getYouTubeEmbedUrl = (url: string) => {
  const match =
    url.match(/v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);

  if (!match) return null;

  const videoId = match[1];

  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}`;
};

export default function AdminVideosPage() {
  const [vendors, setVendors] = useState<VendorVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorVideos();
  }, []);

  const fetchVendorVideos = async () => {
    const { data, error } = await supabase
      .from("vendor_register")
      .select("id, owner_name, company_name, video_files")
      .not("video_files", "is", null);

    if (!error) setVendors(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">

      {/* HEADER */}
      <div className="bg-yellow-300 pt-10 pb-28 px-6 rounded-b-[3rem] shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-black flex items-center gap-3">
            <Video className="text-red-600" />
            Vendor <span className="text-red-600">Videos</span>
          </h1>
          <p className="text-red-900/70 text-xs font-bold uppercase tracking-wide mt-3 max-w-md">
            All promotional videos uploaded by registered vendors
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border shadow-xl">
            <RefreshCw className="animate-spin text-red-600" size={40} />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Loading Videos...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendors.flatMap((vendor) =>
              Array.isArray(vendor.video_files)
                ? vendor.video_files.map((video: any, index: number) => {
                    const videoUrl =
                      typeof video === "string" ? video : video?.url;

                    if (!videoUrl) return null;

                    const yt = isYouTube(videoUrl);
                    const embedUrl = yt ? getYouTubeEmbedUrl(videoUrl) : null;

                    return (
                      <div
                        key={`${vendor.id}-${index}`}
                        onClick={() => yt && openYouTube(videoUrl)}
                        className={`group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1
                          ${yt ? "cursor-pointer" : "cursor-default"}
                        `}
                      >
                        {/* VIDEO */}
                        <div className="relative h-56 bg-slate-900 overflow-hidden">
                          {yt && embedUrl ? (
                            <iframe
                              src={embedUrl}
                              allow="autoplay; encrypted-media"
                              allowFullScreen
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          ) : (
                            <video
                              src={videoUrl}
                              muted
                              loop
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                            />
                          )}

                          {/* ICON */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {yt ? (
                              <Youtube
                                size={64}
                                strokeWidth={1}
                                className="text-red-600/80"
                              />
                            ) : (
                              <PlayCircle
                                size={64}
                                strokeWidth={1}
                                className="text-white/30 group-hover:text-red-600 transition-colors"
                              />
                            )}
                          </div>
                        </div>

                        {/* INFO */}
                        <div className="p-6 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase truncate">
                            <User size={14} className="text-red-600" />
                            {vendor.owner_name || "Owner Not Set"}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase truncate">
                            <Building2 size={14} />
                            {vendor.company_name || "Company Not Set"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                : []
            )}
          </div>
        )}
      </div>
    </div>
  );
}
