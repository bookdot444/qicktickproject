"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Phone, MapPin, ShieldCheck, Globe, Building2,
  User, ArrowLeft, MessageSquare, Award, Navigation,
  Info, Layers, Zap, Smartphone, Mail,
  ChevronDown, Image as ImageIcon, ShoppingBag,
  Clock, Box, Video, Play, ExternalLink, Link as LinkIcon,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>("media");

  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      const [vendorRes, productsRes] = await Promise.all([
        supabase.from("vendor_register").select("*").eq("id", id).single(),
        supabase.from("vendor_products").select("*").eq("vendor_id", id).eq("is_active", true)
      ]);
      if (vendorRes.data) setVendor(vendorRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      setLoading(false);
    };
    if (id) fetchVendorData();
  }, [id]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (loading || !vendor) return <LoadingSpinner />;

  return (
    <div className="w-full bg-white font-sans selection:bg-yellow-100">

      {/* --- UPDATED HEADER (SMART TRANSPORT STYLE) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-12 pb-32 px-6 relative overflow-hidden border-b border-yellow-200">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <button
            onClick={() => router.back()}
            className="mb-12 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800 hover:text-black transition group"
          >
            <div className="p-2 rounded-full border border-yellow-300 bg-white/50 backdrop-blur-md group-hover:border-yellow-500 transition-colors">
              <ArrowLeft size={14} />
            </div>
            Back to Search
          </button>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

            {/* Left: Logo & Content */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 flex-1">
              {/* Logo Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-44 h-44 flex-shrink-0 bg-white p-4 rounded-[2.5rem] shadow-xl border border-yellow-100 flex items-center justify-center"
              >
                {vendor.company_logo ? (
                  <img
                    src={vendor.company_logo}
                    className="w-full h-full object-contain"
                    alt="Company Logo"
                  />
                ) : (
                  <Building2 size={64} className="text-yellow-600/30" />
                )}
              </motion.div>

              {/* Text Info */}
              <div className="text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                  <span className="bg-white/80 backdrop-blur-md border border-yellow-300 text-yellow-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    <Sparkles size={10} className="inline mr-1 mb-0.5" /> {vendor.status}
                  </span>
                  {vendor.user_type?.map((type: string, i: number) => (
                    <span
                      key={i}
                      className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest"
                    >
                      {type}
                    </span>
                  ))}

                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-6"
                >
                  {vendor.company_name.split(' ')[0]} <br />
                  <span className="text-red-600 italic">{vendor.company_name.split(' ').slice(1).join(' ')}</span>
                </motion.h1>

                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-600 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-yellow-600" /> {vendor.city}, {vendor.state}
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-red-600" /> GST: {vendor.gst_number || "Verified"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Floating Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: 3 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="hidden lg:block bg-white p-10 rounded-[4rem] shadow-2xl border-2 border-yellow-100 relative"
            >
              <div className="absolute -top-4 -right-4 bg-red-600 text-white p-4 rounded-3xl animate-bounce shadow-xl">
                <Award size={32} strokeWidth={2.5} />
              </div>
              <div className="bg-yellow-50 p-6 rounded-[2.5rem]">
                <Layers size={100} className="text-yellow-600" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full whitespace-nowrap">
                VERIFIED BUSINESS PROFILE
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 pb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDE: DETAILS & CATALOG */}
          <div className="lg:col-span-8 space-y-6">

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Category"
                value={
                  <div className="flex flex-col">
                    {vendor.user_type?.map((c: string, i: number) => (
                      <span key={i} className="block">{c}</span>
                    ))}
                  </div>
                }
                icon={<Box />}
              />
              <StatCard label="Catalog" value={`${products.length} Items`} icon={<ShoppingBag />} />
              <StatCard label="Established" value={new Date(vendor.created_at).getFullYear()} icon={<Clock />} />
              <StatCard label="Trust Score" value="A+" icon={<Award />} />
            </div>

            <div className="space-y-4">


              {/* Media Gallery */}
              <AccordionSection
                title="Media Gallery"
                icon={<ImageIcon size={20} />}
                isOpen={openSection === "media"}
                onToggle={() => toggleSection("media")}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vendor.media_files?.map((img: string, i: number) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100">
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </AccordionSection>

              {/* Business Overview Accordion */}
              <AccordionSection
                title="Business Overview"
                icon={<Info size={20} />}
                isOpen={openSection === "overview"}
                onToggle={() => toggleSection("overview")}
              >
                <div className="space-y-6">
                  {/* Profile Description */}
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    {vendor.profile_info || "Premium business providing specialized services."}
                  </p>

                  {/* Detailed Address Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1">
                        <MapPin size={12} className="text-yellow-600" /> Registered Address
                      </h4>
                      <address className="not-italic text-sm font-bold text-slate-800 leading-relaxed">
                        {/* Constructing address from your specific SQL fields */}
                        {vendor.flat_no && <span>{vendor.flat_no}, </span>}
                        {vendor.floor && <span>{vendor.floor} Floor, </span>}
                        {vendor.building && <span>{vendor.building}</span>}
                        {(vendor.flat_no || vendor.building) && <br />}

                        {vendor.street && <span>{vendor.street}, </span>}
                        {vendor.area && <span>{vendor.area}</span>}
                        {(vendor.street || vendor.area) && <br />}

                        {vendor.landmark && (
                          <span className="text-slate-500 font-medium">
                            Near {vendor.landmark}
                            <br />
                          </span>
                        )}

                        <span className="text-slate-900 uppercase">
                          {vendor.city}, {vendor.state} - {vendor.pincode}
                        </span>
                      </address>

                      {/* Optional: Add a 'Get Directions' link using Google Maps */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${vendor.company_name} ${vendor.city} ${vendor.pincode}`)}`}
                        target="_blank"
                        className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-yellow-600 hover:text-yellow-700 uppercase tracking-wider"
                      >
                        <Navigation size={12} /> Get Directions
                      </a>
                    </div>

                    {/* Keywords / Tags */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Service Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {vendor.business_keywords?.split(',').map((k: string) => (
                          <span key={k} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-200 uppercase">
                            {k.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionSection>

              {/* Product Catalog */}
              <AccordionSection
                title="Product Catalog"
                icon={<ShoppingBag size={18} />}
                isOpen={openSection === "products"}
                onToggle={() => toggleSection("products")}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                  {products.map((p) => (
                    <motion.div
                      key={p.id}
                      whileHover={{ y: -2 }}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-[#DC143C] transition"
                    >
                      {/* Image (SMALL HEIGHT) */}
                      <div className="relative h-32 bg-slate-50">
                        {p.product_image ? (
                          <img
                            src={p.product_image}
                            alt={p.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Box size={24} />
                          </div>
                        )}
                      </div>

                      {/* Content (COMPACT) */}
                      <div className="p-3">
                        <h4 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-2">
                          {p.product_name}
                        </h4>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#DC143C]">
                            ₹{p.price}
                          </span>

                          <button className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-[#DC143C]">
                            View
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AccordionSection>

            </div>
          </div>

          {/* RIGHT SIDE: CONTACT & WEBSITES */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-4">

              {/* --- SIDEBAR CONTACT BOX --- */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <div className="p-2 bg-yellow-400 rounded-lg">
                    <User className="text-black" size={20} />
                  </div>
                  Contact Details
                </h3>

                <div className="space-y-6">
                  <ContactRow label="Owner / Manager" value={vendor.owner_name} icon={<User size={18} />} />
                  <ContactRow label="Mobile Line" value={vendor.mobile_number} icon={<Smartphone size={18} />} />
                  <ContactRow label="Official Email" value={vendor.email} icon={<Mail size={18} />} />

                  {/* --- WEBSITE SECTION (BELOW EMAIL) --- */}
                  {vendor.websites && vendor.websites.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                        Official Websites
                      </p>
                      <div className="space-y-3">
                        {vendor.websites.map((url: string, i: number) => (
                          <a
                            key={i}
                            href={url.startsWith('http') ? url : `https://${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 group"
                          >
                            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-yellow-400/20 transition-colors">
                              <Globe size={16} className="text-yellow-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-300 group-hover:text-yellow-400 truncate transition-colors max-w-[200px]">
                              {/* This cleans the URL for display (removes https://) */}
                              {url.replace(/(^\w+:|^)\/\//, '').split('/')[0]}
                            </span>
                            <ExternalLink size={12} className="ml-auto opacity-30 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Call Buttons */}
                <div className="mt-10 space-y-3">
                  <a href={`tel:${vendor.mobile_number}`} className="flex items-center justify-center gap-3 bg-yellow-400 text-black font-black py-5 rounded-2xl hover:bg-yellow-300 transition-all">
                    <Phone size={20} /> Call Now
                  </a>
                </div>
              </div>

              {/* Status Footer */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</span>
                  <span className="text-[10px] font-black text-green-600 uppercase">Active</span>
                </div>
                <p className="font-black text-slate-900">{vendor.subscription_plan || "Verified Business"}</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* --- REUSABLE COMPONENTS --- */

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:border-yellow-200 transition-colors">
      <div className="text-yellow-500 mb-3">{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
      {/* FIXED: Changed <p> to <div> to allow nested block elements */}
      <div className="text-lg font-black text-slate-900 tracking-tight leading-tight">
        {value}
      </div>
    </div>
  );
}

function ContactRow({ label, value, icon }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-slate-500 mt-1">{icon}</div>
      <div className="overflow-hidden">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-200 truncate">{value || "Not Disclosed"}</p>
      </div>
    </div>
  );
}

function AccordionSection({ title, icon, children, isOpen, onToggle }: any) {
  return (
    <div className={`bg-white rounded-[2rem] border-2 transition-all ${isOpen ? 'border-yellow-400' : 'border-slate-50'}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl transition-colors ${isOpen ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-slate-50 text-slate-400'}`}>
            {icon}
          </div>
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
        </div>
        <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-yellow-600' : 'text-slate-300'}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="px-6 pb-8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-yellow-100/30">
      <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-xs uppercase tracking-[0.3em] text-black">Loading Vendor...</p>
    </div>
  );
}