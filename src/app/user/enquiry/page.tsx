"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, Send, Loader, Lock, History, Activity, 
  ArrowRight, Clock, AlertCircle, CheckCircle2, X, Sparkles, Zap, Search
} from "lucide-react";

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entryLimit, setEntryLimit] = useState(0);  // Changed from hasSubscription (boolean) to entryLimit (number)
  const [search, setSearch] = useState("");  // New: Search state

  // Form States
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
    fetchEnquiries();

    const channel = supabase
      .channel('public-enquiries')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'enquiries' }, 
        (payload) => {
          setEnquiries((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Invalid";
    if (formData.phone && !formData.phone.match(/^\d{10,15}$/)) newErrors.phone = "Invalid";
    if (formData.message.length < 10) newErrors.message = "Min 10 chars";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkSubscriptionStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setEntryLimit(0);
      return;
    }

    let limit = 0;

    // Check vendor subscription
    const { data: vendor } = await supabase.from("vendor_register").select("subscription_expiry, subscription_plan_id").eq("user_id", user.id).maybeSingle();
    const isVendorActive = vendor?.subscription_expiry && new Date(vendor.subscription_expiry) > new Date();
    if (isVendorActive && vendor.subscription_plan_id) {
      const { data: plan } = await supabase.from("subscription_plans").select("entry").eq("id", vendor.subscription_plan_id).single();
      limit = plan?.entry || 0;
    }

    // Check user subscription (if not already set via vendor)
    if (limit === 0) {
      const { data: sub } = await supabase.from("user_subscriptions").select("id, plan_id").eq("user_id", user.id).eq("status", "active").maybeSingle();
      if (sub?.plan_id) {
        const { data: plan } = await supabase.from("subscription_plans").select("entry").eq("id", sub.plan_id).single();
        limit = plan?.entry || 0;
      }
    }

    setEntryLimit(limit);
  };

  const fetchEnquiries = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("ENQUIRIES DATA:", data);
    console.log("ENQUIRIES ERROR:", error);

    if (error) {
      setEnquiries([]);
    } else {
      setEnquiries(data || []);
    }

    setLoading(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setFormLoading(true);
    const { error } = await supabase.from("enquiries").insert([formData]);

    if (!error) {
      setFormData({ name: "", email: "", phone: "", message: "" });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      setErrors({});
    }
    setFormLoading(false);
  };

  // New: Filtered enquiries based on search
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) =>
      enq.message.toLowerCase().includes(search.toLowerCase())
    );
  }, [enquiries, search]);

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-10 font-sans selection:bg-yellow-200">
      
      {/* --- SUCCESS TOAST (Compact) --- */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: -20, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-0 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none"
          >
            <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto border border-white/10">
              <Zap className="text-yellow-400" size={16} fill="currentColor" />
              <span className="font-black  uppercase tracking-widest text-[10px]">Signal Live</span>
              <button onClick={() => setShowToast(false)} className="text-white/40 hover:text-white p-1"><X size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER (Reduced Size) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-32 px-6 relative overflow-hidden border-b border-yellow-100">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full mb-4 shadow-sm border border-yellow-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-800">Global Pulse Stream</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-none uppercase">
              ENQUIRY <span className="text-black ">FEED</span>
            </h1>
          </div>
          <div className="hidden lg:block bg-white p-6 rounded-[2.5rem] -rotate-3 shadow-xl border border-yellow-100">
             <Sparkles size={50} className="text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- LEFT: BROADCAST FORM --- */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-yellow-100">
              <div className="mb-8">
                  <h3 className="text-xl font-black tracking-tighter uppercase  text-gray-900">Post your Requirement</h3>
                  <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mt-1">Broadcast requirement to all verified vendors</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Name" placeholder="IDENTITY..." error={errors.name}
                    value={formData.name} onChange={(val:string) => setFormData({...formData, name: val})} 
                  />
                  <Input 
                    label="Email" type="email" placeholder="CONTACT..." error={errors.email}
                    value={formData.email} onChange={(val:string) => setFormData({...formData, email: val})} 
                  />
                </div>
                <Input 
                  label="Phone Number" placeholder="MOBILE..." error={errors.phone}
                  value={formData.phone} onChange={(val:string) => setFormData({...formData, phone: val})} 
                />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-2">
<label className="text-[9px] font-black uppercase tracking-[0.2em] text-black ">Requirement</label>
                  </div>
                  <textarea 
  placeholder="WHAT ARE YOU LOOKING FOR?..."
  rows={3} 
  value={formData.message} 
  onChange={(e) => setFormData({...formData, message: e.target.value})}
  className={`
    w-full p-4 rounded-2xl outline-none transition-all font-bold uppercase text-[11px] tracking-widest text-black
    bg-black/5 border 
    ${errors.message ? 'border-red-400' : 'border-black/10'} 
    focus:border-black focus:bg-white 
    placeholder:text-black/30
  `}
/>
                </div>

                <button 
                  type="submit" disabled={formLoading}
                  className="w-full bg-gray-900 hover:bg-red-600 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-tighter transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {formLoading ? <Loader className="animate-spin" size={20} /> : <>Enquiry Submit<Send size={18} /></>}
                </button>
              </form>
            </div>
          </div>

          {/* --- RIGHT: LIVE PULSE FEED --- */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 text-gray-900">
                <Clock className="text-red-600" size={20} /> Live Leads
              </h2>
              <span className="bg-yellow-400 text-black text-[8px] font-black px-2 py-0.5 rounded uppercase">Recent</span>
            </div>

            {/* New: Search Bar */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requirements..."
                className="w-full pl-12 pr-4 py-3 rounded-full text-black bg-white/80 border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold"
              />
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence initial={false}>
                {filteredEnquiries.length === 0 ? (
                    <div className="bg-white p-10 rounded-[2rem] border border-dashed border-yellow-200 text-center shadow-inner">
                        <History className="mx-auto text-yellow-100 mb-2" size={30} />
                        <p className="text-yellow-800/40 text-[9px] font-black uppercase tracking-widest">No Signals Detected</p>
                    </div>
                ) : filteredEnquiries.map((enq) => {
                  // Fixed: Use original index from full enquiries list for unlocking
                  const originalIndex = enquiries.findIndex(e => e.id === enq.id);
                  const isUnlocked = originalIndex < entryLimit;

                  return (
                    <motion.div 
                      key={enq.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-6 rounded-[2rem] border border-transparent hover:border-yellow-400 shadow-md relative group transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-1.5">
                           <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                           <span className="text-[8px] font-black text-black uppercase tracking-widest ">Live Signal</span>
                        </div>
                        <span className="text-[8px] font-black text-gray-300">{new Date(enq.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="relative mb-4">
                         <p className="text-[11px] font-bold text-gray-600 leading-relaxed uppercase tracking-tight relative z-10">
                           {enq.message}
                         </p>
                      </div>

                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-gray-900 text-yellow-400 flex items-center justify-center font-black text-[10px] shadow-lg">
                          {enq.name?.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{enq.name}</p>
                      </div>

                      {/* PRIVATE DATA BOX - Now per-enquiry based on entryLimit */}
                      <div className="relative rounded-2xl bg-gray-900 p-4 overflow-hidden">
                        <div className={`space-y-1 transition-all duration-500 ${!isUnlocked ? 'blur-sm select-none pointer-events-none opacity-20' : ''}`}>
                          <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase">
                            <Mail size={12} className="text-yellow-400" /> {enq.email}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase ">
                            <Phone size={12} className="text-yellow-400" /> {enq.phone || "HIDDEN"}
                          </div>
                        </div>

                        {!isUnlocked && (
                          <div 
                            onClick={() => window.location.href='/user/subscription-plans'}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px] cursor-pointer"
                          >
                            <span className="text-[8px] font-black uppercase text-yellow-400 tracking-widest bg-gray-900 px-3 py-1 rounded-full border border-yellow-400/30">Unlock Contact</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- PROTOCOL FLOW (Compact) --- */}
      <div className="max-w-7xl mx-auto px-6 mt-20 mb-10">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden border border-yellow-100 shadow-xl">
          <div className="relative z-10 flex flex-col items-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter text-center leading-none">
              The <span className="text-black">Protocol</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <FlowStep number="01" icon={<Send size={24}/>} color="bg-yellow-400" title="Broadcast" desc="Requirement is instantly tagged and pushed to feed." />
            <FlowStep number="02" icon={<Activity size={24}/>} color="bg-red-600" textColor="text-white" title="Stream" desc="Verified vendors monitor the pulse stream live." />
            <FlowStep number="03" icon={<Zap size={24}/>} color="bg-gray-900" textColor="text-yellow-400" title="Connect" desc="Partners unlock bridges to send competitive quotes." />
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ number, icon, color, title, desc, textColor = "text-black" }: any) {
  return (
    <div className="relative group">
      <div className="mb-4 relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} ${textColor} flex items-center justify-center shadow-lg relative z-10 transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <span className="text-3xl font-black text-black select-none">{number}</span>
      </div>
      <div className="space-y-1">
        <h4 className="text-gray-900 font-black uppercase tracking-widest text-base">{title}</h4>
        <p className="text-gray-400 text-[10px] font-bold leading-relaxed uppercase tracking-wider">{desc}</p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, error }: any) {
  return (
    <div className="space-y-2 w-full">
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black ml-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full p-4 rounded-2xl outline-none transition-all font-bold uppercase text-[11px] tracking-widest text-black 
            bg-black/5 border 
            ${error ? 'border-red-400 shadow-sm' : 'border-black/10'} 
            focus:border-black focus:bg-white 
            placeholder:text-black/30
          `}
        />
        {error && (
          <div className="absolute -bottom-5 left-2 flex items-center gap-1">
            <AlertCircle size={8} className="text-red-500" />
            <span className="text-[8px] text-red-500 font-black uppercase">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}