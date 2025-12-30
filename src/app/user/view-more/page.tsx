"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

type PageConfig = {
  title: string;
  table: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  help: {
    title: "Help & Earn",
    table: "help_and_earn",
  },
  categories: {
    title: "All Categories",
    table: "categories",
  },
  branding: {
    title: "Digital Branding",
    table: "digital_branding_videos",
  },
  podcasts: {
    title: "Podcasts",
    table: "podcast_videos",
  },
  influencers: {
    title: "Influencers",
    table: "influencers_videos",
  },
  certificates: {
    title: "Certificates",
    table: "certificates",
  },
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

      if (!error) {
        setData(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [type, router]);

  const pageTitle = type ? PAGE_CONFIG[type]?.title : "";

  return (
    <div className="min-h-screen bg-[#FFFDF5] pt-[120px] px-6">
      <div className="max-w-7xl mx-auto">

        {/* ---------- PAGE HEADER ---------- */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900">
            {pageTitle}
          </h1>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Explore all available {pageTitle.toLowerCase()} curated for you
          </p>
        </div>

        {/* ---------- LOADING ---------- */}
        {loading && (
          <div className="text-center text-gray-500 font-medium">
            Loading {pageTitle}...
          </div>
        )}

        {/* ---------- EMPTY STATE ---------- */}
        {!loading && data.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold text-lg">
              No items found
            </p>
          </div>
        )}

        {/* ---------- GRID ---------- */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {data.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                {/* ---------- MEDIA ---------- */}
                <div className="relative aspect-square bg-black overflow-hidden">

                  {/* VIDEO */}
                  {item.video_url ? (
                    <video
                      src={item.video_url}
                      className="w-full h-full object-cover block"
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  ) : (
                    <Image
                      src={item.image_url || "/placeholder.jpg"}
                      alt={item.name || item.title || "Item"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* BADGE */}
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    {type}
                  </span>
                </div>

                {/* ---------- CONTENT ---------- */}
                <div className="p-4 text-center">
                  <h3 className="font-black text-gray-900 text-sm line-clamp-2">
                    {item.name || item.title}
                  </h3>

                  {item.description && (
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
