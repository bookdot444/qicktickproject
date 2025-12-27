"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Phone,
  MapPin,
  ShieldCheck,
  Star,
  Globe,
  Building2,
  Calendar,
  Briefcase,
  User,
  Hash,
  ArrowLeft,
  Mail,
  ExternalLink,
  Info,
  Layers,
  FileText,
  MessageSquare,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

export default function VendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("vendor_register")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setVendor(data);
        const { data: reviewData } = await supabase
          .from("vendor_reviews")
          .select("*")
          .eq("vendor_id", id)
          .eq("status", "approved");
        setReviews(reviewData || []);
      }
      setLoading(false);
    };

    if (id) fetchVendorData();
  }, [id]);

  if (loading || !vendor) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#D80000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avgRating = reviews.length > 0
      ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
      : "New";

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-20">
      
      {/* ================= HERO SECTION ================= */}
      <div className="bg-[#D80000] pt-12 pb-32 px-6 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <button 
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-white/80 hover:text-white font-bold text-xs uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={14} /> Back to Directory
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Company Logo */}
            <div className="w-40 h-40 bg-white rounded-3xl p-4 shadow-2xl flex items-center justify-center border-4 border-white/10 overflow-hidden shrink-0">
              {vendor.company_logo ? (
                <img src={vendor.company_logo} alt="logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 size={60} className="text-slate-200" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4">
                <span className="bg-[#FFD700] text-black text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider">
                  {vendor.subscription_plan || "Verified"}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-emerald-400" /> Identity Verified
                </span>
              </div>
              
              <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-4 leading-none">
                {vendor.company_name}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-white/80 text-sm font-bold uppercase tracking-wide">
                <div className="flex items-center gap-2"><MapPin size={18} className="text-[#FFD700]" /> {vendor.city}, {vendor.state}</div>
                <div className="flex items-center gap-2"><Star size={18} className="text-[#FFD700] fill-[#FFD700]" /> {avgRating} Rating</div>
                <div className="flex items-center gap-2"><Award size={18} /> {vendor.sector || "Industrial Sector"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: ABOUT & MEDIA */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
              <SummaryItem label="Business Type" value={vendor.business_type} />
              <SummaryItem label="GST Number" value={vendor.gst_number || "Verified"} />
              <SummaryItem label="Location" value={vendor.pincode} />
              <SummaryItem label="User Type" value={vendor.user_type} />
            </div>

            {/* Profile Info */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <Info className="text-[#D80000]" size={24} /> Company Profile
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-line">
                {vendor.profile_info || "This vendor has not provided a detailed profile description yet."}
              </p>

              {vendor.business_keywords && (
                <div className="mt-10 pt-8 border-t border-slate-50">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Core Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.business_keywords.split(',').map((tag: string, i: number) => (
                      <span key={i} className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold border border-slate-100 uppercase">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Media/Gallery Section */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Layers className="text-[#D80000]" size={24} /> Media Portfolio
              </h2>
              {vendor.media_files?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vendor.media_files.map((url: string, i: number) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 group">
                      <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Work" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                  <FileText className="text-slate-200 mx-auto mb-2" size={40} />
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No media files available</p>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: CALL & ENQUIRY ACTIONS */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* ACTION CARD (Call & Enquiry) */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D80000] blur-[80px] opacity-40" />
              
              <h3 className="text-xl font-black mb-8 flex items-center gap-2 relative z-10">
                Contact Directory
              </h3>

              <div className="space-y-4 relative z-10">
                {/* CALL BUTTON */}
                <a 
                  href={`tel:${vendor.mobile_number}`}
                  className="w-full bg-[#D80000] hover:bg-white hover:text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-900/40"
                >
                  <Phone size={18} /> Call Now
                </a>

                {/* ENQUIRY BUTTON */}
                <button 
                  onClick={() => window.location.href = `mailto:${vendor.email}?subject=Business Enquiry`}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                >
                  <MessageSquare size={18} /> Send Enquiry
                </button>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10 space-y-4 relative z-10">
                <ContactInfoItem icon={<User size={16} />} label="Point of Contact" value={vendor.owner_name} />
                <ContactInfoItem icon={<Hash size={16} />} label="GSTIN" value={vendor.gst_number || "Verified"} />
                <ContactInfoItem icon={<Globe size={16} />} label="Website" value={vendor.website} isLink />
              </div>
            </div>

            {/* OFFICE ADDRESS CARD */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Registered Office</h3>
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-50 text-[#D80000] rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                      {vendor.address}<br />
                      {vendor.city}, {vendor.state}<br />
                      PIN: {vendor.pincode}
                    </p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT HELPERS ================= */

function SummaryItem({ label, value }: any) {
  return (
    <div className="text-center md:text-left">
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">{label}</p>
      <p className="text-xs font-black text-slate-800 truncate">{value || "N/A"}</p>
    </div>
  );
}

function ContactInfoItem({ icon, label, value, isLink }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-[#FFD700]">{icon}</div>
      <div className="overflow-hidden">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" className="text-xs font-black text-white hover:text-[#FFD700] truncate block italic underline underline-offset-2">
            {value || "N/A"}
          </a>
        ) : (
          <p className="text-xs font-black text-white truncate">{value || "N/A"}</p>
        )}
      </div>
    </div>
  );
}