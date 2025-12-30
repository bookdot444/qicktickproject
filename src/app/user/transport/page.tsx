"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Phone, Send, Loader, Lock, Clock, 
  AlertCircle, CheckCircle2, X, MapPin, 
  Calendar, Weight, User as UserIcon, ArrowRight,
  Package, Sparkles, ShieldCheck
} from "lucide-react";

interface TransportRequest {
  id: number;
  name: string;
  phone: string;
  pickup_location: string;
  drop_location: string;
  travel_date: string;
  goods_description?: string;
  weight_kg?: string;
  created_at: string;
}

export default function TransportPage() {
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "", phone: "", pickup: "", drop: "", date: "", goods: "", weight: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    checkUser();
    fetchRequests();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: vendor } = await supabase.from("vendor_register").select("subscription_expiry").eq("user_id", user.id).maybeSingle();
    const isVendorActive = vendor?.subscription_expiry && new Date(vendor.subscription_expiry) > new Date();
    
    const { data: sub } = await supabase.from("user_subscriptions").select("id").eq("user_id", user.id).eq("status", "active").maybeSingle();
    setHasSubscription(!!isVendorActive || !!sub);
  };

  const fetchRequests = async () => {
    setListLoading(true);
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const dateLimit = tenDaysAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from("travel_requests")
      .select("*")
      .gte('travel_date', dateLimit) 
      .order("travel_date", { ascending: false });

    if (!error && data) setRequests(data);
    setListLoading(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.phone.match(/^\d{10,15}$/)) newErrors.phone = "Invalid";
    if (!formData.pickup.trim()) newErrors.pickup = "Required";
    if (!formData.drop.trim()) newErrors.drop = "Required";
    if (!formData.date) newErrors.date = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.from("travel_requests").insert([{
      name: formData.name,
      phone: formData.phone,
      pickup_location: formData.pickup,
      drop_location: formData.drop,
      travel_date: formData.date,
      goods_description: formData.goods,
      weight_kg: formData.weight,
    }]);

    if (!error) {
      setFormData({ name: "", phone: "", pickup: "", drop: "", date: "", goods: "", weight: "" });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      fetchRequests();
    }
    setLoading(false);
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
            <div className="bg-gray-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 pointer-events-auto border border-white/10">
              <div className="bg-yellow-400 p-2 rounded-full"><CheckCircle2 className="text-black" size={20} /></div>
              <div className="flex flex-col flex-1">
                <span className="font-black uppercase tracking-widest text-xs italic">Request Live</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Added to logistics feed</span>
              </div>
              <button onClick={() => setShowToast(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-40 px-6 relative overflow-hidden border-b border-yellow-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-yellow-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">Live Logistics Feed</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-none">
              SMART <br/>
              <span className="text-red-600">TRANSPORT</span>
            </h1>
          </div>
          <div className="hidden lg:block bg-white p-10 rounded-[3rem] rotate-3 shadow-2xl border-2 border-yellow-100 relative">
             <div className="absolute -top-3 -left-3 bg-red-600 text-white p-3 rounded-2xl animate-bounce">
                <Truck size={28} />
             </div>
             <Package size={80} className="text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* --- LEFT: BOOKING FORM --- */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-yellow-100">
              <div className="mb-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-gray-900">Book Your Slot</h3>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Connect with verified logistics partners</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Owner Name" placeholder="ENTER NAME..." error={errors.name} value={formData.name} onChange={(v:any)=>setFormData({...formData, name:v})} />
                  <Input label="Phone Number" placeholder="CONTACT NO..." error={errors.phone} value={formData.phone} onChange={(v:any)=>setFormData({...formData, phone:v})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-[#FEF3C7]/20 rounded-[2.5rem] border-2 border-transparent focus-within:border-yellow-200 transition-all">
                  <Input label="Pickup City" placeholder="ORIGIN..." error={errors.pickup} value={formData.pickup} onChange={(v:any)=>setFormData({...formData, pickup:v})} />
                  <Input label="Drop City" placeholder="DESTINATION..." error={errors.drop} value={formData.drop} onChange={(v:any)=>setFormData({...formData, drop:v})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Travel Date" type="date" min={new Date().toISOString().split('T')[0]} error={errors.date} value={formData.date} onChange={(v:any)=>setFormData({...formData, date:v})} />
                  <Input label="Load Weight (KG)" placeholder="TOTAL WEIGHT..." value={formData.weight} onChange={(v:any)=>setFormData({...formData, weight:v})} />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-800/60 ml-2 italic">Material Details</label>
                  <textarea 
                    placeholder="DESCRIBE YOUR GOODS (TYPE, FRAGILITY, ETC)..." rows={3}
                    className="w-full p-6 bg-[#FEF3C7]/20 border-2 border-transparent rounded-[2rem] focus:border-yellow-400 focus:bg-white outline-none transition-all font-black uppercase text-xs tracking-widest text-gray-700 placeholder:text-yellow-800/30"
                    value={formData.goods} onChange={(e)=>setFormData({...formData, goods: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-gray-900 hover:bg-red-600 text-white py-7 rounded-[2rem] font-black text-xl italic uppercase tracking-tighter transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:bg-gray-200"
                >
                  {loading ? <Loader className="animate-spin" /> : <>Post To Live Feed <Send size={20}/></>}
                </button>
              </form>
            </div>
          </div>

          {/* --- RIGHT: LIVE FEED --- */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-gray-900">
                  <Clock className="text-red-600" size={24} /> Live Leads
                </h2>
                <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-lg uppercase">Recent 10 Days</span>
            </div>

            <div className="space-y-6 max-h-[850px] overflow-y-auto pr-2 custom-scrollbar">
              {listLoading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] border-2 border-dashed border-yellow-200">
                  <Loader className="animate-spin text-yellow-600 mb-4" />
                  <span className="text-[10px] font-black uppercase italic text-yellow-800 tracking-widest">Scanning Network</span>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center p-20 bg-white rounded-[3rem] border border-dashed border-yellow-200 text-yellow-800/40 italic font-black uppercase tracking-widest">No Active Requests</div>
              ) : (
                requests.map((req) => {
                  const isPast = new Date(req.travel_date) < new Date(new Date().setHours(0,0,0,0));
                  
                  return (
                    <motion.div 
                      key={req.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      className={`bg-white p-8 rounded-[3rem] border-2 shadow-lg relative group transition-all duration-500 hover:shadow-2xl ${isPast ? 'border-gray-100 grayscale opacity-60' : 'border-transparent hover:border-yellow-400'}`}
                    >
                      <div className="flex justify-between items-center mb-6">
                        {isPast ? (
                          <span className="text-[9px] font-black bg-gray-100 text-gray-400 px-3 py-1 rounded-full uppercase tracking-widest">Archived</span>
                        ) : (
                          <div className="flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                             <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Live Lead</span>
                          </div>
                        )}
                        <span className="text-[10px] font-black text-gray-300">REQID_{req.id}</span>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-yellow-100 p-2 rounded-xl text-yellow-700"><MapPin size={18}/></div>
                          <p className="text-lg font-black italic uppercase tracking-tighter text-gray-900 leading-tight">
                            {req.pickup_location} <ArrowRight size={14} className="inline mx-1 text-red-600"/> {req.drop_location}
                          </p>
                        </div>
                        
                        <div className="flex gap-4 ml-1">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase italic bg-gray-50 px-3 py-1.5 rounded-full">
                            <Calendar size={12} className="text-yellow-600"/> {req.travel_date}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase italic bg-gray-50 px-3 py-1.5 rounded-full">
                            <Weight size={12} className="text-yellow-600"/> {req.weight_kg || '0'} KG
                          </div>
                        </div>
                      </div>

                      {req.goods_description && (
                        <div className="mb-8 p-5 bg-[#FEF3C7]/30 rounded-3xl border border-yellow-100/50">
                          <div className="flex items-center gap-2 mb-2 text-yellow-800">
                            <Package size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Load Details</span>
                          </div>
                          <p className="text-[11px] font-bold text-gray-600 leading-relaxed uppercase tracking-tight italic">
                            {req.goods_description}
                          </p>
                        </div>
                      )}

                      {/* PRIVATE DATA BOX */}
                      <div className="relative rounded-[2rem] bg-gray-900 p-6 overflow-hidden">
                        <div className={`space-y-3 transition-all duration-1000 ${!hasSubscription ? 'blur-md select-none pointer-events-none opacity-20' : ''}`}>
                          <div className="flex items-center gap-3 text-xs font-black text-white uppercase tracking-widest italic">
                            <UserIcon size={14} className="text-yellow-400" /> {req.name}
                          </div>
                          <div className="flex items-center gap-3 text-xs font-black text-white uppercase tracking-widest italic">
                            <Phone size={14} className="text-yellow-400" /> {req.phone}
                          </div>
                        </div>

                        {!hasSubscription && (
                          <div 
                            onClick={() => router.push('/user/subscription-plans')}
                            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-sm cursor-pointer group/lock"
                          >
                            <div className="bg-yellow-400 text-black p-3 rounded-2xl shadow-2xl mb-2 group-hover/lock:rotate-12 transition-transform">
                              <Lock size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest italic">Unlock Contact Info</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- HOW IT WORKS: LOGISTICS PROTOCOL --- */}
      <div className="max-w-7xl mx-auto px-6 mt-32 mb-20">
        <div className="bg-white rounded-[4rem] p-12 md:p-24 relative overflow-hidden border border-yellow-100 shadow-[0_40px_100px_-20px_rgba(251,191,36,0.15)]">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-50 rounded-full blur-3xl opacity-60 -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-50 rounded-full blur-3xl opacity-40 -ml-40 -mb-40" />

          <div className="relative z-10 flex flex-col items-center mb-20">
            <div className="bg-gray-900 text-yellow-400 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.4em] mb-6 shadow-xl">
              Logistics Pipeline
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-gray-900 italic uppercase tracking-tighter text-center leading-none">
              How to <span className="text-red-600">Dispatch</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
            {/* Step 1 */}
            <div className="relative group">
              <div className="mb-8 relative">
                <span className="absolute -top-6 -left-4 text-8xl font-black text-yellow-100/80 italic z-0 select-none">01</span>
                <div className="w-24 h-24 rounded-3xl bg-yellow-400 flex items-center justify-center text-black shadow-2xl relative z-10 rotate-3 group-hover:rotate-6 transition-all duration-500">
                  <Package size={40} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-gray-900 font-black italic uppercase tracking-widest text-xl">Upload Load</h4>
                <p className="text-gray-400 text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                  Enter your pickup, destination, and cargo details. Your request is formatted into a high-priority logistics signal.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="mb-8 relative">
                <span className="absolute -top-6 -left-4 text-8xl font-black text-red-100/80 italic z-0 select-none">02</span>
                <div className="w-24 h-24 rounded-3xl bg-red-600 flex items-center justify-center text-white shadow-2xl relative z-10 -rotate-3 group-hover:-rotate-6 transition-all duration-500">
                  <Truck size={40} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-gray-900 font-black italic uppercase tracking-widest text-xl">Logistics Hub</h4>
                <p className="text-gray-400 text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                  Your lead hits our live feed, where verified fleet owners and transport agencies scan for matching routes in real-time.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="mb-8 relative">
                <span className="absolute -top-6 -left-4 text-8xl font-black text-gray-100 italic z-0 select-none">03</span>
                <div className="w-24 h-24 rounded-3xl bg-gray-900 flex items-center justify-center text-yellow-400 shadow-2xl relative z-10 rotate-3 group-hover:rotate-6 transition-all duration-500">
                  <ShieldCheck size={40} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-gray-900 font-black italic uppercase tracking-widest text-xl">Direct Link</h4>
                <p className="text-gray-400 text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                  Subscribed vendors unlock your contact bridge to provide instant quotes. No middlemen, just direct logistics fulfillment.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Hint */}
          <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic max-w-sm text-center md:text-left">
              *All requests are valid for a 10-day broadcast window before being archived into the network.
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 text-xs font-black uppercase tracking-tighter text-red-600 hover:gap-5 transition-all"
            >
              Start Your Broadcast <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, error, min }: any) {
  return (
    <div className="space-y-3 w-full">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-800/60 ml-2 italic">{label}</label>
      <div className="relative">
          <input
            type={type} value={value} onChange={(e) => onChange(e.target.value)} 
            placeholder={placeholder} min={min}
            className={`w-full p-6 bg-[#FEF3C7]/20 border-2 rounded-[2rem] focus:border-yellow-400 focus:bg-white outline-none transition-all font-black uppercase text-xs tracking-widest text-gray-700 placeholder:text-yellow-800/30 ${error ? 'border-red-500' : 'border-transparent'}`}
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