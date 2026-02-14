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
  const [transportLimit, setTransportLimit] = useState(0);  // Changed from hasSubscription (boolean) to transportLimit (number)
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
    if (!user) {
      setTransportLimit(0);
      return;
    }

    let limit = 0;

    // Check vendor subscription
    const { data: vendor } = await supabase.from("vendor_register").select("subscription_expiry, subscription_plan_id").eq("user_id", user.id).maybeSingle();
    const isVendorActive = vendor?.subscription_expiry && new Date(vendor.subscription_expiry) > new Date();
    if (isVendorActive && vendor.subscription_plan_id) {
      const { data: plan } = await supabase.from("subscription_plans").select("transport").eq("id", vendor.subscription_plan_id).single();
      limit = plan?.transport || 0;
    }

    // Check user subscription (if not already set via vendor)
    if (limit === 0) {
      const { data: sub } = await supabase.from("user_subscriptions").select("id, plan_id").eq("user_id", user.id).eq("status", "active").maybeSingle();
      if (sub?.plan_id) {
        const { data: plan } = await supabase.from("subscription_plans").select("transport").eq("id", sub.plan_id).single();
        limit = plan?.transport || 0;
      }
    }

    setTransportLimit(limit);
  };

  const fetchRequests = async () => {
    setListLoading(true);

    const { data, error } = await supabase
      .from("travel_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data);
    }

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
    <div className="min-h-screen bg-[#FFFDF5] pb-10 font-sans selection:bg-yellow-200">

      {/* --- SUCCESS TOAST --- */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }} animate={{ y: -20, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-0 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none"
          >
            <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto border border-white/10">
              <div className="bg-yellow-400 p-1.5 rounded-full"><CheckCircle2 className="text-black" size={16} /></div>
              <div className="flex flex-col">
                <span className="font-black uppercase tracking-widest text-[10px] ">Request Live</span>
              </div>
              <button onClick={() => setShowToast(false)} className="text-white/40 hover:text-white ml-2"><X size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER (Reduced Size) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-32 px-6 relative overflow-hidden border-b border-yellow-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full mb-4 shadow-sm border border-yellow-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-800">Live Logistics</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-none">
              SMART <span className="text-black">TRANSPORT</span>
            </h1>
          </div>
          <div className="hidden lg:block bg-white p-6 rounded-[2rem] rotate-3 shadow-xl border border-yellow-100 relative">
            <div className="absolute -top-2 -left-2 bg-red-600 text-white p-2 rounded-xl animate-bounce">
              <Truck size={20} />
            </div>
            <Package size={50} className="text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* --- LEFT: BOOKING FORM --- */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-yellow-100">
              <div className="mb-8">
                <h3 className="text-xl font-black tracking-tighter uppercase text-gray-900">Post your TRANSPORT </h3>
                <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mt-1">Connect with verified partners</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Owner Name" placeholder="NAME..." error={errors.name} value={formData.name} onChange={(v: any) => setFormData({ ...formData, name: v })} />
                  <Input label="Phone" placeholder="CONTACT..." error={errors.phone} value={formData.phone} onChange={(v: any) => setFormData({ ...formData, phone: v })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Pickup" placeholder="ORIGIN..." error={errors.pickup} value={formData.pickup} onChange={(v: any) => setFormData({ ...formData, pickup: v })} />
                  <Input label="Drop" placeholder="DESTINATION..." error={errors.drop} value={formData.drop} onChange={(v: any) => setFormData({ ...formData, drop: v })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Date" type="date" min={new Date().toISOString().split('T')[0]} error={errors.date} value={formData.date} onChange={(v: any) => setFormData({ ...formData, date: v })} />
                  <Input label="Weight (KG)" placeholder="TOTAL KG..." value={formData.weight} onChange={(v: any) => setFormData({ ...formData, weight: v })} />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black ml-2">Product Description</label>
                  <textarea
                    placeholder="DESCRIBE YOUR GOODS..."
                    rows={2}
                    className="w-full p-4 bg-black/5 border border-black/10 rounded-2xl focus:border-black focus:bg-white outline-none transition-all font-bold uppercase text-[11px] tracking-widest text-black placeholder:text-black/30"
                    value={formData.goods}
                    onChange={(e) => setFormData({ ...formData, goods: e.target.value })}
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-gray-900 hover:bg-red-600 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-tighter transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:bg-gray-200"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : <>TRANSPORT  Submit <Send size={18} /></>}
                </button>
              </form>
            </div>
          </div>

          {/* --- RIGHT: LIVE FEED --- */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 text-gray-900">
                <Clock className="text-black" size={20} /> Active Leads
              </h2>
              <span className="bg-yellow-400 text-black text-[8px] font-black px-2 py-0.5 rounded uppercase">Recent</span>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
              {listLoading ? (
                <div className="flex flex-col items-center justify-center p-10 bg-white rounded-[2rem] border border-dashed border-yellow-200">
                  <Loader className="animate-spin text-yellow-600 mb-2" size={20} />
                  <span className="text-[9px] font-black uppercase text-yellow-800">Scanning...</span>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-[2rem] border border-dashed border-yellow-200 text-yellow-800/40 text-[9px] font-black uppercase tracking-widest">No Active Leads</div>
              ) : (
                requests.map((req, index) => {
                  const isPast = new Date(req.travel_date) < new Date(new Date().setHours(0, 0, 0, 0));
                  const isUnlocked = index < transportLimit;  // New: Check if this lead is within the transport limit

                  return (
                    <motion.div
                      key={req.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      className={`bg-white p-6 rounded-[2rem] border shadow-md relative group transition-all duration-300 ${isPast ? 'border-gray-100 grayscale opacity-60' : 'border-transparent hover:border-yellow-400'}`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isPast ? 'bg-gray-300' : 'bg-red-600 animate-pulse'}`}></span>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${isPast ? 'text-gray-400' : 'text-black'}`}>{isPast ? 'Archived' : 'Live Lead'}</span>
                        </div>
                        <span className="text-[8px] font-black text-gray-300">ID_{req.id}</span>
                      </div>

                      <div className="mb-4">
                        {/* Locations */}
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin size={14} className="text-yellow-600" />
                          <p className="text-sm font-black  uppercase tracking-tighter text-gray-900 leading-tight">
                            {req.pickup_location} <ArrowRight size={10} className="inline mx-1 text-black" /> {req.drop_location}
                          </p>
                        </div>

                        {/* Badges: Date & Weight */}
                        <div className="flex gap-2 mb-3">
                          <div className="flex items-center gap-1.5 text-[8px] font-black text-gray-500 uppercase  bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                            <Calendar size={10} className="text-yellow-600" /> {req.travel_date}
                          </div>
                          <div className="flex items-center gap-1.5 text-[8px] font-black text-gray-500 uppercase  bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                            <Weight size={10} className="text-yellow-600" /> {req.weight_kg || '0'} KG
                          </div>
                        </div>

                        {/* --- PRODUCT DESCRIPTION --- */}
                        {req.goods_description && (
                          <div className="flex items-start gap-2 bg-yellow-50/50 p-3 rounded-xl border border-yellow-100/50">
                            <Package size={12} className="text-yellow-600 mt-0.5 shrink-0" />
                            <p className="text-[10px] font-bold uppercase tracking-tight text-gray-600 leading-snug">
                              <span className="text-yellow-800/50 text-[8px] block mb-0.5 font-black">Goods:</span>
                              {req.goods_description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Contact Section - Now per-lead based on transportLimit */}
                      <div className="relative rounded-2xl bg-gray-900 p-4 overflow-hidden mt-4">
                        <div className={`space-y-1 transition-all duration-500 ${!isUnlocked ? 'blur-sm select-none pointer-events-none opacity-20' : ''}`}>
                          <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase ">
                            <UserIcon size={12} className="text-yellow-400" /> {req.name}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase ">
                            <Phone size={12} className="text-yellow-400" /> {req.phone}
                          </div>
                        </div>
                        {!isUnlocked && (
                          <div
                            onClick={() => router.push('/user/subscription-plans')}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px] cursor-pointer"
                          >
                            <span className="text-[8px] font-black uppercase text-yellow-400 tracking-widest bg-gray-900 px-3 py-1 rounded-full border border-yellow-400/30">Unlock Contact</span>
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

      {/* --- HOW IT WORKS (More Compact) --- */}
      <div className="max-w-7xl mx-auto px-6 mt-20 mb-10">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden border border-yellow-100 shadow-xl">
          <div className="relative z-10 flex flex-col items-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900  uppercase tracking-tighter text-center leading-none">
              How to <span className="text-black">Dispatch</span>
            </h2>
          </div>

          <div className="grid text grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <Step number="01" icon={<Package size={24} />} color="bg-yellow-400" title="Upload" desc="Enter cargo details to start broadcasting." />
            <Step number="02" icon={<Truck size={24} />} color="bg-red-600" textColor="text-white" title="Feed" desc="Lead hits our live network for agencies." />
            <Step number="03" icon={<ShieldCheck size={24} />} color="bg-gray-900" textColor="text-yellow-400" title="Direct" desc="Agencies unlock and quote directly." />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ number, icon, color, title, desc, textColor = "text-black" }: any) {
  return (
    <div className="relative group">
      <div className="mb-6 relative flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl ${color} ${textColor} flex items-center justify-center shadow-lg relative z-10 transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <span className="text-4xl font-black text-black select-none">{number}</span>
      </div>
      <div className="space-y-1">
        <h4 className="text-gray-900 font-black uppercase tracking-widest text-base">{title}</h4>
        <p className="text-gray-400 text-[10px] font-bold leading-relaxed uppercase tracking-wider">{desc}</p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, error, min }: any) {
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
          min={min}
          className={`
            w-full p-4 transition-all font-bold uppercase text-[11px] tracking-widest outline-none rounded-2xl border
            bg-black/5 
            ${error ? 'border-red-500' : 'border-black/10'} 
            focus:border-black focus:bg-white 
            text-black placeholder:text-black/30
          `}
        />
        {error && (
          <div className="absolute -bottom-5 left-2 flex items-center gap-1">
            <AlertCircle size={8} className="text-red-500" />
            <span className="text-[8px] text-red-500 font-black  uppercase">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}