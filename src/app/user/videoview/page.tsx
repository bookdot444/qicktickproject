"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { Megaphone, Briefcase, Play, X, BadgeCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";

// 1. We create a sub-component for the logic
function VendorContent() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ads" | "services">("ads");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

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
    if (vendorId) {
      fetchVendors();
    }
  }, [vendorId]);

  useEffect(() => {
    if (tab === "services") setActiveTab("services");
    else setActiveTab("ads");
  }, [tab]);

  const allAdsVideos = vendors.flatMap((vendor) => {
    if (!vendor.video_files || !Array.isArray(vendor.video_files)) return [];
    return vendor.video_files.map((vid: any, index: number) => ({
      ...vid,
      vendorId: vendor.id,
      vendorName: vendor.company_name,
      sector: vendor.sector,
      area: vendor.area,
      logo: vendor.company_logo,
      uniqueId: `${vendor.id}-${index}`,
    }));
  });

  const allCertificates = vendors.flatMap((vendor) => {
    if (!vendor.certificates || !Array.isArray(vendor.certificates)) return [];
    return vendor.certificates.map((cert: string, index: number) => ({
      certUrl: cert,
      vendorId: vendor.id,
      vendorName: vendor.company_name,
      sector: vendor.sector,
      area: vendor.area,
      logo: vendor.company_logo,
      uniqueId: `${vendor.id}-cert-${index}`,
    }));
  });

  return (
    <div className="min-h-screen bg-[#FFFDF5] px-5 py-10">
      <Toaster position="top-center" />

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            Ads & <span className="text-red-600">Services</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-semibold">
            Explore vendor ads videos and service certificates.
          </p>
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

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold">Loading...</div>
        ) : (
          <>
            {activeTab === "ads" && (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-wide">Vendor Ads Videos</h2>
                {allAdsVideos.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 font-bold">No Ads videos uploaded.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {allAdsVideos.map((video) => (
                      <motion.div key={video.uniqueId} whileHover={{ scale: 1.02 }} className="bg-white rounded-[2rem] overflow-hidden border border-yellow-100 shadow-sm hover:shadow-xl transition-all">
                        <div className="relative h-56 bg-black cursor-pointer group" onClick={() => setSelectedVideo(video)}>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                            <Play className="text-white" size={50} />
                          </div>
                          <video src={video.url} muted autoPlay loop playsInline className="w-full h-full object-cover" />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            {video.logo ? <Image src={video.logo} alt="logo" width={50} height={50} className="rounded-full object-cover border" /> : <div className="w-12 h-12 bg-gray-200 rounded-full" />}
                            <div>
                              <h3 className="font-black text-gray-900 text-sm uppercase">{video.vendorName}</h3>
                              <p className="text-[11px] text-gray-500 font-bold uppercase">{video.sector} • {video.area}</p>
                            </div>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-2 text-xs font-black text-gray-700 uppercase tracking-widest">Advertisement Video</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "services" && (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-wide">Vendor Service Certificates</h2>
                {allCertificates.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 font-bold">No certificates uploaded.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {allCertificates.map((cert) => (
                      <motion.div key={cert.uniqueId} whileHover={{ scale: 1.02 }} className="bg-white rounded-[2rem] overflow-hidden border border-yellow-100 shadow-sm hover:shadow-xl transition-all">
                        <div className="relative h-60 bg-gray-100 cursor-pointer group" onClick={() => setSelectedCertificate(cert.certUrl)}>
                          <Image src={cert.certUrl} alt="certificate" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <BadgeCheck size={55} className="text-yellow-300" />
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            {cert.logo ? <Image src={cert.logo} alt="logo" width={50} height={50} className="rounded-full object-cover border" /> : <div className="w-12 h-12 bg-gray-200 rounded-full" />}
                            <div>
                              <h3 className="font-black text-gray-900 text-sm uppercase">{cert.vendorName}</h3>
                              <p className="text-[11px] text-gray-500 font-bold uppercase">{cert.sector} • {cert.area}</p>
                            </div>
                          </div>
                          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 text-xs font-black text-gray-700 uppercase tracking-widest">Service Certificate</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedVideo(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="font-black text-gray-900 uppercase">{selectedVideo.vendorName}</h2>
                <button onClick={() => setSelectedVideo(null)} className="bg-gray-100 p-2 rounded-xl hover:bg-gray-200"><X size={20} /></button>
              </div>
              <video src={selectedVideo.url} controls autoPlay className="w-full h-[400px] object-cover bg-black" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCertificate && (
          <motion.div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCertificate(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="font-black text-gray-900 uppercase">Certificate Preview</h2>
                <button onClick={() => setSelectedCertificate(null)} className="bg-gray-100 p-2 rounded-xl hover:bg-gray-200"><X size={20} /></button>
              </div>
              <div className="relative w-full h-[500px] bg-gray-100">
                <Image src={selectedCertificate} alt="certificate" fill className="object-contain" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 2. The default export NOW wraps everything in Suspense
export default function VendorAdsServicesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading content...</div>}>
      <VendorContent />
    </Suspense>
  );
}