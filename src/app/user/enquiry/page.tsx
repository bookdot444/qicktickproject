"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, Send, Loader, Lock, History, Activity, 
  ArrowRight, Clock, AlertCircle, CheckCircle2, X, Sparkles, Zap
} from "lucide-react";

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

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
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Invalid Email";
    if (formData.phone && !formData.phone.match(/^\d{10,15}$/)) newErrors.phone = "10-15 digits required";
    if (formData.message.length < 10) newErrors.message = "Too short (min 10 chars)";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkSubscriptionStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: vendor } = await supabase.from("vendor_register").select("subscription_expiry").eq("user_id", user.id).maybeSingle();
    const isVendorActive = vendor?.subscription_expiry && new Date(vendor.subscription_expiry) > new Date();
    const { data: sub } = await supabase.from("user_subscriptions").select("id").eq("user_id", user.id).eq("status", "active").maybeSingle();
    setHasSubscription(!!isVendorActive || !!sub);
  };

  const fetchEnquiries = async () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const { data } = await supabase.from("enquiries").select("*").gte('created_at', tenDaysAgo.toISOString()).order("created_at", { ascending: false });
    if (data) setEnquiries(data);
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

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-20 font-sans selection:bg-yellow-200">
      
      {/* --- SUCCESS TOAST --- */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} animate={{ y: -40, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none"
          >
            <div className="bg-gray-900 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4 pointer-events-auto border border-white/10">
              <div className="bg-yellow-400 p-2 rounded-full"><Zap className="text-black" size={18} fill="currentColor" /></div>
              <div className="flex flex-col flex-1">
                <span className="font-black italic uppercase tracking-widest text-xs">Signal Transmitted</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Broadcast live on feed</span>
              </div>
              <button onClick={() => setShowToast(false)} className="text-white/40 hover:text-white p-1"><X size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-44 px-6 relative overflow-hidden border-b border-yellow-100">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-yellow-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">Global Pulse Stream</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-none">
              ENQUIRY <br/>
              <span className="text-red-600 italic">FEED</span>
            </h1>
          </div>
          <div className="hidden lg:block bg-white p-10 rounded-[3.5rem] -rotate-3 shadow-2xl border-2 border-yellow-100 relative">
             <div className="absolute -top-3 -right-3 bg-gray-900 text-yellow-400 p-4 rounded-3xl animate-pulse">
                <Activity size={32} />
             </div>
             <Sparkles size={70} className="text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- LEFT: BROADCAST FORM --- */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-yellow-100">
              <div className="mb-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-gray-900">Send Enquiry</h3>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Your message will be visible to all verified vendors</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label="Full Name" placeholder="IDENTITY..." error={errors.name}
                    value={formData.name} onChange={(val:string) => setFormData({...formData, name: val})} 
                  />
                  <Input 
                    label="Email Address" type="email" placeholder="CONTACT EMAIL..." error={errors.email}
                    value={formData.email} onChange={(val:string) => setFormData({...formData, email: val})} 
                  />
                </div>
                <Input 
                  label="Phone Number" placeholder="MOBILE NO..." error={errors.phone}
                  value={formData.phone} onChange={(val:string) => setFormData({...formData, phone: val})} 
                />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-800/60 italic">Requirement Details</label>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${formData.message.length < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                      {formData.message.length} chars
                    </span>
                  </div>
                  <textarea 
                    placeholder="WHAT ARE YOU LOOKING FOR? BE SPECIFIC..."
                    rows={4} value={formData.message} 
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className={`w-full p-6 bg-[#FEF3C7]/20 border-2 rounded-[2rem] focus:border-yellow-400 focus:bg-white outline-none transition-all font-black uppercase text-xs tracking-widest text-gray-700 placeholder:text-yellow-800/30 ${errors.message ? 'border-red-400' : 'border-transparent'}`}
                  />
                  {errors.message && <p className="text-[10px] text-red-500 font-black italic flex items-center gap-1 px-2"><AlertCircle size={10}/> {errors.message}</p>}
                </div>

                <button 
                  type="submit" disabled={formLoading}
                  className="w-full bg-gray-900 hover:bg-red-600 text-white py-7 rounded-[2.5rem] font-black text-xl italic uppercase tracking-tighter transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {formLoading ? <Loader className="animate-spin" /> : <>Broadcast Signal <Send size={20} /></>}
                </button>
              </form>
            </div>
          </div>

          {/* --- RIGHT: LIVE PULSE FEED --- */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-gray-900">
                <Clock className="text-red-600" size={24} /> Recent Signals
              </h2>
              <span className="bg-yellow-400 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-sm">10D History</span>
            </div>

            <div className="space-y-6 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {enquiries.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3.5rem] border-2 border-dashed border-yellow-200 text-center shadow-inner">
                        <History className="mx-auto text-yellow-200 mb-4" size={50} />
                        <p className="text-yellow-800/40 text-[10px] font-black uppercase italic tracking-widest leading-loose">No transmission detected<br/>in current sector</p>
                    </div>
                ) : enquiries.map((enq) => (
                  <motion.div 
                    key={enq.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 rounded-[3rem] border-2 border-transparent hover:border-yellow-400 shadow-lg relative group transition-all duration-500"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                         <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] italic">Active Lead</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-300 uppercase italic">{new Date(enq.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="relative mb-8">
                       <span className="absolute -top-4 -left-2 text-6xl text-yellow-400/20 font-serif">“</span>
                       <p className="text-[13px] font-bold text-gray-600 italic leading-relaxed uppercase tracking-tight relative z-10">
                         {enq.message}
                       </p>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 rounded-2xl bg-gray-900 text-yellow-400 flex items-center justify-center font-black text-xs shadow-xl rotate-3">
                        {enq.name?.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs font-black text-gray-900 uppercase italic tracking-tighter">{enq.name}</p>
                    </div>

                    {/* PRIVATE DATA BOX */}
                    <div className="relative rounded-[2rem] bg-gray-900 p-6 overflow-hidden">
                      <div className={`space-y-3 transition-all duration-1000 ${!hasSubscription ? 'blur-md select-none pointer-events-none opacity-20' : ''}`}>
                        <div className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-widest italic">
                          <Mail size={14} className="text-yellow-400" /> {enq.email}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-widest italic">
                          <Phone size={14} className="text-yellow-400" /> {enq.phone || "HIDDEN"}
                        </div>
                      </div>

                      {!hasSubscription && (
                        <div 
                          onClick={() => window.location.href='/user/subscription-plans'}
                          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-sm cursor-pointer group/lock"
                        >
                          <div className="bg-yellow-400 text-black p-3 rounded-2xl shadow-2xl mb-2 group-hover/lock:scale-110 transition-transform">
                            <Lock size={16} />
                          </div>
                          <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest italic">Access Contact</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
     
     {/* --- HOW IT WORKS: PREMIUM WHITE CARD VERSION --- */}
      <div className="max-w-7xl mx-auto px-6 mt-32 mb-20">
        <div className="bg-white rounded-[4rem] p-12 md:p-24 relative overflow-hidden border border-yellow-100 shadow-[0_40px_100px_-20px_rgba(251,191,36,0.15)]">
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full blur-3xl opacity-60 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-40 -ml-32 -mb-32" />

          <div className="relative z-10 flex flex-col items-center mb-20">
            <div className="bg-gray-900 text-yellow-400 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.4em] mb-6 shadow-xl">
              Protocol flow
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-gray-900 italic uppercase tracking-tighter text-center leading-none">
              How the <span className="text-red-600">Ecosystem</span> Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
            {/* Step 1 */}
            <div className="relative group">
              <div className="mb-8 relative">
                <span className="absolute -top-6 -left-4 text-8xl font-black text-yellow-100/80 italic z-0 select-none">01</span>
                <div className="w-24 h-24 rounded-3xl bg-yellow-400 flex items-center justify-center text-black shadow-2xl relative z-10 rotate-3 group-hover:rotate-6 transition-transform duration-500">
                  <Send size={40} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-gray-900 font-black italic uppercase tracking-widest text-xl">Broadcast Signal</h4>
                <p className="text-gray-400 text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                  Post your specific needs via our encrypted form. Your enquiry is instantly tagged and pushed to the global live feed.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="mb-8 relative">
                <span className="absolute -top-6 -left-4 text-8xl font-black text-red-100/80 italic z-0 select-none">02</span>
                <div className="w-24 h-24 rounded-3xl bg-red-600 flex items-center justify-center text-white shadow-2xl relative z-10 -rotate-3 group-hover:-rotate-6 transition-transform duration-500">
                  <Activity size={40} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-gray-900 font-black italic uppercase tracking-widest text-xl">Live Processing</h4>
                <p className="text-gray-400 text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                  Our network of verified vendors monitors the pulse stream. Your request remains highlighted and active for 10 days of prime visibility.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="mb-8 relative">
                <span className="absolute -top-6 -left-4 text-8xl font-black text-gray-100 italic z-0 select-none">03</span>
                <div className="w-24 h-24 rounded-3xl bg-gray-900 flex items-center justify-center text-yellow-400 shadow-2xl relative z-10 rotate-3 group-hover:rotate-6 transition-transform duration-500">
                  <Zap size={40} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-gray-900 font-black italic uppercase tracking-widest text-xl">Direct Connection</h4>
                <p className="text-gray-400 text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                  Verified partners unlock your contact bridge. You receive direct, competitive proposals from the best in the industry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, error }: any) {
  return (
    <div className="space-y-3 w-full">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-800/60 ml-2 italic">{label}</label>
      <div className="relative">
          <input
            type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className={`w-full p-6 bg-[#FEF3C7]/20 border-2 rounded-[2rem] focus:border-yellow-400 focus:bg-white outline-none transition-all font-black uppercase text-xs tracking-widest text-gray-700 placeholder:text-yellow-800/30 ${error ? 'border-red-400 shadow-sm' : 'border-transparent'}`}
          />
          {error && (
            <div className="absolute -bottom-6 left-4 flex items-center gap-1">
               <AlertCircle size={10} className="text-red-500"/>
               <span className="text-[10px] text-red-500 font-black italic uppercase tracking-tighter">{error}</span>
            </div>
          )}
      </div>
    </div>
  );
}