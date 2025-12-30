"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import {
  X, Lock, Check, ShieldCheck, Zap,
  ArrowRight, Loader, Star, Eye, PhoneCall
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
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userStatus, setUserStatus] = useState<{ active: boolean, expiry: string | null }>({ active: false, expiry: null });

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

  const calculateTotal = (base: number, tax: number) =>
    Math.round(base + (base * tax) / 100);

  const handlePayment = async (plan: SubscriptionPlan) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setShowAuthModal(true); return; }
    
    // Razorpay Logic here...
    if (!(window as any).Razorpay) { alert("Payment system loading..."); return; }
    // ... rest of your existing payment implementation
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
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 font-sans selection:bg-yellow-200 pb-20">
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

      {/* --- HEADER (With Active Status Badge) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-40 px-6 relative overflow-hidden border-b border-yellow-200">
        <div className="absolute top-0 left-0 w-full h-full opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
            {userStatus.active ? (
              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 flex justify-center">
                <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-400 py-2 pl-6 pr-2 rounded-full flex items-center gap-6 shadow-lg">
                  <div className="text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest text-yellow-700 block">Current Status</span>
                    <p className="text-gray-900 font-bold text-xs">Expires: <span className="text-red-600">{userStatus.expiry}</span></p>
                  </div>
                  <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-black text-[10px] uppercase flex items-center gap-2">
                    <ShieldCheck size={14} /> Active Premium
                  </div>
                </div>
              </motion.div>
            ) : (
              <span className="inline-block px-4 py-1.5 mb-6 bg-white/80 backdrop-blur-md border border-yellow-300 text-yellow-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-sm">
                  Upgrade Your Experience
              </span>
            )}

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-none">
              {userStatus.active ? "EXTEND" : "UPGRADE"} <span className="text-red-600">PLAN</span>
            </h1>
            <p className="text-gray-600 font-bold text-lg mt-6 max-w-xl mx-auto">
                {userStatus.active 
                  ? "Your premium access is active. Extend your membership to keep enjoying full benefits."
                  : "Reveal owner contact details and verified cargo information instantly."}
            </p>
        </div>
      </div>

      {/* --- PLANS GRID (Centered for 1, 2, or 3 items) --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        <div className="flex flex-wrap justify-center gap-8">
          {plans.map((plan, idx) => {
            const totalPrice = calculateTotal(plan.base_price, plan.tax_percent);
            const isPopular = idx === 1; 
            return (
              <motion.div 
                key={plan.id} 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] max-w-[400px]"
              >
                <div className={`h-full bg-white rounded-[3rem] shadow-2xl p-10 flex flex-col border-2 transition-all duration-500 ${isPopular ? 'border-yellow-400 ring-8 ring-yellow-400/5 scale-105' : 'border-white hover:border-yellow-200'}`}>
                  
                  {isPopular && (
                    <div className="bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full w-fit mb-6">
                        Best Seller
                    </div>
                  )}

                  <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-black text-gray-900 tracking-tighter">₹{totalPrice}</span>
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">/ {plan.duration_months} Months</span>
                  </div>

                  <div className="space-y-4 mb-10 flex-grow">
                    {plan.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 bg-yellow-100 rounded-full p-1">
                            <Check size={12} className="text-yellow-700 stroke-[4px]" />
                        </div>
                        <span className="text-gray-600 text-sm font-bold leading-tight">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePayment(plan)}
                    className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${
                        isPopular 
                        ? 'bg-red-600 text-white shadow-xl hover:bg-red-700 hover:-translate-y-1' 
                        : 'bg-gray-900 text-white hover:bg-black transition-colors'
                      }`}
                  >
                    {userStatus.active ? "Renew Membership" : "Get Started Now"} <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- FOOTER UTILITY --- */}
      <footer className="max-w-6xl mx-auto mt-32 px-6">
        <div className="bg-[#FEF3C7] rounded-[4rem] p-10 md:p-16 relative overflow-hidden border border-yellow-200 shadow-xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-6">
                STOP GUESSING, <br />
                <span className="text-red-600">START EARNING.</span>
              </h2>
              <p className="text-gray-700 font-medium text-lg">
                Premium members get 10x more leads by accessing direct contact numbers.
              </p>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <MiniCard icon={<Eye size={20} />} label="Full Details" />
              <MiniCard icon={<PhoneCall size={20} />} label="Direct Call" />
              <MiniCard icon={<ShieldCheck size={20} />} label="Verified" />
              <MiniCard icon={<Star size={20} />} label="Top Listing" />
            </div>
          </div>
          <Zap size={300} className="absolute -bottom-20 -right-10 text-yellow-400 opacity-20 rotate-12 pointer-events-none" />
        </div>
      </footer>
    </div>
  );
}

function MiniCard({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
      <div className="text-yellow-600 bg-yellow-100 p-3 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-gray-900 text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}