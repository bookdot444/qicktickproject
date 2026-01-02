"use client";

import React, { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import {
  X, Lock, Check, ShieldCheck, Zap,
  ArrowRight, Loader, Star, Eye, PhoneCall,
  ChevronLeft, ChevronRight,Sparkles,Briefcase
} from "lucide-react";

type SubscriptionPlan = {
  id: number;
  name: string;
  base_price: number;
  tax_percent: number;
  duration_months: number;
  benefits: string[];
  color: string | null;
};

export default function SubscriptionPlanPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userStatus, setUserStatus] = useState<{ active: boolean, expiry: string | null }>({ active: false, expiry: null });
const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
    checkCurrentSubscription();
  }, []);

  const checkCurrentSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: vendor } = await supabase
      .from("vendor_register")
      .select("subscription_expiry")
      .eq("user_id", user.id)
      .maybeSingle();

    if (vendor?.subscription_expiry) {
      const expiryDate = new Date(vendor.subscription_expiry);
      if (expiryDate > new Date()) {
        setUserStatus({
          active: true,
          expiry: expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        });
      }
    }
  };

  const fetchPlans = async () => {
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("base_price", { ascending: true });

    setPlans(data || []);
    setLoading(false);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8; 
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const calculateTotal = (base: number, tax: number) =>
    Math.round(base + (base * tax) / 100);

  const handlePayment = async (plan: SubscriptionPlan) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setShowAuthModal(true); return; }
    if (!(window as any).Razorpay) { alert("Payment system loading..."); return; }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF5]">
        <div className="relative">
            <Loader className="animate-spin text-yellow-600" size={48} />
            <div className="absolute inset-0 blur-xl bg-yellow-400/20 animate-pulse"></div>
        </div>
        <p className="text-gray-900 font-black uppercase tracking-[0.3em] text-xs mt-6">Syncing Premium Plans</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 font-sans selection:bg-yellow-200 pb-20 overflow-x-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* --- AUTH MODAL --- */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-sm w-full relative z-10 p-12 text-center border-t-8 border-red-600">
              <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
                <X size={24} />
              </button>
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-3">
                <Lock size={32} className="text-red-600" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-4">SIGN IN <br/> REQUIRED</h2>
              <p className="text-gray-500 font-medium text-sm">Log in to purchase a premium plan.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
{/* --- PREMIUM PLANS HEADER (MATCHED TO VIDEO HUB STYLE) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-40 px-6 relative overflow-hidden border-b border-yellow-200">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Column: Text Content */}
          <div className="text-left">
            {userStatus.active && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-yellow-300"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">
                  Account Status: <span className="text-red-600">Active</span>
                </span>
              </motion.div>
            )}

            <motion.h1 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85] uppercase"
            >
              PREMIUM <br/>
              <span className="text-red-600 italic">PLANS</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.2 }}
              className="mt-6 text-gray-600 font-bold text-lg max-w-md flex items-center gap-2"
            >
              <Sparkles size={20} className="text-yellow-600 shrink-0" />
              Scale your business with 10x more leads and direct partner access.
            </motion.p>
          </div>

          {/* Right Column: Floating Visual Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="hidden lg:block bg-white p-12 rounded-[4rem] shadow-2xl border-2 border-yellow-100 relative"
          >
              <div className="absolute -top-4 -left-4 bg-red-600 text-white p-4 rounded-3xl animate-bounce shadow-xl">
                <ShieldCheck size={32} strokeWidth={2.5} />
              </div>
              <div className="bg-yellow-50 p-6 rounded-[2.5rem]">
                <Briefcase size={100} className="text-yellow-600" strokeWidth={1.5} />
              </div>
              
              {/* Status Badge inside Card */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full whitespace-nowrap">
                {userStatus.active ? `EXPIRES: ${userStatus.expiry}` : "MEMBERSHIP INACTIVE"}
              </div>
          </motion.div>
        </div>
      </div>


{/* --- INTERACTIVE SLIDER SECTION --- */}
<div className="relative w-full -mt-12">
  
  {/* Navigation Arrows */}
  <div className="absolute top-1/2 left-4 z-50 -translate-y-1/2 hidden md:block">
    <button 
      onClick={() => scroll("left")} 
      className="p-5 rounded-full bg-white/90 backdrop-blur-md border border-gray-100 shadow-xl hover:bg-yellow-400 transition-all group active:scale-95"
    >
      <ChevronLeft size={24} className="group-hover:text-yellow-900" />
    </button>
  </div>
  
  <div className="absolute top-1/2 right-4 z-50 -translate-y-1/2 hidden md:block">
    <button 
      onClick={() => scroll("right")} 
      className="p-5 rounded-full bg-white/90 backdrop-blur-md border border-gray-100 shadow-xl hover:bg-yellow-400 transition-all group active:scale-95"
    >
      <ChevronRight size={24} className="group-hover:text-yellow-900" />
    </button>
  </div>

  <div 
    ref={scrollRef}
    className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-16 px-6 md:px-16"
    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
  >
    <div className="flex-shrink-0 w-1 md:w-2" />

    {plans.map((plan, idx) => {
      const totalPrice = calculateTotal(plan.base_price, plan.tax_percent);
      const isHovered = hoveredIndex === idx;
      const isSomethingHovered = hoveredIndex !== null;
      const isOtherHovered = isSomethingHovered && !isHovered;

      return (
        <motion.div 
          key={plan.id} 
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          animate={{
            scale: isHovered ? 1.05 : isOtherHovered ? 0.95 : 1,
            opacity: isOtherHovered ? 0.6 : 1,
            zIndex: isHovered ? 50 : 1,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-shrink-0 w-[85vw] md:w-[420px] snap-center relative"
        >
          <div className={`h-full min-h-[480px] bg-white rounded-[3.5rem] p-10 md:p-11 flex flex-col border transition-all duration-500 relative overflow-hidden group cursor-pointer
            ${isHovered ? 'shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] border-yellow-400 -translate-y-4' : 'shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] border-gray-50'}
          `}>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">{plan.name}</h3>
                    <div className={`h-1 bg-yellow-400 rounded-full transition-all duration-500 ${isHovered ? 'w-20' : 'w-10'}`} />
                  </div>
                  {idx === 1 && (
                      <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">Popular</span>
                  )}
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-6xl font-black text-gray-900 tracking-tighter">₹{totalPrice}</span>
                <span className="text-gray-400 font-bold text-[11px] uppercase tracking-widest ml-1">/ {plan.duration_months} Mo</span>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.benefits.slice(0, 6).map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-yellow-400 rounded-full p-0.5 shrink-0">
                        <Check size={10} className="text-yellow-950 stroke-[4px]" />
                    </div>
                    <span className="text-gray-700 text-[14px] font-bold leading-tight line-clamp-2">{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePayment(plan)}
                className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.15em] text-[11px] transition-all duration-300 flex items-center justify-center gap-3 group/btn
                  ${isHovered ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'bg-gray-950 text-white'}
                `}
              >
                {userStatus.active ? "Renew Now" : "Select Plan"}
                <ArrowRight size={18} className={`transition-transform ${isHovered ? 'translate-x-2' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>
      );
    })}
    
    <div className="flex-shrink-0 w-1 md:w-2" />
  </div>
</div>

{/* --- HOW TO DISPATCH SECTION (CONTAINED DESIGN) --- */}
<section className="py-20 px-6 bg-[#FFFDF5]"> {/* Light background for the outer section */}
  <div className="max-w-6xl mx-auto">
    
    {/* THE MAIN CONTAINER: This makes it a card rather than full-screen */}
    <div className="bg-white rounded-[4rem] p-12 md:p-20 border border-yellow-100 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.04)] relative overflow-hidden">
      
      {/* Decorative Background Pattern inside the card */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[grid-size:40px_40px] bg-[radial-gradient(#000_1px,transparent_1px)]" />

      {/* Top Label */}
      <div className="flex justify-center mb-8 relative z-10">
        <span className="bg-[#0F172A] text-yellow-400 text-[9px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full shadow-lg">
          Logistics Pipeline
        </span>
      </div>

      {/* Main Headline */}
      <h2 className="text-center mb-24 relative z-10">
        <span className="text-4xl md:text-7xl font-black italic text-[#0F172A] tracking-tighter uppercase leading-[0.85] block">
          STOP GUESSING,
        </span>
        <span className="text-4xl md:text-7xl font-black italic text-red-600 tracking-tighter uppercase leading-[0.85] block">
          START EARNING.
        </span>
        <p className="mt-6 text-gray-400 font-bold text-xs md:text-sm uppercase tracking-[0.2em]">
          Get 10x more leads with direct contact access.
        </p>
      </h2>

      {/* 3-Column Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
        
        {/* Step 01 */}
        <div className="relative group">
          <span className="absolute -top-12 -left-4 text-[10rem] font-black text-gray-50/50 select-none -z-10 group-hover:text-yellow-50 transition-colors duration-500">01</span>
          <div className="w-20 h-20 bg-yellow-400 rounded-[1.8rem] flex items-center justify-center shadow-xl mb-8 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Eye size={32} className="text-gray-900" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 mb-3">Full Details</h3>
          <p className="text-gray-400 text-[11px] font-bold leading-relaxed uppercase tracking-wide">
            Enter your pickup, destination, and cargo details formatted into a high-priority logistics signal.
          </p>
        </div>

        {/* Step 02 */}
        <div className="relative group">
          <span className="absolute -top-12 -left-4 text-[10rem] font-black text-gray-50/50 select-none -z-10 group-hover:text-red-50 transition-colors duration-500">02</span>
          <div className="w-20 h-20 bg-red-600 rounded-[1.8rem] flex items-center justify-center shadow-xl mb-8 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <PhoneCall size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 mb-3">Direct Call</h3>
          <p className="text-gray-400 text-[11px] font-bold leading-relaxed uppercase tracking-wide">
            Your lead hits our live feed where verified fleet owners scan for matching routes in real-time.
          </p>
        </div>

        {/* Step 03 */}
        <div className="relative group">
          <span className="absolute -top-12 -left-4 text-[10rem] font-black text-gray-50/50 select-none -z-10 group-hover:text-slate-100 transition-colors duration-500">03</span>
          <div className="w-20 h-20 bg-[#0F172A] rounded-[1.8rem] flex items-center justify-center shadow-xl mb-8 transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
            <ShieldCheck size={32} className="text-yellow-400" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 mb-3">Verified Access</h3>
          <p className="text-gray-400 text-[11px] font-bold leading-relaxed uppercase tracking-wide">
            Subscribed vendors unlock your contact bridge to provide instant quotes with no middlemen.
          </p>
        </div>
      </div>

    </div> {/* End of Main Container */}
  </div>
</section>
    </div>
  );
}

function MiniCard({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white p-5 rounded-[2rem] flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
      <div className="text-yellow-600 bg-yellow-100 p-3 rounded-2xl group-hover:bg-yellow-400 group-hover:text-yellow-900 transition-all duration-500">
        {icon}
      </div>
      <span className="text-gray-950 text-[9px] font-black uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}