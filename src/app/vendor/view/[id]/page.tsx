"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Phone, MapPin, ShieldCheck, Star, Globe, Building2,
  User, Hash, ArrowLeft, MessageSquare, Award,
  Info, Layers, Zap, ExternalLink, Smartphone, Mail,
  ChevronDown, Image as ImageIcon, ShoppingBag,
  Clock, Box, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>("overview");

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
    <div className="min-h-screen bg-[#FAFAFA] pb-32 font-sans selection:bg-yellow-200">

      {/* --- REFINED HERO SECTION --- */}
      <div className="relative bg-gradient-to-br from-amber-50 via-[#FFFDF5] to-white pt-20 pb-48 px-6 overflow-hidden border-b border-amber-100">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <button
            onClick={() => router.back()}
            className="group mb-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800 hover:text-amber-600 transition-all"
          >
            <ArrowLeft size={16} /> Back to results
          </button>

          <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-center">
            {/* Logo Container */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
              <div className="bg-white p-6 rounded-3xl shadow-xl shadow-amber-900/5 w-44 h-44 flex items-center justify-center border border-amber-100/50">
                {vendor.company_logo ? (
                  <img src={vendor.company_logo} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <Building2 size={50} className="text-amber-200" />
                )}
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-full shadow-lg border border-amber-50">
                 <ShieldCheck size={24} className="text-green-500" />
              </div>
            </motion.div>

            <div className="text-center lg:text-left flex-1">
              <div className="inline-flex items-center gap-2 bg-amber-100/50 text-amber-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
                <Award size={12} /> Established Partner
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                {vendor.company_name}
              </h1>
              <div className="flex flex-wrap justify-center lg:justify-start gap-5">
                <HeroBadge icon={<MapPin size={16}/>} text={`${vendor.city}, ${vendor.state}`} />
                <HeroBadge icon={<Layers size={16}/>} text={vendor.sector} />
                <HeroBadge icon={<Box size={16}/>} text={vendor.business_type} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="Inventory" value={products.length} sub="Items" icon={<ShoppingBag />} />
            <StatsCard label="Verified" value="Yes" sub="Status" icon={<ShieldCheck />} />
            <StatsCard label="Reliability" value="99%" sub="Uptime" icon={<Zap />} />
            <StatsCard label="Active" value="2024" sub="Joined" icon={<Clock />} />
          </div>

          <AccordionSection
            title="Business Profile"
            icon={<Info size={20} />}
            isOpen={openSection === "overview"}
            onToggle={() => toggleSection("overview")}
          >
            <div className="bg-slate-50/50 p-8 rounded-2xl">
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  {vendor.profile_info || "Premium entity specializing in high-performance industrial solutions and technical excellence."}
                </p>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Product Catalog"
            icon={<ShoppingBag size={20} />}
            isOpen={openSection === "products"}
            onToggle={() => toggleSection("products")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.length > 0 ? products.map((p) => (
                <div key={p.id} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                  <div className="aspect-[4/3] relative bg-slate-50">
                    {p.product_image ? (
                      <img src={p.product_image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200"><Box size={40} /></div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 font-bold px-4 py-2 rounded-2xl text-sm shadow-sm border border-slate-100">
                      ₹{p.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-slate-900 text-base mb-2">{p.product_name}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{p.description}</p>
                  </div>
                </div>
              )) : (
                <p className="col-span-2 text-center py-10 text-slate-400 font-medium">No products listed in catalog</p>
              )}
            </div>
          </AccordionSection>

          <AccordionSection
            title="Media Gallery"
            icon={<ImageIcon size={20} />}
            isOpen={openSection === "photos"}
            onToggle={() => toggleSection("photos")}
          >
            {vendor.media_files?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vendor.media_files.map((url: string, i: number) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden group border border-slate-100">
                      <img src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl text-slate-400 text-sm font-medium italic">
                    No visual media currently available
                </div>
            )}
          </AccordionSection>
        </div>

        {/* RIGHT COLUMN - CONTACT CENTER */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                 <Building2 size={120} />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-8">Contact Information</h3>

              <div className="space-y-6 relative z-10">
                <ContactRow icon={<User size={18}/>} label="Owner" value={vendor.owner_name} />
                <ContactRow icon={<Smartphone size={18}/>} label="Phone Number" value={vendor.mobile_number} />
                <ContactRow icon={<Mail size={18}/>} label="Official Email" value={vendor.email} />
                <ContactRow icon={<Globe size={18}/>} label="Website" value={vendor.website} isLink />
              </div>

              <div className="mt-10 space-y-3">
                <a href={`tel:${vendor.mobile_number}`} className="flex w-full bg-slate-900 text-white py-5 rounded-2xl items-center justify-center gap-3 font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                  <Phone size={18} /> Call Business
                </a>
                <button className="flex w-full bg-amber-400 text-amber-950 py-5 rounded-2xl items-center justify-center gap-3 font-bold text-sm hover:bg-amber-300 transition-all shadow-lg shadow-amber-100">
                  <MessageSquare size={18} /> WhatsApp Message
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mb-1">Entity Validation</p>
              <p className="text-slate-600 font-bold text-xs uppercase">GST Verified: {vendor.gst_number || "Verified"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- REFINED COMPONENTS --- */

function HeroBadge({ icon, text }: any) {
  return (
    <div className="flex items-center gap-2 font-bold text-xs text-slate-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-100/30 shadow-sm">
      <span className="text-amber-500">{icon}</span> {text}
    </div>
  );
}

function StatsCard({ label, value, sub, icon }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
      <div className="text-amber-500 mb-3 bg-amber-50 p-3 rounded-xl">{icon}</div>
      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-slate-900">{value}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase">{sub}</span>
      </div>
    </div>
  );
}

function AccordionSection({ title, icon, children, isOpen, onToggle }: any) {
  return (
    <div className={`bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden ${isOpen ? 'border-amber-200 shadow-xl shadow-amber-900/5' : 'border-slate-100 hover:border-amber-100'}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-7 text-left">
        <div className="flex items-center gap-5">
          <div className={`p-3 rounded-xl transition-all duration-500 ${isOpen ? 'bg-amber-500 text-white rotate-6' : 'bg-slate-50 text-slate-400'}`}>
            {icon}
          </div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        <div className={`p-1.5 rounded-full transition-all duration-500 ${isOpen ? 'bg-amber-50 text-amber-500 rotate-180' : 'text-slate-300'}`}>
          <ChevronDown size={20} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-7 pb-8 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactRow({ icon, label, value, isLink }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400">{icon}</div>
      <div className="overflow-hidden">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" className="text-sm font-bold text-amber-600 hover:text-amber-500 truncate block transition-all underline decoration-amber-200 decoration-2 underline-offset-4">{value || "Visit Website"}</a>
        ) : (
          <p className="text-sm font-bold text-slate-800 tracking-tight">{value || "---"}</p>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500" size={20} />
      </div>
      <p className="mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Loading Profile</p>
    </div>
  );
}