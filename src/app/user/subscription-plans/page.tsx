"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { X, Lock, Check, ShieldCheck, Zap, Star, Sparkles, Crown } from "lucide-react";

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

  useEffect(() => {
    fetchPlans();
  }, []);

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

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!(window as any).Razorpay) {
      alert("Payment system loading. Try again.");
      return;
    }

    const amount = calculateTotal(plan.base_price, plan.tax_percent);

    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const order = await res.json();

    const razorpay = new (window as any).Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "QickTick Premium",
      description: `${plan.name} Membership`,
      order_id: order.id,
      handler: async (response: any) => {
        await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            plan_id: plan.id,
            user_id: user.id,
            amount,
          }),
        });
        router.push("/payment-success");
      },
      theme: { color: "#D80000" }, // Matches the Red in your Q logo
    });

    razorpay.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#D80000] border-t-[#FFD700] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-slate-900 font-sans pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* --- AUTH MODAL --- */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full relative z-10 p-8 text-center border-b-8 border-[#D80000]"
            >
              <Lock size={48} className="text-[#D80000] mx-auto mb-4" />
              <h2 className="text-2xl font-black mb-2">Access Denied</h2>
              <p className="text-slate-500 mb-6 font-medium">Please login to QickTick to unlock premium subscriptions.</p>
              <button onClick={() => router.push('/auth')} className="w-full py-4 bg-[#D80000] text-white font-bold rounded-xl shadow-lg">Login Now</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PREMIUM HEADER --- */}
      <div className="bg-[#D80000] pt-24 pb-40 px-6 relative overflow-hidden">
        {/* Animated Background Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700] rounded-full blur-[120px] opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full blur-[100px] opacity-20 -ml-20 -mb-20"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-8">
            <Crown size={16} className="text-[#FFD700]" />
            <span className="text-[#FFD700] text-xs font-black uppercase tracking-[0.2em]">Premium Access</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white">
            Elevate Your <span className="text-[#FFD700]">Business</span>
          </motion.h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-medium">
            Join the elite network of verified providers and grow your revenue with QickTick Premium.
          </p>
        </div>
      </div>

      {/* --- PLANS GRID --- */}
      {/* --- PLANS GRID --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        {/* Changed grid to flex to allow centering of 1 or 2 items */}
        <div className="flex flex-wrap justify-center gap-8">
          {plans.map((plan, idx) => {
            const totalPrice = calculateTotal(plan.base_price, plan.tax_percent);
            const perMonth = Math.round(totalPrice / plan.duration_months);
            // Logic for highlighting a plan (e.g., the second one or a specific ID)
            const isPopular = idx === 1;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                // Set a fixed width or max-width so they don't stretch too far
                className="w-full sm:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] max-w-[400px]"
              >
                <Card className={`relative h-full overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white transition-all ${isPopular ? 'ring-4 ring-[#FFD700]' : ''}`}>
                  {isPopular && (
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#D80000] via-[#FFD700] to-[#D80000]"></div>
                  )}

                  <CardContent className="p-10 flex flex-col h-full">
                    <div className="mb-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                        {isPopular && <Sparkles size={24} className="text-[#FFD700] fill-[#FFD700]" />}
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">₹{totalPrice}</span>
                        <span className="text-slate-400 font-bold text-sm">/{plan.duration_months}m</span>
                      </div>
                      <p className="text-[#D80000] font-black text-xs uppercase tracking-wider mt-3 bg-[#D80000]/5 inline-block px-3 py-1 rounded-lg">
                        Just ₹{perMonth} / month
                      </p>
                    </div>

                    <div className="space-y-4 mb-10 flex-grow">
                      {plan.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                            <Check size={12} className="text-[#D80000] stroke-[4px]" />
                          </div>
                          <span className="text-slate-600 text-[15px] font-bold leading-tight">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePayment(plan)}
                      className={`w-full py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-black text-lg ${isPopular
                          ? 'bg-[#D80000] text-white hover:bg-black'
                          : 'bg-slate-900 text-[#FFD700] hover:bg-black'
                        }`}
                    >
                      {isPopular ? <Zap size={20} fill="currentColor" /> : <ShieldCheck size={20} />}
                      Select {plan.name}
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}