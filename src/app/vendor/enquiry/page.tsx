"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  Loader, 
  ShieldAlert, 
  Sparkles,
  Zap,
  HeadphonesIcon,
  Globe,
  Clock,
  CheckCircle2,
  FileText,
  BadgeCheck,
  MessageSquareText
} from "lucide-react";

export default function VendorEnquiryPage() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorEmail, setVendorEmail] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setVendorEmail(user.email);
        const { data } = await supabase
          .from("vendor_register")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();
        if (data) setVendorId(data.id);
      }
    };
    fetchVendor();
  }, []);

  const handleFormSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    const { error } = await supabase.from("vendor_enquiries").insert([
      { vendor_id: vendorId, vendor_email: vendorEmail, subject, message },
    ]);

    if (error) {
      setFormError("Submission failed. Please try again.");
    } else {
      setFormSuccess("Ticket successfully transmitted to Admin.");
      setSubject("");
      setMessage("");
    }
    setFormLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-20  font-sans">
      {/* --- PREMIUM HERO SECTION --- */}
      {/* --- HERO HEADER (Admin Connect Style) --- */}
<div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-20 pb-32 px-6 relative overflow-hidden border-b border-yellow-200">
  {/* Dot Grid Pattern Overlay */}
  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

  <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
    <div className="text-center md:text-left">
     

      {/* Main Title */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none uppercase mb-6"
      >
        Admin <br />
        <span className="text-red-600 italic">Connect</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 text-lg max-w-md font-medium leading-tight mb-6"
      >
        Instant communication channel for verified partners. Our technical team monitors this feed 24/7.
      </motion.p>
    </div>

    {/* Decorative Icon Card */}
    <motion.div 
      initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
      animate={{ opacity: 1, rotate: -3, scale: 1 }}
      className="hidden lg:block bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-yellow-100 relative"
    >
      {/* 24/7 Status Badge */}
      <div className="absolute -top-2 -left-2 bg-green-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        Live 24/7
      </div>
      
      <div className="text-yellow-600">
        <MessageSquareText size={60} strokeWidth={2.5} />
      </div>
    </motion.div>
  </div>
</div>

      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* --- MAIN ENQUIRY FORM --- */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3.5rem] p-8 md:p-14 border border-slate-100"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-[#D80000] rounded-3xl flex items-center justify-center shadow-lg shadow-red-200">
                   <Zap className="text-[#FFD700] fill-[#FFD700]" size={28} />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">Open Support Ticket</h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Response: 15 Minutes</p>
                </div>
              </div>
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Admin" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-4 border-white bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white">+5</div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {formError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-[#D80000] p-6 rounded-2xl text-sm font-bold mb-8 border-l-8 border-[#D80000] flex items-center gap-3">
                  <ShieldAlert size={20} /> {formError}
                </motion.div>
              )}
              {formSuccess && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl text-sm font-bold mb-8 border-l-8 border-emerald-500 flex items-center gap-3">
                  <Sparkles size={20} className="text-emerald-500" /> {formSuccess}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-2 ml-1">
                  <FileText size={14} className="text-[#D80000]"/> Subject Identification
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. KYC Verification Query"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 focus:bg-white focus:border-[#D80000] focus:ring-4 focus:ring-red-500/5 outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-2 ml-1">
                  <MessageSquare size={14} className="text-[#D80000]"/> Detailed Inquiry
                </label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist your business today?"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-7 focus:bg-white focus:border-[#D80000] focus:ring-4 focus:ring-red-500/5 outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-300 resize-none"
                />
              </div>

              <button
                onClick={handleFormSubmit}
                disabled={formLoading}
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-[#FFD700] py-7 rounded-3xl font-black transition-all shadow-2xl flex items-center justify-center gap-4 group active:scale-[0.98] text-xl uppercase tracking-tighter"
              >
                {formLoading ? <Loader className="animate-spin" size={24} /> : (
                  <> Dispatch Ticket <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> </>
                )}
              </button>
            </div>
          </motion.div>

          {/* --- SIDE FEATURES PANEL --- */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Live Status Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D80000] rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <Globe size={20} className="text-[#FFD700] animate-pulse" />
                System Status
              </h3>
              <div className="space-y-5">
                <StatusItem label="Admin Dashboard" status="Operational" />
                <StatusItem label="Payment Gateway" status="Operational" />
                <StatusItem label="Email Servers" status="Fast" />
              </div>
            </div>

            {/* Support Quick Links */}
            <div className="bg-[#FFD700] rounded-[2.5rem] p-8 text-slate-900">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <HeadphonesIcon size={20} />
                Quick Support
              </h3>
              <div className="space-y-4">
                <QuickLink icon={<BadgeCheck size={18}/>} title="Partner FAQ" desc="Instant answers" />
                <QuickLink icon={<Clock size={18}/>} title="Emergency" desc="WhatsApp Admin" />
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex items-center gap-5 shadow-sm">
               <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="text-emerald-500" size={32} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Secure Channel</p>
                  <p className="text-sm font-black text-slate-800 leading-tight">End-to-End Encrypted Communication</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3">
      <span className="text-xs font-bold text-white/60 uppercase">{label}</span>
      <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-tighter">{status}</span>
    </div>
  );
}

function QuickLink({ icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl cursor-pointer hover:bg-white transition-colors group">
      <div className="w-10 h-10 bg-slate-900 text-[#FFD700] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-tight">{title}</p>
        <p className="text-[10px] font-medium text-slate-600">{desc}</p>
      </div>
    </div>
  );
}