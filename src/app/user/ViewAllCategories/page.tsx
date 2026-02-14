"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Layers,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  image_url?: string;
}

export default function ViewAllCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 80;

  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = categories;

    if (search.trim()) {
      filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredCategories(filtered);

    // ✅ Reset page to 1 when searching
    setCurrentPage(1);
  }, [search, categories]);

  async function fetchCategories() {
    setLoading(true);

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (!error && data) {
      setCategories(data);
      setFilteredCategories(data);
    }

    setLoading(false);
  }

  // ✅ Pagination calculations
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  const goNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goPrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] text-gray-900 pb-12">
      {/* ---------- HEADER ---------- */}
      <header className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-12 pb-16 px-6 relative overflow-hidden border-b border-yellow-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
            <div className="flex-1">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-yellow-800 hover:text-black transition-all mb-4 group w-fit"
              >
                <div className="p-2 rounded-full border border-yellow-300 bg-white/50 backdrop-blur-md group-hover:border-yellow-500 transition-colors">
                  <ChevronLeft size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Back to Hub
                </span>
              </button>

              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-4 shadow-sm border border-yellow-300"
              >
                <Sparkles size={14} className="text-yellow-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">
                  Premium Directory
                </span>
              </motion.div>

              {/* Page Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-gray-900 uppercase leading-tight">
                All <span className="text-red-600">Categories</span>
              </h1>

              {/* Search Input */}
              <div className="mt-6 w-full max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full px-4 py-2 rounded-full border border-yellow-300 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm"
                />
              </div>

              {/* Showing Count */}
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                Showing {currentCategories.length} of {filteredCategories.length} categories
              </p>
            </div>

            {/* Right Image/Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="hidden lg:block bg-white p-10 rounded-[3.5rem] shadow-2xl border-2 border-yellow-100 relative"
            >
              <div className="absolute -top-3 -right-3 bg-red-600 text-white p-3 rounded-2xl animate-bounce shadow-xl">
                <ShieldCheck size={28} strokeWidth={2.5} />
              </div>
              <div className="bg-yellow-50 p-6 rounded-[2rem]">
                <Layers size={80} className="text-yellow-600" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[7px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full whitespace-nowrap">
                VERIFIED ASSETS
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ---------- CATEGORIES GRID ---------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6 justify-items-center">
          {loading
            ? [...Array(20)].map((_, i) => (
                <div key={i} className="flex flex-col items-center animate-pulse">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-200 mb-2" />
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                </div>
              ))
            : currentCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-col items-center cursor-pointer active:scale-95 transition group w-full"
                  onClick={() => router.push(`/user/services/${cat.id}`)}
                >
                  <div className="relative overflow-hidden w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border border-gray-100 shadow-sm group-hover:shadow-md">
                    {cat.image_url ? (
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 768px) 64px, 80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 font-bold">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <p className="mt-1.5 text-[10px] sm:text-xs font-medium text-gray-700 text-center truncate w-full">
                    {cat.name}
                  </p>
                </div>
              ))}
        </div>

        {/* ---------- PAGINATION ---------- */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-md border border-yellow-200">
              {/* PREV */}
              <button
                onClick={goPrev}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>

              {/* PAGE INFO */}
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-800">
                Page {currentPage} / {totalPages}
              </span>

              {/* NEXT */}
              <button
                onClick={goNext}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
