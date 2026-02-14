"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { Megaphone, Briefcase, Play, X, BadgeCheck, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useSearchParams } from "next/navigation";

function VendorContent() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ads" | "services">("ads");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  
  // State for Certificate Slider
  const [certIndex, setCertIndex] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const vendorId = searchParams.get("vendorId");
  const tab = searchParams.get("tab");

  const fetchVendors = async () => {
    setLoading(true);
    if (!vendorId) {
      toast.error("Vendor ID missing");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("vendor_register")
      .select("id, company_name, sector, area, video_files, certificates, company_logo")
      .eq("id", vendorId)
      .single();

    if (error) {
      toast.error("Failed to load vendor details");
      setLoading(false);
      return;
    }

    setVendors([data]);
    setLoading(false);
  };

  useEffect(() => {
    if (vendorId) fetchVendors();
  }, [vendorId]);

  useEffect(() => {
    if (tab === "services") setActiveTab("services");
    else setActiveTab("ads");
  }, [tab]);

  const vendor = vendors[0];

  const allAdsVideos = vendors.flatMap((v) => {
    if (!v.video_files || !Array.isArray(v.video_files)) return [];
    return v.video_files.map((vid: any, index: number) => ({
      ...vid,
      vendorId: v.id,
      vendorName: v.company_name,
      sector: v.sector,
      area: v.area,
      logo: v.company_logo,
      uniqueId: `${v.id}-${index}`,
    }));
  });

  const allCertificates = vendors.flatMap((v) => {
    if (!v.certificates || !Array.isArray(v.certificates)) return [];
    return v.certificates.map((cert: string) => cert);
  });

  const nextCert = () => {
    if (certIndex !== null) setCertIndex((certIndex + 1) % allCertificates.length);
  };

  const prevCert = () => {
    if (certIndex !== null) setCertIndex((certIndex - 1 + allCertificates.length) % allCertificates.length);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] px-5 py-10">
      <Toaster position="top-center" />

      {/* NEW TOP NAVIGATION HEADER */}
      {vendor && (
        <div className="max-w-6xl mx-auto mb-8 bg-white p-4 rounded-3xl border border-yellow-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border">
              <Image src={vendor.company_logo || "/placeholder.png"} alt="logo" fill className="object-cover" />
            </div>
            <h2 className="font-black text-gray-900 uppercase tracking-tight">{vendor.company_name}</h2>
          </div>
          <Link 
            href={`/vendor/view/${vendor.id}`}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all"
          >
            <User size={18} /> View Profile
          </Link>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            Ads & <span className="text-red-600">Services</span>
          </h1>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex bg-white rounded-2xl shadow-md border border-yellow-100 overflow-hidden w-full md:w-auto">
          <button
            onClick={() => setActiveTab("ads")}
            className={`flex-1 md:flex-none px-6 py-3 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all
              ${activeTab === "ads" ? "bg-yellow-400 text-black" : "text-gray-600 hover:bg-yellow-50"}`}
          >
            <Megaphone size={18} /> Ads
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex-1 md:flex-none px-6 py-3 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all
              ${activeTab === "services" ? "bg-yellow-400 text-black" : "text-gray-600 hover:bg-yellow-50"}`}
          >
            <Briefcase size={18} /> Services
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold">Loading...</div>
        ) : (
          <>
            {activeTab === "ads" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {allAdsVideos.map((video) => (
                  <motion.div key={video.uniqueId} whileHover={{ scale: 1.02 }} className="bg-white rounded-[2rem] overflow-hidden border border-yellow-100 shadow-sm">
                    <div className="relative h-56 bg-black cursor-pointer group" onClick={() => setSelectedVideo(video)}>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                        <Play className="text-white" size={50} />
                      </div>
                      <video src={video.url} muted autoPlay loop playsInline className="w-full h-full object-cover" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "services" && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allCertificates.map((cert, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.03 }} 
                    className="relative aspect-[3/4] bg-gray-200 rounded-2xl overflow-hidden cursor-pointer border shadow-sm"
                    onClick={() => setCertIndex(idx)}
                  >
                    <Image src={cert} alt="cert" fill className="object-cover" />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedVideo(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden relative">
               <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-md p-2 rounded-full text-white"><X size={24} /></button>
               <video src={selectedVideo.url} controls autoPlay className="w-full h-auto max-h-[80vh] bg-black" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN IMAGE SLIDER */}
      <AnimatePresence>
        {certIndex !== null && (
          <motion.div className="fixed inset-0 bg-black/98 z-[999] flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button onClick={() => setCertIndex(null)} className="absolute top-6 right-6 text-white hover:text-red-500 z-[1001]"><X size={40} /></button>
            
            <button onClick={prevCert} className="absolute left-4 text-white p-4 z-[1001] bg-white/10 rounded-full hover:bg-white/20"><ChevronLeft size={40} /></button>
            
            <div className="relative w-full h-full p-10 flex items-center justify-center" onClick={() => setCertIndex(null)}>
              <motion.div 
                key={certIndex}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="relative w-full h-full max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Image src={allCertificates[certIndex]} alt="full cert" fill className="object-contain" />
              </motion.div>
            </div>

            <button onClick={nextCert} className="absolute right-4 text-white p-4 z-[1001] bg-white/10 rounded-full hover:bg-white/20"><ChevronRight size={40} /></button>
            
            <div className="absolute bottom-10 text-white font-bold bg-black/50 px-6 py-2 rounded-full">
              {certIndex + 1} / {allCertificates.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VendorAdsServicesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-bold">Initializing...</div>}>
      <VendorContent />
    </Suspense>
  );
}